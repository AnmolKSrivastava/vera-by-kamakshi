// Payment Service: Razorpay Integration

/**
 * Load Razorpay script dynamically
 * @returns {Promise} Resolves when script is loaded
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      resolve(true);
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Razorpay SDK'));
    };
    
    document.body.appendChild(script);
  });
};

/**
 * Initialize Razorpay payment
 * @param {Object} options - Payment options
 * @param {number} options.amount - Amount in INR (will be converted to paise)
 * @param {string} options.orderId - Order ID for reference
 * @param {Object} options.customerInfo - Customer details
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onFailure - Failure callback
 */
export const initiateRazorpayPayment = async (options) => {
  try {
    // Load Razorpay script if not already loaded
    await loadRazorpayScript();
    
    const {
      amount,
      orderId,
      customerInfo = {},
      onSuccess,
      onFailure
    } = options;
    
    // Configure Razorpay options
    const razorpayOptions = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID',
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      name: 'Vera by Kamakshi',
      description: `Order #${orderId?.slice(0, 8).toUpperCase() || 'NEW'}`,
      image: '/logo192.png',
      order_id: orderId, // Optional: Razorpay order ID from backend
      handler: function(response) {
        // Payment successful
        if (onSuccess) {
          onSuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          });
        }
      },
      prefill: {
        name: customerInfo.name || '',
        email: customerInfo.email || '',
        contact: customerInfo.phone || ''
      },
      notes: {
        address: customerInfo.address || ''
      },
      theme: {
        color: '#333333'
      },
      modal: {
        ondismiss: function() {
          // Payment cancelled by user
          if (onFailure) {
            onFailure(new Error('Payment cancelled by user'));
          }
        }
      }
    };
    
    const razorpay = new window.Razorpay(razorpayOptions);
    
    razorpay.on('payment.failed', function(response) {
      // Payment failed
      if (onFailure) {
        onFailure({
          code: response.error.code,
          description: response.error.description,
          source: response.error.source,
          step: response.error.step,
          reason: response.error.reason,
          metadata: response.error.metadata
        });
      }
    });
    
    // Open Razorpay checkout
    razorpay.open();
    
  } catch (error) {
    console.error('Razorpay initialization error:', error);
    if (options.onFailure) {
      options.onFailure(error);
    }
  }
};

/**
 * Verify payment signature via backend API
 * IMPORTANT: This must be called before marking order as paid
 * @param {Object} paymentData - Payment response data from Razorpay
 * @param {string} paymentData.razorpay_payment_id - Payment ID
 * @param {string} paymentData.razorpay_order_id - Order ID
 * @param {string} paymentData.razorpay_signature - Payment signature
 * @returns {Promise<boolean>} True if signature is valid
 */
export const verifyPaymentSignature = async (paymentData) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = paymentData;
    
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      console.error('Missing required payment verification fields');
      return false;
    }
    
    // Call backend API to verify signature
    // TODO: Replace with your actual Cloud Function or backend API endpoint
    const verificationEndpoint = process.env.REACT_APP_PAYMENT_VERIFICATION_ENDPOINT 
                                 || 'https://your-region-your-project.cloudfunctions.net/verifyPayment';
    
    const response = await fetch(verificationEndpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature
      })
    });
    
    if (!response.ok) {
      console.error('Payment verification failed:', response.statusText);
      return false;
    }
    
    const result = await response.json();
    return result.verified === true;
    
  } catch (error) {
    console.error('Payment verification error:', error);
    return false;
  }
};

/**
 * Backend verification example (to be implemented as Cloud Function)
 * 
 * Example Cloud Function code:
 * 
 * const crypto = require('crypto');
 * const functions = require('firebase-functions');
 * 
 * exports.verifyPayment = functions.https.onRequest(async (req, res) => {
 *   // Enable CORS
 *   res.set('Access-Control-Allow-Origin', 'https://your-domain.com');
 *   res.set('Access-Control-Allow-Methods', 'POST');
 *   
 *   if (req.method === 'OPTIONS') {
 *     res.status(204).send('');
 *     return;
 *   }
 *   
 *   try {
 *     const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
 *     const razorpay_key_secret = functions.config().razorpay.secret;
 *     
 *     // Generate signature
 *     const text = `${razorpay_order_id}|${razorpay_payment_id}`;
 *     const generated_signature = crypto
 *       .createHmac('sha256', razorpay_key_secret)
 *       .update(text)
 *       .digest('hex');
 *     
 *     // Compare signatures
 *     const verified = generated_signature === razorpay_signature;
 *     
 *     res.status(200).json({ verified });
 *   } catch (error) {
 *     console.error('Verification error:', error);
 *     res.status(500).json({ verified: false, error: error.message });
 *   }
 * });
 */

/**
 * Get payment method display name
 * @param {string} method - Payment method code
 * @returns {string} Display name
 */
export const getPaymentMethodName = (method) => {
  const methods = {
    'COD': 'Cash on Delivery',
    'UPI': 'UPI',
    'Card': 'Credit/Debit Card',
    'NetBanking': 'Net Banking',
    'Wallet': 'Wallet'
  };
  return methods[method] || method;
};

/**
 * Calculate order pricing
 * @param {Array} cartItems - Cart items
 * @param {Object} options - Additional options (coupon, etc.)
 * @returns {Object} Pricing breakdown
 */
export const calculateOrderPricing = (cartItems, options = {}) => {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Free shipping above 999
  const shippingCost = subtotal >= 999 ? 0 : 99;
  
  // Apply coupon discount if available
  let discount = 0;
  if (options.coupon) {
    if (options.coupon.type === 'percentage') {
      discount = (subtotal * options.coupon.discount) / 100;
      if (options.coupon.maxDiscount) {
        discount = Math.min(discount, options.coupon.maxDiscount);
      }
    } else if (options.coupon.type === 'fixed') {
      discount = options.coupon.discount;
    }
  }
  
  const total = subtotal + shippingCost - discount;
  
  return {
    subtotal,
    shippingCost,
    discount,
    total,
    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
  };
};

export default {
  loadRazorpayScript,
  initiateRazorpayPayment,
  verifyPaymentSignature,
  getPaymentMethodName,
  calculateOrderPricing
};
