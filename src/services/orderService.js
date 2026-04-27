// Order Service: Handles Firestore order operations
import { db } from '../config/firebase';
import { collection, addDoc, getDocs, getDoc, doc, updateDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';

const ORDERS_COLLECTION = 'orders';

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
export const createOrderFromCart = async (userId, cartItems, shippingAddress, paymentMethod = 'COD', paymentDetails = {}, userEmail = null) => {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = subtotal > 999 ? 0 : 99; // Free shipping above 999
  const discount = 0;
  const totalAmount = subtotal + shippingCost - discount;

  const orderData = {
    userId,
    email: userEmail,
    items: cartItems.map(item => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.imageUrl || item.images?.[0] || null,
      size: item.selectedSize || null,
      color: item.selectedColor || null,
      sku: item.sku || null
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
    discount,
    totalAmount,
    paymentMethod,
    paymentStatus: paymentMethod === 'COD' ? 'pending' : paymentDetails.status || 'pending',
    transactionId: paymentDetails.transactionId || null,
    status: 'pending',
    createdAt: Timestamp.now()
  };

  return await createOrder(orderData);
};

// Get all orders for a user
export const getUserOrders = async (userId) => {
  const q = query(collection(db, ORDERS_COLLECTION), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
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
  }
  
  await updateDoc(doc(db, ORDERS_COLLECTION, orderId), updateData);
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
export const cancelOrder = async (orderId, reason = '') => {
  await updateOrder(orderId, {
    status: 'cancelled',
    cancelledAt: Timestamp.now(),
    cancellationReason: reason
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
