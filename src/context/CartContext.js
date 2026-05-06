// src/context/CartContext.js
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
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
 * Manages cart state with Firestore sync for logged-in users
 */
export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const isInitialMergeRef = useRef(true);

  // Load cart from localStorage on mount (for guest users)
  useEffect(() => {
    if (!user) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
        }
      }
    }
  }, [user]);

  // Save cart to localStorage for guest users
  useEffect(() => {
    if (!user) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  // Sync cart with Firestore when user logs in
  useEffect(() => {
    if (!user) {
      setCartItems([]);
      isInitialMergeRef.current = true;
      return;
    }

    setLoading(true);
    const cartRef = doc(db, 'carts', user.uid);

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      cartRef,
      async (docSnap) => {
        try {
          if (docSnap.exists()) {
            // Cart exists in Firestore
            const firestoreCart = docSnap.data().items || [];
            
            // Only merge on initial load
            if (isInitialMergeRef.current) {
              // Get localStorage cart
              const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
              
              // Merge carts if localStorage has items
              if (localCart.length > 0) {
                const mergedCart = [...firestoreCart];
                
                localCart.forEach(localItem => {
                  const existingIndex = mergedCart.findIndex(
                    item => item.id === localItem.id && 
                            JSON.stringify(item.options) === JSON.stringify(localItem.options)
                  );
                  
                  if (existingIndex > -1) {
                    // Item exists, keep the higher quantity
                    mergedCart[existingIndex].quantity = Math.max(
                      mergedCart[existingIndex].quantity,
                      localItem.quantity
                    );
                  } else {
                    // New item from localStorage
                    mergedCart.push(localItem);
                  }
                });
                
                // Update Firestore with merged cart
                await setDoc(cartRef, {
                  items: mergedCart,
                  updatedAt: new Date().toISOString()
                }, { merge: true });
                
                // Clear localStorage after merge
                localStorage.removeItem('cart');
                setCartItems(mergedCart);
              } else {
                // No local cart, use Firestore cart
                setCartItems(firestoreCart);
              }
              
              isInitialMergeRef.current = false;
            } else {
              // After initial merge, always update with Firestore data
              setCartItems(firestoreCart);
            }
          } else {
            // No cart in Firestore, check localStorage (initial load only)
            const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
            
            if (localCart.length > 0) {
              // Create Firestore cart from localStorage
              await setDoc(cartRef, {
                items: localCart,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
              localStorage.removeItem('cart');
              setCartItems(localCart);
            } else {
              // Empty cart
              setCartItems([]);
            }
            
            isInitialMergeRef.current = false;
          }
        } catch (error) {
          console.error('Error syncing cart:', error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error listening to cart changes:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  /**
   * Sync cart to Firestore
   * @param {Array} items - Cart items to sync
   */
  const syncToFirestore = async (items) => {
    if (!user || syncing) return;
    
    try {
      setSyncing(true);
      const cartRef = doc(db, 'carts', user.uid);
      await setDoc(cartRef, {
        items,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error syncing cart to Firestore:', error);
    } finally {
      setSyncing(false);
    }
  };

  /**
   * Add item to cart
   * @param {Object} cartItem - Cart item with { id, name, price, image, quantity, options, stock, available }
   * @returns {Object} - Returns { success: boolean, error: string }
   */
  const addToCart = async (cartItem) => {
    if (!user) {
      return { success: false, error: 'auth_required' }; // Indicates auth required
    }
    
    const { quantity = 1, options = {}, stock, available, ...product } = cartItem;
    
    // Check if product is marked as unavailable
    if (available === false) {
      console.warn('Cannot add unavailable item to cart');
      return { success: false, error: 'out_of_stock' };
    }
    
    // Validate stock availability
    if (stock !== undefined && stock !== null && stock !== '') {
      const numericStock = Number(stock);
      
      // Check if out of stock
      if (numericStock === 0) {
        console.warn('Cannot add out of stock item to cart');
        return { success: false, error: 'out_of_stock' };
      }
      
      // Check if requested quantity exceeds available stock
      const existingItemIndex = cartItems.findIndex(
        item => item.id === product.id && 
                JSON.stringify(item.options) === JSON.stringify(options)
      );
      
      const currentCartQuantity = existingItemIndex > -1 ? cartItems[existingItemIndex].quantity : 0;
      const totalQuantity = currentCartQuantity + quantity;
      
      if (totalQuantity > numericStock) {
        console.warn(`Cannot add ${quantity} items. Only ${numericStock - currentCartQuantity} available`);
        return { success: false, error: 'insufficient_stock', available: numericStock - currentCartQuantity };
      }
    }
    
    // For authenticated users, write directly to Firestore
    // Let onSnapshot update the state
    const existingItemIndex = cartItems.findIndex(
      item => item.id === product.id && 
              JSON.stringify(item.options) === JSON.stringify(options)
    );

    let updatedItems;
    if (existingItemIndex > -1) {
      // Update quantity if item exists
      updatedItems = [...cartItems];
      updatedItems[existingItemIndex].quantity += quantity;
    } else {
      // Add new item (include stock for future reference)
      updatedItems = [...cartItems, { 
        ...product, 
        quantity, 
        options,
        stock,
        addedAt: new Date().toISOString()
      }];
    }
    
    // Write to Firestore - onSnapshot will update state
    await syncToFirestore(updatedItems);
    
    return { success: true }; // Successfully added
  };

  /**
   * Remove item from cart
   * @param {string} productId - Product ID to remove
   * @param {Object} options - Options to match
   */
  const removeFromCart = async (productId, options = {}) => {
    if (!user) return;
    
    const updatedItems = cartItems.filter(item => 
      !(item.id === productId && 
        JSON.stringify(item.options) === JSON.stringify(options))
    );
    
    // Write to Firestore - onSnapshot will update state
    await syncToFirestore(updatedItems);
  };

  /**
   * Update item quantity
   * @param {string} productId - Product ID
   * @param {number} quantity - New quantity
   * @param {Object} options - Options to match
   */
  const updateQuantity = async (productId, quantity, options = {}) => {
    if (!user) return;
    
    if (quantity <= 0) {
      await removeFromCart(productId, options);
      return;
    }

    const updatedItems = cartItems.map(item =>
      item.id === productId && 
      JSON.stringify(item.options) === JSON.stringify(options)
        ? { ...item, quantity }
        : item
    );
    
    // Write to Firestore - onSnapshot will update state
    await syncToFirestore(updatedItems);
  };

  /**
   * Clear entire cart
   */
  const clearCart = async () => {
    if (!user) return;
    
    // Write to Firestore - onSnapshot will update state
    await syncToFirestore([]);
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
    getItemCount,
    loading
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
