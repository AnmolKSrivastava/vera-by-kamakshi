// src/context/WishlistContext.js
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const isInitialMergeRef = useRef(true);

  // Load wishlist from localStorage on mount (for guest users)
  useEffect(() => {
    if (!user) {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        try {
          setWishlistItems(JSON.parse(savedWishlist));
        } catch (error) {
          console.error('Error loading wishlist from localStorage:', error);
        }
      }
    }
  }, [user]);

  // Save wishlist to localStorage for guest users
  useEffect(() => {
    if (!user) {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, user]);

  // Sync wishlist with Firestore when user logs in
  useEffect(() => {
    if (!user) {
      setWishlistItems([]);
      isInitialMergeRef.current = true;
      return;
    }

    setLoading(true);
    const wishlistRef = doc(db, 'wishlists', user.uid);

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      wishlistRef,
      async (docSnap) => {
        try {
          if (docSnap.exists()) {
            // Wishlist exists in Firestore
            const firestoreWishlist = docSnap.data().items || [];
            
            // Only merge on initial load
            if (isInitialMergeRef.current) {
              // Get localStorage wishlist
              const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
              
              // Merge wishlists if localStorage has items
              if (localWishlist.length > 0) {
                const mergedWishlist = [...firestoreWishlist];
                
                localWishlist.forEach(localItem => {
                  const exists = mergedWishlist.find(item => item.id === localItem.id);
                  if (!exists) {
                    // New item from localStorage
                    mergedWishlist.push(localItem);
                  }
                });
                
                // Update Firestore with merged wishlist
                await setDoc(wishlistRef, {
                  items: mergedWishlist,
                  updatedAt: new Date().toISOString()
                }, { merge: true });
                
                // Clear localStorage after merge
                localStorage.removeItem('wishlist');
                setWishlistItems(mergedWishlist);
              } else {
                // No local wishlist, use Firestore wishlist
                setWishlistItems(firestoreWishlist);
              }
              
              isInitialMergeRef.current = false;
            } else {
              // After initial merge, always update with Firestore data
              setWishlistItems(firestoreWishlist);
            }
          } else {
            // No wishlist in Firestore, check localStorage (initial load only)
            const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            
            if (localWishlist.length > 0) {
              // Create Firestore wishlist from localStorage
              await setDoc(wishlistRef, {
                items: localWishlist,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
              localStorage.removeItem('wishlist');
              setWishlistItems(localWishlist);
            } else {
              // Empty wishlist
              setWishlistItems([]);
            }
            
            isInitialMergeRef.current = false;
          }
        } catch (error) {
          console.error('Error syncing wishlist:', error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error listening to wishlist changes:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  /**
   * Sync wishlist to Firestore
   * @param {Array} items - Wishlist items to sync
   */
  const syncToFirestore = async (items) => {
    if (!user || syncing) return;
    
    try {
      setSyncing(true);
      const wishlistRef = doc(db, 'wishlists', user.uid);
      await setDoc(wishlistRef, {
        items,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error syncing wishlist to Firestore:', error);
    } finally {
      setSyncing(false);
    }
  };

  const addToWishlist = async (product) => {
    if (!user) {
      return false; // Indicates auth required
    }
    
    const exists = wishlistItems.find(item => item.id === product.id);
    if (exists) {
      return true; // Already in wishlist
    }
    
    const updatedItems = [...wishlistItems, { 
      ...product, 
      addedAt: new Date().toISOString() 
    }];
    
    // Write to Firestore - onSnapshot will update state
    await syncToFirestore(updatedItems);
    
    return true; // Successfully added
  };

  const removeFromWishlist = async (productId) => {
    if (!user) return;
    
    const updatedItems = wishlistItems.filter(item => item.id !== productId);
    
    // Write to Firestore - onSnapshot will update state
    await syncToFirestore(updatedItems);
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const toggleWishlist = async (product) => {
    if (!user) {
      return false; // Indicates auth required
    }
    
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
    return true;
  };

  const value = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    wishlistCount: wishlistItems.length,
    loading
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
