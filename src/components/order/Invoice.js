import React from 'react';
import './Invoice.css';

const Invoice = ({ order }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!order) return null;

  return (
    <div className="invoice-container">
      <div className="invoice-actions no-print">
        <button className="print-btn" onClick={handlePrint}>Print Invoice</button>
        <button className="download-btn" onClick={handlePrint}>Download PDF</button>
      </div>

      <div className="invoice-content">
        {/* Invoice Header */}
        <div className="invoice-header">
          <div className="company-info">
            <h1>VERA</h1>
            <p>By Kamakshi</p>
            <p>Premium Ethnic Wear</p>
          </div>
          <div className="invoice-meta">
            <h2>TAX INVOICE</h2>
            <p><strong>Invoice #:</strong> INV-{order.id.slice(0, 8).toUpperCase()}</p>
            <p><strong>Order #:</strong> {order.id.slice(0, 8).toUpperCase()}</p>
            <p><strong>Date:</strong> {formatDate(order.createdAt)}</p>
          </div>
        </div>

        <div className="invoice-divider"></div>

        {/* Billing & Shipping Info */}
        <div className="invoice-addresses">
          <div className="address-box">
            <h3>Bill To:</h3>
            <p><strong>{order.shippingAddress?.name}</strong></p>
            <p>{order.shippingAddress?.addressLine1}</p>
            {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
            <p>{order.shippingAddress?.pincode}</p>
            <p>Phone: {order.shippingAddress?.phone}</p>
          </div>
          <div className="address-box">
            <h3>Ship To:</h3>
            <p><strong>{order.shippingAddress?.name}</strong></p>
            <p>{order.shippingAddress?.addressLine1}</p>
            {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
            <p>{order.shippingAddress?.pincode}</p>
            <p>Phone: {order.shippingAddress?.phone}</p>
          </div>
        </div>

        <div className="invoice-divider"></div>

        {/* Order Items Table */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>
                  <strong>{item.name}</strong>
                  {item.size && <div className="item-meta">Size: {item.size}</div>}
                  {item.color && <div className="item-meta">Color: {item.color}</div>}
                  {item.sku && <div className="item-meta">SKU: {item.sku}</div>}
                </td>
                <td>{item.quantity}</td>
                <td>{formatPrice(item.price)}</td>
                <td>{formatPrice(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Invoice Summary */}
        <div className="invoice-summary">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>{formatPrice(order.subtotal || order.totalAmount)}</span>
          </div>
          {order.discount > 0 && (
            <div className="summary-row discount">
              <span>Discount:</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          {order.couponCode && (
            <div className="summary-row">
              <span>Coupon Applied ({order.couponCode}):</span>
              <span>-{formatPrice(order.couponDiscount || 0)}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Shipping Charges:</span>
            <span>{order.shippingCost ? formatPrice(order.shippingCost) : 'FREE'}</span>
          </div>
          <div className="summary-row tax">
            <span>GST (Included in price)</span>
            <span>-</span>
          </div>
          <div className="summary-row total">
            <span><strong>Grand Total:</strong></span>
            <span><strong>{formatPrice(order.totalAmount)}</strong></span>
          </div>
        </div>

        <div className="invoice-divider"></div>

        {/* Payment Info */}
        <div className="invoice-payment">
          <h3>Payment Information</h3>
          <div className="payment-details">
            <p><strong>Payment Method:</strong> {order.paymentMethod || 'Cash on Delivery'}</p>
            <p><strong>Payment Status:</strong> <span className={`status ${order.paymentStatus}`}>{order.paymentStatus || 'Pending'}</span></p>
            {order.transactionId && <p><strong>Transaction ID:</strong> {order.transactionId}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          <div className="footer-section">
            <h4>Terms & Conditions</h4>
            <ul>
              <li>Returns accepted within 7 days of delivery</li>
              <li>Product must be unused with original tags</li>
              <li>Refund will be processed within 7-10 business days</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact Us</h4>
            <p>Email: support@vera-kamakshi.com</p>
            <p>Phone: +91 XXX XXX XXXX</p>
            <p>Website: www.vera-kamakshi.com</p>
          </div>
        </div>

        <div className="invoice-signature">
          <p>This is a computer-generated invoice and does not require a signature.</p>
          <p><strong>Thank you for shopping with Vera!</strong></p>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
