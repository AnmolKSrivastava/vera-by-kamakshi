// src/services/reviewService.js
import { 
  collection, 
  addDoc, 
  getDocs,
  getDoc, 
  query, 
  where, 
  orderBy,
  limit,
  updateDoc,
  doc,
  increment,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const REVIEWS_COLLECTION = 'reviews';

/**
 * Add a new review for a product
 * @param {string} productId - Product ID
 * @param {Object} reviewData - Review data (userId, userName, rating, text)
 * @returns {Promise<string>} Review ID
 */
export const addReview = async (productId, reviewData) => {
  try {
    const reviewDoc = {
      productId,
      userId: reviewData.userId,
      userName: reviewData.userName,
      userEmail: reviewData.userEmail,
      rating: reviewData.rating,
      text: reviewData.text,
      verified: reviewData.verified || false,
      helpful: 0,
      helpfulBy: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), reviewDoc);
    return docRef.id;
  } catch (error) {
    console.error('Error adding review:', error);
    throw new Error('Failed to add review');
  }
};

/**
 * Get all reviews for a product
 * @param {string} productId - Product ID
 * @returns {Promise<Array>} Array of reviews
 */
export const getProductReviews = async (productId) => {
  try {
    const reviewsQuery = query(
      collection(db, REVIEWS_COLLECTION),
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(reviewsQuery);
    const reviews = [];
    
    querySnapshot.forEach((doc) => {
      reviews.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      });
    });

    return reviews;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

/**
 * Mark a review as helpful
 * @param {string} reviewId - Review ID
 * @param {string} userId - User ID marking as helpful
 * @returns {Promise<void>}
 */
export const markReviewHelpful = async (reviewId, userId) => {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    
    // In a real implementation, you'd want to check if user already marked it helpful
    // and use a transaction to prevent race conditions
    await updateDoc(reviewRef, {
      helpful: increment(1),
      helpfulBy: [...(await getDoc(reviewRef)).data().helpfulBy || [], userId]
    });
  } catch (error) {
    console.error('Error marking review helpful:', error);
    throw new Error('Failed to mark review as helpful');
  }
};

/**
 * Get average rating for a product
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} {averageRating, totalReviews, distribution}
 */
export const getProductRating = async (productId) => {
  try {
    const reviews = await getProductReviews(productId);
    
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        distribution: [0, 0, 0, 0, 0]
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    // Distribution [5-star, 4-star, 3-star, 2-star, 1-star]
    const distribution = [5, 4, 3, 2, 1].map(star => 
      reviews.filter(r => r.rating === star).length
    );

    return {
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: reviews.length,
      distribution
    };
  } catch (error) {
    console.error('Error getting product rating:', error);
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: [0, 0, 0, 0, 0]
    };
  }
};

/**
 * Check if user has purchased the product (for verified badge)
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @returns {Promise<boolean>}
 */
export const hasUserPurchasedProduct = async (userId, productId) => {
  // This will be implemented when Order Management is complete
  // For now, return false
  // const ordersQuery = query(
  //   collection(db, 'orders'),
  //   where('userId', '==', userId),
  //   where('items', 'array-contains', { productId })
  // );
  // const snapshot = await getDocs(ordersQuery);
  // return !snapshot.empty;
  return false;
};

const reviewService = {
  addReview,
  getProductReviews,
  markReviewHelpful,
  getProductRating,
  hasUserPurchasedProduct
};

/**
 * Get recent high-rated reviews across all products (for homepage)
 * @param {number} limit - Max number of reviews to return (default 6)
 * @param {number} minRating - Minimum star rating to include (default 4)
 * @returns {Promise<Array>} Array of reviews
 */
export const getRecentReviews = async (maxResults = 6, minRating = 4) => {
  try {
    const reviewsQuery = query(
      collection(db, REVIEWS_COLLECTION),
      where('rating', '>=', minRating),
      orderBy('rating', 'desc'),
      limit(maxResults)
    );

    const querySnapshot = await getDocs(reviewsQuery);
    const reviews = [];

    querySnapshot.forEach((docSnap) => {
      reviews.push({
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
      });
    });

    return reviews;
  } catch (error) {
    console.error('Error fetching recent reviews:', error);
    return [];
  }
};

export default reviewService;
