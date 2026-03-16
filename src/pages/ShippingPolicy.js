import React from 'react';
import './ContentPages.css';

const ShippingPolicy = () => {
  return (
    <div className="content-page">
      <div className="content-container">
        <h1 className="page-title">Shipping Policy</h1>
        <p className="page-intro">
          At VERA by Kamakshi, we ensure your order reaches you safely and on time.
        </p>

        <section className="content-section">
          <h2>Shipping Information</h2>
          
          <h3>Domestic Shipping (Within India)</h3>
          <ul>
            <li><strong>Free Shipping:</strong> On all orders across India with no minimum purchase requirement</li>
            <li><strong>Standard Delivery:</strong> 3-5 business days</li>
            <li><strong>Express Delivery:</strong> 1-2 business days (available at checkout with additional charges)</li>
            <li><strong>Metro Cities:</strong> Faster delivery in Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad</li>
          </ul>

          <h3>Order Processing Time</h3>
          <p>
            All orders are processed within 1-2 business days (Monday-Saturday). Orders placed on Sunday 
            or public holidays will be processed the next business day.
          </p>

          <h3>Tracking Your Order</h3>
          <p>
            Once your order is shipped, you will receive a shipping confirmation email with a tracking number. 
            You can track your order status by:
          </p>
          <ul>
            <li>Logging into your account and viewing "My Orders"</li>
            <li>Using the tracking link provided in the shipping confirmation email</li>
            <li>Contacting our customer support team</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>Shipping Charges</h2>
          <table className="policy-table">
            <thead>
              <tr>
                <th>Shipping Method</th>
                <th>Delivery Time</th>
                <th>Charges</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Standard Shipping</td>
                <td>3-5 business days</td>
                <td>FREE</td>
              </tr>
              <tr>
                <td>Express Shipping</td>
                <td>1-2 business days</td>
                <td>₹200</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="content-section">
          <h2>International Shipping</h2>
          <p>
            We currently ship within India only. International shipping will be available soon. 
            Please contact us at <a href="mailto:support@verabykamakshi.com">support@verabykamakshi.com</a> for 
            inquiries about international orders.
          </p>
        </section>

        <section className="content-section">
          <h2>Packaging</h2>
          <p>
            All our products are carefully packed in premium packaging with protective materials to ensure 
            your bag arrives in perfect condition. Each order includes:
          </p>
          <ul>
            <li>Luxury gift box with VERA by Kamakshi branding</li>
            <li>Dust bag for storage and protection</li>
            <li>Care instructions card</li>
            <li>Authenticity certificate</li>
            <li>Thank you note</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>Delivery Issues</h2>
          <p>
            If you experience any issues with delivery, such as delays or damaged packages, please contact 
            us immediately at <a href="mailto:support@verabykamakshi.com">support@verabykamakshi.com</a> or 
            call us at <a href="tel:+919876543210">+91 98765 43210</a>.
          </p>
        </section>

        <section className="content-section note-section">
          <p>
            <strong>Note:</strong> Delivery times are estimates and may vary due to unforeseen circumstances 
            such as weather conditions, courier delays, or public holidays. We appreciate your patience and 
            understanding.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ShippingPolicy;
