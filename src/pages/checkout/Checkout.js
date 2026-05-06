import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import ActionModal from '../../components/common/ActionModal';
import { createOrderFromCart } from '../../services/orderService';
import './Checkout.css';

// Payment logos
import codLogo from '../../assets/Payment/cash-on-delivery.svg';
import upiLogo from '../../assets/Payment/google-pay.svg';
import visaLogo from '../../assets/Payment/visa.svg';
import mastercardLogo from '../../assets/Payment/mastercard.svg';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  
  // Get cart preferences from navigation state
  const cartPreferences = location.state || {};
  const {
    shippingMethod = 'standard',
    shippingCost: passedShippingCost = 0,
    giftWrap = false,
    giftWrapCost: passedGiftWrapCost = 0,
    giftMessage = '',
    couponDiscount = 0,
    couponCode = ''
  } = cartPreferences;
  
  const [step, setStep] = useState(1); // 1: Address, 2: Payment
  const [loading, setLoading] = useState(false);
  const orderPlacedRef = useRef(false);
  const [errors, setErrors] = useState({});
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'default'
  });

  const scrollPageToTop = () => {
    window.scrollTo(0, 0);

    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }

    if (document.body) {
      document.body.scrollTop = 0;
    }
  };
  
  // Guest user info (if not logged in)
  const [guestEmail, setGuestEmail] = useState('');
  
  // Shipping address form
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    phone: '+91'
  });
  
  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  // Order summary calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = passedShippingCost;
  const giftWrapCost = passedGiftWrapCost;
  const discount = couponDiscount;
  const total = subtotal + shippingCost + giftWrapCost - discount;
  
  useEffect(() => {
    // Redirect if cart is empty (but not if we just placed an order)
    if (cartItems.length === 0 && !orderPlacedRef.current) {
      navigate('/cart');
    }
    
    // Pre-fill user info if logged in
    if (user) {
      // You can load saved addresses from Firestore here
      setShippingAddress(prev => ({
        ...prev,
        name: user.displayName || '',
        phone: user.phoneNumber || ''
      }));
    }
  }, [cartItems, user, navigate]);

  useEffect(() => {
    scrollPageToTop();

    requestAnimationFrame(() => {
      scrollPageToTop();
    });
  }, [step]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number
    if (name === 'phone') {
      let phoneValue = value;
      // Ensure +91 prefix is always present
      if (!phoneValue.startsWith('+91')) {
        phoneValue = '+91';
      }
      // Only allow digits after +91, limit to 10 digits
      const digitsOnly = phoneValue.slice(3).replace(/\D/g, '');
      phoneValue = '+91' + digitsOnly.slice(0, 10);
      
      setShippingAddress(prev => ({
        ...prev,
        [name]: phoneValue
      }));
    } else {
      setShippingAddress(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateAddress = () => {
    const newErrors = {};
    
    if (!shippingAddress.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!shippingAddress.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address is required';
    }
    if (!shippingAddress.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!shippingAddress.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!shippingAddress.pincode.trim()) {
      newErrors.pincode = 'PIN code is required';
    } else if (!/^\d{6}$/.test(shippingAddress.pincode)) {
      newErrors.pincode = 'Invalid PIN code (6 digits)';
    }
    if (!shippingAddress.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(shippingAddress.phone)) {
      newErrors.phone = 'Invalid phone number';
    }
    
    // Guest user validation
    if (!user) {
      if (!guestEmail.trim()) {
        newErrors.guestEmail = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
        newErrors.guestEmail = 'Invalid email address';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleContinueToPayment = () => {
    if (validateAddress()) {
      setStep(2);
    }
  };
  
  const handlePlaceOrder = async () => {
    setLoading(true);
    
    try {
      let orderId;
      
      if (paymentMethod === 'COD') {
        // Create order directly for COD
        orderId = await createOrderFromCart(
          user?.uid || `guest_${Date.now()}`,
          cartItems,
          shippingAddress,
          'COD',
          { status: 'pending' },
          user?.email || guestEmail,
          {
            shippingMethod,
            shippingCost,
            giftWrap,
            giftWrapCost,
            giftMessage,
            couponCode,
            couponDiscount
          }
        );
        
        const successPayload = {
          orderId,
          total,
          paymentMethod: 'COD'
        };

        sessionStorage.setItem('checkoutSuccess', JSON.stringify(successPayload));

        // Set flag before clearing cart to prevent empty-cart redirect
        orderPlacedRef.current = true;
        clearCart();
        
        // Navigate to confirmation
        navigate(`/order-confirmation/${orderId}`, {
          state: { 
            orderDetails: successPayload
          }
        });
      } else {
        // For online payment methods, initialize Razorpay
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID,
          amount: total * 100, // Amount in paise
          currency: 'INR',
          name: 'Vera by Kamakshi',
          description: 'Purchase from Vera',
          image: '/logo192.png',
          handler: async function(response) {
            // Payment successful
            orderId = await createOrderFromCart(
              user?.uid || `guest_${Date.now()}`,
              cartItems,
              shippingAddress,
              paymentMethod,
              {
                status: 'paid',
                transactionId: response.razorpay_payment_id
              },
              user?.email || guestEmail,
              {
                shippingMethod,
                shippingCost,
                giftWrap,
                giftWrapCost,
                giftMessage,
                couponCode,
                couponDiscount
              }
            );
            
            const successPayload = {
              orderId,
              total,
              paymentMethod,
              transactionId: response.razorpay_payment_id
            };

            sessionStorage.setItem('checkoutSuccess', JSON.stringify(successPayload));

            orderPlacedRef.current = true;
            clearCart();
            navigate(`/order-confirmation/${orderId}`, {
              state: { 
                orderDetails: successPayload
              }
            });
          },
          prefill: {
            name: shippingAddress.name,
            email: user?.email || guestEmail,
            contact: shippingAddress.phone
          },
          notes: {
            address: `${shippingAddress.addressLine1}, ${shippingAddress.city}`
          },
          theme: {
            color: '#333333'
          },
          modal: {
            ondismiss: function() {
              setLoading(false);
            }
          }
        };
        
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      console.error('Error placing order:', error);
      
      // Check if it's a stock-related error
      if (error.message && error.message.includes('Stock issues')) {
        setStatusModal({
          isOpen: true,
          title: 'Cannot Place Order',
          message: error.message.split('Stock issues:')[1].trim(),
          variant: 'danger'
        });
      } else if (error.message && error.message.includes('Insufficient stock')) {
        setStatusModal({
          isOpen: true,
          title: 'Cannot Place Order',
          message: error.message,
          variant: 'danger'
        });
      } else {
        setStatusModal({
          isOpen: true,
          title: 'Checkout Failed',
          message: 'Failed to place order. Please try again.',
          variant: 'danger'
        });
      }
      
      setLoading(false);
    }
  };
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
  };
  
  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Progress Indicator */}
        <div className="checkout-progress">
          <div className="progress-step completed">
            <div className="step-number">1</div>
            <div className="step-label">Shopping Cart</div>
          </div>
          <div className="progress-line completed"></div>
          <div className={`progress-step ${step >= 2 ? 'completed' : step === 1 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Checkout</div>
          </div>
          <div className={`progress-line ${step >= 2 ? 'completed' : ''}`}></div>
          <div className={`progress-step ${step === 2 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Payment</div>
          </div>
          <div className="progress-line"></div>
          <div className="progress-step">
            <div className="step-number">4</div>
            <div className="step-label">Complete</div>
          </div>
        </div>
        
        <div className="checkout-header">
          <h1>{step === 1 ? 'Shipping Details' : 'Payment Method'}</h1>
        </div>
        
        <div className="checkout-content">
          <div className="checkout-main">
            {/* Step 1: Shipping Address */}
            {step === 1 && (
              <div className="address-section">
                <h2>Shipping Address</h2>
                
                {!user && (
                  <div className="guest-info">
                    <p className="guest-notice">
                      Checking out as a guest. <button onClick={() => navigate('/login')}>Login</button> to save your address.
                    </p>
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => {
                          setGuestEmail(e.target.value);
                          if (errors.guestEmail) {
                            setErrors(prev => ({ ...prev, guestEmail: '' }));
                          }
                        }}
                        placeholder="your@email.com"
                        className={errors.guestEmail ? 'error' : ''}
                      />
                      {errors.guestEmail && <span className="error-message">{errors.guestEmail}</span>}
                    </div>
                  </div>
                )}
                
                <form className="address-form">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={shippingAddress.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      placeholder="+91 XXXXXXXXXX"
                      className={errors.phone ? 'error' : ''}
                    />
                    <small className="input-hint">Enter your 10-digit mobile number</small>
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label>Address Line 1 *</label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={shippingAddress.addressLine1}
                      onChange={handleInputChange}
                      placeholder="House No., Building Name, Street"
                      className={errors.addressLine1 ? 'error' : ''}
                    />
                    {errors.addressLine1 && <span className="error-message">{errors.addressLine1}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label>Address Line 2</label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={shippingAddress.addressLine2}
                      onChange={handleInputChange}
                      placeholder="Locality, Area (Optional)"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        className={errors.city ? 'error' : ''}
                      />
                      {errors.city && <span className="error-message">{errors.city}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label>State *</label>
                      <input
                        type="text"
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleInputChange}
                        placeholder="State"
                        className={errors.state ? 'error' : ''}
                      />
                      {errors.state && <span className="error-message">{errors.state}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label>PIN Code *</label>
                      <input
                        type="text"
                        name="pincode"
                        value={shippingAddress.pincode}
                        onChange={handleInputChange}
                        placeholder="123456"
                        maxLength="6"
                        className={errors.pincode ? 'error' : ''}
                      />
                      {errors.pincode && <span className="error-message">{errors.pincode}</span>}
                    </div>
                  </div>
                  
                  <button 
                    type="button" 
                    className="continue-btn"
                    onClick={handleContinueToPayment}
                  >
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}
            
            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="payment-section">
                <button className="back-btn" onClick={() => setStep(1)}>
                  ← Back to Address
                </button>
                
                <h2>Select Payment Method</h2>
                <p className="payment-subtitle">Choose how you'd like to pay for your order</p>
                
                <div className="payment-methods">
                  <div 
                    className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('COD')}
                  >
                    <div className="payment-radio">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="COD" 
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                      />
                      <span className="radio-checkmark"></span>
                    </div>
                    <div className="payment-icon cod-icon">
                      <img src={codLogo} alt="Cash on Delivery" />
                    </div>
                    <div className="payment-details">
                      <h4>Cash on Delivery</h4>
                      <p>Pay with cash when your order is delivered</p>
                    </div>
                    {paymentMethod === 'COD' && <span className="selected-badge">✓</span>}
                  </div>
                  
                  <div 
                    className={`payment-option ${paymentMethod === 'UPI' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('UPI')}
                  >
                    <div className="payment-radio">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="UPI" 
                        checked={paymentMethod === 'UPI'}
                        onChange={() => setPaymentMethod('UPI')}
                      />
                      <span className="radio-checkmark"></span>
                    </div>
                    <div className="payment-icon upi-icon">
                      <img src={upiLogo} alt="UPI Payment" />
                    </div>
                    <div className="payment-details">
                      <h4>UPI Payment</h4>
                      <p>Google Pay, PhonePe, Paytm & more</p>
                    </div>
                    {paymentMethod === 'UPI' && <span className="selected-badge">✓</span>}
                  </div>
                  
                  <div 
                    className={`payment-option ${paymentMethod === 'Card' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('Card')}
                  >
                    <div className="payment-radio">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="Card" 
                        checked={paymentMethod === 'Card'}
                        onChange={() => setPaymentMethod('Card')}
                      />
                      <span className="radio-checkmark"></span>
                    </div>
                    <div className="payment-icon card-icon">
                      <img src={visaLogo} alt="Visa" className="card-logo" />
                      <img src={mastercardLogo} alt="Mastercard" className="card-logo" />
                    </div>
                    <div className="payment-details">
                      <h4>Credit/Debit Card</h4>
                      <p>Visa, Mastercard, Rupay & more</p>
                    </div>
                    {paymentMethod === 'Card' && <span className="selected-badge">✓</span>}
                  </div>
                </div>
                
                <button 
                  className="place-order-btn"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : `Place Order - ${formatPrice(total)}`}
                </button>
              </div>
            )}
          </div>
          
          {/* Order Summary Sidebar */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            
            <div className="summary-items">
              {cartItems.map((item, idx) => (
                <div key={idx} className="summary-item">
                  {(item.imageUrl || item.image || item.images?.[0]) ? (
                    <img src={item.imageUrl || item.image || item.images?.[0]} alt={item.name} />
                  ) : (
                    <div className="summary-item-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#030213" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </div>
                  )}
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="summary-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="total-row">
                <span>Shipping ({shippingMethod === 'express' ? 'Express 2-3 days' : 'Standard 5-7 days'})</span>
                <span>{shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}</span>
              </div>
              {giftWrap && (
                <div className="total-row">
                  <span>Gift Wrap</span>
                  <span>{formatPrice(giftWrapCost)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="total-row discount">
                  <span>Discount {couponCode && `(${couponCode})`}</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="total-row grand-total">
                <span>Total</span>
                <strong>{formatPrice(total)}</strong>
              </div>
            </div>
            
            {giftWrap && giftMessage && (
              <div className="shipping-notice" style={{background: '#f0f9ff', borderLeft: '3px solid #3b82f6'}}>
                <strong>Gift Message:</strong> {giftMessage}
              </div>
            )}
          </div>
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
};

export default Checkout;
