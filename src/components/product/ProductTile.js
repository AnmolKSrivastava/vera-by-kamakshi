import React from "react";
import "./ProductTile.css";
import { Link } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";

const ProductTile = ({ id, image, name, price, colors = [], product, stock }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  // Determine stock status
  const productStock = stock !== undefined ? stock : product?.stock;
  const isLowStock = productStock !== undefined && productStock < 5 && productStock > 0;
  const isOutOfStock = productStock !== undefined && productStock === 0;

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Create product object for wishlist
    const productData = product || { id, image, imageUrl: image, name, price, colors };
    toggleWishlist(productData);
  };

  return (
    <Link to={`/product/${id}`} className="product-tile-link" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="product-tile">
        <div className="product-image-container">
          <img src={image} alt={name} className="product-image" />
          
          {/* Stock Badge */}
          {isOutOfStock && (
            <div className="stock-badge out-of-stock">Out of Stock</div>
          )}
          {isLowStock && (
            <div className="stock-badge low-stock">Only {productStock} left!</div>
          )}
          
          {/* Wishlist Button */}
          <button 
            className={`product-tile-wishlist-btn ${isInWishlist(id) ? 'active' : ''}`}
            onClick={handleWishlistClick}
            aria-label={isInWishlist(id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill={isInWishlist(id) ? '#ef5350' : 'none'}
              stroke={isInWishlist(id) ? '#ef5350' : '#fff'}
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
        <div className="product-info">
          <h3 className="product-name">{name}</h3>
          <div className="product-price">₹{price}</div>
          {colors && colors.length > 0 && (
            <div className="product-colors">
                {colors.map((color, idx) => (
                <span
                  key={idx}
                  className="color-dot"
                  style={{ background: color }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductTile;
