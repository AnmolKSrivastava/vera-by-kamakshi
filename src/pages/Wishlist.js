import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ActionModal from '../components/common/ActionModal';
import { formatPrice } from '../utils/formatters';
import './Wishlist.css';

function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { openLoginModal } = useAuth();
  const navigate = useNavigate();
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'default'
  });

  const handleMoveToCart = async (product) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || product.imageUrl,
      imageUrl: product.imageUrl || product.image,
      quantity: 1,
      stock: product.stock,
      available: product.available,
      selectedColor: product.colors?.[0] || 'Default'
    };
    const result = await addToCart(cartItem);
    if (!result.success) {
      if (result.error === 'auth_required') {
        openLoginModal();
      } else if (result.error === 'out_of_stock') {
        setStatusModal({ isOpen: true, title: 'Out of Stock', message: 'This item is currently out of stock.', variant: 'danger' });
      } else if (result.error === 'insufficient_stock') {
        setStatusModal({ isOpen: true, title: 'Limited Stock', message: `Only ${result.available} item(s) available right now.`, variant: 'danger' });
      }
      return;
    }
    removeFromWishlist(product.id);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-empty">
        <div className="wishlist-empty-content">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <h2>Your wishlist is empty</h2>
          <p>Save items you love and find them here</p>
          <button className="continue-shopping-btn" onClick={() => navigate('/collections')}>
            Explore Collections
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">

        <h1 className="wishlist-title">My Wishlist ({wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'})</h1>

        {/* Trust Badges */}
        <div className="trust-badges">
          <div className="trust-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>Secure Checkout</span>
          </div>
          <div className="trust-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Fast Delivery</span>
          </div>
          <div className="trust-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            <span>100% Authentic</span>
          </div>
          <div className="trust-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Easy Returns</span>
          </div>
        </div>

        {/* Items list */}
        <div className="wishlist-items">
          {wishlistItems.map((item) => {
            const hasStockData = item.stock !== undefined && item.stock !== null && item.stock !== '';
            const numericStock = hasStockData ? Number(item.stock) : null;
            const isOutOfStock = (hasStockData && numericStock === 0) || item.available === false;
            const isLowStock = !isOutOfStock && hasStockData && numericStock > 0 && numericStock <= 5;
            const imgSrc = item.imageUrl || item.image;

            return (
              <div key={item.id} className={`wishlist-item${isOutOfStock ? ' out-of-stock' : ''}`}>
                {/* Image */}
                <div className="wishlist-item-image">
                  {imgSrc ? (
                    <img src={imgSrc} alt={item.name} loading="lazy" decoding="async" />
                  ) : (
                    <div className="wishlist-item-image-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#030213" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="wishlist-item-details">
                  {item.category && <p className="wishlist-item-category">{item.category}</p>}
                  <Link to={`/product/${item.id}`} className="wishlist-item-name">{item.name}</Link>
                  <div className="wishlist-item-price">{formatPrice(item.price)}</div>
                  {isOutOfStock && <span className="wishlist-stock-badge badge-out">Out of Stock</span>}
                  {isLowStock && <span className="wishlist-stock-badge badge-low">Only {numericStock} left</span>}
                </div>

                {/* Actions */}
                <div className="wishlist-item-actions">
                  <button
                    className="wishlist-move-to-cart-btn"
                    onClick={() => handleMoveToCart(item)}
                    disabled={isOutOfStock}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1"></circle>
                      <circle cx="20" cy="21" r="1"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    {isOutOfStock ? 'Out of Stock' : 'Move to Cart'}
                  </button>
                  <button
                    className="wishlist-remove-btn"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                      <path d="M10 11v6M14 11v6"></path>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="wishlist-footer">
          <button className="continue-shopping-link" onClick={() => navigate('/collections')}>
            Continue Shopping
          </button>
        </div>

      </div>

      <ActionModal
        isOpen={statusModal.isOpen}
        title={statusModal.title}
        message={statusModal.message}
        confirmText="Close"
        showCancel={false}
        onConfirm={() => setStatusModal((prev) => ({ ...prev, isOpen: false }))}
        onCancel={() => setStatusModal((prev) => ({ ...prev, isOpen: false }))}
        variant={statusModal.variant}
      />
    </div>
  );
}

export default Wishlist;
