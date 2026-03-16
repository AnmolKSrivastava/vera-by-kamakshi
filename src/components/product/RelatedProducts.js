// src/components/product/RelatedProducts.js
import React, { useMemo } from 'react';
import { useProducts } from '../../hooks/useProducts';
import ProductTile from './ProductTile';
import LoadingSpinner from '../common/LoadingSpinner';
import './RelatedProducts.css';

const RelatedProducts = ({ currentProductId, category, currentPrice = 0 }) => {
  const { products, loading } = useProducts();

  const relatedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    // Filter and score products for relevance
    const scoredProducts = products
      .filter(p => p.id !== currentProductId) // Exclude current product
      .map(product => {
        let score = 0;

        // Same category gets highest priority (50 points)
        if (product.category === category) {
          score += 50;
        }

        // Similar price range (within 30%)
        if (currentPrice > 0) {
          const priceDiff = Math.abs(product.price - currentPrice) / currentPrice;
          if (priceDiff <= 0.3) {
            score += 30;
          } else if (priceDiff <= 0.5) {
            score += 15;
          }
        }

        // In stock products get priority (20 points)
        if (product.stock > 0) {
          score += 20;
        }

        return { ...product, relevanceScore: score };
      })
      .sort((a, b) => {
        // Sort by relevance score, then by rating, then by newest
        if (b.relevanceScore !== a.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        if (b.rating !== a.rating) {
          return (b.rating || 0) - (a.rating || 0);
        }
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      })
      .slice(0, 4); // Limit to 4 products

    return scoredProducts;
  }, [products, currentProductId, category, currentPrice]);

  if (loading) return <LoadingSpinner size="small" />;
  if (relatedProducts.length === 0) return null;

  return (
    <div className="related-products">
      <h3 className="related-products-title">You May Also Like</h3>
      <div className="related-products-grid">
        {relatedProducts.map(product => (
          <ProductTile key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
