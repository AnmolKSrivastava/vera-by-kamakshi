// src/utils/validators.js

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Indian phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid Indian mobile number (10 digits starting with 6-9)
  if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
    return true;
  }
  
  // Check if it's in E.164 format (+91 prefixed, 12 digits total)
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return /^91[6-9]/.test(cleaned);
  }
  
  return false;
};

/**
 * Format phone to E.164 format (+91XXXXXXXXXX)
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone
 */
export const formatPhoneToE164 = (phone) => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }
  
  return phone;
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  return { isValid: true, message: 'Password is strong' };
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @returns {boolean} True if not empty
 */
export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

/**
 * Validate number
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid number
 */
export const isValidNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

/**
 * Validate positive number
 * @param {any} value - Value to validate
 * @returns {boolean} True if positive number
 */
export const isPositiveNumber = (value) => {
  return isValidNumber(value) && parseFloat(value) > 0;
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export const isValidUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate hex color code
 * @param {string} color - Color code to validate
 * @returns {boolean} True if valid hex color
 */
export const isValidHexColor = (color) => {
  if (!color) return false;
  return /^#[0-9A-F]{6}$/i.test(color);
};
