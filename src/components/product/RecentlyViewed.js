// src/components/product/RecentlyViewed.js
import React, { useState, useEffect } from 'react';
import { getRecentlyViewed } from '../../utils/helpers';
import ProductTile from './ProductTile';
import './RecentlyViewed.css';

const RecentlyViewed = ({ currentProductId = null, limit = 8 }) => {
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    const loadRecentlyViewed = () => {
      let products = getRecentlyViewed();
      
      // Exclude current product if viewing product page
      if (currentProductId) {
        products = products.filter(p => p.id !== currentProductId);
      }
      
      // Limit the number shown
      products = products.slice(0, limit);
      
      setRecentProducts(products);
    };

    loadRecentlyViewed();
    
    // Listen for storage changes (if user has multiple tabs)
    window.addEventListener('storage', loadRecentlyViewed);
    
    return () => {
      window.removeEventListener('storage', loadRecentlyViewed);
    };
  }, [currentProductId, limit]);

  if (recentProducts.length === 0) return null;

  return (
    <div className="recently-viewed">
      <div className="recently-viewed-header">
        <h3 className="recently-viewed-title">Recently Viewed</h3>
        <p className="recently-viewed-subtitle">Continue where you left off</p>
      </div>
      <div className="recently-viewed-grid">
        {recentProducts.map(product => (
          <ProductTile key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;
