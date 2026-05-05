import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatters';
import './Wishlist.css';

function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    // Add to cart with default quantity and first available color
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1,
      selectedColor: product.colors?.[0] || 'Default'
    };
    addToCart(cartItem);
    removeFromWishlist(product.id);
  };

  const handleRemove = (productId) => {
    removeFromWishlist(productId);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div className="wishlist-header">
            <h1>My Wishlist</h1>
            <p className="wishlist-count">0 items</p>
          </div>
          <div className="wishlist-empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ef5350" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <h2>Your Wishlist is Empty</h2>
            <p>Save items you love for later!</p>
            <Link to="/collections" className="continue-shopping-btn">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <div className="wishlist-header">
          <h1>My Wishlist</h1>
          <p className="wishlist-count">{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}</p>
        </div>

        <div className="wishlist-grid">
          {wishlistItems.map((item) => (
            <div key={item.id} className="wishlist-item">
              <button 
                className="remove-from-wishlist-btn"
                onClick={() => handleRemove(item.id)}
                aria-label="Remove from wishlist"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>

              <Link to={`/product/${item.id}`} className="wishlist-item-link">
                <div className="wishlist-item-image">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} loading="lazy" decoding="async" />
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

                <div className="wishlist-item-details">
                  <h3 className="wishlist-item-name">{item.name}</h3>
                  <p className="wishlist-item-price">{formatPrice(item.price)}</p>
                  {item.colors && item.colors.length > 0 && (
                    <div className="wishlist-item-colors">
                      {item.colors.slice(0, 3).map((color, index) => (
                        <span 
                          key={index} 
                          className="wishlist-color-dot" 
                          style={{ backgroundColor: color }}
                          title={color}
                        ></span>
                      ))}
                      {item.colors.length > 3 && (
                        <span className="wishlist-color-more">+{item.colors.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </Link>

              <button 
                className="move-to-cart-btn"
                onClick={() => handleMoveToCart(item)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Wishlist;
