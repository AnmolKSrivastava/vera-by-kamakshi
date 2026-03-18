import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import ProductTile from '../components/product/ProductTile';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './SearchResults.css';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const searchProducts = async () => {
      if (!searchQuery.trim()) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get all products (Firestore doesn't support case-insensitive search natively)
        const productsRef = collection(db, 'products');
        const querySnapshot = await getDocs(productsRef);
        
        const allProducts = [];
        querySnapshot.forEach((doc) => {
          allProducts.push({ id: doc.id, ...doc.data() });
        });

        // Filter products by name or description (case-insensitive)
        const searchLower = searchQuery.toLowerCase();
        const filteredProducts = allProducts.filter(product => {
          const nameMatch = product.name?.toLowerCase().includes(searchLower);
          const descriptionMatch = product.description?.toLowerCase().includes(searchLower);
          const idMatch = product.productId?.toLowerCase().includes(searchLower);
          return nameMatch || descriptionMatch || idMatch;
        });

        setProducts(filteredProducts);
      } catch (err) {
        console.error('Error searching products:', err);
        setError('Failed to search products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="search-results-page">
        <div className="search-results-container">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="search-results-page">
      <div className="search-results-container">
        <div className="search-results-header">
          <h1>Search Results</h1>
          {searchQuery && (
            <p className="search-query">
              Showing results for: <span className="search-term">"{searchQuery}"</span>
            </p>
          )}
          <p className="search-count">
            {products.length} {products.length === 1 ? 'product' : 'products'} found
          </p>
        </div>

        {error && (
          <div className="search-error">
            <p>{error}</p>
          </div>
        )}

        {!searchQuery.trim() ? (
          <div className="search-empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#030213" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <h2>Enter a search term</h2>
            <p>Try searching for products by name or description</p>
            <Link to="/collections" className="browse-btn">Browse All Products</Link>
          </div>
        ) : products.length === 0 ? (
          <div className="search-empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#030213" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h2>No products found</h2>
            <p>Try different keywords or browse all products</p>
            <Link to="/collections" className="browse-btn">Browse All Products</Link>
          </div>
        ) : (
          <div className="search-results-grid">
            {products.map((product) => (
              <ProductTile key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResults;
