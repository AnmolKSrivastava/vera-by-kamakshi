// src/components/product/ReviewsSection.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProductReviews, addReview, getProductRating } from '../../services/reviewService';
import ActionModal from '../common/ActionModal';
import './ReviewsSection.css';

const ReviewsSection = ({ productId, productName }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'default'
  });
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    distribution: [0, 0, 0, 0, 0]
  });

  // Fetch reviews on component mount
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const fetchedReviews = await getProductReviews(productId);
        setReviews(fetchedReviews);
        
        const stats = await getProductRating(productId);
        setRatingStats(stats);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setStatusModal({
        isOpen: true,
        title: 'Sign In Required',
        message: 'Please sign in to write a review.',
        variant: 'default'
      });
      return;
    }

    if (rating === 0) {
      setStatusModal({
        isOpen: true,
        title: 'Rating Required',
        message: 'Please select a rating before submitting your review.',
        variant: 'danger'
      });
      return;
    }

    if (reviewText.trim().length < 10) {
      setStatusModal({
        isOpen: true,
        title: 'Review Too Short',
        message: 'Please write at least 10 characters.',
        variant: 'danger'
      });
      return;
    }

    setSubmitting(true);

    try {
      const reviewData = {
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        userEmail: user.email,
        rating,
        text: reviewText.trim(),
        verified: false // Will be true when order system is implemented
      };

      await addReview(productId, reviewData);
      
      // Refresh reviews
      const updatedReviews = await getProductReviews(productId);
      setReviews(updatedReviews);
      
      const stats = await getProductRating(productId);
      setRatingStats(stats);

      // Reset form
      setRating(0);
      setReviewText('');
      setShowReviewForm(false);
      setSubmitSuccess(true);
      
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting review:', error);
      setStatusModal({
        isOpen: true,
        title: 'Review Failed',
        message: 'Failed to submit review. Please try again.',
        variant: 'danger'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    if (!user) {
      setStatusModal({
        isOpen: true,
        title: 'Sign In Required',
        message: 'Please sign in to mark reviews as helpful.',
        variant: 'default'
      });
      return;
    }

    // Simple optimistic UI update
    setReviews(prev => prev.map(r => 
      r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
    ));
    
    // Note: markReviewHelpful needs proper implementation with transaction
    // to prevent duplicate votes
  };

  const renderStars = (rating) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={star <= rating ? 'star filled' : 'star'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const renderInteractiveStars = () => {
    return (
      <div className="interactive-stars">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            className={`star-btn ${star <= (hoverRating || rating) ? 'filled' : ''}`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`Rate ${star} stars`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="reviews-section">
        <h3 className="reviews-title">Customer Reviews</h3>
        <p>Loading reviews...</p>
      </div>
    );
  }

  const averageRating = ratingStats.averageRating;
  const totalReviews = ratingStats.totalReviews;
  const ratingDistribution = [5, 4, 3, 2, 1].map((star, index) => ({
    star,
    count: ratingStats.distribution[index] || 0,
    percentage: totalReviews > 0 ? ((ratingStats.distribution[index] || 0) / totalReviews) * 100 : 0
  }));

  return (
    <div className="reviews-section">
      <h3 className="reviews-title">Customer Reviews</h3>
      
      {submitSuccess && (
        <div className="review-success-message">
          ✓ Thank you! Your review has been submitted successfully.
        </div>
      )}

      {totalReviews > 0 ? (
        <>
          <div className="reviews-summary">
            <div className="rating-overview">
              <div className="average-rating">
                <span className="rating-number">{averageRating.toFixed(1)}</span>
                {renderStars(Math.round(averageRating))}
                <span className="review-count">Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}</span>
              </div>
            </div>
            
            <div className="rating-distribution">
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="rating-bar">
                  <span className="star-label">{star} ★</span>
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <span className="count-label">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="reviews-list">
            {reviews.map(review => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="review-author">
                    <div className="author-avatar">{review.userName?.charAt(0).toUpperCase() || 'U'}</div>
                    <div>
                      <div className="author-name">{review.userName || 'Anonymous'}</div>
                      {review.verified && (
                        <span className="verified-badge">✓ Verified Purchase</span>
                      )}
                    </div>
                  </div>
                  <div className="review-date">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-IN', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    }) : 'Recently'}
                  </div>
                </div>
                
                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>
                
                <p className="review-text">{review.text}</p>
                
                <div className="review-footer">
                  <button 
                    className="helpful-button"
                    onClick={() => handleHelpful(review.id)}
                    disabled={!user}
                    title={!user ? 'Sign in to mark as helpful' : 'Mark as helpful'}
                  >
                    👍 Helpful ({review.helpful || 0})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="no-reviews">
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      )}

      {/* Write Review Button/Form */}
      {!showReviewForm ? (
        <button 
          className="write-review-btn"
          onClick={() => {
            if (!user) {
              setStatusModal({
                isOpen: true,
                title: 'Sign In Required',
                message: 'Please sign in to write a review.',
                variant: 'default'
              });
              return;
            }
            setShowReviewForm(true);
          }}
        >
          Write a Review
        </button>
      ) : (
        <div className="review-form-container">
          <h4>Write Your Review</h4>
          <form className="review-form" onSubmit={handleSubmitReview}>
            <div className="form-group">
              <label>Your Rating *</label>
              {renderInteractiveStars()}
              {rating > 0 && (
                <span className="rating-text">
                  {rating === 5 ? 'Excellent!' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Fair' : 'Poor'}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="review-text">Your Review *</label>
              <textarea
                id="review-text"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience with this product..."
                rows="5"
                required
                minLength="10"
                maxLength="1000"
              />
              <small className="char-count">{reviewText.length} / 1000 characters</small>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => {
                  setShowReviewForm(false);
                  setRating(0);
                  setReviewText('');
                }}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-submit"
                disabled={submitting || rating === 0 || reviewText.trim().length < 10}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      <ActionModal
        isOpen={statusModal.isOpen}
        title={statusModal.title}
        message={statusModal.message}
        confirmText="Close"
        showCancel={false}
        onConfirm={() => setStatusModal((prev) => ({ ...prev, isOpen: false }))}
        onCancel={() => setStatusModal((prev) => ({ ...prev, isOpen: false }))}
        variant={statusModal.variant}
      />
    </div>
  );
};

export default ReviewsSection;
