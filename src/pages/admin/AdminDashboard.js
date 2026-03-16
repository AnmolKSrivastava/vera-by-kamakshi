import React from "react";
import "./AdminDashboard.css";
import { useState, useEffect, useCallback } from "react";
import { productService } from "../../services/productService";
import { storageService } from "../../services/storageService";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const { user } = useAuth();
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
  
  // Analytics State
  const [analyticsData, setAnalyticsData] = useState({
    salesData: [],
    categoryData: [],
    topProducts: [],
    totalRevenue: 0,
    totalOrders: 0
  });

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

  // Fetch Activity Logs
  const fetchActivityLogs = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'activityLogs'));
      const logs = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 50); // Latest 50 logs
      setActivityLogs(logs);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
    }
  }, []);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, []);

  // Fetch Coupons
  const fetchCoupons = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'coupons'));
      const couponsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCoupons(couponsList);
    } catch (err) {
      console.error('Error fetching coupons:', err);
    }
  }, []);

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const productList = await productService.getAll();
      setProducts(productList);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
    setLoadingProducts(false);
  }, []);
  
  // Fetch Stock History
  const fetchStockHistory = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'stockHistory'));
      const history = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 100); // Latest 100 entries
      setStockHistory(history);
    } catch (err) {
      console.error('Error fetching stock history:', err);
    }
  }, []);
  
  // Fetch Analytics Data
  const fetchAnalytics = useCallback(async () => {
    try {
      // For now, generate mock analytics data from products
      // In production, this would query orders collection
      const categoryBreakdown = {};
      products.forEach(p => {
        const cat = p.category || 'Uncategorized';
        if (!categoryBreakdown[cat]) {
          categoryBreakdown[cat] = { name: cat, value: 0, count: 0 };
        }
        categoryBreakdown[cat].value += (p.price || 0);
        categoryBreakdown[cat].count += 1;
      });
      
      const categoryData = Object.values(categoryBreakdown);
      
      // Mock sales data for last 30 days
      const salesData = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        salesData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: Math.floor(Math.random() * 50000) + 10000,
          orders: Math.floor(Math.random() * 20) + 5
        });
      }
      
      // Top products by stock value
      const topProducts = [...products]
        .filter(p => p.stock > 0)
        .sort((a, b) => (b.price * b.stock) - (a.price * a.stock))
        .slice(0, 5)
        .map(p => ({
          name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
          value: p.price * p.stock,
          stock: p.stock
        }));
      
      setAnalyticsData({
        salesData,
        categoryData,
        topProducts,
        totalRevenue: salesData.reduce((sum, d) => sum + d.revenue, 0),
        totalOrders: salesData.reduce((sum, d) => sum + d.orders, 0)
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  }, [products]);

  // Fetch products when Products section is opened
  useEffect(() => {
    if (activeSection === "products") {
      fetchProducts();
    } else if (activeSection === "coupons") {
      fetchCoupons();
    } else if (activeSection === "users") {
      fetchUsers();
    } else if (activeSection === "logs") {
      fetchActivityLogs();
    } else if (activeSection === "inventory") {
      fetchProducts();
      fetchStockHistory();
    } else if (activeSection === "dashboard") {
      fetchProducts();
      fetchUsers();
      fetchCoupons();
      fetchAnalytics();
    }
  }, [activeSection, fetchProducts, fetchCoupons, fetchUsers, fetchActivityLogs, fetchStockHistory, fetchAnalytics]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  // Inventory Management Handlers
  const handleBulkStockUpdate = async () => {
    try {
      for (const product of bulkUpdateProducts) {
        if (product.newStock !== undefined && product.newStock !== product.stock) {
          const oldStock = product.stock;
          const newStock = Number(product.newStock);
          
          // Update product stock
          await updateDoc(doc(db, 'products', product.id), {
            stock: newStock,
            updatedAt: new Date().toISOString()
          });
          
          // Log stock change to history
          await addDoc(collection(db, 'stockHistory'), {
            productId: product.productId,
            productName: product.name,
            oldStock,
            newStock,
            change: newStock - oldStock,
            reason: 'Bulk Update',
            updatedBy: user?.email || 'Admin',
            timestamp: new Date().toISOString()
          });
          
          await logActivity('STOCK_UPDATE', `Updated stock for ${product.name}: ${oldStock} → ${newStock}`);
        }
      }
      
      alert('Stock updated successfully!');
      setBulkUpdateProducts([]);
      fetchProducts();
      fetchStockHistory();
    } catch (err) {
      console.error('Error updating stock:', err);
      alert('Error updating stock: ' + err.message);
    }
  };
  
  const handleStockChange = (productId, newStock) => {
    setBulkUpdateProducts(prev => {
      const existing = prev.find(p => p.id === productId);
      if (existing) {
        return prev.map(p => p.id === productId ? { ...p, newStock: Number(newStock) } : p);
      } else {
        const product = products.find(p => p.id === productId);
        return [...prev, { ...product, newStock: Number(newStock) }];
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
      // Refresh products list if on products section
      if (activeSection === "products") {
        fetchProducts();
      }
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
      name: product.name || '',
      price: product.price || '',
      imageUrl: product.image || '',
      description: product.description || '',
      stock: product.stock || 0,
      category: product.category || ''
    });
    setColors(product.colors || ['#000000']);
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
        name: form.name,
        price: Number(form.price),
        image: imageUrl,
        imageUrl: imageUrl,
        description: form.description || '',
        stock: Number(form.stock) || 0,
        category: form.category || 'Uncategorized',
        colors: colors.map(c => c.trim()).filter(Boolean)
      };
      await productService.update(editingProduct.id, updatedProduct);
      await logActivity('EDIT_PRODUCT', `Updated product: ${updatedProduct.name}`);
      setSubmitMsg("Product updated successfully!");
      setEditModalOpen(false);
      setEditingProduct(null);
      setImageFile(null);
      fetchProducts();
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
      fetchProducts();
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
      fetchCoupons();
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
        fetchCoupons();
      } catch (err) {
        console.error("Error deleting coupon:", err);
      }
    }
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
                <div className="stat-icon">📦</div>
                <div className="stat-content">
                  <div className="stat-value">{products.length}</div>
                  <div className="stat-label">Total Products</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <div className="stat-value">{users.length}</div>
                  <div className="stat-label">Total Users</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎫</div>
                <div className="stat-content">
                  <div className="stat-value">{coupons.length}</div>
                  <div className="stat-label">Active Coupons</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <div className="stat-value">
                    {products.reduce((sum, p) => sum + (p.stock || 0), 0)}
                  </div>
                  <div className="stat-label">Total Stock</div>
                </div>
              </div>
            </div>

            {/* Low Stock Alert */}
            {products.filter(p => (p.stock || 0) < 5 && (p.stock || 0) > 0).length > 0 && (
              <div className="alert-box warning">
                <strong>⚠️ Low Stock Alert:</strong> 
                {products.filter(p => (p.stock || 0) < 5 && (p.stock || 0) > 0).length} products have low stock
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
            
            {loadingProducts ? (
              <div className="loading-state">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="empty-state">No products found. Add a product from the Dashboard section.</div>
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
                    {products.map((product) => (
                      <tr key={product.id} className={product.stock < 5 ? 'low-stock-row' : ''}>
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
                          <span className={`stock-badge ${product.stock < 5 ? 'low' : product.stock < 10 ? 'medium' : 'high'}`}>
                            {product.stock || 0}
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
                    ))}
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
            <h1 className="admin-title">Sales Analytics & Reports</h1>
            
            {/* Key Metrics */}
            <div className="analytics-metrics">
              <div className="metric-card">
                <div className="metric-icon">💰</div>
                <div className="metric-content">
                  <div className="metric-value">₹{analyticsData.totalRevenue.toLocaleString()}</div>
                  <div className="metric-label">Total Revenue (30 days)</div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">📦</div>
                <div className="metric-content">
                  <div className="metric-value">{analyticsData.totalOrders}</div>
                  <div className="metric-label">Total Orders (30 days)</div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">📈</div>
                <div className="metric-content">
                  <div className="metric-value">
                    ₹{analyticsData.totalOrders > 0 ? Math.round(analyticsData.totalRevenue / analyticsData.totalOrders).toLocaleString() : 0}
                  </div>
                  <div className="metric-label">Average Order Value</div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">🛍️</div>
                <div className="metric-content">
                  <div className="metric-value">
                    ₹{products.length > 0 ? Math.round(products.reduce((sum, p) => sum + (p.price || 0) * (p.stock || 0), 0)).toLocaleString() : 0}
                  </div>
                  <div className="metric-label">Total Inventory Value</div>
                </div>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="charts-row">
              <div className="chart-container">
                <h3 className="chart-title">Sales & Orders Trend (Last 30 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8b7355" strokeWidth={2} name="Revenue (₹)" />
                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={2} name="Orders" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="charts-row">
              <div className="chart-container half">
                <h3 className="chart-title">Sales by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry.name} (${entry.count})`}
                    >
                      {analyticsData.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#8b7355', '#d4a574', '#e0c9a6', '#bfa589', '#9b8269', '#7f6a53'][index % 6]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="chart-container half">
                <h3 className="chart-title">Top Products by Inventory Value</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Bar dataKey="value" fill="#8b7355" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Products Performance Table */}
            <div className="performance-table-section">
              <h3>Products Performance Overview</h3>
              <table className="performance-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Unit Price</th>
                    <th>Stock Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 10).map((product) => {
                    const stockValue = (product.price || 0) * (product.stock || 0);
                    const stockStatus = product.stock === 0 ? 'Out of Stock' : product.stock < 5 ? 'Low Stock' : 'In Stock';
                    return (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>{product.category || 'N/A'}</td>
                        <td>{product.stock || 0}</td>
                        <td>₹{product.price.toLocaleString()}</td>
                        <td>₹{stockValue.toLocaleString()}</td>
                        <td>
                          <span className={`status-badge ${stockStatus.toLowerCase().replace(' ', '-')}`}>
                            {stockStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === "inventory" && (
          <div className="inventory-section">
            <h1 className="admin-title">Inventory Management</h1>
            
            {/* Inventory Overview */}
            <div className="inventory-overview">
              <div className="inventory-stat">
                <h3>Total Products</h3>
                <p className="stat-number">{products.length}</p>
              </div>
              <div className="inventory-stat">
                <h3>Total Units</h3>
                <p className="stat-number">{products.reduce((sum, p) => sum + (p.stock || 0), 0)}</p>
              </div>
              <div className="inventory-stat">
                <h3>Low Stock Items</h3>
                <p className="stat-number warning">{products.filter(p => p.stock > 0 && p.stock < 5).length}</p>
              </div>
              <div className="inventory-stat">
                <h3>Out of Stock</h3>
                <p className="stat-number danger">{products.filter(p => p.stock === 0).length}</p>
              </div>
            </div>

            {/* Bulk Stock Update */}
            <div className="bulk-update-section">
              <h2>Bulk Stock Update</h2>
              <p className="section-description">Update stock quantities for multiple products at once</p>
              
              {loadingProducts ? (
                <div className="loading-state">Loading products...</div>
              ) : (
                <>
                  <div className="bulk-update-table-container">
                    <table className="bulk-update-table">
                      <thead>
                        <tr>
                          <th>Product ID</th>
                          <th>Product Name</th>
                          <th>Category</th>
                          <th>Current Stock</th>
                          <th>New Stock</th>
                          <th>Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => {
                          const bulkProduct = bulkUpdateProducts.find(p => p.id === product.id);
                          const newStock = bulkProduct?.newStock;
                          const change = newStock !== undefined ? newStock - (product.stock || 0) : 0;
                          
                          return (
                            <tr key={product.id}>
                              <td>{product.productId}</td>
                              <td>{product.name}</td>
                              <td>{product.category}</td>
                              <td>
                                <span className={`stock-badge ${product.stock < 5 ? 'low' : 'high'}`}>
                                  {product.stock || 0}
                                </span>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="stock-input"
                                  min="0"
                                  placeholder={product.stock || 0}
                                  onChange={(e) => handleStockChange(product.id, e.target.value)}
                                  value={newStock !== undefined ? newStock : ''}
                                />
                              </td>
                              <td>
                                {change !== 0 && (
                                  <span className={`change-indicator ${change > 0 ? 'positive' : 'negative'}`}>
                                    {change > 0 ? '+' : ''}{change}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
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
              {products.filter(p => p.stock < 5).length === 0 ? (
                <div className="empty-state">All products are well-stocked! 🎉</div>
              ) : (
                <div className="alerts-grid">
                  {products
                    .filter(p => p.stock < 5)
                    .sort((a, b) => a.stock - b.stock)
                    .map((product) => (
                      <div key={product.id} className={`alert-card ${product.stock === 0 ? 'critical' : 'warning'}`}>
                        <div className="alert-header">
                          <span className="alert-icon">{product.stock === 0 ? '🔴' : '⚠️'}</span>
                          <span className="alert-status">
                            {product.stock === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}
                          </span>
                        </div>
                        <div className="alert-content">
                          <h4>{product.name}</h4>
                          <p><strong>Product ID:</strong> {product.productId}</p>
                          <p><strong>Current Stock:</strong> {product.stock} units</p>
                          <p><strong>Category:</strong> {product.category}</p>
                          {product.stock === 0 && (
                            <p className="reorder-suggestion">⚡ Immediate reorder recommended</p>
                          )}
                          {product.stock > 0 && product.stock < 5 && (
                            <p className="reorder-suggestion">📋 Consider restocking soon</p>
                          )}
                        </div>
                        <button 
                          className="btn-quick-restock"
                          onClick={() => {
                            setActiveSection('inventory');
                            setTimeout(() => {
                              const input = document.querySelector(`input[data-product-id="${product.id}"]`);
                              if (input) input.focus();
                            }, 100);
                          }}
                        >
                          Quick Restock
                        </button>
                      </div>
                    ))}
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
          <div className="orders-section">
            <h1 className="admin-title">Orders Management</h1>
            <div className="placeholder-section">Orders section coming soon...</div>
          </div>
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
                      <th>Email</th>
                      <th>Name</th>
                      <th>Joined</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.email}</td>
                        <td>{user.name || 'N/A'}</td>
                        <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <span className={`role-badge ${user.role || 'user'}`}>
                            {user.role || 'User'}
                          </span>
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
              <div className="form-row">
                <div className="form-group">
                  <label>Product ID</label>
                  <input
                    type="text"
                    value={editingProduct.productId}
                    onChange={(e) => setEditingProduct({ ...editingProduct, productId: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    value={editingProduct.stock || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
                    min="0"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={editingProduct.category || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    <option value="Handbags">Handbags</option>
                    <option value="Wallets">Wallets</option>
                    <option value="Clutches">Clutches</option>
                    <option value="Totes">Totes</option>
                    <option value="Crossbody">Crossbody</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  rows="3"
                ></textarea>
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="text"
                  value={editingProduct.image || editingProduct.imageUrl || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                />
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
    </div>
  );
};

export default AdminDashboard;
