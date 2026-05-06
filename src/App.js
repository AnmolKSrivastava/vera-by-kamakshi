
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AdminProvider } from './context/AdminContext';
import { WishlistProvider } from './context/WishlistContext';

// Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import SeoManager from './components/common/SeoManager';
import ScrollToTop from './components/common/ScrollToTop';

// Pages
const Home = lazy(() => import('./pages/Home'));
const Collections = lazy(() => import('./pages/Collections'));
const ProductDescription = lazy(() => import('./pages/ProductDescription'));
const Cart = lazy(() => import('./pages/cart/Cart'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'));
const ReturnPolicy = lazy(() => import('./pages/ReturnPolicy'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const FAQ = lazy(() => import('./pages/FAQ'));
const MyOrders = lazy(() => import('./pages/orders/MyOrders'));
const OrderDetails = lazy(() => import('./pages/orders/OrderDetails'));
const UserProfile = lazy(() => import('./pages/profile/UserProfile'));
const Checkout = lazy(() => import('./pages/checkout/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/checkout/OrderConfirmation'));
const UserLogin = lazy(() => import('./components/auth/UserLogin'));
const AdminLogin = lazy(() => import('./components/auth/AdminLogin'));

function AppShellFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
      Loading...
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';
  const { user, isAdmin, loading, loginModalOpen, openLoginModal, closeLoginModal } = useAuth();
  
  return (
    <div className="app-layout">
      <SeoManager />
      {!isAdminPage && <Header onLoginClick={openLoginModal} />}
      <div className={`app-content ${isAdminPage ? 'no-header' : ''}`}>
        <Suspense fallback={<AppShellFallback />}>
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
            <Route path="/profile" element={<UserProfile />} />
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
        </Suspense>
      </div>
      {!isAdminPage && <Footer />}
      {loginModalOpen && (
        <Suspense fallback={null}>
          <UserLogin isOpen={loginModalOpen} onClose={closeLoginModal} />
        </Suspense>
      )}
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
