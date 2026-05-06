import React from 'react';
import { Link } from 'react-router-dom';
import './AboutUs.css';
import useScrollReveal from '../hooks/useScrollReveal';

const AboutUs = () => {
  const [statsRef, statsVisible] = useScrollReveal();
  const [storyRef, storyVisible] = useScrollReveal();
  const [valuesRef, valuesVisible] = useScrollReveal();
  const [craftsmanshipRef, craftsmanshipVisible] = useScrollReveal();
  const [featuresRef, featuresVisible] = useScrollReveal();

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About VERA by Kamakshi</h1>
          <p className="about-hero-tagline">
            Where Tradition Meets Luxury
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section 
        ref={statsRef}
        className={`about-stats scroll-reveal ${statsVisible ? 'is-visible' : ''}`}
      >
        <div className="stat-card">
          <span className="stat-number">100%</span>
          <span className="stat-label">Premium Quality</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">100%</span>
          <span className="stat-label">Luxury Imports</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">100%</span>
          <span className="stat-label">Modern Design</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">100%</span>
          <span className="stat-label">Secure Shopping</span>
        </div>
      </section>

      {/* Story Section */}
      <section 
        ref={storyRef}
        className={`about-story scroll-reveal ${storyVisible ? 'is-visible' : ''}`}
      >
        <div className="story-grid">
          <div className="story-content">
            <h2>Our Story</h2>
            <p>
              VERA by Kamakshi was founded with a vision to bring the world's finest luxury bags to discerning 
              customers who appreciate exceptional design and premium quality. We curate an exclusive collection 
              of imported luxury bags that embody contemporary elegance and sophisticated style.
            </p>
            <p>
              Every piece in our collection is carefully selected for its modern design, superior craftsmanship, 
              and timeless appeal. We believe that luxury should be accessible, and every woman deserves to carry 
              a bag that reflects her unique style and elevates her confidence.
            </p>
            <div className="story-highlight">
              "We curate excellence. We deliver luxury."
            </div>
          </div>
          <div className="story-image">
            <div className="story-image-placeholder">VERA</div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section 
        ref={valuesRef}
        className={`about-values scroll-reveal ${valuesVisible ? 'is-visible' : ''}`}
      >
        <div className="about-section-header">
          <h2>Our Values</h2>
          <p>The principles that guide everything we do</p>
        </div>
        <div className="values-grid">
          <div className="value-card">
            <span className="value-icon">◆</span>
            <h3>Premium Selection</h3>
            <p>We curate only the finest imported luxury bags, ensuring exceptional quality in every piece.</p>
          </div>
          <div className="value-card">
            <span className="value-icon">●</span>
            <h3>Global Trends</h3>
            <p>Our collection features the latest international designs and contemporary styles.</p>
          </div>
          <div className="value-card">
            <span className="value-icon">◈</span>
            <h3>Customer First</h3>
            <p>Your satisfaction drives us. We're committed to providing an exceptional shopping experience.</p>
          </div>
          <div className="value-card">
            <span className="value-icon">▲</span>
            <h3>Modern Elegance</h3>
            <p>Contemporary designs that complement your lifestyle and elevate your everyday style.</p>
          </div>
        </div>
      </section>

      {/* Craftsmanship Section */}
      <section 
        ref={craftsmanshipRef}
        className={`about-craftsmanship scroll-reveal ${craftsmanshipVisible ? 'is-visible' : ''}`}
      >
        <div className="about-section-header">
          <h2>What Sets Us Apart</h2>
          <p>Excellence in every detail</p>
        </div>
        <div className="craftsmanship-grid">
          <div className="craftsmanship-item">
            <span className="craftsmanship-icon">✦</span>
            <div className="craftsmanship-text">
              <h3>Curated Collection</h3>
              <p>Each bag is hand-selected from premium international suppliers, ensuring only the finest pieces reach you.</p>
            </div>
          </div>
          <div className="craftsmanship-item">
            <span className="craftsmanship-icon">■</span>
            <div className="craftsmanship-text">
              <h3>Modern Aesthetics</h3>
              <p>Contemporary designs that blend functionality with sophisticated style for the modern woman.</p>
            </div>
          </div>
          <div className="craftsmanship-item">
            <span className="craftsmanship-icon">◆</span>
            <div className="craftsmanship-text">
              <h3>Premium Materials</h3>
              <p>Luxurious materials and superior construction in every imported piece we offer.</p>
            </div>
          </div>
          <div className="craftsmanship-item">
            <span className="craftsmanship-icon">◇</span>
            <div className="craftsmanship-text">
              <h3>Exclusive Selection</h3>
              <p>Access to unique designs and limited collections you won't find everywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={featuresRef}
        className={`about-features scroll-reveal ${featuresVisible ? 'is-visible' : ''}`}
      >
        <h2>Why Choose VERA?</h2>
        <ul className="features-list">
          <li>Premium Imported Luxury Bags</li>
          <li>Contemporary Modern Designs</li>
          <li>Curated Exclusive Collections</li>
          <li>Free Shipping Across India</li>
          <li>Secure Payment Options</li>
          <li>Quality Assured Products</li>
          <li>Elegant Gift Packaging</li>
          <li>Dedicated Customer Support</li>
        </ul>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <h2>Join the VERA Family</h2>
        <p>
          Discover bags that are more than accessories—they're companions in your journey. 
          Explore our collection and find your perfect match today.
        </p>
        <Link to="/collections" className="cta-button">Explore Our Collection</Link>
      </section>
    </div>
  );
};

export default AboutUs;
