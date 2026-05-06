import React from "react";
import "./AdminDashboard.css";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { productService } from "../../services/productService";
import { storageService } from "../../services/storageService";
import { getAnalyticsData, getGrowthMetrics } from "../../services/orderService";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminOrdersManagement from './orders/AdminOrdersManagement';

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [form, setForm] = useState({ 
    productId: "", 
    name: "", 
    price: "", 
    imageUrl: "",
    description: "",
    stock: "",
    category: "",
    featured: false,
    salePrice: "",
    tags: "",
    sku: "",
    brand: "",
    weight: "",
    dimensions: "",
    material: "",
    countryOfOrigin: "",
    slug: ""
  });
  const [colors, setColors] = useState(["#000000"]);
  const [imageFile, setImageFile] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [imagePreview, setImagePreview] = useState("");
  const [submitMsg, setSubmitMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // Edit Product Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  
  // Delete User Confirmation State
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // Coupons State
  const [coupons, setCoupons] = useState([]);
  const [couponForm, setCouponForm] = useState({
    code: "",
    discount: "",
    type: "percentage",
    expiresAt: "",
    minPurchase: "",
    maxUses: ""
  });
  
  // Users State
  const [users, setUsers] = useState([]);
  
  // Activity Logs State
  const [activityLogs, setActivityLogs] = useState([]);
  
  // Inventory Management State
  const [stockHistory, setStockHistory] = useState([]);
  const [bulkUpdateProducts, setBulkUpdateProducts] = useState([]);
  
  // Products Search & Filter State
  const [productsSearchTerm, setProductsSearchTerm] = useState('');
  const [productsFilter, setProductsFilter] = useState('all'); // all, low-stock, out-of-stock, by-category
  const [productsCategoryFilter, setProductsCategoryFilter] = useState('all');
  
  // Inventory Search & Filter State
  const [inventorySearchTerm, setInventorySearchTerm] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState('all'); // all, low-stock, out-of-stock
  
  // Analytics State
  const [analyticsData, setAnalyticsData] = useState({
    salesData: [],
    categoryData: [],
    topProducts: [],
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalCustomers: 0,
    newCustomers: 0,
    repeatCustomers: 0,
    conversionRate: 0,
    ordersByStatus: {}
  });
  const [analyticsDateRange, setAnalyticsDateRange] = useState(30); // 7, 30, 90, or custom
  const [growthMetrics, setGrowthMetrics] = useState({
    revenueGrowth: 0,
    ordersGrowth: 0
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Log admin activity
  const logActivity = async (action, details) => {
    try {
      const log = {
        action,
        details,
        user: user?.email || 'Unknown',
        timestamp: new Date().toISOString()
      };
      await addDoc(collection(db, 'activityLogs'), log);
      setActivityLogs(prev => [log, ...prev]);
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logActivity('Logout', 'Admin logged out');
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Fetch Analytics Data
  const fetchAnalytics = useCallback(async (days = 30) => {
    setLoadingAnalytics(true);
    try {
      // Fetch real analytics data from orders
      const data = await getAnalyticsData(days);
      setAnalyticsData(data);
      
      // Fetch growth metrics
      const growth = await getGrowthMetrics(days);
      setGrowthMetrics(growth);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      // Fallback to empty data if error
      setAnalyticsData({
        salesData: [],
        categoryData: [],
        topProducts: [],
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalCustomers: 0,
        newCustomers: 0,
        repeatCustomers: 0,
        conversionRate: 0,
        ordersByStatus: {}
      });
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  // Fetch data when section changes (no real-time listeners to avoid Firestore bugs)
  useEffect(() => {
    const fetchData = async () => {
      if (activeSection === "products") {
        setLoadingProducts(true);
        try {
          const productList = await productService.getAll();
          setProducts(productList);
        } catch (err) {
          console.error("Error fetching products:", err);
        }
        setLoadingProducts(false);
      } else if (activeSection === "coupons") {
        try {
          const querySnapshot = await getDocs(collection(db, 'coupons'));
          const couponsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setCoupons(couponsList);
        } catch (err) {
          console.error('Error fetching coupons:', err);
        }
      } else if (activeSection === "users") {
        try {
          const querySnapshot = await getDocs(collection(db, 'users'));
          const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setUsers(usersList);
        } catch (err) {
          console.error('Error fetching users:', err);
        }
      } else if (activeSection === "logs") {
        try {
          const querySnapshot = await getDocs(collection(db, 'activityLogs'));
          const logs = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 50);
          setActivityLogs(logs);
        } catch (err) {
          console.error('Error fetching activity logs:', err);
        }
      } else if (activeSection === "inventory") {
        setLoadingProducts(true);
        try {
          const productList = await productService.getAll();
          setProducts(productList);
          
          const querySnapshot = await getDocs(collection(db, 'stockHistory'));
          const history = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 100);
          setStockHistory(history);
        } catch (err) {
          console.error("Error fetching data:", err);
        }
        setLoadingProducts(false);
      } else if (activeSection === "dashboard") {
        setLoadingProducts(true);
        try {
          const productList = await productService.getAll();
          setProducts(productList);
          
          const usersSnapshot = await getDocs(collection(db, 'users'));
          const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setUsers(usersList);
          
          const couponsSnapshot = await getDocs(collection(db, 'coupons'));
          const couponsList = couponsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setCoupons(couponsList);
          
          fetchAnalytics(analyticsDateRange);
        } catch (err) {
          console.error("Error fetching dashboard data:", err);
        }
        setLoadingProducts(false);
      } else if (activeSection === "analytics") {
        fetchAnalytics(analyticsDateRange);
      }
    };
    
    fetchData();
  }, [activeSection, fetchAnalytics, analyticsDateRange]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  // Inventory Management Handlers
  const handleBulkStockUpdate = async () => {
    try {
      for (const product of bulkUpdateProducts) {
        if (product.addStock !== undefined && product.addStock !== 0) {
          const oldStock = Number(product.stock) || 0;
          const stockToAdd = Number(product.addStock) || 0;
          
          // Only allow positive stock additions
          if (stockToAdd <= 0) {
            alert(`Cannot reduce stock for ${product.name}: Stock reduction happens automatically through orders. Please enter a positive number to add stock.`);
            continue;
          }
          
          const newStock = oldStock + stockToAdd;
          
          // Update product stock
          await updateDoc(doc(db, 'products', product.id), {
            stock: newStock,
            updatedAt: new Date().toISOString()
          });
          
          // Log stock change to history
          await addDoc(collection(db, 'stockHistory'), {
            productId: product.id || '',
            productName: product.name || 'Unknown Product',
            oldStock,
            newStock,
            change: stockToAdd,
            reason: 'Stock Addition',
            updatedBy: user?.email || 'Admin',
            timestamp: new Date().toISOString()
          });
          
          await logActivity('STOCK_UPDATE', `Updated stock for ${product.name}: ${oldStock} +${stockToAdd} = ${newStock}`);
        }
      }

      const [productList, stockHistorySnapshot] = await Promise.all([
        productService.getAll(),
        getDocs(collection(db, 'stockHistory'))
      ]);

      setProducts(productList);
      setStockHistory(
        stockHistorySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 100)
      );
      
      alert('Stock updated successfully!');
      setBulkUpdateProducts([]);
    } catch (err) {
      console.error('Error updating stock:', err);
      alert('Error updating stock: ' + err.message);
    }
  };
  
  // Sync Stock Handler - Ensures all products have stock field
  const handleSyncStock = async () => {
    if (!window.confirm('This will ensure all products have a stock field set to 0 if missing. Continue?')) {
      return;
    }
    
    setLoadingProducts(true);
    try {
      const result = await productService.syncProductStock();
      
      // Refresh products list
      const productList = await productService.getAll();
      setProducts(productList);
      
      alert(
        `Stock Sync Complete!\n\n` +
        `Total Products: ${result.totalProducts}\n` +
        `Updated: ${result.updatedCount}\n` +
        `Already Synced: ${result.alreadySyncedCount}\n\n` +
        (result.results.length > 0 
          ? `Updated products:\n${result.results.map(r => `- ${r.name}: ${r.oldStock} → ${r.newStock}`).join('\n')}`
          : 'All products already had valid stock values.')
      );
      
      await logActivity('SYNC_STOCK', `Synced stock for ${result.updatedCount} products`);
    } catch (err) {
      console.error('Error syncing stock:', err);
      alert('Error syncing stock: ' + err.message);
    } finally {
      setLoadingProducts(false);
    }
  };
  
  const handleStockChange = (productId, addStock) => {
    setBulkUpdateProducts(prev => {
      const existing = prev.find(p => p.id === productId);
      if (existing) {
        return prev.map(p => p.id === productId ? { ...p, addStock: Number(addStock) } : p);
      } else {
        const product = products.find(p => p.id === productId);
        return [...prev, { ...product, addStock: Number(addStock) }];
      }
    });
  };

  const handleColorChange = (idx, value) => {
    setColors(colors => colors.map((c, i) => (i === idx ? value : c)));
  };

  const handleAddColor = () => {
    setColors(colors => [...colors, "#000000"]);
  };

  const handleRemoveColor = (idx) => {
    setColors(colors => colors.filter((_, i) => i !== idx));
  };

  // Filter Products for Products Section
  const getFilteredProducts = () => {
    let filtered = [...products];
    
    // Apply search filter
    if (productsSearchTerm.trim()) {
      const search = productsSearchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(search) ||
        product.productId?.toLowerCase().includes(search) ||
        product.category?.toLowerCase().includes(search) ||
        product.brand?.toLowerCase().includes(search)
      );
    }
    
    // Apply category filter
    if (productsCategoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === productsCategoryFilter);
    }
    
    // Apply stock filter
    if (productsFilter === 'low-stock') {
      filtered = filtered.filter(p => {
        const stock = Number(p.stock) || 0;
        return stock > 0 && stock <= 10;
      });
    } else if (productsFilter === 'out-of-stock') {
      filtered = filtered.filter(p => {
        const stock = Number(p.stock) || 0;
        return stock === 0;
      });
    }
    
    return filtered;
  };

  // Filter Products for Inventory Section
  const getFilteredInventoryProducts = () => {
    let filtered = [...products];
    
    // Apply search filter
    if (inventorySearchTerm.trim()) {
      const search = inventorySearchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(search) ||
        product.productId?.toLowerCase().includes(search) ||
        product.category?.toLowerCase().includes(search)
      );
    }
    
    // Apply stock filter
    if (inventoryFilter === 'low-stock') {
      filtered = filtered.filter(p => {
        const stock = Number(p.stock) || 0;
        return stock > 0 && stock <= 10;
      });
    } else if (inventoryFilter === 'out-of-stock') {
      filtered = filtered.filter(p => {
        const stock = Number(p.stock) || 0;
        return stock === 0;
      });
    }
    
    return filtered;
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesChange = (e) => {
    if (e.target.files) {
      setAdditionalImages(Array.from(e.target.files));
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setForm({ ...form, imageUrl: url });
    if (url) {
      setImagePreview(url);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm({ 
      ...form, 
      name: name,
      slug: generateSlug(name)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMsg("");
    setUploading(true);
    try {
      let imageUrl = form.imageUrl;
      if (imageFile) {
        imageUrl = await storageService.uploadProductImage(imageFile);
      }
      
      // Upload additional images
      let additionalImageUrls = [];
      if (additionalImages.length > 0) {
        for (const img of additionalImages) {
          const url = await storageService.uploadProductImage(img);
          additionalImageUrls.push(url);
        }
      }
      
      const product = {
        productId: form.productId,
        name: form.name,
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        image: imageUrl,
        imageUrl: imageUrl,
        additionalImages: additionalImageUrls,
        description: form.description || '',
        stock: Number(form.stock) || 0,
        category: form.category || 'Uncategorized',
        colors: colors.map(c => c.trim()).filter(Boolean),
        featured: form.featured || false,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        sku: form.sku || '',
        brand: form.brand || '',
        weight: form.weight || '',
        dimensions: form.dimensions || '',
        material: form.material || '',
        countryOfOrigin: form.countryOfOrigin || '',
        slug: form.slug || generateSlug(form.name)
      };
      await productService.create(product);
      await logActivity('ADD_PRODUCT', `Added product: ${product.name}`);
      setSubmitMsg("Product added successfully!");
      setForm({ 
        productId: "", 
        name: "", 
        price: "", 
        imageUrl: "", 
        description: "", 
        stock: "", 
        category: "",
        featured: false,
        salePrice: "",
        tags: "",
        sku: "",
        brand: "",
        weight: "",
        dimensions: "",
        material: "",
        countryOfOrigin: "",
        slug: ""
      });
      setColors(["#000000"]);
      setImageFile(null);
      setAdditionalImages([]);
      setImagePreview("");
      // Reset file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => input.value = '');
      // Real-time listener will auto-update products list
    } catch (err) {
      setSubmitMsg("Error adding product: " + err.message);
    }
    setUploading(false);
  };

  // Edit Product Handlers
  const handleEditClick = (product) => {
    setEditingProduct(product);
    setForm({
      productId: product.productId || '',
      sku: product.sku || '',
      name: product.name || '',
      slug: product.slug || '',
      price: product.price || '',
      salePrice: product.salePrice || '',
      imageUrl: product.image || product.imageUrl || '',
      description: product.description || '',
      stock: product.stock || 0,
      category: product.category || '',
      brand: product.brand || '',
      featured: product.featured || false,
      material: product.material || '',
      countryOfOrigin: product.countryOfOrigin || ''
    });
    setColors(product.colors || ['#000000']);
    setImagePreview(product.image || product.imageUrl || '');
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitMsg("");
    setUploading(true);
    try {
      let imageUrl = form.imageUrl;
      if (imageFile) {
        imageUrl = await storageService.uploadProductImage(imageFile);
      }
      const updatedProduct = {
        productId: form.productId,
        sku: form.sku || '',
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        image: imageUrl,
        imageUrl: imageUrl,
        description: form.description || '',
        stock: Number(form.stock) || 0,
        category: form.category || 'Uncategorized',
        brand: form.brand || '',
        featured: form.featured || false,
        material: form.material || '',
        countryOfOrigin: form.countryOfOrigin || '',
        colors: colors.map(c => c.trim()).filter(Boolean)
      };
      await productService.update(editingProduct.id, updatedProduct);
      await logActivity('EDIT_PRODUCT', `Updated product: ${updatedProduct.name}`);
      setSubmitMsg("Product updated successfully!");
      setEditModalOpen(false);
      setEditingProduct(null);
      setImageFile(null);
      // Real-time listener will auto-update products
    } catch (err) {
      setSubmitMsg("Error updating product: " + err.message);
    }
    setUploading(false);
  };

  // Delete Product Handlers
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await productService.delete(productToDelete.id);
      await logActivity('DELETE_PRODUCT', `Deleted product: ${productToDelete.name}`);
      setDeleteModalOpen(false);
      setProductToDelete(null);
      // Real-time listener will auto-update products
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Error deleting product: " + err.message);
    }
  };

  // Coupon Handlers
  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    try {
      const coupon = {
        ...couponForm,
        discount: Number(couponForm.discount),
        minPurchase: Number(couponForm.minPurchase) || 0,
        maxUses: Number(couponForm.maxUses) || null,
        currentUses: 0,
        active: true,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'coupons'), coupon);
      await logActivity('ADD_COUPON', `Created coupon: ${coupon.code}`);
      setCouponForm({ code: "", discount: "", type: "percentage", expiresAt: "", minPurchase: "", maxUses: "" });
      // Real-time listener will auto-update coupons
    } catch (err) {
      console.error("Error creating coupon:", err);
      alert("Error creating coupon: " + err.message);
    }
  };

  const handleDeleteCoupon = async (couponId, code) => {
    if (window.confirm(`Delete coupon ${code}?`)) {
      try {
        await deleteDoc(doc(db, 'coupons', couponId));
        await logActivity('DELETE_COUPON', `Deleted coupon: ${code}`);
        // Real-time listener will auto-update coupons
      } catch (err) {
        console.error("Error deleting coupon:", err);
      }
    }
  };
  
  // User Delete Handlers
  const handleDeleteUserClick = (user) => {
    setUserToDelete(user);
    setDeleteUserModalOpen(true);
  };

  const handleDeleteUserConfirm = async () => {
    try {
      await deleteDoc(doc(db, 'users', userToDelete.id));
      await logActivity('DELETE_USER', `Deleted user: ${userToDelete.email}`);
      setDeleteUserModalOpen(false);
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setUserToDelete(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Error deleting user: " + err.message);
    }
  };

  // Export analytics data to CSV
  const exportAnalyticsCSV = () => {
    const csvRows = [];
    
    // Header
    csvRows.push('Analytics Report - ' + new Date().toLocaleDateString());
    csvRows.push('Date Range: Last ' + analyticsDateRange + ' days');
    csvRows.push('');
    
    // Summary metrics
    csvRows.push('SUMMARY METRICS');
    csvRows.push('Metric,Value');
    csvRows.push(`Total Revenue,₹${analyticsData.totalRevenue.toLocaleString()}`);
    csvRows.push(`Total Orders,${analyticsData.totalOrders}`);
    csvRows.push(`Average Order Value,₹${Math.round(analyticsData.averageOrderValue).toLocaleString()}`);
    csvRows.push(`Total Customers,${analyticsData.totalCustomers}`);
    csvRows.push(`New Customers,${analyticsData.newCustomers}`);
    csvRows.push(`Repeat Customers,${analyticsData.repeatCustomers}`);
    csvRows.push(`Revenue Growth,${growthMetrics.revenueGrowth}%`);
    csvRows.push(`Orders Growth,${growthMetrics.ordersGrowth}%`);
    csvRows.push('');
    
    // Daily sales
    csvRows.push('DAILY SALES');
    csvRows.push('Date,Revenue,Orders');
    analyticsData.salesData.forEach(day => {
      csvRows.push(`${day.date},${day.revenue},${day.orders}`);
    });
    csvRows.push('');
    
    // Category breakdown
    csvRows.push('CATEGORY BREAKDOWN');
    csvRows.push('Category,Revenue,Items Sold');
    analyticsData.categoryData.forEach(cat => {
      csvRows.push(`${cat.name},${cat.value},${cat.count}`);
    });
    csvRows.push('');
    
    // Top products
    csvRows.push('TOP PRODUCTS');
    csvRows.push('Product,Revenue,Quantity');
    analyticsData.topProducts.forEach(prod => {
      csvRows.push(`${prod.name},${prod.value},${prod.quantity || 0}`);
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-logo">Admin Panel</div>
        <nav className="admin-nav">
          <ul>
            <li 
              className={activeSection === "dashboard" ? "active" : ""} 
              onClick={() => setActiveSection("dashboard")}
            >
              📊 Dashboard
            </li>
            <li 
              className={activeSection === "analytics" ? "active" : ""} 
              onClick={() => setActiveSection("analytics")}
            >
              📈 Analytics
            </li>
            <li 
              className={activeSection === "orders" ? "active" : ""} 
              onClick={() => setActiveSection("orders")}
            >
              📦 Orders
            </li>
            <li 
              className={activeSection === "products" ? "active" : ""} 
              onClick={() => setActiveSection("products")}
            >
              🛍️ Products
            </li>
            <li 
              className={activeSection === "inventory" ? "active" : ""} 
              onClick={() => setActiveSection("inventory")}
            >
              📦 Inventory
            </li>
            <li 
              className={activeSection === "coupons" ? "active" : ""} 
              onClick={() => setActiveSection("coupons")}
            >
              🎫 Coupons
            </li>
            <li 
              className={activeSection === "users" ? "active" : ""} 
              onClick={() => setActiveSection("users")}
            >
              👥 Users
            </li>
            <li 
              className={activeSection === "logs" ? "active" : ""} 
              onClick={() => setActiveSection("logs")}
            >
              📝 Activity Logs
            </li>
            <li 
              className={activeSection === "settings" ? "active" : ""} 
              onClick={() => setActiveSection("settings")}
            >
              ⚙️ Settings
            </li>
            <li 
              className="logout-btn"
              onClick={handleLogout}
            >
              🚪 Logout
            </li>
          </ul>
        </nav>
      </aside>
      <main className="admin-main">
        {activeSection === "dashboard" && (
          <>
            <h1 className="admin-title">Dashboard Overview</h1>
            
            {/* Dashboard Statistics */}
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-label">Total Products</div>
                <div className="stat-value products">{products.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Users</div>
                <div className="stat-value users">{users.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Active Coupons</div>
                <div className="stat-value coupons">{coupons.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Stock</div>
                <div className="stat-value stock">
                  {products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0)}
                </div>
              </div>
            </div>

            {/* Low Stock Alert */}
            {products.filter(p => {
              const stock = Number(p.stock) || 0;
              return stock <= 10 && stock > 0;
            }).length > 0 && (
              <div className="alert-box warning">
                <strong>⚠️ Low Stock Alert:</strong> 
                {products.filter(p => {
                  const stock = Number(p.stock) || 0;
                  return stock <= 10 && stock > 0;
                }).length} products have low stock
              </div>
            )}

            {/* Add Product Section */}
            <section className="add-product-section">
              <h2>Add New Product</h2>
              <form className="add-product-form" onSubmit={handleSubmit}>
            
            {/* Basic Info */}
            <div className="form-section-title">📋 Basic Information</div>
            <div className="form-row">
              <div className="form-group">
                <label>Product ID <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="productId" 
                  value={form.productId} 
                  onChange={handleChange} 
                  placeholder="e.g., VB-001" 
                  required 
                  className={form.productId ? 'valid' : ''}
                />
              </div>
              <div className="form-group">
                <label>SKU / Barcode <span className="optional">(optional)</span></label>
                <input 
                  type="text" 
                  name="sku" 
                  value={form.sku} 
                  onChange={handleChange} 
                  placeholder="e.g., SKU123456" 
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Product Name <span className="required">*</span></label>
              <input 
                type="text" 
                name="name" 
                value={form.name} 
                onChange={handleNameChange} 
                placeholder="e.g., Luxury Leather Handbag" 
                required 
                className={form.name ? 'valid' : ''}
              />
            </div>

            <div className="form-group">
              <label>URL Slug <span className="optional">(auto-generated)</span></label>
              <input 
                type="text" 
                name="slug" 
                value={form.slug} 
                onChange={handleChange} 
                placeholder="luxury-leather-handbag" 
                className="slug-input"
              />
            </div>

            {/* Pricing */}
            <div className="form-section-title">💰 Pricing</div>
            <div className="form-row">
              <div className="form-group">
                <label>Regular Price (₹) <span className="required">*</span></label>
                <input 
                  type="number" 
                  name="price" 
                  value={form.price} 
                  onChange={handleChange} 
                  placeholder="2999.99" 
                  required 
                  min="0" 
                  step="0.01"
                  className={form.price ? 'valid' : ''}
                />
              </div>
              <div className="form-group">
                <label>Sale Price (₹) <span className="optional">(optional)</span></label>
                <input 
                  type="number" 
                  name="salePrice" 
                  value={form.salePrice} 
                  onChange={handleChange} 
                  placeholder="2499.99" 
                  min="0" 
                  step="0.01"
                />
                {form.salePrice && form.price && Number(form.salePrice) < Number(form.price) && (
                  <small className="discount-info">
                    💰 {Math.round(((form.price - form.salePrice) / form.price) * 100)}% off
                  </small>
                )}
              </div>
            </div>

            {/* Inventory */}
            <div className="form-section-title">📦 Inventory & Category</div>
            <div className="form-row">
              <div className="form-group">
                <label>Stock Quantity <span className="required">*</span></label>
                <input 
                  type="number" 
                  name="stock" 
                  value={form.stock} 
                  onChange={handleChange} 
                  placeholder="20" 
                  min="0"
                  className={form.stock && Number(form.stock) < 5 ? 'warning' : form.stock ? 'valid' : ''}
                />
                {form.stock && Number(form.stock) < 5 && Number(form.stock) > 0 && (
                  <small className="warning-text">⚠️ Low stock warning</small>
                )}
              </div>
              <div className="form-group">
                <label>Category</label>
                <select 
                  name="category" 
                  value={form.category} 
                  onChange={handleChange}
                  className={form.category ? 'valid' : ''}
                >
                  <option value="">Select Category</option>
                  <option value="Handbags">Handbags</option>
                  <option value="Wallets">Wallets</option>
                  <option value="Clutches">Clutches</option>
                  <option value="Totes">Totes</option>
                  <option value="Crossbody">Crossbody</option>
                  <option value="Backpacks">Backpacks</option>
                  <option value="Satchels">Satchels</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Brand <span className="optional">(optional)</span></label>
                <input 
                  type="text" 
                  name="brand" 
                  value={form.brand} 
                  onChange={handleChange} 
                  placeholder="e.g., VERA by Kamakshi" 
                />
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    name="featured" 
                    checked={form.featured} 
                    onChange={(e) => setForm({...form, featured: e.target.checked})}
                  />
                  <span>⭐ Mark as Featured Product</span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="form-section-title">📝 Description & Details</div>
            <div className="form-group">
              <label>Description <span className="optional">(optional)</span></label>
              <textarea 
                name="description" 
                value={form.description} 
                onChange={handleChange} 
                placeholder="Detailed product description, features, materials..." 
                rows="4"
                className={form.description ? 'valid' : ''}
              ></textarea>
              <small className="char-count">{form.description.length} characters</small>
            </div>

            {/* Images */}
            <div className="form-section-title">🖼️ Images</div>
            <div className="form-group">
              <label>Main Product Image (Upload) <span className="required">*</span></label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="file-input"
              />
            </div>
            <div className="form-group">
              <label>Or Image URL</label>
              <input 
                type="text" 
                name="imageUrl" 
                value={form.imageUrl} 
                onChange={handleImageUrlChange} 
                placeholder="https://example.com/image.jpg" 
              />
            </div>
            
            {imagePreview && (
              <div className="image-preview-container">
                <label>Image Preview:</label>
                <img src={imagePreview} alt="Preview" className="image-preview" />
              </div>
            )}

            <div className="form-group">
              <label>Additional Images <span className="optional">(optional)</span></label>
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleAdditionalImagesChange} 
                className="file-input"
              />
              <small>Upload multiple images for product gallery</small>
              {additionalImages.length > 0 && (
                <div className="file-count">📎 {additionalImages.length} file(s) selected</div>
              )}
            </div>

            {/* Colors */}
            <div className="form-section-title">🎨 Colors</div>
            <div className="form-group">
              <label>Available Colors</label>
              {colors.map((color, idx) => (
                <div key={idx} className="color-input-row">
                  <input
                    type="color"
                    value={color}
                    onChange={e => handleColorChange(idx, e.target.value)}
                    className="color-picker"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={e => handleColorChange(idx, e.target.value)}
                    placeholder="#000000"
                    className="color-hex-input"
                  />
                  {colors.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => handleRemoveColor(idx)} 
                      className="remove-color-btn" 
                      title="Remove color"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={handleAddColor} className="add-color-btn">
                + Add Color
              </button>
            </div>

            {/* Product Specifications */}
            <div className="form-section-title">📏 Specifications</div>
            <div className="form-row">
              <div className="form-group">
                <label>Material <span className="optional">(optional)</span></label>
                <input 
                  type="text" 
                  name="material" 
                  value={form.material} 
                  onChange={handleChange} 
                  placeholder="e.g., Genuine Leather, Canvas" 
                />
              </div>
              <div className="form-group">
                <label>Country of Origin <span className="optional">(optional)</span></label>
                <input 
                  type="text" 
                  name="countryOfOrigin" 
                  value={form.countryOfOrigin} 
                  onChange={handleChange} 
                  placeholder="e.g., India, Italy" 
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Dimensions <span className="optional">(optional)</span></label>
                <input 
                  type="text" 
                  name="dimensions" 
                  value={form.dimensions} 
                  onChange={handleChange} 
                  placeholder="e.g., 30cm x 25cm x 10cm" 
                />
              </div>
              <div className="form-group">
                <label>Weight <span className="optional">(optional)</span></label>
                <input 
                  type="text" 
                  name="weight" 
                  value={form.weight} 
                  onChange={handleChange} 
                  placeholder="e.g., 500g or 1.2kg" 
                />
              </div>
            </div>

            {/* Tags */}
            <div className="form-section-title">🏷️ Tags & Keywords</div>
            <div className="form-group">
              <label>Tags <span className="optional">(comma-separated)</span></label>
              <input 
                type="text" 
                name="tags" 
                value={form.tags} 
                onChange={handleChange} 
                placeholder="e.g., leather, luxury, designer, handmade" 
              />
              <small>Used for search and filtering</small>
            </div>

            <button type="submit" className="add-product-btn" disabled={uploading}>
              {uploading ? "⏳ Uploading..." : "✅ Add Product"}
            </button>
            {submitMsg && (
              <div className={`submit-message ${submitMsg.startsWith('Error') ? 'error' : 'success'}`}>
                {submitMsg}
              </div>
            )}
          </form>
        </section>
        </>
        )}

        {activeSection === "products" && (
          <div className="products-list-section">
            <h1 className="admin-title">Products Management</h1>
            
            {/* Search and Filter Controls */}
            {!loadingProducts && products.length > 0 && (
              <div className="products-controls">
                <div className="search-filter-row">
                  <input
                    type="text"
                    placeholder="Search by name, ID, category, brand..."
                    className="search-input"
                    value={productsSearchTerm}
                    onChange={(e) => setProductsSearchTerm(e.target.value)}
                  />
                  <select
                    className="category-filter"
                    value={productsCategoryFilter}
                    onChange={(e) => setProductsCategoryFilter(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="Handbags">Handbags</option>
                    <option value="Wallets">Wallets</option>
                    <option value="Clutches">Clutches</option>
                    <option value="Totes">Totes</option>
                    <option value="Crossbody">Crossbody</option>
                    <option value="Backpacks">Backpacks</option>
                    <option value="Satchels">Satchels</option>
                  </select>
                </div>
                <div className="filter-buttons">
                  <button
                    className={`filter-btn ${productsFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setProductsFilter('all')}
                  >
                    All Products
                  </button>
                  <button
                    className={`filter-btn ${productsFilter === 'low-stock' ? 'active' : ''}`}
                    onClick={() => setProductsFilter('low-stock')}
                  >
                    Low Stock (≤10)
                  </button>
                  <button
                    className={`filter-btn ${productsFilter === 'out-of-stock' ? 'active' : ''}`}
                    onClick={() => setProductsFilter('out-of-stock')}
                  >
                    Out of Stock
                  </button>
                </div>
              </div>
            )}
            
            {loadingProducts ? (
              <div className="loading-state">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="empty-state">No products found. Add a product from the Dashboard section.</div>
            ) : getFilteredProducts().length === 0 ? (
              <div className="empty-state">No products match your search criteria.</div>
            ) : (
              <div className="products-table-container">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product ID</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Category</th>
                      <th>Colors</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredProducts().map((product) => {
                      const stock = Number(product.stock) || 0;
                      return (
                      <tr key={product.id} className={stock <= 10 ? 'low-stock-row' : ''}>
                        <td>
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="product-thumbnail"
                          />
                        </td>
                        <td>{product.productId}</td>
                        <td>{product.name}</td>
                        <td>₹{product.price}</td>
                        <td>
                          <span className={`stock-badge ${stock <= 10 ? 'low' : stock <= 20 ? 'medium' : 'high'}`}>
                            {stock}
                          </span>
                        </td>
                        <td>{product.category || 'N/A'}</td>
                        <td>
                          <div className="color-dots">
                            {product.colors && product.colors.map((color, index) => (
                              <span 
                                key={index} 
                                className="color-dot" 
                                style={{ backgroundColor: color }}
                                title={color}
                              ></span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="edit-btn" onClick={() => handleEditClick(product)}>✏️ Edit</button>
                            <button className="delete-btn" onClick={() => handleDeleteClick(product)}>🗑️ Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeSection === "coupons" && (
          <div className="coupons-section">
            <h1 className="admin-title">Coupon Management</h1>
            
            {/* Add New Coupon Form */}
            <div className="coupon-form-container">
              <h2>Create New Coupon</h2>
              <form className="coupon-form" onSubmit={handleCouponSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Coupon Code</label>
                    <input
                      type="text"
                      value={couponForm.code}
                      onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., SAVE20"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Discount Type</label>
                    <select
                      value={couponForm.type}
                      onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Discount Value</label>
                    <input
                      type="number"
                      value={couponForm.discount}
                      onChange={(e) => setCouponForm({ ...couponForm, discount: e.target.value })}
                      placeholder={couponForm.type === 'percentage' ? '20' : '500'}
                      required
                      min="0"
                      max={couponForm.type === 'percentage' ? '100' : undefined}
                    />
                  </div>
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="date"
                      value={couponForm.expiresAt}
                      onChange={(e) => setCouponForm({ ...couponForm, expiresAt: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Minimum Purchase (₹)</label>
                    <input
                      type="number"
                      value={couponForm.minPurchase}
                      onChange={(e) => setCouponForm({ ...couponForm, minPurchase: e.target.value })}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Uses (0 = unlimited)</label>
                    <input
                      type="number"
                      value={couponForm.maxUses}
                      onChange={(e) => setCouponForm({ ...couponForm, maxUses: e.target.value })}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                <button type="submit" className="btn-create-coupon">
                  🎫 Create Coupon
                </button>
              </form>
            </div>

            {/* Existing Coupons */}
            <div className="coupons-list-container">
              <h2>Active Coupons</h2>
              {coupons.length === 0 ? (
                <div className="empty-state">No coupons created yet.</div>
              ) : (
                <div className="coupons-grid">
                  {coupons.map((coupon) => (
                    <div key={coupon.id} className="coupon-card">
                      <div className="coupon-header">
                        <span className="coupon-code">{coupon.code}</span>
                        <button 
                          className="delete-coupon-btn" 
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          title="Delete Coupon"
                        >
                          ×
                        </button>
                      </div>
                      <div className="coupon-details">
                        <p>
                          <strong>Discount:</strong> {coupon.type === 'percentage' 
                            ? `${coupon.discount}%` 
                            : `₹${coupon.discount}`}
                        </p>
                        {coupon.minPurchase > 0 && (
                          <p><strong>Min Purchase:</strong> ₹{coupon.minPurchase}</p>
                        )}
                        {coupon.maxUses > 0 && (
                          <p><strong>Max Uses:</strong> {coupon.maxUses}</p>
                        )}
                        {coupon.expiresAt && (
                          <p><strong>Expires:</strong> {new Date(coupon.expiresAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === "analytics" && (
          <div className="analytics-section">
            <div className="analytics-header">
              <h1 className="admin-title">Sales Analytics & Reports</h1>
              <div className="analytics-controls">
                <select 
                  className="date-range-select" 
                  value={analyticsDateRange}
                  onChange={(e) => setAnalyticsDateRange(Number(e.target.value))}
                >
                  <option value={7}>Last 7 Days</option>
                  <option value={30}>Last 30 Days</option>
                  <option value={90}>Last 90 Days</option>
                </select>
                <button className="export-btn" onClick={exportAnalyticsCSV} title="Export to CSV">
                  📥 Export Report
                </button>
              </div>
            </div>
            
            {loadingAnalytics ? (
              <div className="analytics-loading">Loading analytics data...</div>
            ) : (
              <>
                {/* Key Metrics with Growth Indicators */}
                <div className="analytics-metrics">
                  <div className="metric-card">
                    <div className="metric-label">Total Revenue ({analyticsDateRange} days)</div>
                    <div className="metric-value revenue">₹{analyticsData.totalRevenue.toLocaleString()}</div>
                    {growthMetrics.revenueGrowth !== 0 && (
                      <div className={`growth-indicator ${growthMetrics.revenueGrowth > 0 ? 'positive' : 'negative'}`}>
                        {growthMetrics.revenueGrowth > 0 ? '↑' : '↓'} {Math.abs(growthMetrics.revenueGrowth)}%
                      </div>
                    )}
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Total Orders ({analyticsDateRange} days)</div>
                    <div className="metric-value orders">{analyticsData.totalOrders}</div>
                    {growthMetrics.ordersGrowth !== 0 && (
                      <div className={`growth-indicator ${growthMetrics.ordersGrowth > 0 ? 'positive' : 'negative'}`}>
                        {growthMetrics.ordersGrowth > 0 ? '↑' : '↓'} {Math.abs(growthMetrics.ordersGrowth)}%
                      </div>
                    )}
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Average Order Value</div>
                    <div className="metric-value value">₹{Math.round(analyticsData.averageOrderValue).toLocaleString()}</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Total Customers</div>
                    <div className="metric-value users">{analyticsData.totalCustomers}</div>
                    <div className="metric-subtext">
                      {analyticsData.newCustomers} new, {analyticsData.repeatCustomers} returning
                    </div>
                  </div>
                </div>

                {/* Customer Insights */}
                <div className="customer-insights-row">
                  <div className="insight-card">
                    <h3>Customer Retention</h3>
                    <div className="insight-value">{analyticsData.conversionRate.toFixed(1)}%</div>
                    <div className="insight-label">Repeat Customer Rate</div>
                  </div>
                  <div className="insight-card">
                    <h3>Order Status Breakdown</h3>
                    <div className="status-breakdown">
                      <div className="status-item">
                        <span className="status-dot pending"></span>
                        <span>Pending: {analyticsData.ordersByStatus?.pending || 0}</span>
                      </div>
                      <div className="status-item">
                        <span className="status-dot processing"></span>
                        <span>Processing: {analyticsData.ordersByStatus?.processing || 0}</span>
                      </div>
                      <div className="status-item">
                        <span className="status-dot shipped"></span>
                        <span>Shipped: {analyticsData.ordersByStatus?.shipped || 0}</span>
                      </div>
                      <div className="status-item">
                        <span className="status-dot delivered"></span>
                        <span>Delivered: {analyticsData.ordersByStatus?.delivered || 0}</span>
                      </div>
                      <div className="status-item">
                        <span className="status-dot cancelled"></span>
                        <span>Cancelled: {analyticsData.ordersByStatus?.cancelled || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Row 1 */}
                <div className="charts-row">
                  <div className="chart-container">
                    <h3 className="chart-title">Sales & Orders Trend (Last {analyticsDateRange} Days)</h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={analyticsData.salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          stroke="#666"
                        />
                        <YAxis 
                          yAxisId="left" 
                          tick={{ fontSize: 12 }}
                          stroke="#666"
                          label={{ value: 'Revenue (₹)', angle: -90, position: 'insideLeft' }}
                        />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right" 
                          tick={{ fontSize: 12 }}
                          stroke="#666"
                          label={{ value: 'Orders', angle: 90, position: 'insideRight' }}
                        />
                        <Tooltip 
                          contentStyle={{ background: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}
                          formatter={(value, name) => [
                            name === 'Revenue (₹)' ? `₹${value.toLocaleString()}` : value,
                            name
                          ]}
                        />
                        <Legend />
                        <Line 
                          yAxisId="left" 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#030213" 
                          strokeWidth={3} 
                          name="Revenue (₹)"
                          dot={{ fill: '#030213', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          yAxisId="right" 
                          type="monotone" 
                          dataKey="orders" 
                          stroke="#82ca9d" 
                          strokeWidth={3} 
                          name="Orders"
                          dot={{ fill: '#82ca9d', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Charts Row 2 */}
                <div className="charts-row">
                  <div className="chart-container half">
                    <h3 className="chart-title">Sales by Category</h3>
                    {analyticsData.categoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={analyticsData.categoryData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name} (${entry.count})`}
                            labelLine={{ stroke: '#666' }}
                          >
                            {analyticsData.categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#030213', '#2c2c2c', '#4a4a4a', '#666666', '#858585', '#a3a3a3'][index % 6]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="no-data">No category data available</div>
                    )}
                  </div>
                  
                  <div className="chart-container half">
                    <h3 className="chart-title">Top 10 Products by Revenue</h3>
                    {analyticsData.topProducts.length > 0 ? (
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={analyticsData.topProducts} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis type="number" tick={{ fontSize: 11 }} />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={150}
                            tick={{ fontSize: 11 }}
                          />
                          <Tooltip 
                            formatter={(value, name) => [
                              name === 'value' ? `₹${value.toLocaleString()}` : value,
                              name === 'value' ? 'Revenue' : name
                            ]}
                            contentStyle={{ background: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}
                          />
                          <Bar dataKey="value" fill="#030213" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="no-data">No product data available</div>
                    )}
                  </div>
                </div>

                {/* Products Performance Table */}
                {analyticsData.topProducts.length > 0 && (
                  <div className="performance-table-section">
                    <h3>Top Products Performance</h3>
                    <table className="performance-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Product Name</th>
                          <th>Revenue</th>
                          <th>Quantity Sold</th>
                          <th>Avg Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.topProducts.map((product, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{product.name}</td>
                            <td>₹{product.value.toLocaleString()}</td>
                            <td>{product.quantity || 0}</td>
                            <td>₹{product.quantity > 0 ? Math.round(product.value / product.quantity).toLocaleString() : 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeSection === "inventory" && (
          <div className="inventory-section">
            <h1 className="admin-title">Inventory Management</h1>
            
            {/* Sync Stock Button */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#495057', fontSize: '1rem' }}>📦 Sync Stock Database</h3>
                  <p style={{ margin: 0, color: '#6c757d', fontSize: '0.875rem' }}>
                    Ensure all products have a stock field. Products without stock will be set to 0 (out of stock).
                  </p>
                </div>
                <button 
                  onClick={handleSyncStock}
                  disabled={loadingProducts}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loadingProducts ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    opacity: loadingProducts ? 0.6 : 1,
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => !loadingProducts && (e.target.style.backgroundColor = '#138496')}
                  onMouseLeave={(e) => !loadingProducts && (e.target.style.backgroundColor = '#17a2b8')}
                >
                  {loadingProducts ? '⏳ Syncing...' : '🔄 Sync Stock Now'}
                </button>
              </div>
            </div>
            
            {/* Inventory Overview */}
            <div className="inventory-overview">
              <div className="inventory-stat">
                <h3>Total Products</h3>
                <p className="stat-number">{products.length}</p>
              </div>
              <div className="inventory-stat">
                <h3>Total Units</h3>
                <p className="stat-number">{products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0)}</p>
              </div>
              <div className="inventory-stat">
                <h3>Low Stock Items</h3>
                <p className="stat-number warning">{products.filter(p => {
                  const stock = Number(p.stock) || 0;
                  return stock > 0 && stock <= 10;
                }).length}</p>
              </div>
              <div className="inventory-stat">
                <h3>Out of Stock</h3>
                <p className="stat-number danger">{products.filter(p => {
                  const stock = Number(p.stock) || 0;
                  return stock === 0;
                }).length}</p>
              </div>
            </div>

            {/* Bulk Stock Update */}
            <div className="bulk-update-section">
              <h2>Bulk Stock Update</h2>
              <p className="section-description">Add stock quantities for multiple products at once. Stock reduction happens automatically when customers place orders.</p>
              
              {loadingProducts ? (
                <div className="loading-state">Loading products...</div>
              ) : (
                <>
                  {/* Search and Filter Controls */}
                  <div className="inventory-controls">
                    <div className="search-filter-row">
                      <input
                        type="text"
                        placeholder="Search by name, ID, category..."
                        className="search-input"
                        value={inventorySearchTerm}
                        onChange={(e) => setInventorySearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="filter-buttons">
                      <button
                        className={`filter-btn ${inventoryFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setInventoryFilter('all')}
                      >
                        All Products
                      </button>
                      <button
                        className={`filter-btn ${inventoryFilter === 'low-stock' ? 'active' : ''}`}
                        onClick={() => setInventoryFilter('low-stock')}
                      >
                        Low Stock (≤10)
                      </button>
                      <button
                        className={`filter-btn ${inventoryFilter === 'out-of-stock' ? 'active' : ''}`}
                        onClick={() => setInventoryFilter('out-of-stock')}
                      >
                        Out of Stock
                      </button>
                    </div>
                  </div>

                  {getFilteredInventoryProducts().length === 0 ? (
                    <div className="empty-state">No products match your search criteria.</div>
                  ) : (
                  <div className="bulk-update-table-container">
                    <table className="bulk-update-table">
                      <thead>
                        <tr>
                          <th>Product ID</th>
                          <th>Product Name</th>
                          <th>Category</th>
                          <th>Current Stock</th>
                          <th>Add Stock</th>
                          <th>New Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFilteredInventoryProducts().map((product) => {
                          const bulkProduct = bulkUpdateProducts.find(p => p.id === product.id);
                          const addStock = bulkProduct?.addStock || 0;
                          const currentStock = Number(product.stock) || 0;
                          const newTotal = currentStock + addStock;
                          
                          return (
                            <tr key={product.id}>
                              <td>{product.productId}</td>
                              <td>{product.name}</td>
                              <td>{product.category}</td>
                              <td>
                                <span className={`stock-badge ${currentStock <= 10 ? 'low' : 'high'}`}>
                                  {currentStock}
                                </span>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="stock-input"
                                  placeholder="0"
                                  min="0"
                                  onChange={(e) => handleStockChange(product.id, e.target.value)}
                                  value={bulkProduct ? addStock : ''}
                                  title="Enter quantity to add to current stock"
                                />
                              </td>
                              <td>
                                {bulkProduct && addStock !== 0 && (
                                  <span className={`change-indicator ${addStock > 0 ? 'positive' : 'error'}`}>
                                    {addStock > 0 ? newTotal : '❌ Enter positive number'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  )}
                  
                  {bulkUpdateProducts.length > 0 && (
                    <div className="bulk-update-actions">
                      <button className="btn-update-stock" onClick={handleBulkStockUpdate}>
                        💾 Update Stock ({bulkUpdateProducts.length} product{bulkUpdateProducts.length > 1 ? 's' : ''})
                      </button>
                      <button className="btn-cancel" onClick={() => setBulkUpdateProducts([])}>
                        Cancel
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Stock History */}
            <div className="stock-history-section">
              <h2>Stock History</h2>
              <p className="section-description">Track all stock changes and updates</p>
              
              {stockHistory.length === 0 ? (
                <div className="empty-state">No stock history available yet. Changes will be logged here.</div>
              ) : (
                <div className="stock-history-container">
                  <table className="stock-history-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Product</th>
                        <th>Old Stock</th>
                        <th>New Stock</th>
                        <th>Change</th>
                        <th>Reason</th>
                        <th>Updated By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockHistory.map((entry) => (
                        <tr key={entry.id}>
                          <td>{new Date(entry.timestamp).toLocaleString()}</td>
                          <td>
                            <div className="history-product-info">
                              <strong>{entry.productName}</strong>
                              <small>{entry.productId}</small>
                            </div>
                          </td>
                          <td>{entry.oldStock}</td>
                          <td>{entry.newStock}</td>
                          <td>
                            <span className={`change-indicator ${entry.change > 0 ? 'positive' : 'negative'}`}>
                              {entry.change > 0 ? '+' : ''}{entry.change}
                            </span>
                          </td>
                          <td>{entry.reason}</td>
                          <td>{entry.updatedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Low Stock Alerts */}
            <div className="low-stock-alerts">
              <h2>Low Stock Alerts & Reorder Recommendations</h2>
              {products.filter(p => (Number(p.stock) || 0) <= 10).length === 0 ? (
                <div className="empty-state">All products are well-stocked! 🎉</div>
              ) : (
                <div className="alerts-grid">
                  {products
                    .filter(p => (Number(p.stock) || 0) <= 10)
                    .sort((a, b) => (Number(a.stock) || 0) - (Number(b.stock) || 0))
                    .map((product) => {
                      const stock = Number(product.stock) || 0;
                      return (
                      <div key={product.id} className={`alert-card ${stock === 0 ? 'critical' : 'warning'}`}>
                        <div className="alert-header">
                          <span className="alert-icon">{stock === 0 ? '🔴' : '⚠️'}</span>
                          <span className="alert-status">
                            {stock === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}
                          </span>
                        </div>
                        <div className="alert-content">
                          <h4>{product.name}</h4>
                          <p><strong>Product ID:</strong> {product.productId}</p>
                          <p><strong>Current Stock:</strong> {stock} units</p>
                          <p><strong>Category:</strong> {product.category}</p>
                          {stock === 0 && (
                            <p className="reorder-suggestion">⚡ Immediate reorder recommended</p>
                          )}
                          {stock > 0 && stock <= 10 && (
                            <p className="reorder-suggestion">📋 Consider restocking soon</p>
                          )}
                        </div>
                      </div>
                    );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === "logs" && (
          <div className="logs-section">
            <h1 className="admin-title">Activity Logs</h1>
            <div className="logs-container">
              {activityLogs.length === 0 ? (
                <div className="empty-state">No activity logs yet.</div>
              ) : (
                <table className="logs-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Action</th>
                      <th>Details</th>
                      <th>User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLogs.map((log) => (
                      <tr key={log.id}>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                        <td>
                          <span className={`log-action ${log.action.toLowerCase().replace(' ', '-')}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="log-details">{log.details}</td>
                        <td>{log.user}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeSection === "orders" && (
          <AdminOrdersManagement onLog={logActivity} />
        )}

        {activeSection === "users" && (
          <div className="users-section">
            <h1 className="admin-title">Users Management</h1>
            <div className="users-container">
              {users.length === 0 ? (
                <div className="empty-state">No users found.</div>
              ) : (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Contact Number</th>
                      <th>Email</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.fullName || user.name || user.displayName || 'N/A'}</td>
                        <td>{user.phoneNumber || 'N/A'}</td>
                        <td>{user.email}</td>
                        <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <button className="delete-btn" onClick={() => handleDeleteUserClick(user)}>🗑️ Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeSection === "settings" && (
          <div className="settings-section">
            <h1 className="admin-title">Settings</h1>
            <div className="placeholder-section">Settings section coming soon...</div>
          </div>
        )}
      </main>

      {/* Edit Product Modal */}
      {editModalOpen && (
        <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Product</h2>
              <button className="modal-close" onClick={() => setEditModalOpen(false)}>×</button>
            </div>
            <form className="edit-product-form" onSubmit={handleEditSubmit}>
              
              {/* Basic Info */}
              <div className="form-section-title">📋 Basic Information</div>
              <div className="form-row">
                <div className="form-group">
                  <label>Product ID <span className="required">*</span></label>
                  <input
                    type="text"
                    name="productId"
                    value={form.productId}
                    onChange={handleChange}
                    required
                    className={form.productId ? 'valid' : ''}
                  />
                </div>
                <div className="form-group">
                  <label>SKU / Barcode <span className="optional">(optional)</span></label>
                  <input
                    type="text"
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    placeholder="e.g., SKU123456"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Product Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleNameChange}
                  required
                  className={form.name ? 'valid' : ''}
                />
              </div>

              <div className="form-group">
                <label>URL Slug <span className="optional">(auto-generated)</span></label>
                <input
                  type="text"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  className="slug-input"
                />
              </div>

              {/* Pricing */}
              <div className="form-section-title">💰 Pricing</div>
              <div className="form-row">
                <div className="form-group">
                  <label>Regular Price (₹) <span className="required">*</span></label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className={form.price ? 'valid' : ''}
                  />
                </div>
                <div className="form-group">
                  <label>Sale Price (₹) <span className="optional">(optional)</span></label>
                  <input
                    type="number"
                    name="salePrice"
                    value={form.salePrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                  />
                  {form.salePrice && form.price && Number(form.salePrice) < Number(form.price) && (
                    <small className="discount-info">
                      💰 {Math.round(((form.price - form.salePrice) / form.price) * 100)}% off
                    </small>
                  )}
                </div>
              </div>

              {/* Inventory */}
              <div className="form-section-title">📦 Inventory & Category</div>
              <div className="form-row">
                <div className="form-group">
                  <label>Stock Quantity <span className="required">*</span></label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    min="0"
                    className={form.stock && Number(form.stock) <= 10 ? 'warning' : form.stock ? 'valid' : ''}
                  />
                  {form.stock && Number(form.stock) <= 10 && Number(form.stock) > 0 && (
                    <small className="warning-text">⚠️ Low stock warning</small>
                  )}
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={form.category ? 'valid' : ''}
                  >
                    <option value="">Select Category</option>
                    <option value="Handbags">Handbags</option>
                    <option value="Wallets">Wallets</option>
                    <option value="Clutches">Clutches</option>
                    <option value="Totes">Totes</option>
                    <option value="Crossbody">Crossbody</option>
                    <option value="Backpacks">Backpacks</option>
                    <option value="Satchels">Satchels</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Brand <span className="optional">(optional)</span></label>
                  <input
                    type="text"
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    placeholder="e.g., VERA by Kamakshi"
                  />
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={form.featured}
                      onChange={(e) => setForm({...form, featured: e.target.checked})}
                    />
                    <span>⭐ Mark as Featured Product</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="form-section-title">📝 Description & Details</div>
              <div className="form-group">
                <label>Description <span className="optional">(optional)</span></label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  className={form.description ? 'valid' : ''}
                ></textarea>
                <small className="char-count">{form.description.length} characters</small>
              </div>

              {/* Images */}
              <div className="form-section-title">🖼️ Images</div>
              <div className="form-group">
                <label>Product Image (Upload) <span className="optional">(optional)</span></label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
              </div>
              <div className="form-group">
                <label>Or Image URL</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleImageUrlChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              {imagePreview && (
                <div className="image-preview-container">
                  <label>Image Preview:</label>
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                </div>
              )}

              {/* Colors */}
              <div className="form-section-title">🎨 Colors</div>
              <div className="form-group">
                <label>Available Colors</label>
                {colors.map((color, idx) => (
                  <div key={idx} className="color-input-row">
                    <input
                      type="color"
                      value={color}
                      onChange={e => handleColorChange(idx, e.target.value)}
                      className="color-picker"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={e => handleColorChange(idx, e.target.value)}
                      placeholder="#000000"
                      className="color-hex-input"
                    />
                    {colors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(idx)}
                        className="remove-color-btn"
                        title="Remove color"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={handleAddColor} className="add-color-btn">
                  + Add Color
                </button>
              </div>

              {/* Product Specifications */}
              <div className="form-section-title">📏 Specifications</div>
              <div className="form-row">
                <div className="form-group">
                  <label>Material <span className="optional">(optional)</span></label>
                  <input
                    type="text"
                    name="material"
                    value={form.material}
                    onChange={handleChange}
                    placeholder="e.g., Genuine Leather, Canvas"
                  />
                </div>
                <div className="form-group">
                  <label>Country of Origin <span className="optional">(optional)</span></label>
                  <input
                    type="text"
                    name="countryOfOrigin"
                    value={form.countryOfOrigin}
                    onChange={handleChange}
                    placeholder="e.g., India, Italy"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal-overlay" onClick={() => setDeleteModalOpen(false)}>
          <div className="modal-content modal-delete" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Deletion</h2>
              <button className="modal-close" onClick={() => setDeleteModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <span className="warning-icon">⚠️</span>
                <p>Are you sure you want to delete this product?</p>
              </div>
              {productToDelete && (
                <div className="product-delete-info">
                  <img src={productToDelete.image} alt={productToDelete.name} className="delete-product-image" />
                  <div className="delete-product-details">
                    <p><strong>Name:</strong> {productToDelete.name}</p>
                    <p><strong>ID:</strong> {productToDelete.productId}</p>
                    <p><strong>Price:</strong> ₹{productToDelete.price}</p>
                  </div>
                </div>
              )}
              <p className="delete-note">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </button>
              <button className="btn-delete-confirm" onClick={handleDeleteConfirm}>
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete User Confirmation Modal */}
      {deleteUserModalOpen && (
        <div className="modal-overlay" onClick={() => setDeleteUserModalOpen(false)}>
          <div className="modal-content modal-delete" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm User Deletion</h2>
              <button className="modal-close" onClick={() => setDeleteUserModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <span className="warning-icon">⚠️</span>
                <p>Are you sure you want to delete this user?</p>
              </div>
              {userToDelete && (
                <div className="product-delete-info">
                  <div className="delete-product-details">
                    <p><strong>Name:</strong> {userToDelete.fullName || userToDelete.name || userToDelete.displayName || 'N/A'}</p>
                    <p><strong>Contact Number:</strong> {userToDelete.phoneNumber || 'N/A'}</p>
                    <p><strong>Email:</strong> {userToDelete.email}</p>
                  </div>
                </div>
              )}
              <p className="delete-note">This action cannot be undone. All user data including orders, cart, and wishlist will remain.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteUserModalOpen(false)}>
                Cancel
              </button>
              <button className="btn-delete-confirm" onClick={handleDeleteUserConfirm}>
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
