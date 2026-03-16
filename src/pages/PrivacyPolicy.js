import React from 'react';
import './ContentPages.css';

const PrivacyPolicy = () => {
  return (
    <div className="content-page">
      <div className="content-container">
        <h1 className="page-title">Privacy Policy</h1>
        <p className="page-intro">
          Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <p className="page-intro">
          At VERA by Kamakshi, we are committed to protecting your privacy and ensuring the security 
          of your personal information. This Privacy Policy explains how we collect, use, and safeguard 
          your data.
        </p>

        <section className="content-section">
          <h2>1. Information We Collect</h2>
          
          <h3>1.1 Personal Information</h3>
          <p>When you interact with our website, we may collect:</p>
          <ul>
            <li><strong>Contact Information:</strong> Name, email address, phone number, shipping address</li>
            <li><strong>Account Information:</strong> Username, password (encrypted), profile preferences</li>
            <li><strong>Payment Information:</strong> Billing address, payment method (processed securely through payment gateways)</li>
            <li><strong>Order Information:</strong> Purchase history, product preferences, order details</li>
          </ul>

          <h3>1.2 Automatically Collected Information</h3>
          <ul>
            <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
            <li><strong>Usage Data:</strong> Pages visited, time spent on site, links clicked</li>
            <li><strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>2. How We Use Your Information</h2>
          <p>We use the collected information for:</p>
          <ul>
            <li><strong>Order Processing:</strong> To fulfill your orders, process payments, and arrange delivery</li>
            <li><strong>Communication:</strong> Order confirmations, shipping updates, customer support responses</li>
            <li><strong>Account Management:</strong> To create and manage your account, save preferences</li>
            <li><strong>Personalization:</strong> To provide personalized product recommendations</li>
            <li><strong>Marketing:</strong> To send promotional emails about new products, offers (only with your consent)</li>
            <li><strong>Analytics:</strong> To understand customer behavior and improve our services</li>
            <li><strong>Legal Compliance:</strong> To comply with legal obligations and prevent fraud</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>3. Information Sharing</h2>
          <p>We do not sell, trade, or rent your personal information. We may share information with:</p>
          
          <h3>3.1 Service Providers</h3>
          <ul>
            <li><strong>Payment Processors:</strong> Secure payment gateway providers (Razorpay, Stripe, etc.)</li>
            <li><strong>Shipping Partners:</strong> Courier services for order delivery</li>
            <li><strong>Email Services:</strong> Email delivery platforms for communications</li>
            <li><strong>Analytics Tools:</strong> Google Analytics for website performance tracking</li>
          </ul>

          <h3>3.2 Legal Requirements</h3>
          <p>
            We may disclose your information if required by law, court order, or to protect our rights, 
            property, or safety.
          </p>
        </section>

        <section className="content-section">
          <h2>4. Data Security</h2>
          <p>We implement industry-standard security measures to protect your information:</p>
          <ul>
            <li><strong>Encryption:</strong> SSL/TLS encryption for data transmission</li>
            <li><strong>Secure Storage:</strong> Encrypted databases with restricted access</li>
            <li><strong>Payment Security:</strong> PCI-DSS compliant payment processing</li>
            <li><strong>Access Controls:</strong> Limited employee access to personal data</li>
            <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
          </ul>
          <p className="note">
            <strong>Note:</strong> While we strive to protect your data, no method of transmission over the 
            internet is 100% secure. We cannot guarantee absolute security.
          </p>
        </section>

        <section className="content-section">
          <h2>5. Cookies and Tracking</h2>
          <p>We use cookies to enhance your browsing experience:</p>
          
          <h3>Types of Cookies We Use</h3>
          <table className="policy-table">
            <thead>
              <tr>
                <th>Cookie Type</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Essential Cookies</td>
                <td>Website functionality, login sessions</td>
                <td>Session</td>
              </tr>
              <tr>
                <td>Preference Cookies</td>
                <td>Remember your settings and preferences</td>
                <td>1 year</td>
              </tr>
              <tr>
                <td>Analytics Cookies</td>
                <td>Website performance and usage statistics</td>
                <td>2 years</td>
              </tr>
              <tr>
                <td>Marketing Cookies</td>
                <td>Personalized advertisements</td>
                <td>1 year</td>
              </tr>
            </tbody>
          </table>
          <p>
            You can manage cookie preferences through your browser settings. Note that disabling cookies 
            may affect website functionality.
          </p>
        </section>

        <section className="content-section">
          <h2>6. Your Rights</h2>
          <p>You have the following rights regarding your personal data:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
            <li><strong>Correction:</strong> Update or correct inaccurate personal information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal obligations)</li>
            <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time</li>
            <li><strong>Data Portability:</strong> Request your data in a structured, machine-readable format</li>
            <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing where applicable</li>
          </ul>
          <p>
            To exercise these rights, contact us at <a href="mailto:privacy@verabykamakshi.com">privacy@verabykamakshi.com</a>.
          </p>
        </section>

        <section className="content-section">
          <h2>7. Data Retention</h2>
          <p>We retain your personal information for:</p>
          <ul>
            <li><strong>Account Data:</strong> Until you request deletion or account closure</li>
            <li><strong>Order History:</strong> 7 years for tax and legal compliance</li>
            <li><strong>Marketing Data:</strong> Until you opt-out or 3 years of inactivity</li>
            <li><strong>Analytics Data:</strong> Aggregated data retained indefinitely</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>8. Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites (payment gateways, social media, etc.). 
            We are not responsible for the privacy practices of these external sites. Please review their 
            privacy policies before providing any information.
          </p>
        </section>

        <section className="content-section">
          <h2>9. Children's Privacy</h2>
          <p>
            Our services are not intended for individuals under 18 years of age. We do not knowingly 
            collect personal information from children. If we become aware of such data collection, 
            we will delete it promptly.
          </p>
        </section>

        <section className="content-section">
          <h2>10. International Data Transfers</h2>
          <p>
            Your information is stored on servers located in India. If you access our website from 
            outside India, your information may be transferred to and processed in India, which may 
            have different data protection laws.
          </p>
        </section>

        <section className="content-section">
          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices 
            or legal requirements. We will notify you of significant changes via email or a prominent 
            notice on our website. Your continued use of our services after such changes constitutes 
            acceptance of the updated policy.
          </p>
        </section>

        <section className="content-section">
          <h2>12. Contact Us</h2>
          <p>If you have questions or concerns about this Privacy Policy or our data practices:</p>
          <div className="contact-info-box">
            <p><strong>VERA by Kamakshi</strong></p>
            <p>Email: <a href="mailto:privacy@verabykamakshi.com">privacy@verabykamakshi.com</a></p>
            <p>Phone: <a href="tel:+919876543210">+91 98765 43210</a></p>
            <p>Address: 123 Fashion Street, Colaba, Mumbai 400001, India</p>
          </div>
        </section>

        <section className="content-section note-section">
          <p>
            <strong>Your Privacy Matters:</strong> At VERA by Kamakshi, we are committed to transparency 
            and protecting your personal information. We continuously review and update our security 
            measures to ensure your data remains safe.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
