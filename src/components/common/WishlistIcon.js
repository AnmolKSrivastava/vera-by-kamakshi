import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import './WishlistIcon.css';

function WishlistIcon() {
  const navigate = useNavigate();
  const { wishlistCount } = useWishlist();

  const handleClick = () => {
    navigate('/wishlist');
  };

  return (
    <div className="wishlist-icon-container" onClick={handleClick}>
      <button className="wishlist-icon-btn" aria-label="Wishlist">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="22" 
          height="22" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#C48E82" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="heart-icon"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        {wishlistCount > 0 && (
          <span className="wishlist-badge">{wishlistCount}</span>
        )}
      </button>
    </div>
  );
}

export default WishlistIcon;
