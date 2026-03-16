import React, { useState } from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';

function Footer() {
  const [email, setEmail] = useState('');
  const [subscribeMsg, setSubscribeMsg] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribeMsg('Thank you for subscribing!');
      setEmail('');
      setTimeout(() => setSubscribeMsg(''), 3000);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Brand Section */}
        <div className="footer-column footer-brand">
          <h3 className="footer-logo">VERA</h3>
          <p className="footer-tagline">Luxury Bags for the Modern Woman</p>
          <div className="social-icons">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="currentColor"/>
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="currentColor"/>
              </svg>
            </a>
            <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" fill="currentColor"/>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" fill="currentColor"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Shop Links */}
        <div className="footer-column">
          <h4 className="footer-title">Shop</h4>
          <ul className="footer-links">
            <li><Link to="/shop">All Products</Link></li>
            <li><Link to="/shop">New Arrivals</Link></li>
            <li><Link to="/shop">Best Sellers</Link></li>
            <li><Link to="/shop">Handbags</Link></li>
            <li><Link to="/shop">Clutches</Link></li>
            <li><Link to="/shop">Totes</Link></li>
          </ul>
        </div>

        {/* Customer Service Links */}
        <div className="footer-column">
          <h4 className="footer-title">Customer Service</h4>
          <ul className="footer-links">
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/shipping-policy">Shipping Policy</Link></li>
            <li><Link to="/return-policy">Return & Refunds</Link></li>
            <li><Link to="/faq">FAQs</Link></li>
            <li><Link to="/wishlist">My Wishlist</Link></li>
            <li><Link to="/cart">Shopping Cart</Link></li>
          </ul>
        </div>

        {/* Company Links */}
        <div className="footer-column">
          <h4 className="footer-title">Company</h4>
          <ul className="footer-links">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms & Conditions</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/admin" className="admin-footer-link">Admin</Link></li>
          </ul>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="footer-newsletter">
        <div className="newsletter-content">
          <div className="newsletter-text">
            <h4>Stay Updated</h4>
            <p>Subscribe to receive updates on new collections and exclusive offers</p>
          </div>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="newsletter-input"
            />
            <button type="submit" className="newsletter-btn">Subscribe</button>
          </form>
          {subscribeMsg && <p className="subscribe-message">{subscribeMsg}</p>}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div className="payment-methods">
            <span className="payment-label">We Accept:</span>
            <div className="payment-icons">
              <span className="payment-icon">💳 Visa</span>
              <span className="payment-icon">💳 Mastercard</span>
              <span className="payment-icon">📱 UPI</span>
              <span className="payment-icon">💰 COD</span>
            </div>
          </div>
          <div className="trust-badges">
            <span className="badge">🔒 Secure Checkout</span>
            <span className="badge">🚚 Free Shipping</span>
            <span className="badge">↩️ Easy Returns</span>
          </div>
          <p className="copyright">© 2026 VERA by Kamakshi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
