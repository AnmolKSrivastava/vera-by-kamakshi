import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { createOrderFromCart } from '../../services/orderService';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  
  const [step, setStep] = useState(1); // 1: Address, 2: Payment
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
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
    phone: ''
  });
  
  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  // Order summary calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = subtotal > 999 ? 0 : 99;
  const discount = 0;
  const total = subtotal + shippingCost - discount;
  
  useEffect(() => {
    // Redirect if cart is empty
    if (cartItems.length === 0) {
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
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
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
          user?.email || guestEmail
        );
        
        // Clear cart
        clearCart();
        
        // Navigate to confirmation
        navigate(`/order-confirmation/${orderId}`, {
          state: { 
            orderDetails: { 
              orderId, 
              total, 
              paymentMethod: 'COD' 
            } 
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
              user?.email || guestEmail
            );
            
            clearCart();
            navigate(`/order-confirmation/${orderId}`, {
              state: { 
                orderDetails: { 
                  orderId, 
                  total, 
                  paymentMethod,
                  transactionId: response.razorpay_payment_id
                } 
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
      alert('Failed to place order. Please try again.');
      setLoading(false);
    }
  };
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
  };
  
  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <div className="checkout-steps">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Shipping Address</span>
            </div>
            <div className="step-divider"></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Payment</span>
            </div>
          </div>
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
                      placeholder="+91 1234567890"
                      className={errors.phone ? 'error' : ''}
                    />
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
                
                <div className="payment-methods">
                  <div 
                    className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('COD')}
                  >
                    <input 
                      type="radio" 
                      name="payment" 
                      value="COD" 
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                    />
                    <div className="payment-details">
                      <h4>Cash on Delivery (COD)</h4>
                      <p>Pay with cash when your order is delivered</p>
                    </div>
                  </div>
                  
                  <div 
                    className={`payment-option ${paymentMethod === 'UPI' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('UPI')}
                  >
                    <input 
                      type="radio" 
                      name="payment" 
                      value="UPI" 
                      checked={paymentMethod === 'UPI'}
                      onChange={() => setPaymentMethod('UPI')}
                    />
                    <div className="payment-details">
                      <h4>UPI</h4>
                      <p>Pay with Google Pay, PhonePe, Paytm & more</p>
                    </div>
                  </div>
                  
                  <div 
                    className={`payment-option ${paymentMethod === 'Card' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('Card')}
                  >
                    <input 
                      type="radio" 
                      name="payment" 
                      value="Card" 
                      checked={paymentMethod === 'Card'}
                      onChange={() => setPaymentMethod('Card')}
                    />
                    <div className="payment-details">
                      <h4>Credit/Debit Card</h4>
                      <p>Visa, Mastercard, Rupay & more</p>
                    </div>
                  </div>
                  
                  <div 
                    className={`payment-option ${paymentMethod === 'NetBanking' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('NetBanking')}
                  >
                    <input 
                      type="radio" 
                      name="payment" 
                      value="NetBanking" 
                      checked={paymentMethod === 'NetBanking'}
                      onChange={() => setPaymentMethod('NetBanking')}
                    />
                    <div className="payment-details">
                      <h4>Net Banking</h4>
                      <p>All major banks supported</p>
                    </div>
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
                  <img src={item.imageUrl || item.images?.[0]} alt={item.name} />
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
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}</span>
              </div>
              {discount > 0 && (
                <div className="total-row discount">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="total-row grand-total">
                <span>Total</span>
                <strong>{formatPrice(total)}</strong>
              </div>
            </div>
            
            {subtotal < 999 && (
              <div className="shipping-notice">
                Add {formatPrice(999 - subtotal)} more for FREE shipping!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
