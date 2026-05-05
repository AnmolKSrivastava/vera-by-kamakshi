// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { authService } from '../services/authService';
import { fetchAdminEmails } from '../services/adminService';

const AuthContext = createContext();

/**
 * Hook to use auth context
 * Must be used within AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/**
 * Authentication Provider Component
 * Manages user authentication state and admin privileges
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Check admin status
        try {
          const adminEmails = await fetchAdminEmails();
          setIsAdmin(adminEmails.includes(currentUser.email));
        } catch (err) {
          console.error('Error checking admin status:', err);
          setIsAdmin(false);
        }

        // Check if user profile is complete in Firestore
        try {
          const profile = await authService.getUserProfile(currentUser.uid);
          if (profile.exists) {
            // Store profile data
            setUserProfile(profile.data);
            
            // Check if profile has all required fields
            const data = profile.data;
            const hasAllFields = data.fullName && data.email && data.phoneNumber;
            setProfileComplete(hasAllFields);
          } else {
            setUserProfile(null);
            setProfileComplete(false);
          }
        } catch (err) {
          console.error('Error checking profile completion:', err);
          setUserProfile(null);
          setProfileComplete(false);
        }
      } else {
        setUserProfile(null);
        setIsAdmin(false);
        setProfileComplete(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Sign in with Google
   */
  const signInWithGoogle = async () => {
    try {
      setError(null);
      const user = await authService.signInWithGoogle();
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Sign in with phone number
   */
  const signInWithPhone = async (phoneNumber, recaptchaContainerId) => {
    try {
      setError(null);
      const confirmationResult = await authService.signInWithPhone(
        phoneNumber, 
        recaptchaContainerId
      );
      return confirmationResult;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Verify OTP
   */
  const verifyOTP = async (confirmationResult, otp) => {
    try {
      setError(null);
      const user = await authService.verifyOTP(confirmationResult, otp);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Sign out
   */
  const signOut = async () => {
    try {
      setError(null);
      await authService.signOut();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    userProfile,
    isAdmin,
    profileComplete,
    loading,
    error,
    signInWithGoogle,
    signInWithPhone,
    verifyOTP,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
