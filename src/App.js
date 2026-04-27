
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AdminProvider } from './context/AdminContext';
import { WishlistProvider } from './context/WishlistContext';

// Pages
import Home from './pages/Home';
import Collections from './pages/Collections';
import ProductDescription from './pages/ProductDescription';
import Cart from './pages/cart/Cart';
import Wishlist from './pages/Wishlist';
import SearchResults from './pages/SearchResults';
import AdminDashboard from './pages/admin/AdminDashboard';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import ShippingPolicy from './pages/ShippingPolicy';
import ReturnPolicy from './pages/ReturnPolicy';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import FAQ from './pages/FAQ';
import MyOrders from './pages/orders/MyOrders';
import OrderDetails from './pages/orders/OrderDetails';
import Checkout from './pages/checkout/Checkout';
import OrderConfirmation from './pages/checkout/OrderConfirmation';

// Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import UserLogin from './components/auth/UserLogin';
import AdminLogin from './components/auth/AdminLogin';

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';
  const [loginOpen, setLoginOpen] = useState(false);
  const { user, isAdmin, loading } = useAuth();
  
  return (
    <div className="app-layout">
      {!isAdminPage && <Header onLoginClick={() => setLoginOpen(true)} />}
      <div className={`app-content ${isAdminPage ? 'no-header' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/shop" element={<Navigate to="/collections" replace />} />
          <Route path="/product/:id" element={<ProductDescription />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/return-policy" element={<ReturnPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/orders/:orderId" element={<OrderDetails />} />
          <Route path="/admin" element={
            loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                Loading...
              </div>
            ) : !user || !isAdmin ? (
              <AdminLogin asPage={true} />
            ) : (
              <AdminDashboard />
            )
          } />
        </Routes>
      </div>
      {!isAdminPage && <Footer />}
      {loginOpen && <UserLogin isOpen={loginOpen} onClose={() => setLoginOpen(false)} />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <WishlistProvider>
            <CartProvider>
              <ScrollToTop />
              <AppContent />
            </CartProvider>
          </WishlistProvider>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
