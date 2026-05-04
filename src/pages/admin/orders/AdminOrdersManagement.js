import React, { useEffect, useState } from 'react';
import { getAllOrders, updateOrder, updateOrderStatus } from '../../../services/orderService';
import { useAuth } from '../../../context/AuthContext';
import './AdminOrdersManagement.css';

const AdminOrdersManagement = ({ onLog }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const fetchedOrders = await getAllOrders();
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      // Use updateOrderStatus for status changes (handles stock restoration for cancellations)
      await updateOrderStatus(selectedOrder.id, newStatus, user?.email || 'Admin');
      
      // Update tracking number separately if provided
      if (trackingNumber && trackingNumber !== selectedOrder.trackingNumber) {
        await updateOrder(selectedOrder.id, { trackingNumber });
      }
      
      // Refresh orders to get updated data
      await fetchOrders();

      // Log activity
      if (onLog) {
        const statusMessage = newStatus === 'cancelled' 
          ? `Order #${selectedOrder.id.slice(0, 8)} cancelled (stock restored)` 
          : `Order #${selectedOrder.id.slice(0, 8)} status changed to ${newStatus}`;
        onLog('Order Status Updated', statusMessage);
      }

      setShowStatusModal(false);
      setSelectedOrder(null);
      setNewStatus('');
      setTrackingNumber('');
      
      const message = newStatus === 'cancelled'
        ? 'Order cancelled successfully. Stock has been restored.'
        : 'Order status updated successfully';
      alert(message);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status: ' + (error.message || 'Unknown error'));
    }
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setTrackingNumber(order.trackingNumber || '');
    setShowStatusModal(true);
  };

  const filteredOrders = orders
    .filter(order => {
      if (filter !== 'all' && order.status !== filter) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          order.id.toLowerCase().includes(search) ||
          order.userId?.toLowerCase().includes(search) ||
          order.shippingAddress?.name?.toLowerCase().includes(search) ||
          order.shippingAddress?.phone?.includes(search)
        );
      }
      return true;
    });

  const getOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      totalRevenue: orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    };
  };

  const stats = getOrderStats();

  if (loading) {
    return <div className="admin-loading">Loading orders...</div>;
  }

  return (
    <div className="admin-orders-management">
      <div className="section-header">
        <h2>Orders Management</h2>
        <button className="refresh-btn" onClick={fetchOrders}>Refresh</button>
      </div>

      <div className="orders-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card processing">
          <div className="stat-value">{stats.processing}</div>
          <div className="stat-label">Processing</div>
        </div>
        <div className="stat-card shipped">
          <div className="stat-value">{stats.shipped}</div>
          <div className="stat-label">Shipped</div>
        </div>
        <div className="stat-card delivered">
          <div className="stat-value">{stats.delivered}</div>
          <div className="stat-label">Delivered</div>
        </div>
        <div className="stat-card revenue">
          <div className="stat-value">{formatPrice(stats.totalRevenue)}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
      </div>

      {/* Filters */}
      <div className="orders-controls">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
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
        <input
          type="text"
          placeholder="Search by Order ID, Customer Name, Phone..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id}>
                  <td>
                    <span className="order-id-cell">#{order.id.slice(0, 8).toUpperCase()}</span>
                  </td>
                  <td>
                    <div className="customer-cell">
                      <div>{order.shippingAddress?.name || 'N/A'}</div>
                      <div className="customer-phone">{order.shippingAddress?.phone}</div>
                    </div>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>{order.items?.length || 0} items</td>
                  <td><strong>{formatPrice(order.totalAmount)}</strong></td>
                  <td>
                    <span className={`payment-badge ${order.paymentStatus}`}>
                      {order.paymentMethod || 'COD'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn view-btn"
                        onClick={() => setSelectedOrder(order)}
                        title="View Details"
                      >
                        👁️
                      </button>
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => openStatusModal(order)}
                        title="Update Status"
                      >
                        ✏️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && !showStatusModal && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details - #{selectedOrder.id.slice(0, 8).toUpperCase()}</h3>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="order-detail-section">
                <h4>Customer Information</h4>
                <p><strong>Name:</strong> {selectedOrder.shippingAddress?.name}</p>
                <p><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone}</p>
                <p><strong>Email:</strong> {selectedOrder.email || 'N/A'}</p>
              </div>
              
              <div className="order-detail-section">
                <h4>Shipping Address</h4>
                <p>{selectedOrder.shippingAddress?.addressLine1}</p>
                {selectedOrder.shippingAddress?.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.pincode}</p>
              </div>

              <div className="order-detail-section">
                <h4>Order Items</h4>
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="modal-item">
                    <img src={item.imageUrl} alt={item.name} />
                    <div>
                      <p><strong>{item.name}</strong></p>
                      <p>Qty: {item.quantity} × {formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-detail-section">
                <h4>Payment & Status</h4>
                <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod || 'COD'}</p>
                <p><strong>Payment Status:</strong> {selectedOrder.paymentStatus || 'Pending'}</p>
                <p><strong>Order Status:</strong> <span className={`status-badge ${selectedOrder.status}`}>{selectedOrder.status}</span></p>
                {selectedOrder.trackingNumber && (
                  <p><strong>Tracking Number:</strong> {selectedOrder.trackingNumber}</p>
                )}
                <p><strong>Total Amount:</strong> {formatPrice(selectedOrder.totalAmount)}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn secondary" onClick={() => setSelectedOrder(null)}>Close</button>
              <button className="modal-btn primary" onClick={() => openStatusModal(selectedOrder)}>
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Order Status</h3>
              <button className="close-btn" onClick={() => setShowStatusModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Order ID</label>
                <input type="text" value={`#${selectedOrder.id.slice(0, 8).toUpperCase()}`} disabled />
              </div>
              <div className="form-group">
                <label>Current Status</label>
                <input type="text" value={selectedOrder.status} disabled />
              </div>
              <div className="form-group">
                <label>New Status *</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              {newStatus === 'shipped' && (
                <div className="form-group">
                  <label>Tracking Number</label>
                  <input
                    type="text"
                    placeholder="Enter tracking number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="modal-btn secondary" onClick={() => setShowStatusModal(false)}>
                Cancel
              </button>
              <button className="modal-btn primary" onClick={handleStatusUpdate}>
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersManagement;
