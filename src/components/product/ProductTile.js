import React, { useState, useEffect } from "react";
import "./ProductTile.css";
import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import reviewService from "../../services/reviewService";

const ProductTile = ({ id, image, name, price, colors = [], product, stock }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [rating, setRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  // Get product data
  const productData = product || { id, image, imageUrl: image, name, price, colors, stock };
  const salePrice = productData.salePrice;
  const featured = productData.featured;
  const category = productData.category;
  const createdAt = productData.createdAt;
  
  // Determine stock status
  const productStock = stock !== undefined ? stock : productData?.stock;
  const hasStockData = productStock !== undefined && productStock !== null && productStock !== '';
  const numericStock = hasStockData ? Number(productStock) || 0 : null;
  const isLowStock = hasStockData && numericStock > 0 && numericStock <= 10;
  const isOutOfStock = hasStockData && numericStock === 0;
  const lowStockLabel = numericStock === 1 ? '1 ITEM LEFT' : `ONLY ${numericStock} LEFT`;
  
  // Calculate if product is new (created within 7 days)
  const isNew = createdAt && (new Date() - new Date(createdAt)) < 7 * 24 * 60 * 60 * 1000;
  
  // Calculate discount percentage
  const discountPercentage = salePrice && price ? Math.round(((price - salePrice) / price) * 100) : 0;
  const savings = salePrice && price ? price - salePrice : 0;
  
  // Determine current price
  const currentPrice = salePrice || price;
  
  // Fetch rating on mount
  useEffect(() => {
    const fetchRating = async () => {
      try {
        const ratingData = await reviewService.getProductRating(id);
        if (ratingData) {
          setRating(ratingData.averageRating);
          setReviewCount(ratingData.totalReviews);
        }
      } catch (err) {
        console.error('Error fetching rating:', err);
      }
    };
    fetchRating();
  }, [id]);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(productData);
  };
  
  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(productData);
    }
  };
  
  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${id}`);
  };

  return (
    <Link 
      to={`/product/${id}`} 
      className="product-tile-link" 
      style={{ textDecoration: 'none', color: 'inherit' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-tile">
        <div className="product-image-container">
          {/* Top Badges */}
          <div className="product-badges">
            {isNew && <span className="badge badge-new">NEW</span>}
            {featured && <span className="badge badge-featured">⭐ FEATURED</span>}
            {discountPercentage > 0 && (
              <span className="badge badge-sale">{discountPercentage}% OFF</span>
            )}
            {isOutOfStock && <span className="badge badge-stock badge-out">OUT OF STOCK</span>}
            {isLowStock && <span className="badge badge-stock badge-low">{lowStockLabel}</span>}
          </div>
          
          <img src={image} alt={name} className="product-image" />
          
          {/* Hover Overlay with Actions */}
          <div className={`product-overlay ${isHovered ? 'visible' : ''}`}>
            <div className="quick-actions">
              <button className="quick-action-btn" onClick={handleQuickView} title="Quick View">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span>Quick View</span>
              </button>
              {!isOutOfStock && (
                <button className="quick-action-btn btn-add-cart" onClick={handleQuickAdd} title="Add to Cart">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  <span>Add to Cart</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Wishlist Button */}
          <button 
            className={`product-tile-wishlist-btn ${isInWishlist(id) ? 'active' : ''}`}
            onClick={handleWishlistClick}
            aria-label={isInWishlist(id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="22" 
              height="22" 
              viewBox="0 0 24 24" 
              fill={isInWishlist(id) ? '#ef5350' : 'none'}
              stroke={isInWishlist(id) ? '#ef5350' : '#ef5350'}
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          
          {/* Category Tag */}
          {category && <div className="category-tag">{category}</div>}
        </div>
        
        <div className="product-info">
          {/* Rating */}
          {rating && (
            <div className="product-rating">
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={star <= Math.round(rating) ? 'star filled' : 'star'}>
                    ★
                  </span>
                ))}
              </div>
              <span className="rating-text">
                {rating.toFixed(1)} {reviewCount > 0 && `(${reviewCount})`}
              </span>
            </div>
          )}
          
          <h3 className="product-name">{name}</h3>
          
          {/* Price Section */}
          <div className="product-pricing">
            <div className="price-row">
              <span className="current-price">₹{currentPrice.toLocaleString()}</span>
              {salePrice && <span className="original-price">₹{price.toLocaleString()}</span>}
            </div>
            {savings > 0 && (
              <div className="savings-text">Save ₹{savings.toLocaleString()}</div>
            )}
          </div>
          
          {/* Colors Preview */}
          {colors && colors.length > 0 && (
            <div className="product-colors">
              {colors.slice(0, 5).map((color, idx) => (
                <span
                  key={idx}
                  className="color-dot"
                  style={{ background: color }}
                  title={color}
                />
              ))}
              {colors.length > 5 && (
                <span className="color-more">+{colors.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductTile;
