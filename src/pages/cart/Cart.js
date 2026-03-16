// src/pages/cart/Cart.js
import React from 'react';
import './Cart.css';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../../utils/formatters';

const Cart = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal, 
    getItemCount 
  } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-content">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <h2>Your cart is empty</h2>
          <p>Add some products to get started</p>
          <button className="continue-shopping-btn" onClick={() => navigate('/shop')}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1 className="cart-title">Shopping Cart ({getItemCount()} items)</h1>
        
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={`${item.id}-${JSON.stringify(item.options)}`} className="cart-item">
                <div className="cart-item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                
                <div className="cart-item-details">
                  <h3 className="cart-item-name">{item.name}</h3>
                  <div className="cart-item-price">{formatPrice(item.price)}</div>
                  
                  {item.options?.color && (
                    <div className="cart-item-color">
                      Color: 
                      <span 
                        className="color-preview" 
                        style={{ backgroundColor: item.options.color }}
                      ></span>
                    </div>
                  )}
                  
                  {item.options?.size && (
                    <div className="cart-item-size">Size: {item.options.size}</div>
                  )}
                </div>
                
                <div className="cart-item-quantity">
                  <label>Quantity:</label>
                  <div className="quantity-controls">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.options)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.options)}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="cart-item-total">
                  {formatPrice(item.price * item.quantity)}
                </div>
                
                <button 
                  className="cart-item-remove"
                  onClick={() => removeFromCart(item.id, item.options)}
                  aria-label="Remove item"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(getCartTotal())}</span>
            </div>
            
            <div className="summary-row">
              <span>Shipping</span>
              <span className="free-shipping">FREE</span>
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>{formatPrice(getCartTotal())}</span>
            </div>
            
            <button 
              className="checkout-btn"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </button>
            
            <button 
              className="continue-shopping-link"
              onClick={() => navigate('/shop')}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
