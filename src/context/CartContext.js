// src/context/CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

/**
 * Hook to use cart context
 * Must be used within CartProvider
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

/**
 * Shopping Cart Provider Component
 * Manages cart state and operations
 * TODO: Add Firestore sync for logged-in users
 */
export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  // const [loading, setLoading] = useState(false); // TODO: Use when implementing Firestore sync

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // TODO: Sync cart with Firestore when user logs in
  useEffect(() => {
    if (user) {
      // Future: Load user's cart from Firestore and merge with local cart
      console.log('User logged in, cart sync not yet implemented');
    }
  }, [user]);

  /**
   * Add item to cart
   * @param {Object} cartItem - Cart item with { id, name, price, image, quantity, options }
   */
  const addToCart = (cartItem) => {
    const { quantity = 1, options = {}, ...product } = cartItem;
    
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.id === product.id && 
                JSON.stringify(item.options) === JSON.stringify(options)
      );

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, { 
          ...product, 
          quantity, 
          options,
          addedAt: new Date().toISOString()
        }];
      }
    });
  };

  /**
   * Remove item from cart
   * @param {string} productId - Product ID to remove
   * @param {Object} options - Options to match
   */
  const removeFromCart = (productId, options = {}) => {
    setCartItems(prevItems => 
      prevItems.filter(item => 
        !(item.id === productId && 
          JSON.stringify(item.options) === JSON.stringify(options))
      )
    );
  };

  /**
   * Update item quantity
   * @param {string} productId - Product ID
   * @param {number} quantity - New quantity
   * @param {Object} options - Options to match
   */
  const updateQuantity = (productId, quantity, options = {}) => {
    if (quantity <= 0) {
      removeFromCart(productId, options);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId && 
        JSON.stringify(item.options) === JSON.stringify(options)
          ? { ...item, quantity }
          : item
      )
    );
  };

  /**
   * Clear entire cart
   */
  const clearCart = () => {
    setCartItems([]);
  };

  /**
   * Get cart total
   * @returns {number} Total price
   */
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  /**
   * Get total item count
   * @returns {number} Total number of items
   */
  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getItemCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
