
import React, { useState } from 'react';
import './Home.css';
import ProductTile from '../components/product/ProductTile';
import RecentlyViewed from '../components/product/RecentlyViewed';
import Hero from '../components/common/Hero';
import { Link } from 'react-router-dom';
import { useFeaturedProducts } from '../hooks/useProducts';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import useScrollReveal from '../hooks/useScrollReveal';

function NewArrivals() {
  const { products: newProducts, loading, error } = useFeaturedProducts(4);
  const [sectionRef, isVisible] = useScrollReveal();

  return (
    <section 
      ref={sectionRef}
      className={`new-arrivals-section scroll-reveal ${isVisible ? 'is-visible' : ''}`}
    >
      <div className="home-section-header">
        <h2 className="home-section-title">NEW ARRIVALS</h2>
        <p className="home-section-subtitle">Discover our latest collection of handcrafted bags</p>
      </div>
      {loading ? (
        <LoadingSpinner message="Loading new arrivals..." />
      ) : error ? (
        <div className="error-state">Unable to load products</div>
      ) : (
        <div className={`new-arrivals-grid scroll-reveal-stagger ${isVisible ? 'is-visible' : ''}`}>
          {newProducts.slice(0, 4).map((product, idx) => (
            <ProductTile key={product.id || idx} {...product} product={product} />
          ))}
        </div>
      )}
      <Link to="/collections" className="view-all-btn">View All Products</Link>
    </section>
  );
}

function Testimonials() {
  const [sectionRef, isVisible] = useScrollReveal();
  
  const testimonials = [
    {
      name: 'Priya Sharma',
      location: 'Mumbai',
      rating: 5,
      text: 'Absolutely in love with my new handbag! The quality is exceptional and the craftsmanship is evident in every detail. Worth every penny!',
      image: '👩🏻'
    },
    {
      name: 'Ananya Desai',
      location: 'Delhi',
      rating: 5,
      text: 'VERA by Kamakshi has become my go-to for luxury bags. The leather is genuine, the designs are timeless, and the service is impeccable.',
      image: '👩🏽'
    },
    {
      name: 'Sakshi Patel',
      location: 'Bangalore',
      rating: 5,
      text: 'I received so many compliments on my clutch! The attention to detail and the elegant design make it perfect for any occasion.',
      image: '👩🏻‍🦱'
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className={`testimonials-section scroll-reveal ${isVisible ? 'is-visible' : ''}`}
    >
      <div className="home-section-header">
        <h2 className="home-section-title">WHAT OUR CUSTOMERS SAY</h2>
        <p className="home-section-subtitle">Real reviews from real customers</p>
      </div>
      <div className={`testimonials-grid scroll-reveal-stagger ${isVisible ? 'is-visible' : ''}`}>
        {testimonials.map((testimonial, index) => (
          <div key={index} className="testimonial-card">
            <div className="testimonial-rating">
              {'⭐'.repeat(testimonial.rating)}
            </div>
            <p className="testimonial-text">"{testimonial.text}"</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">{testimonial.image}</div>
              <div className="testimonial-info">
                <h4 className="testimonial-name">{testimonial.name}</h4>
                <p className="testimonial-location">{testimonial.location}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');
  const [sectionRef, isVisible] = useScrollReveal();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Simulate subscription (in production, this would call an API)
    setSubscribed(true);
    setError('');
    setEmail('');
    
    // Reset after 5 seconds
    setTimeout(() => {
      setSubscribed(false);
    }, 5000);
  };

  return (
    <section 
      ref={sectionRef}
      className={`newsletter-section scroll-reveal ${isVisible ? 'is-visible' : ''}`}
    >
      <div className="newsletter-container">
        <div className="newsletter-content">
          <h2 className="newsletter-title">JOIN OUR NEWSLETTER</h2>
          <p className="newsletter-subtitle">
            Subscribe to get special offers, free giveaways, and exclusive deals.
          </p>
        </div>
        {subscribed ? (
          <div className="newsletter-success">
            <span className="success-icon">✓</span>
            <p>Thank you for subscribing!</p>
          </div>
        ) : (
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="newsletter-input"
              required
            />
            <button type="submit" className="newsletter-button">
              Subscribe
            </button>
          </form>
        )}
        {error && <p className="newsletter-error">{error}</p>}
      </div>
    </section>
  );
}

function Home() {
  const { products: featured, loading, error, refetch } = useFeaturedProducts(4);
  const [featuredRef, featuredVisible] = useScrollReveal();
  const [recentlyViewedRef, recentlyViewedVisible] = useScrollReveal();

  return (
    <div className="home-container">
      <Hero />
      
      <section 
        ref={featuredRef}
        className={`featured-section scroll-reveal ${featuredVisible ? 'is-visible' : ''}`}
      >
        <header className="featured-header">
          <h1 className="featured-title">OUR FEATURED COLLECTION</h1>
          <p className="featured-subtitle">Signature handbags chosen for timeless design and everyday elegance</p>
        </header>
        {loading ? (
          <LoadingSpinner message="Loading featured products..." />
        ) : error ? (
          <ErrorMessage error={error} onRetry={refetch} />
        ) : (
          <div className={`featured-product-grid scroll-reveal-stagger ${featuredVisible ? 'is-visible' : ''}`}>
            {featured.length === 0 ? (
              <div style={{gridColumn: '1 / -1', textAlign: 'center'}}>No featured products found.</div>
            ) : (
              featured.map((product, idx) => (
                <ProductTile key={product.id || idx} {...product} product={product} />
              ))
            )}
          </div>
        )}
      </section>

      <NewArrivals />
      
      <Testimonials />
      
      <div 
        ref={recentlyViewedRef}
        className={`scroll-reveal ${recentlyViewedVisible ? 'is-visible' : ''}`}
      >
        <RecentlyViewed limit={4} />
      </div>
      
      <Newsletter />
    </div>
  );
}
export default Home;
