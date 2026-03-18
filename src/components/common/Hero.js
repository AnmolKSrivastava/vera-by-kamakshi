import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero-section">
      {/* Background Image */}
      <div className="hero-background">
        <div className="hero-overlay"></div>
      </div>

      {/* Content */}
      <div className="hero-content">
        <h1 className="hero-title">
          Timeless Elegance
        </h1>
        <p className="hero-subtitle">
          Discover our curated collection of handcrafted luxury bags
        </p>
        <button 
          className="hero-cta"
          onClick={() => navigate('/shop')}
        >
          EXPLORE COLLECTION
        </button>
      </div>

      {/* Scroll Indicator */}
      <div className="hero-scroll-indicator">
        <div className="hero-scroll-wrapper">
          <div className="hero-scroll-dot"></div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
