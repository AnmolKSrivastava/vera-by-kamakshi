import React from 'react';
import './ContentPages.css';

const TermsConditions = () => {
  return (
    <div className="content-page">
      <div className="content-container">
        <h1 className="page-title">Terms & Conditions</h1>
        <p className="page-intro">
          Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <p className="page-intro">
          Please read these Terms and Conditions carefully before using the VERA by Kamakshi website 
          and services. By accessing or using our services, you agree to be bound by these terms.
        </p>

        <section className="content-section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using this website (verabykamakshi.com), you accept and agree to be bound 
            by these Terms and Conditions and our Privacy Policy. If you do not agree with any part of 
            these terms, you must not use our website or services.
          </p>
        </section>

        <section className="content-section">
          <h2>2. Eligibility</h2>
          <p>To use our services, you must:</p>
          <ul>
            <li>Be at least 18 years of age</li>
            <li>Have the legal capacity to enter into binding contracts</li>
            <li>Not be prohibited from using our services under any applicable laws</li>
            <li>Provide accurate and complete information during registration and purchase</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>3. Account Registration</h2>
          <p>When you create an account with us:</p>
          <ul>
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You are responsible for all activities that occur under your account</li>
            <li>You must notify us immediately of any unauthorized access or security breach</li>
            <li>We reserve the right to suspend or terminate accounts for violation of these terms</li>
            <li>You may not transfer your account to another person</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>4. Product Information</h2>
          <p>Regarding product listings on our website:</p>
          <ul>
            <li>We strive to provide accurate product descriptions, images, and prices</li>
            <li>Colors may vary slightly due to monitor settings and lighting</li>
            <li>We reserve the right to correct errors, inaccuracies, or omissions</li>
            <li>We may update product information without prior notice</li>
            <li>Product availability is subject to change</li>
            <li>All dimensions and specifications are approximate</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>5. Pricing and Payment</h2>
          
          <h3>5.1 Pricing</h3>
          <ul>
            <li>All prices are listed in Indian Rupees (INR)</li>
            <li>Prices include applicable GST unless otherwise stated</li>
            <li>We reserve the right to change prices at any time without notice</li>
            <li>The price at the time of order placement will be the applicable price</li>
          </ul>

          <h3>5.2 Payment</h3>
          <ul>
            <li>Payment must be made in full at the time of order placement</li>
            <li>We accept credit cards, debit cards, UPI, net banking, and Cash on Delivery (where available)</li>
            <li>All payment transactions are processed through secure, PCI-DSS compliant payment gateways</li>
            <li>We do not store your complete card details on our servers</li>
            <li>Orders will be processed only after successful payment verification</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>6. Order Processing and Fulfillment</h2>
          <ul>
            <li>Order confirmation does not guarantee product availability</li>
            <li>We reserve the right to refuse or cancel any order for any reason</li>
            <li>Orders may be cancelled if: product is out of stock, pricing error, fraud suspicion, delivery address is unserviceable</li>
            <li>If your order is cancelled, you will receive a full refund</li>
            <li>We will notify you via email or phone if there are any order issues</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>7. Shipping and Delivery</h2>
          <p>
            Shipping and delivery are governed by our <a href="/shipping-policy">Shipping Policy</a>. 
            Key points:
          </p>
          <ul>
            <li>Delivery timeframes are estimates and not guaranteed</li>
            <li>We are not responsible for delays caused by third-party courier services</li>
            <li>Risk of loss passes to you upon delivery</li>
            <li>You must inspect the package at the time of delivery</li>
            <li>Report any damage or missing items within 48 hours</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>8. Returns and Refunds</h2>
          <p>
            Returns and refunds are governed by our <a href="/return-policy">Return & Refund Policy</a>. 
            Summary:
          </p>
          <ul>
            <li>7-day return window from delivery date</li>
            <li>Items must be unused, in original condition with tags</li>
            <li>Certain items are non-returnable (customized products, sale items)</li>
            <li>Refunds processed within 5-7 business days after return verification</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>9. Intellectual Property</h2>
          <p>All content on this website is protected by intellectual property laws:</p>
          <ul>
            <li>The VERA by Kamakshi name, logo, and trademarks are our property</li>
            <li>All product images, descriptions, and website design are copyrighted</li>
            <li>You may not reproduce, distribute, or use any content without written permission</li>
            <li>User-generated content (reviews, photos) may be used by us for marketing purposes</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>10. User Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the website for any unlawful purpose</li>
            <li>Impersonate any person or entity</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Upload viruses, malware, or harmful code</li>
            <li>Scrape, crawl, or harvest data from our website</li>
            <li>Interfere with the proper functioning of the website</li>
            <li>Submit false, misleading, or fraudulent information</li>
            <li>Harass, abuse, or harm other users</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>11. Product Authenticity</h2>
          <ul>
            <li>All products sold are 100% authentic VERA by Kamakshi products</li>
            <li>Each product comes with an authenticity certificate</li>
            <li>We do not sell counterfeit or replica items</li>
            <li>Counterfeiting is a serious offense and will be reported to authorities</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>12. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law:
          </p>
          <ul>
            <li>We are not liable for any indirect, incidental, or consequential damages</li>
            <li>Our total liability shall not exceed the amount paid for the product</li>
            <li>We are not responsible for losses due to unauthorized access to your account</li>
            <li>We are not liable for third-party actions (courier delays, payment gateway issues)</li>
            <li>Use of our website is at your own risk</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>13. Warranty Disclaimer</h2>
          <p>
            Our products come with manufacturer warranties as specified. However:
          </p>
          <ul>
            <li>Products are sold "as is" without any additional warranties</li>
            <li>We do not warrant that the website will be error-free or uninterrupted</li>
            <li>We make no guarantees about product suitability for specific purposes</li>
            <li>Warranty claims must be made within the specified warranty period</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>14. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless VERA by Kamakshi, its directors, employees, and 
            partners from any claims, damages, losses, or expenses arising from:
          </p>
          <ul>
            <li>Your violation of these Terms and Conditions</li>
            <li>Your violation of any rights of another party</li>
            <li>Your misuse of the website or products</li>
            <li>Your submission of false or misleading information</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>15. Governing Law and Jurisdiction</h2>
          <p>
            These Terms and Conditions are governed by the laws of India. Any disputes shall be subject 
            to the exclusive jurisdiction of the courts in Mumbai, Maharashtra, India.
          </p>
        </section>

        <section className="content-section">
          <h2>16. Dispute Resolution</h2>
          <p>
            In the event of any dispute:
          </p>
          <ol className="numbered-list">
            <li>Contact our customer support team first to resolve the issue amicably</li>
            <li>If unresolved, disputes may be submitted to mediation</li>
            <li>Legal action may be taken only after exhausting informal resolution methods</li>
          </ol>
        </section>

        <section className="content-section">
          <h2>17. Severability</h2>
          <p>
            If any provision of these Terms and Conditions is found to be invalid or unenforceable, 
            the remaining provisions will continue to be valid and enforceable.
          </p>
        </section>

        <section className="content-section">
          <h2>18. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms and Conditions at any time. Changes will be 
            effective immediately upon posting to the website. Your continued use of the website after 
            changes constitutes acceptance of the modified terms. We recommend reviewing this page 
            periodically.
          </p>
        </section>

        <section className="content-section">
          <h2>19. Contact Information</h2>
          <p>For questions about these Terms and Conditions:</p>
          <div className="contact-info-box">
            <p><strong>VERA by Kamakshi</strong></p>
            <p>Email: <a href="mailto:legal@verabykamakshi.com">legal@verabykamakshi.com</a></p>
            <p>Phone: <a href="tel:+919876543210">+91 98765 43210</a></p>
            <p>Address: 123 Fashion Street, Colaba, Mumbai 400001, India</p>
            <p>Business Hours: Monday - Saturday, 10:00 AM - 6:00 PM IST</p>
          </div>
        </section>

        <section className="content-section note-section">
          <p>
            <strong>Agreement:</strong> By using our website and services, you acknowledge that you have 
            read, understood, and agree to be bound by these Terms and Conditions. Thank you for choosing 
            VERA by Kamakshi.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsConditions;
