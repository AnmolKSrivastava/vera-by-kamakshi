import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';
import instagramIcon from '../../assets/Socials/instagram.svg';
import facebookIcon from '../../assets/Socials/facebook.svg';
import pinterestIcon from '../../assets/Socials/Pintrest.svg';
import xIcon from '../../assets/Socials/X.svg';
import visaIcon from '../../assets/Payment/visa.svg';
import mastercardIcon from '../../assets/Payment/mastercard.svg';
import googlePayIcon from '../../assets/Payment/google-pay.svg';
import cashOnDeliveryIcon from '../../assets/Payment/cash-on-delivery.svg';
import xsavLogo from '../../assets/Logo/xsav_lab_logo.webp';

const socialLinks = [
  {
    href: 'https://instagram.com',
    label: 'Instagram',
    icon: instagramIcon,
  },
  {
    href: 'https://facebook.com',
    label: 'Facebook',
    icon: facebookIcon,
  },
  {
    href: 'https://pinterest.com',
    label: 'Pinterest',
    icon: pinterestIcon,
  },
  {
    href: 'https://twitter.com',
    label: 'X',
    icon: xIcon,
  },
];

const paymentMethods = [
  {
    label: 'Visa',
    icon: visaIcon,
  },
  {
    label: 'Mastercard',
    icon: mastercardIcon,
  },
  {
    label: 'Google Pay',
    icon: googlePayIcon,
  },
  {
    label: 'Cash on Delivery',
    icon: cashOnDeliveryIcon,
  },
];

const trustBadges = [
  {
    title: 'Secure Payments',
    subtitle: 'Protected checkout',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="badge-icon-svg">
        <path d="M12 2L5 5v6c0 5.25 3.44 10.02 7 11 3.56-.98 7-5.75 7-11V5l-7-3z" />
        <path d="M9.25 12.25l1.8 1.8 3.7-4.05" />
      </svg>
    ),
  },
  {
    title: 'Free Shipping',
    subtitle: 'Across India',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="badge-icon-svg">
        <path d="M3 7h11v8H3z" />
        <path d="M14 10h3l3 3v2h-6z" />
        <circle cx="7.5" cy="17.5" r="1.5" />
        <circle cx="17.5" cy="17.5" r="1.5" />
      </svg>
    ),
  },
  {
    title: 'Easy Returns',
    subtitle: 'Simple exchange policy',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="badge-icon-svg">
        <path d="M8 7H4V3" />
        <path d="M4 7c1.7-2.4 4.47-4 7.6-4C16.79 3 21 7.21 21 12s-4.21 9-9.4 9c-3.13 0-5.9-1.6-7.6-4" />
        <path d="M16 17h4v4" />
      </svg>
    ),
  },
];

const poweredBy = {
  label: 'XSAV Lab',
  website: 'https://xsavlab.com/',
};

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Brand Section */}
        <div className="footer-column footer-brand">
          <h3 className="footer-logo">VERA</h3>
          <p className="footer-tagline">Luxury Bags for the Modern Woman</p>
          <div className="social-icons">
            {socialLinks.map((socialLink) => (
              <a
                key={socialLink.label}
                href={socialLink.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={socialLink.label}
              >
                <img src={socialLink.icon} alt="" className="social-icon-image" />
              </a>
            ))}
          </div>
        </div>

        {/* Collections Links */}
        <div className="footer-column">
          <h4 className="footer-title">Collections</h4>
          <ul className="footer-links">
            <li><Link to="/collections">All Products</Link></li>
            <li><Link to="/collections">New Arrivals</Link></li>
            <li><Link to="/collections">Best Sellers</Link></li>
            <li><Link to="/collections">Handbags</Link></li>
            <li><Link to="/collections">Clutches</Link></li>
            <li><Link to="/collections">Totes</Link></li>
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

        <div className="footer-column footer-contact-column">
          <h4 className="footer-title">Visit Us</h4>
          <div className="footer-contact-info">
            <p className="footer-contact-label">Studio Address</p>
            <p className="footer-contact-text">123 Placeholder Avenue, 2nd Floor, Jaipur, Rajasthan 302001</p>
            <p className="footer-contact-label">Contact</p>
            <a href="tel:+911234567890" className="footer-contact-link">+91 12345 67890</a>
            <a href="mailto:hello@verabykamakshi.com" className="footer-contact-link">hello@verabykamakshi.com</a>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div className="payment-methods">
            <span className="payment-label">We Accept:</span>
            <div className="payment-icons">
              {paymentMethods.map((paymentMethod) => (
                <span key={paymentMethod.label} className="payment-icon" aria-label={paymentMethod.label}>
                  <img src={paymentMethod.icon} alt="" className="payment-icon-image" />
                </span>
              ))}
            </div>
          </div>
          <div className="footer-trust-badges">
            {trustBadges.map((badge) => (
              <span key={badge.title} className="footer-badge">
                <span className="footer-badge-icon">{badge.icon}</span>
                <span className="footer-badge-copy">
                  <span className="footer-badge-title">{badge.title}</span>
                  <span className="footer-badge-subtitle">{badge.subtitle}</span>
                </span>
              </span>
            ))}
          </div>
          <a
            href={poweredBy.website}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-powered-by"
            aria-label={`Powered by ${poweredBy.label}`}
          >
            <span className="footer-powered-label">Powered by</span>
            <span className="footer-powered-logo" aria-hidden="true">
              <img src={xsavLogo} alt="" className="footer-powered-logo-image" />
            </span>
            <span className="footer-powered-brand">{poweredBy.label}</span>
            
          </a>
          <p className="copyright">© 2026 VERA by Kamakshi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
