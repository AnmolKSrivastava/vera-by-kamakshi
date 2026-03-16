// src/services/authService.js
import { 
  signInWithPopup, 
  signInWithPhoneNumber, 
  RecaptchaVerifier,
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

export const authService = {
  /**
   * Sign in with Google OAuth
   * @returns {Promise<Object>} User object
   */
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Create or update user profile
      await this.createUserProfile(user, 'google');
      
      return user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  },

  /**
   * Initialize phone authentication with reCAPTCHA
   * @param {string} phoneNumber - Phone number in E.164 format
   * @param {string} recaptchaContainerId - DOM element ID for reCAPTCHA
   * @returns {Promise<Object>} Confirmation result for OTP verification
   */
  async signInWithPhone(phoneNumber, recaptchaContainerId) {
    try {
      // Setup reCAPTCHA verifier if not already done
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
          size: 'normal',
          callback: () => {
            console.log('reCAPTCHA verified successfully');
          },
          'expired-callback': () => {
            throw new Error('reCAPTCHA expired. Please try again.');
          },
          'error-callback': () => {
            throw new Error('reCAPTCHA error. Please refresh and try again.');
          }
        });
      }

      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        phoneNumber, 
        window.recaptchaVerifier
      );
      
      return confirmationResult;
    } catch (error) {
      console.error('Error sending OTP:', error);
      // Cleanup reCAPTCHA on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      throw error;
    }
  },

  /**
   * Verify OTP and complete phone authentication
   * @param {Object} confirmationResult - Result from signInWithPhone
   * @param {string} otp - OTP code entered by user
   * @returns {Promise<Object>} User object
   */
  async verifyOTP(confirmationResult, otp) {
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      
      // Create or update user profile
      await this.createUserProfile(user, 'phone');
      
      return user;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  },

  /**
   * Create or update user profile in Firestore
   * @param {Object} user - Firebase user object
   * @param {string} loginMethod - 'google' or 'phone'
   * @returns {Promise<void>}
   */
  async createUserProfile(user, loginMethod = 'google') {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create new user profile
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email || null,
          phoneNumber: user.phoneNumber || null,
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          photoURL: user.photoURL || null,
          loginMethod: loginMethod,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        console.log('User profile created successfully');
      } else {
        // Update existing user profile
        await setDoc(userRef, {
          email: user.email || userSnap.data().email,
          phoneNumber: user.phoneNumber || userSnap.data().phoneNumber,
          displayName: user.displayName || userSnap.data().displayName,
          photoURL: user.photoURL || userSnap.data().photoURL,
          loginMethod: loginMethod,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        console.log('User profile updated successfully');
      }
    } catch (error) {
      console.error('Error creating/updating user profile:', error);
      throw error;
    }
  },

  /**
   * Sign out current user
   * @returns {Promise<void>}
   */
  async signOut() {
    try {
      await firebaseSignOut(auth);
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  /**
   * Cleanup reCAPTCHA verifier
   */
  cleanupRecaptcha() {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (err) {
        console.log('reCAPTCHA cleanup:', err);
      }
      window.recaptchaVerifier = null;
    }
  }
};
