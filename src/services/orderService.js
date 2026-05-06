// Order Service: Handles Firestore order operations
import { db } from '../config/firebase';
import { collection, addDoc, getDocs, getDoc, doc, updateDoc, query, where, orderBy, Timestamp, runTransaction } from 'firebase/firestore';

const ORDERS_COLLECTION = 'orders';
const PRODUCTS_COLLECTION = 'products';

const resolveOrderItemImage = async (item) => {
  const existingImage = item.imageUrl || item.image || item.images?.[0] || null;

  if (existingImage) {
    return existingImage;
  }

  if (!item.productId) {
    return null;
  }

  try {
    const productSnap = await getDoc(doc(db, PRODUCTS_COLLECTION, item.productId));

    if (!productSnap.exists()) {
      return null;
    }

    const productData = productSnap.data();
    return productData.imageUrl || productData.image || productData.images?.[0] || null;
  } catch (error) {
    console.error(`Error resolving image for order item ${item.productId}:`, error);
    return null;
  }
};

const enrichOrderImages = async (order) => {
  if (!order?.items?.length) {
    return order;
  }

  const items = await Promise.all(
    order.items.map(async (item) => ({
      ...item,
      imageUrl: await resolveOrderItemImage(item)
    }))
  );

  return {
    ...order,
    items
  };
};

// Create a new order
export const createOrder = async (orderData) => {
  const order = {
    ...orderData,
    createdAt: Timestamp.now(),
    status: orderData.status || 'pending',
    paymentStatus: orderData.paymentStatus || 'pending'
  };
  const docRef = await addDoc(collection(db, ORDERS_COLLECTION), order);
  return docRef.id;
};

// Helper function to create order from cart
export const createOrderFromCart = async (
  userId, 
  cartItems, 
  shippingAddress, 
  paymentMethod = 'COD', 
  paymentDetails = {}, 
  userEmail = null,
  orderExtras = {} // Additional order details like shipping method, gift wrap, coupon
) => {
  // First, validate stock availability for all items
  const stockChecks = await Promise.all(
    cartItems.map(async (item) => {
      const productRef = doc(db, PRODUCTS_COLLECTION, item.id);
      const productSnap = await getDoc(productRef);
      
      if (!productSnap.exists()) {
        return { 
          valid: false, 
          productId: item.id, 
          productName: item.name,
          error: 'Product not found' 
        };
      }
      
      const productData = productSnap.data();
      const availableStock = productData.stock || 0;
      
      if (availableStock < item.quantity) {
        return { 
          valid: false, 
          productId: item.id, 
          productName: item.name,
          requested: item.quantity,
          available: availableStock,
          error: `Insufficient stock. Only ${availableStock} available` 
        };
      }
      
      return { 
        valid: true, 
        productId: item.id, 
        productName: item.name,
        currentStock: availableStock,
        quantity: item.quantity
      };
    })
  );

  // Check if any items have insufficient stock
  const invalidItems = stockChecks.filter(check => !check.valid);
  if (invalidItems.length > 0) {
    const errorMessages = invalidItems.map(item => 
      `${item.productName}: ${item.error}`
    ).join('\n');
    throw new Error(`Cannot place order - Stock issues:\n${errorMessages}`);
  }

  // Calculate order totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = orderExtras.shippingCost !== undefined ? orderExtras.shippingCost : (subtotal > 999 ? 0 : 99);
  const giftWrapCost = orderExtras.giftWrapCost || 0;
  const discount = orderExtras.couponDiscount || 0;
  const totalAmount = subtotal + shippingCost + giftWrapCost - discount;

  // Use Firestore transaction to atomically reduce stock and create order
  const orderId = await runTransaction(db, async (transaction) => {
    // Firestore transactions require all reads to complete before any writes.
    const stockUpdates = [];

    // Re-check stock for each product within transaction
    for (const item of cartItems) {
      const productRef = doc(db, PRODUCTS_COLLECTION, item.id);
      const productSnap = await transaction.get(productRef);
      
      if (!productSnap.exists()) {
        throw new Error(`Product ${item.name} no longer exists`);
      }
      
      const currentStock = productSnap.data().stock || 0;
      
      if (currentStock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.name}. Only ${currentStock} available`);
      }

      stockUpdates.push({
        item,
        productRef,
        currentStock,
        newStock: currentStock - item.quantity
      });
    }

    // Create order
    const orderData = {
      userId,
      email: userEmail,
      items: cartItems.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl || item.image || item.images?.[0] || null,
        size: item.selectedSize || null,
        color: item.selectedColor || null,
        sku: item.sku || null,
        category: item.category || null
      })),
      shippingAddress: {
        name: shippingAddress.name,
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2 || '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        phone: shippingAddress.phone
      },
      subtotal,
      shippingCost,
      shippingMethod: orderExtras.shippingMethod || 'standard',
      giftWrap: orderExtras.giftWrap || false,
      giftWrapCost,
      giftMessage: orderExtras.giftMessage || '',
      couponCode: orderExtras.couponCode || '',
      discount,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'pending' : paymentDetails.status || 'pending',
      transactionId: paymentDetails.transactionId || null,
      status: 'pending',
      createdAt: Timestamp.now()
    };

    const orderRef = doc(collection(db, ORDERS_COLLECTION));

    // Apply stock updates and stock history writes after all reads are complete.
    for (const { item, productRef, currentStock, newStock } of stockUpdates) {
      transaction.update(productRef, {
        stock: newStock,
        updatedAt: new Date().toISOString()
      });

      const stockHistoryRef = doc(collection(db, 'stockHistory'));
      transaction.set(stockHistoryRef, {
        productId: item.id,
        productName: item.name,
        oldStock: currentStock,
        newStock,
        change: -item.quantity,
        reason: 'Order Placed',
        orderId: orderRef.id,
        updatedBy: userEmail || userId,
        timestamp: new Date().toISOString()
      });
    }

    transaction.set(orderRef, orderData);
    
    return orderRef.id;
  });

  return orderId;
};

// Get all orders for a user
export const getUserOrders = async (userId) => {
  const q = query(collection(db, ORDERS_COLLECTION), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return Promise.all(querySnapshot.docs.map(async (orderDoc) => enrichOrderImages({ id: orderDoc.id, ...orderDoc.data() })));
};

// Get all orders (admin)
export const getAllOrders = async () => {
  const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get order by ID
export const getOrderById = async (orderId) => {
  const docSnap = await getDoc(doc(db, ORDERS_COLLECTION, orderId));
  return docSnap.exists() ? enrichOrderImages({ id: docSnap.id, ...docSnap.data() }) : null;
};

// Update order status
export const updateOrderStatus = async (orderId, status, adminEmail = null) => {
  // Get current order data
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  const orderSnap = await getDoc(orderRef);
  
  if (!orderSnap.exists()) {
    throw new Error('Order not found');
  }
  
  const orderData = orderSnap.data();
  const previousStatus = orderData.status;
  
  const updateData = {
    status,
    updatedAt: Timestamp.now()
  };
  
  // Add timestamp for specific status changes
  if (status === 'shipped') {
    updateData.shippedAt = Timestamp.now();
  } else if (status === 'delivered') {
    updateData.deliveredAt = Timestamp.now();
  } else if (status === 'cancelled') {
    updateData.cancelledAt = Timestamp.now();
    
    // Restore stock if order is being cancelled
    if (previousStatus !== 'cancelled' && orderData.items) {
      await restoreStockForOrder(orderId, orderData.items, adminEmail || 'System');
    }
  }
  
  await updateDoc(orderRef, updateData);
};

// Update order (generic)
export const updateOrder = async (orderId, data) => {
  const updateData = {
    ...data,
    updatedAt: Timestamp.now()
  };
  await updateDoc(doc(db, ORDERS_COLLECTION, orderId), updateData);
};

// Cancel order
export const cancelOrder = async (orderId, reason = '', cancelledBy = 'User') => {
  // Get order data to restore stock
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  const orderSnap = await getDoc(orderRef);
  
  if (!orderSnap.exists()) {
    throw new Error('Order not found');
  }
  
  const orderData = orderSnap.data();
  const previousStatus = orderData.status;
  
  // Restore stock if order wasn't already cancelled
  if (previousStatus !== 'cancelled' && orderData.items) {
    await restoreStockForOrder(orderId, orderData.items, cancelledBy);
  }
  
  await updateOrder(orderId, {
    status: 'cancelled',
    cancelledAt: Timestamp.now(),
    cancellationReason: reason,
    cancelledBy
  });
};

// Helper function to restore stock when order is cancelled
const restoreStockForOrder = async (orderId, items, updatedBy) => {
  await runTransaction(db, async (transaction) => {
    const stockRestorations = [];

    for (const item of items) {
      const productRef = doc(db, PRODUCTS_COLLECTION, item.productId);
      const productSnap = await transaction.get(productRef);
      
      if (!productSnap.exists()) {
        console.warn(`Product ${item.productId} not found, skipping stock restoration`);
        continue;
      }
      
      const currentStock = productSnap.data().stock || 0;
      stockRestorations.push({
        item,
        productRef,
        currentStock,
        newStock: currentStock + item.quantity
      });
    }

    for (const { item, productRef, currentStock, newStock } of stockRestorations) {
      transaction.update(productRef, {
        stock: newStock,
        updatedAt: new Date().toISOString()
      });

      const stockHistoryRef = doc(collection(db, 'stockHistory'));
      transaction.set(stockHistoryRef, {
        productId: item.productId,
        productName: item.name,
        oldStock: currentStock,
        newStock,
        change: item.quantity,
        reason: 'Order Cancelled',
        orderId: orderId,
        updatedBy: updatedBy,
        timestamp: new Date().toISOString()
      });
    }
  });
};

// Get order statistics (for admin dashboard)
export const getOrderStats = async () => {
  const allOrders = await getAllOrders();
  
  const stats = {
    total: allOrders.length,
    pending: allOrders.filter(o => o.status === 'pending').length,
    processing: allOrders.filter(o => o.status === 'processing').length,
    shipped: allOrders.filter(o => o.status === 'shipped').length,
    delivered: allOrders.filter(o => o.status === 'delivered').length,
    cancelled: allOrders.filter(o => o.status === 'cancelled').length,
    totalRevenue: allOrders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  };
  
  return stats;
};

// Get orders by date range
export const getOrdersByDateRange = async (startDate, endDate) => {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    where('createdAt', '<=', Timestamp.fromDate(endDate)),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get analytics data for admin dashboard
export const getAnalyticsData = async (days = 30) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const orders = await getOrdersByDateRange(startDate, endDate);
  const successfulOrders = orders.filter(o => o.status !== 'cancelled');
  
  // Calculate daily sales
  const dailySales = {};
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dailySales[dateKey] = { date: dateKey, revenue: 0, orders: 0 };
  }
  
  successfulOrders.forEach(order => {
    const orderDate = order.createdAt.toDate();
    const dateKey = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (dailySales[dateKey]) {
      dailySales[dateKey].revenue += order.totalAmount || 0;
      dailySales[dateKey].orders += 1;
    }
  });
  
  const salesData = Object.values(dailySales).reverse();
  
  // Category breakdown from order items
  const categoryBreakdown = {};
  successfulOrders.forEach(order => {
    order.items?.forEach(item => {
      // You'll need to fetch product data to get category, or store it in order items
      const cat = item.category || 'Uncategorized';
      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = { name: cat, value: 0, count: 0 };
      }
      categoryBreakdown[cat].value += (item.price * item.quantity);
      categoryBreakdown[cat].count += item.quantity;
    });
  });
  
  // Product performance from orders
  const productSales = {};
  successfulOrders.forEach(order => {
    order.items?.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          name: item.name,
          totalRevenue: 0,
          totalQuantity: 0
        };
      }
      productSales[item.productId].totalRevenue += item.price * item.quantity;
      productSales[item.productId].totalQuantity += item.quantity;
    });
  });
  
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10)
    .map(p => ({
      name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
      value: p.totalRevenue,
      quantity: p.totalQuantity
    }));
  
  // Customer analytics
  const uniqueCustomers = new Set(successfulOrders.map(o => o.userId || o.email));
  const repeatCustomers = new Set();
  const customerOrders = {};
  
  successfulOrders.forEach(order => {
    const customerId = order.userId || order.email;
    if (!customerOrders[customerId]) {
      customerOrders[customerId] = 0;
    }
    customerOrders[customerId]++;
    if (customerOrders[customerId] > 1) {
      repeatCustomers.add(customerId);
    }
  });
  
  const totalRevenue = successfulOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrders = successfulOrders.length;
  
  return {
    salesData,
    categoryData: Object.values(categoryBreakdown),
    topProducts,
    totalRevenue,
    totalOrders,
    averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    totalCustomers: uniqueCustomers.size,
    newCustomers: uniqueCustomers.size - repeatCustomers.size,
    repeatCustomers: repeatCustomers.size,
    conversionRate: uniqueCustomers.size > 0 ? (repeatCustomers.size / uniqueCustomers.size) * 100 : 0,
    ordersByStatus: {
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    }
  };
};

// Get growth comparison with previous period
export const getGrowthMetrics = async (currentDays = 30) => {
  const currentEndDate = new Date();
  const currentStartDate = new Date();
  currentStartDate.setDate(currentStartDate.getDate() - currentDays);
  
  const previousEndDate = new Date(currentStartDate);
  const previousStartDate = new Date(previousEndDate);
  previousStartDate.setDate(previousStartDate.getDate() - currentDays);
  
  const currentOrders = await getOrdersByDateRange(currentStartDate, currentEndDate);
  const previousOrders = await getOrdersByDateRange(previousStartDate, previousEndDate);
  
  const currentRevenue = currentOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  
  const previousRevenue = previousOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  
  const currentOrderCount = currentOrders.filter(o => o.status !== 'cancelled').length;
  const previousOrderCount = previousOrders.filter(o => o.status !== 'cancelled').length;
  
  const revenueGrowth = previousRevenue > 0 
    ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
    : 0;
  
  const ordersGrowth = previousOrderCount > 0 
    ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100 
    : 0;
  
  return {
    revenueGrowth: Math.round(revenueGrowth * 10) / 10,
    ordersGrowth: Math.round(ordersGrowth * 10) / 10,
    currentRevenue,
    previousRevenue,
    currentOrderCount,
    previousOrderCount
  };
};
