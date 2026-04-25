import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getOrderById } from '../../services/orderService';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const orderDetails = location.state?.orderDetails;
  
  useEffect(() => {
    if (orderId) {
      getOrderById(orderId)
        .then(setOrder)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [orderId]);
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) {
    return (
      <div className="confirmation-loading">
        <div className="spinner"></div>
        <p>Loading your order details...</p>
      </div>
    );
  }
  
  return (
    <div className="order-confirmation-page">
      <div className="confirmation-container">
        {/* Success Message */}
        <div className="success-section">
          <div className="success-icon">✓</div>
          <h1>Order Placed Successfully!</h1>
          <p className="success-message">
            Thank you for your order. We've received your order and will begin processing it shortly.
          </p>
          {order && (
            <div className="order-number">
              Order #<strong>{order.id.slice(0, 8).toUpperCase()}</strong>
            </div>
          )}
        </div>
        
        {/* Order Details */}
        {order && (
          <div className="confirmation-details">
            <div className="details-section">
              <h2>Order Summary</h2>
              <div className="order-info-grid">
                <div className="info-item">
                  <span className="label">Order Date:</span>
                  <span className="value">{formatDate(order.createdAt)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Payment Method:</span>
                  <span className="value">{order.paymentMethod || 'COD'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Order Total:</span>
                  <span className="value total">{formatPrice(order.totalAmount)}</span>
                </div>
                {orderDetails?.transactionId && (
                  <div className="info-item">
                    <span className="label">Transaction ID:</span>
                    <span className="value">{orderDetails.transactionId}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Shipping Address */}
            <div className="details-section">
              <h2>Shipping Address</h2>
              <div className="address-box">
                <p><strong>{order.shippingAddress?.name}</strong></p>
                <p>{order.shippingAddress?.addressLine1}</p>
                {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</p>
                <p>Phone: {order.shippingAddress?.phone}</p>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="details-section">
              <h2>Order Items</h2>
              <div className="items-list">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="confirmation-item">
                    <img src={item.imageUrl} alt={item.name} />
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p>Quantity: {item.quantity}</p>
                      {item.size && <p>Size: {item.size}</p>}
                      {item.color && <p>Color: {item.color}</p>}
                    </div>
                    <div className="item-price">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Price Breakdown */}
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Subtotal:</span>
                  <span>{formatPrice(order.subtotal || order.totalAmount)}</span>
                </div>
                <div className="price-row">
                  <span>Shipping:</span>
                  <span>{order.shippingCost ? formatPrice(order.shippingCost) : 'FREE'}</span>
                </div>
                {order.discount > 0 && (
                  <div className="price-row discount">
                    <span>Discount:</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="price-row total">
                  <span><strong>Total:</strong></span>
                  <span><strong>{formatPrice(order.totalAmount)}</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Next Steps */}
        <div className="next-steps">
          <h2>What's Next?</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon">📧</div>
              <h3>Order Confirmation</h3>
              <p>You'll receive an order confirmation email shortly with all the details.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">📦</div>
              <h3>Processing</h3>
              <p>We'll start processing your order and prepare it for shipment.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">🚚</div>
              <h3>Shipping Updates</h3>
              <p>Track your order status in the "My Orders" section.</p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="confirmation-actions">
          <button 
            className="view-order-btn"
            onClick={() => navigate(`/orders/${orderId}`)}
          >
            View Order Details
          </button>
          <button 
            className="continue-shopping-btn"
            onClick={() => navigate('/collections')}
          >
            Continue Shopping
          </button>
        </div>
        
        {/* Support Section */}
        <div className="support-section">
          <p>Need help with your order?</p>
          <button 
            className="contact-support-btn"
            onClick={() => navigate('/contact')}
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
