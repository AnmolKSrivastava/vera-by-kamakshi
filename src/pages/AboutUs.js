import React from 'react';
import './ContentPages.css';

const AboutUs = () => {
  return (
    <div className="content-page">
      <div className="content-container">
        <h1 className="page-title">About VERA by Kamakshi</h1>
        
        <section className="content-section">
          <h2>Our Story</h2>
          <p>
            VERA by Kamakshi was born from a passion for timeless elegance and exceptional craftsmanship. 
            Founded with a vision to create luxury leather bags that combine traditional artisanship with 
            contemporary design, we've been dedicated to bringing you pieces that are not just accessories, 
            but works of art.
          </p>
          <p>
            Every bag tells a story of dedication, precision, and love for the craft. Our journey began 
            with a simple belief: that every woman deserves to carry a piece that reflects her unique style 
            and empowers her confidence.
          </p>
        </section>

        <section className="content-section">
          <h2>Our Craftsmanship</h2>
          <p>
            Each VERA by Kamakshi bag is meticulously handcrafted by skilled artisans in India who have 
            honed their craft over generations. We use only the finest full-grain genuine leather, sourced 
            responsibly and treated with care to ensure durability and beauty.
          </p>
          <p>
            From the initial design sketch to the final stitch, every step is executed with precision and 
            attention to detail. Our bags feature hand-stitched seams, premium brass hardware, and luxurious 
            cotton canvas lining, ensuring that each piece meets our exacting standards of quality.
          </p>
        </section>

        <section className="content-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">✨</div>
              <h3>Quality First</h3>
              <p>We never compromise on materials or craftsmanship. Every bag is made to last a lifetime.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌍</div>
              <h3>Sustainability</h3>
              <p>We source responsibly and support local artisans, ensuring ethical production practices.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">💝</div>
              <h3>Customer Love</h3>
              <p>Your satisfaction is our priority. We're here to ensure you love every moment with your VERA bag.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🎨</div>
              <h3>Timeless Design</h3>
              <p>We create pieces that transcend trends, designed to be your companion for years to come.</p>
            </div>
          </div>
        </section>

        <section className="content-section">
          <h2>Why Choose VERA?</h2>
          <ul className="feature-list">
            <li>100% Genuine Leather - No compromises on authenticity</li>
            <li>Handcrafted by skilled Indian artisans</li>
            <li>1 Year Warranty on all products</li>
            <li>Free shipping across India</li>
            <li>Easy 7-day return policy</li>
            <li>Premium packaging for gifting</li>
            <li>Secure payment options</li>
            <li>Dedicated customer support</li>
          </ul>
        </section>

        <section className="content-section cta-section">
          <h2>Join the VERA Family</h2>
          <p>
            Discover bags that are more than accessories—they're companions in your journey. 
            Explore our collection and find your perfect match today.
          </p>
          <a href="/shop" className="cta-button">Explore Our Collection</a>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
