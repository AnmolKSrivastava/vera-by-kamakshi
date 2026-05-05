import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { formatPrice } from '../../utils/formatters';
import './SearchSuggestions.css';

function SearchSuggestions({ searchTerm, onSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setLoading(true);
        
        // Get products from Firestore
        const productsRef = collection(db, 'products');
        const q = query(productsRef, limit(50));
        const querySnapshot = await getDocs(q);
        
        const allProducts = [];
        querySnapshot.forEach((doc) => {
          allProducts.push({ id: doc.id, ...doc.data() });
        });

        // Filter products by search term (case-insensitive)
        const searchLower = searchTerm.toLowerCase();
        const filtered = allProducts.filter(product => {
          const nameMatch = product.name?.toLowerCase().includes(searchLower);
          const descriptionMatch = product.description?.toLowerCase().includes(searchLower);
          const idMatch = product.productId?.toLowerCase().includes(searchLower);
          return nameMatch || descriptionMatch || idMatch;
        }).slice(0, 5); // Limit to 5 suggestions

        setSuggestions(filtered);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  if (!searchTerm || searchTerm.length < 2) {
    return null;
  }

  return (
    <div className="search-suggestions">
      {loading ? (
        <div className="suggestions-loading">
          <div className="suggestions-spinner"></div>
          <span>Searching...</span>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="suggestions-empty">
          <p>No products found</p>
        </div>
      ) : (
        <div className="suggestions-list">
          {suggestions.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="suggestion-item"
              onClick={onSelect}
            >
              <div className="suggestion-image">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} loading="lazy" decoding="async" />
                ) : (
                  <div className="suggestion-image-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#030213" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </div>
                )}
              </div>
              <div className="suggestion-details">
                <h4 className="suggestion-name">{product.name}</h4>
                <p className="suggestion-price">{formatPrice(product.price)}</p>
              </div>
              <svg className="suggestion-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3L11 8L6 13" stroke="#030213" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          ))}
          <div className="suggestions-footer">
            <Link to={`/search?q=${encodeURIComponent(searchTerm)}`} className="view-all-link" onClick={onSelect}>
              View all results →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchSuggestions;
