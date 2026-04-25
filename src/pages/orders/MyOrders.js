import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserOrders } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import './MyOrders.css';

const MyOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, processing, shipped, delivered, cancelled

  useEffect(() => {
    if (user) {
      getUserOrders(user.uid).then(setOrders).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="empty-orders">
        <h3>Please login to view your orders</h3>
        <button className="shop-now-btn" onClick={() => navigate('/')}>Go to Home</button>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="empty-orders">
        <h3>No orders yet</h3>
        <p>Looks like you haven't placed any orders yet.</p>
        <button className="shop-now-btn" onClick={() => navigate('/collections')}>Start Shopping</button>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <h1>My Orders</h1>
      
      <div className="orders-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Orders ({orders.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={`filter-btn ${filter === 'processing' ? 'active' : ''}`}
          onClick={() => setFilter('processing')}
        >
          Processing
        </button>
        <button 
          className={`filter-btn ${filter === 'shipped' ? 'active' : ''}`}
          onClick={() => setFilter('shipped')}
        >
          Shipped
        </button>
        <button 
          className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
          onClick={() => setFilter('delivered')}
        >
          Delivered
        </button>
        <button 
          className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilter('cancelled')}
        >
          Cancelled
        </button>
      </div>

      <div className="orders-list">
        {filteredOrders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <div className="order-id">Order #{order.id.slice(0, 8).toUpperCase()}</div>
                <div className="order-date">Placed on {formatDate(order.createdAt)}</div>
              </div>
              <div className={`order-status ${order.status}`}>{order.status}</div>
            </div>

            <div className="order-items">
              {order.items?.slice(0, 3).map((item, idx) => (
                <div key={idx} className="order-item">
                  <img src={item.imageUrl || '/placeholder.jpg'} alt={item.name} className="order-item-image" />
                  <div className="order-item-details">
                    <h4>{item.name}</h4>
                    <p>Qty: {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                </div>
              ))}
              {order.items?.length > 3 && (
                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
                  +{order.items.length - 3} more items
                </p>
              )}
            </div>

            <div className="order-footer">
              <div className="order-total">
                Total: {formatPrice(order.totalAmount)}
              </div>
              <div className="order-actions">
                <button 
                  className="order-btn primary" 
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  View Details
                </button>
                {order.status === 'delivered' && (
                  <button className="order-btn">Download Invoice</button>
                )}
                {(order.status === 'pending' || order.status === 'processing') && (
                  <button className="order-btn">Cancel Order</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && filter !== 'all' && (
        <div className="empty-orders">
          <h3>No {filter} orders</h3>
          <p>You don't have any orders with this status.</p>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
