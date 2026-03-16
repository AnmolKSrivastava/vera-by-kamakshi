// src/utils/constants.js

/**
 * Application-wide constants
 */

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// Payment Methods
export const PAYMENT_METHODS = {
  RAZORPAY: 'razorpay',
  COD: 'cod',
  UPI: 'upi'
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer'
};

// Login Methods
export const LOGIN_METHODS = {
  GOOGLE: 'google',
  PHONE: 'phone',
  EMAIL: 'email'
};

// Product Categories (customize as needed)
export const PRODUCT_CATEGORIES = [
  'Handbags',
  'Shoulder Bags',
  'Clutches',
  'Tote Bags',
  'Crossbody Bags',
  'Backpacks',
  'Wallets',
  'Accessories'
];

// Delivery Time (in days)
export const DELIVERY_TIME = {
  STANDARD: 7,
  EXPRESS: 3
};

// Currency
export const CURRENCY = {
  SYMBOL: '₹',
  CODE: 'INR',
  NAME: 'Indian Rupee'
};

// Pagination
export const ITEMS_PER_PAGE = 12;

// Image Upload
export const IMAGE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_IMAGES: 5
};

// Phone Number
export const PHONE = {
  COUNTRY_CODE: '+91',
  MIN_LENGTH: 10,
  MAX_LENGTH: 10
};

// Price Range (for filters)
export const PRICE_RANGES = [
  { label: 'Under ₹5,000', min: 0, max: 5000 },
  { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
  { label: '₹10,000 - ₹20,000', min: 10000, max: 20000 },
  { label: '₹20,000 - ₹50,000', min: 20000, max: 50000 },
  { label: 'Above ₹50,000', min: 50000, max: Infinity }
];

// Sort Options
export const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Name: A to Z', value: 'name_asc' },
  { label: 'Name: Z to A', value: 'name_desc' }
];

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  AUTH_FAILED: 'Authentication failed. Please try again.',
  PRODUCT_NOT_FOUND: 'Product not found.',
  CART_EMPTY: 'Your cart is empty.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  SERVER_ERROR: 'Something went wrong. Please try again later.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  PRODUCT_ADDED: 'Product added to cart!',
  ORDER_PLACED: 'Order placed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  ITEM_REMOVED: 'Item removed from cart.'
};
