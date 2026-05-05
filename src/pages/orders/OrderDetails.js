import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, updateOrderStatus } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import './OrderDetails.css';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (orderId) {
      getOrderById(orderId)
        .then(setOrder)
        .finally(() => setLoading(false));
    }
  }, [orderId]);

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
  };

  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      setCancelling(true);
      try {
        await updateOrderStatus(orderId, 'cancelled', user?.email || 'User');
        setOrder(prev => ({ ...prev, status: 'cancelled' }));
        alert('Order cancelled successfully. Product stock has been restored.');
      } catch (error) {
        console.error('Error cancelling order:', error);
        alert('Failed to cancel order: ' + (error.message || 'Unknown error'));
      } finally {
        setCancelling(false);
      }
    }
  };

  const getOrderTimeline = () => {
    const timeline = [
      { status: 'pending', label: 'Order Placed', completed: true },
      { status: 'processing', label: 'Processing', completed: ['processing', 'shipped', 'delivered'].includes(order?.status) },
      { status: 'shipped', label: 'Shipped', completed: ['shipped', 'delivered'].includes(order?.status) },
      { status: 'delivered', label: 'Delivered', completed: order?.status === 'delivered' }
    ];

    if (order?.status === 'cancelled') {
      return [
        { status: 'pending', label: 'Order Placed', completed: true },
        { status: 'cancelled', label: 'Cancelled', completed: true }
      ];
    }

    return timeline;
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-not-found">
        <h3>Order not found</h3>
        <button onClick={() => navigate('/orders')}>Back to Orders</button>
      </div>
    );
  }

  // Check if user owns this order (basic security)
  if (user && order.userId !== user.uid) {
    return (
      <div className="order-not-found">
        <h3>Access Denied</h3>
        <p>You don't have permission to view this order.</p>
        <button onClick={() => navigate('/orders')}>Back to Orders</button>
      </div>
    );
  }

  return (
    <div className="order-details-page">
      <div className="order-details-header">
        <button className="back-btn" onClick={() => navigate('/orders')}>
          ← Back to Orders
        </button>
        <h1>Order Details</h1>
      </div>

      <div className="order-details-container">
        {/* Order Summary Card */}
        <div className="order-summary-card">
          <div className="order-info-row">
            <div>
              <h3>Order #{order.id.slice(0, 8).toUpperCase()}</h3>
              <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <div className={`order-status-badge ${order.status}`}>
              {order.status.toUpperCase()}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="order-timeline">
            <h4>Order Status</h4>
            <div className="timeline">
              {getOrderTimeline().map((step, idx) => (
                <div key={idx} className={`timeline-step ${step.completed ? 'completed' : ''}`}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <p className="timeline-label">{step.label}</p>
                  </div>
                  {idx < getOrderTimeline().length - 1 && <div className="timeline-line"></div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="order-details-grid">
          {/* Shipping Address */}
          <div className="details-card">
            <h4>Shipping Address</h4>
            <div className="address-details">
              <p><strong>{order.shippingAddress?.name || 'N/A'}</strong></p>
              <p>{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</p>
              <p>Phone: {order.shippingAddress?.phone}</p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="details-card">
            <h4>Payment Information</h4>
            <div className="payment-details">
              <div className="detail-row">
                <span>Payment Method:</span>
                <strong>{order.paymentMethod || 'COD'}</strong>
              </div>
              <div className="detail-row">
                <span>Payment Status:</span>
                <strong className={order.paymentStatus}>{order.paymentStatus || 'Pending'}</strong>
              </div>
              {order.transactionId && (
                <div className="detail-row">
                  <span>Transaction ID:</span>
                  <span>{order.transactionId}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="order-items-card">
          <h4>Order Items</h4>
          <div className="items-list">
            {order.items?.map((item, idx) => (
              <div key={idx} className="order-item-row">
                <img src={item.imageUrl || '/placeholder.jpg'} alt={item.name} className="item-image" loading="lazy" decoding="async" />
                <div className="item-details">
                  <h5>{item.name}</h5>
                  {item.size && <p>Size: {item.size}</p>}
                  {item.color && <p>Color: {item.color}</p>}
                </div>
                <div className="item-quantity">
                  Qty: {item.quantity}
                </div>
                <div className="item-price">
                  {formatPrice(item.price)}
                </div>
                <div className="item-total">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Order Total */}
          <div className="order-total-section">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>{formatPrice(order.subtotal || order.totalAmount)}</span>
            </div>
            {order.discount > 0 && (
              <div className="total-row discount">
                <span>Discount:</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="total-row">
              <span>Shipping:</span>
              <span>{order.shippingCost ? formatPrice(order.shippingCost) : 'FREE'}</span>
            </div>
            <div className="total-row grand-total">
              <span>Total:</span>
              <strong>{formatPrice(order.totalAmount)}</strong>
            </div>
          </div>
        </div>

        {/* Order Actions */}
        <div className="order-actions-card">
          {(order.status === 'pending' || order.status === 'processing') && (
            <button 
              className="cancel-order-btn" 
              onClick={handleCancelOrder}
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
          {order.status === 'delivered' && (
            <>
              <button className="download-invoice-btn">Download Invoice</button>
              <button className="reorder-btn" onClick={() => navigate('/collections')}>
                Order Again
              </button>
            </>
          )}
          <button className="help-btn" onClick={() => navigate('/contact')}>
            Need Help?
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
