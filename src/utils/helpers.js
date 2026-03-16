// src/utils/helpers.js

/**
 * General helper functions
 */

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert string to slug (URL-friendly)
 * @param {string} str - String to slugify
 * @returns {string} Slug
 */
export const slugify = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (obj) => {
  if (obj === null || obj === undefined) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  if (typeof obj === 'string') return obj.trim().length === 0;
  return false;
};

/**
 * Remove duplicates from array
 * @param {Array} arr - Array with potential duplicates
 * @param {string} key - Key to check for uniqueness (for objects)
 * @returns {Array} Array without duplicates
 */
export const removeDuplicates = (arr, key = null) => {
  if (!Array.isArray(arr)) return arr;
  
  if (key) {
    const seen = new Set();
    return arr.filter(item => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }
  
  return [...new Set(arr)];
};

/**
 * Group array by key
 * @param {Array} arr - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Grouped object
 */
export const groupBy = (arr, key) => {
  if (!Array.isArray(arr)) return {};
  
  return arr.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

/**
 * Sort array of objects by key
 * @param {Array} arr - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
export const sortBy = (arr, key, order = 'asc') => {
  if (!Array.isArray(arr)) return arr;
  
  return [...arr].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, delay) => {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func(...args);
    }
  };
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

/**
 * Scroll to top of page
 * @param {boolean} smooth - Use smooth scrolling
 */
export const scrollToTop = (smooth = true) => {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto'
  });
};

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if in viewport
 */
export const isInViewport = (element) => {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Calculate estimated delivery dates
 * @param {number} minDays - Minimum delivery days (default: 3)
 * @param {number} maxDays - Maximum delivery days (default: 5)
 * @returns {Object} Object with formatted delivery date range
 */
export const getDeliveryEstimate = (minDays = 3, maxDays = 5) => {
  const today = new Date();
  
  // Add business days (skip weekends)
  const addBusinessDays = (date, days) => {
    let count = 0;
    const resultDate = new Date(date);
    
    while (count < days) {
      resultDate.setDate(resultDate.getDate() + 1);
      const dayOfWeek = resultDate.getDay();
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
    }
    
    return resultDate;
  };
  
  const minDate = addBusinessDays(today, minDays);
  const maxDate = addBusinessDays(today, maxDays);
  
  // Format dates
  const formatDate = (date) => {
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  const formatFullDate = (date) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  return {
    minDate,
    maxDate,
    shortRange: `${formatDate(minDate)} - ${formatDate(maxDate)}`,
    longRange: `${formatFullDate(minDate)} - ${formatFullDate(maxDate)}`,
    businessDays: `${minDays}-${maxDays} business days`
  };
};

/**
 * Recently Viewed Products - localStorage tracking
 */
const RECENTLY_VIEWED_KEY = 'vera_recently_viewed';
const MAX_RECENTLY_VIEWED = 10;

/**
 * Add a product to recently viewed list
 * @param {Object} product - Product object with id, name, image, price
 */
export const addToRecentlyViewed = (product) => {
  try {
    // Get existing list
    const existing = getRecentlyViewed();
    
    // Remove if already exists (to move to front)
    const filtered = existing.filter(p => p.id !== product.id);
    
    // Add to front
    const updated = [
      {
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        category: product.category,
        viewedAt: new Date().toISOString()
      },
      ...filtered
    ].slice(0, MAX_RECENTLY_VIEWED); // Keep only last 10
    
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving to recently viewed:', error);
  }
};

/**
 * Get recently viewed products
 * @returns {Array} Array of recently viewed products
 */
export const getRecentlyViewed = () => {
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading recently viewed:', error);
    return [];
  }
};

/**
 * Clear recently viewed products
 */
export const clearRecentlyViewed = () => {
  try {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
  } catch (error) {
    console.error('Error clearing recently viewed:', error);
  }
};
