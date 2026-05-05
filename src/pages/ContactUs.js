import React, { useState } from 'react';
import './ContentPages.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production, this would send to a backend API or Firebase
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="content-page">
      <div className="content-container">
        <h1 className="page-title">Contact Us</h1>
        <p className="page-intro">
          We'd love to hear from you! Whether you have a question about our products, 
          need assistance with your order, or just want to say hello, we're here to help.
        </p>

        <div className="contact-layout">
          {/* Contact Form */}
          <div className="contact-form-section">
            <h2>Send Us a Message</h2>
            {submitted ? (
              <div className="success-message">
                <span className="success-icon">✓</span>
                <h3>Thank you for contacting us!</h3>
                <p>We'll get back to you within 24-48 hours.</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="How can we help?"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button type="submit" className="submit-button">
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Contact Information */}
          <div className="contact-info-section">
            <h2>Get in Touch</h2>
            
            <div className="contact-info-card">
              <div className="info-icon">📧</div>
              <div className="info-content">
                <h3>Email</h3>
                <a href="mailto:support@verabykamakshi.com">support@verabykamakshi.com</a>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="info-icon">📱</div>
              <div className="info-content">
                <h3>Phone</h3>
                <a href="tel:+919876543210">+91 98765 43210</a>
                <p className="info-note">Mon-Sat, 10 AM - 6 PM IST</p>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="info-icon">📍</div>
              <div className="info-content">
                <h3>Address</h3>
                <p>
                  VERA by Kamakshi<br />
                  123 Fashion Street<br />
                  Mumbai, Maharashtra 400001<br />
                  India
                </p>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="info-icon">🕐</div>
              <div className="info-content">
                <h3>Business Hours</h3>
                <p>
                  Monday - Saturday: 10:00 AM - 6:00 PM<br />
                  Sunday: Closed
                </p>
              </div>
            </div>

            <div className="social-links">
              <h3>Follow Us</h3>
              <div className="social-icons">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">📷</a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">📘</a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">🐦</a>
                <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">📌</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
