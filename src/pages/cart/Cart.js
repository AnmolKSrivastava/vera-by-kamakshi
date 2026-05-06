// src/pages/cart/Cart.js
import React, { useState, useEffect } from 'react';
import './Cart.css';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../../utils/formatters';
import { productService } from '../../services/productService';

const Cart = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal, 
    getItemCount 
  } = useCart();
  const { addToWishlist } = useWishlist();
  const navigate = useNavigate();
  
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  
  // Fetch recommended products
  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const products = await productService.getFeatured(4);
        setRecommendedProducts(products);
      } catch (error) {
        console.error('Error fetching recommended products:', error);
      }
    };
    fetchRecommended();
  }, []);
  
  // Calculate estimated delivery date
  const getDeliveryDate = () => {
    const days = shippingMethod === 'express' ? 2 : 5;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  // Shipping costs
  const shippingCost = shippingMethod === 'express' ? 299 : 0;
  const giftWrapCost = giftWrap ? 99 : 0;
  
  // Apply coupon
  const applyCoupon = () => {
    setCouponError('');
    const code = couponCode.toUpperCase();
    
    // Sample coupon codes
    if (code === 'VERA10') {
      setCouponDiscount(getCartTotal() * 0.1);
    } else if (code === 'WELCOME15') {
      setCouponDiscount(getCartTotal() * 0.15);
    } else if (code === 'LUXURY20') {
      setCouponDiscount(getCartTotal() * 0.2);
    } else {
      setCouponError('Invalid coupon code');
      setCouponDiscount(0);
    }
  };
  
  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponError('');
  };
  
  // Calculate final total
  const subtotal = getCartTotal();
  const finalTotal = subtotal - couponDiscount + shippingCost + giftWrapCost;
  
  // Save for later (move to wishlist)
  const saveForLater = (item) => {
    addToWishlist(item);
    removeFromCart(item.id, item.options);
  };

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
          <button className="continue-shopping-btn" onClick={() => navigate('/collections')}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* Progress Indicator */}
        <div className="checkout-progress">
          <div className="progress-step active">
            <div className="step-number">1</div>
            <div className="step-label">Shopping Cart</div>
          </div>
          <div className="progress-line"></div>
          <div className="progress-step">
            <div className="step-number">2</div>
            <div className="step-label">Checkout</div>
          </div>
          <div className="progress-line"></div>
          <div className="progress-step">
            <div className="step-number">3</div>
            <div className="step-label">Payment</div>
          </div>
          <div className="progress-line"></div>
          <div className="progress-step">
            <div className="step-number">4</div>
            <div className="step-label">Complete</div>
          </div>
        </div>
        
        <h1 className="cart-title">Shopping Cart ({getItemCount()} items)</h1>
        
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
        
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={`${item.id}-${JSON.stringify(item.options)}`} className="cart-item">
                <div className="cart-item-image">
                  {(item.image || item.imageUrl) ? (
                    <img src={item.image || item.imageUrl} alt={item.name} loading="lazy" decoding="async" />
                  ) : (
                    <div className="cart-item-image-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#030213" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </div>
                  )}
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
                
                <div className="cart-item-actions">
                  <button 
                    className="action-btn save-later"
                    onClick={() => saveForLater(item)}
                    title="Save for later"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    Save for Later
                  </button>
                  <button 
                    className="action-btn remove"
                    onClick={() => removeFromCart(item.id, item.options)}
                    title="Remove item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h2>Order Summary</h2>
            
            {/* Coupon Code */}
            <div className="coupon-section">
              <label>Have a Coupon Code?</label>
              <div className="coupon-input-group">
                <input 
                  type="text" 
                  placeholder="Enter code" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={couponDiscount > 0}
                />
                {couponDiscount > 0 ? (
                  <button onClick={removeCoupon} className="remove-coupon-btn">Remove</button>
                ) : (
                  <button onClick={applyCoupon} className="apply-coupon-btn">Apply</button>
                )}
              </div>
              {couponError && <div className="coupon-error">{couponError}</div>}
              {couponDiscount > 0 && <div className="coupon-success">✓ Coupon applied successfully!</div>}
              <div className="coupon-suggestions">
                <small>Try: VERA10, WELCOME15, LUXURY20</small>
              </div>
            </div>
            
            <div className="summary-divider"></div>
            
            {/* Shipping Options */}
            <div className="shipping-section">
              <label>Shipping Method</label>
              <div className="shipping-options">
                <label className={`shipping-option ${shippingMethod === 'standard' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="shipping" 
                    value="standard"
                    checked={shippingMethod === 'standard'}
                    onChange={(e) => setShippingMethod(e.target.value)}
                  />
                  <div className="shipping-details">
                    <div className="shipping-name">Standard Delivery</div>
                    <div className="shipping-time">5-7 Business Days</div>
                  </div>
                  <div className="shipping-price">FREE</div>
                </label>
                <label className={`shipping-option ${shippingMethod === 'express' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="shipping" 
                    value="express"
                    checked={shippingMethod === 'express'}
                    onChange={(e) => setShippingMethod(e.target.value)}
                  />
                  <div className="shipping-details">
                    <div className="shipping-name">Express Delivery</div>
                    <div className="shipping-time">2-3 Business Days</div>
                  </div>
                  <div className="shipping-price">{formatPrice(299)}</div>
                </label>
              </div>
              <div className="estimated-delivery">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
                <span>Estimated delivery: <strong>{getDeliveryDate()}</strong></span>
              </div>
            </div>
            
            <div className="summary-divider"></div>
            
            {/* Gift Options */}
            <div className="gift-section">
              <label className="gift-wrap-toggle">
                <input 
                  type="checkbox" 
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                />
                <span>Add Gift Wrap ({formatPrice(99)})</span>
              </label>
              {giftWrap && (
                <div className="gift-message-input">
                  <textarea 
                    placeholder="Gift message (optional)"
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    maxLength={200}
                  />
                  <small>{giftMessage.length}/200 characters</small>
                </div>
              )}
            </div>
            
            <div className="summary-divider"></div>
            
            {/* Price Breakdown */}
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            
            {couponDiscount > 0 && (
              <div className="summary-row discount-row">
                <span>Discount</span>
                <span className="discount-amount">-{formatPrice(couponDiscount)}</span>
              </div>
            )}
            
            <div className="summary-row">
              <span>Shipping</span>
              <span className={shippingCost === 0 ? 'free-shipping' : ''}>
                {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
              </span>
            </div>
            
            {giftWrap && (
              <div className="summary-row">
                <span>Gift Wrap</span>
                <span>{formatPrice(giftWrapCost)}</span>
              </div>
            )}
            
            <div className="summary-divider"></div>
            
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>
            
            <div className="savings-highlight">
              {couponDiscount > 0 && (
                <div className="total-savings">
                  🎉 You're saving {formatPrice(couponDiscount)}!
                </div>
              )}
            </div>
            
            <button 
              className="checkout-btn"
              onClick={() => navigate('/checkout', {
                state: {
                  shippingMethod,
                  shippingCost,
                  giftWrap,
                  giftWrapCost,
                  giftMessage,
                  couponDiscount,
                  couponCode
                }
              })}
            >
              Proceed to Checkout
            </button>
            
            <button 
              className="continue-shopping-link"
              onClick={() => navigate('/collections')}
            >
              Continue Shopping
            </button>
            
            {/* Security Badge */}
            <div className="security-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>Secure SSL Encrypted Checkout</span>
            </div>
          </div>
        </div>
        
        {/* Recommended Products */}
        {recommendedProducts.length > 0 && (
          <div className="recommended-section">
            <h2 className="recommended-title">You May Also Like</h2>
            <div className="recommended-grid">
              {recommendedProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="recommended-product"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="recommended-image">
                    <img src={product.image || product.imageUrl} alt={product.name} loading="lazy" />
                  </div>
                  <div className="recommended-info">
                    <h4>{product.name}</h4>
                    <div className="recommended-price">
                      {product.salePrice ? (
                        <>
                          <span className="sale-price">{formatPrice(product.salePrice)}</span>
                          <span className="original-price">{formatPrice(product.price)}</span>
                        </>
                      ) : (
                        <span className="price">{formatPrice(product.price)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
