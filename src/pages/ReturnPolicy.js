import React from 'react';
import './ContentPages.css';

const ReturnPolicy = () => {
  return (
    <div className="content-page">
      <div className="content-container">
        <h1 className="page-title">Return & Refund Policy</h1>
        <p className="page-intro">
          We want you to be completely satisfied with your purchase. If you're not happy with your order, 
          we're here to help with our hassle-free return policy.
        </p>

        <section className="content-section">
          <h2>Return Period</h2>
          <p>
            You have <strong>7 days</strong> from the date of delivery to initiate a return. 
            To be eligible for a return, your item must be:
          </p>
          <ul>
            <li>Unused and in the same condition that you received it</li>
            <li>In the original packaging with all tags attached</li>
            <li>Accompanied by the original invoice</li>
            <li>Complete with all accessories (dust bag, care card, etc.)</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>How to Initiate a Return</h2>
          <ol className="numbered-list">
            <li><strong>Contact Us:</strong> Email us at <a href="mailto:returns@verabykamakshi.com">returns@verabykamakshi.com</a> or call +91 98765 43210 within 7 days of receiving your order</li>
            <li><strong>Provide Details:</strong> Include your order number, product details, and reason for return</li>
            <li><strong>Get Approval:</strong> Our team will review and approve your return request within 24 hours</li>
            <li><strong>Ship the Item:</strong> Pack the item securely in its original packaging and ship it to our return address (provided via email)</li>
            <li><strong>Receive Refund:</strong> Once we receive and inspect the returned item, we'll process your refund</li>
          </ol>
        </section>

        <section className="content-section">
          <h2>Refund Process</h2>
          <p>
            Once your return is received and inspected, we will send you an email to notify you that we have 
            received your returned item. We will also notify you of the approval or rejection of your refund.
          </p>
          <p>
            If approved, your refund will be processed, and a credit will automatically be applied to your 
            original method of payment within <strong>5-7 business days</strong>.
          </p>
          
          <h3>Refund Methods</h3>
          <table className="policy-table">
            <thead>
              <tr>
                <th>Payment Method</th>
                <th>Refund Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Credit/Debit Card</td>
                <td>5-7 business days</td>
              </tr>
              <tr>
                <td>UPI</td>
                <td>3-5 business days</td>
              </tr>
              <tr>
                <td>Net Banking</td>
                <td>5-7 business days</td>
              </tr>
              <tr>
                <td>Cash on Delivery</td>
                <td>7-10 business days (bank transfer)</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="content-section">
          <h2>Exchange Policy</h2>
          <p>
            We offer exchanges for size or color changes, subject to availability. To request an exchange:
          </p>
          <ul>
            <li>Contact us within 7 days of delivery</li>
            <li>Return the original item (must meet return conditions)</li>
            <li>Specify the replacement product/variant you want</li>
            <li>We'll ship the replacement once we receive the original item</li>
          </ul>
          <p className="note">
            <strong>Note:</strong> If there's a price difference, you'll either be refunded or charged accordingly.
          </p>
        </section>

        <section className="content-section">
          <h2>Non-Returnable Items</h2>
          <p>The following items cannot be returned:</p>
          <ul>
            <li>Items returned after 7 days of delivery</li>
            <li>Products that show signs of use or damage</li>
            <li>Items without original tags or packaging</li>
            <li>Personalized or customized products</li>
            <li>Sale or clearance items (unless defective)</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>Damaged or Defective Items</h2>
          <p>
            If you receive a damaged or defective item, please contact us immediately with photos of the 
            damage. We will arrange for a replacement or full refund at no additional cost to you, 
            including return shipping.
          </p>
          <p>
            <strong>Report within 48 hours</strong> of receiving the product for fastest resolution.
          </p>
        </section>

        <section className="content-section">
          <h2>Return Shipping Costs</h2>
          <ul>
            <li><strong>Standard Returns:</strong> Customer is responsible for return shipping costs</li>
            <li><strong>Defective/Wrong Items:</strong> We cover all return shipping costs</li>
            <li><strong>Exchanges:</strong> Original return shipping paid by customer; new item ships free</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>Late or Missing Refunds</h2>
          <p>
            If you haven't received your refund within the specified timeframe:
          </p>
          <ol className="numbered-list">
            <li>Check your bank account again</li>
            <li>Contact your credit card company (may take time to post)</li>
            <li>Contact your bank (processing time before refund is posted)</li>
            <li>If you've done all this and still haven't received your refund, contact us at <a href="mailto:refunds@verabykamakshi.com">refunds@verabykamakshi.com</a></li>
          </ol>
        </section>

        <section className="content-section note-section">
          <p>
            <strong>Questions?</strong> If you have any questions about our return policy, please don't hesitate 
            to contact us at <a href="mailto:support@verabykamakshi.com">support@verabykamakshi.com</a> or 
            call +91 98765 43210.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ReturnPolicy;
