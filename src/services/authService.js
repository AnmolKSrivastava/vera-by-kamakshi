// src/services/authService.js
import { 
  signInWithPopup, 
  signInWithPhoneNumber, 
  RecaptchaVerifier,
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

export const authService = {
  /**
   * Sign in with Google OAuth
   * @param {Object} [options] - Optional config
   * @param {boolean} [options.onlyGetUser] - If true, only get user info, do not create/update profile
   * @returns {Promise<Object>} User object or result
   */
  async signInWithGoogle(options = {}) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // If onlyGetUser is true, just return user without profile creation
      if (options.onlyGetUser) {
        return { user };
      }
      
      // Check if user profile exists
      const profile = await this.getUserProfile(user.uid);
      
      // If profile doesn't exist, return user without creating profile
      // Profile will be created after user completes the profile modal
      if (!profile.exists) {
        return { user, isNewUser: true };
      }
      
      // For existing users, update last login info
      await this.updateUserLastLogin(user.uid);
      
      return { user, isNewUser: false };
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
          callback: (response) => {
            // reCAPTCHA verified
          },
          'expired-callback': () => {
            console.error('reCAPTCHA expired');
            throw new Error('reCAPTCHA expired. Please try again.');
          },
          'error-callback': (error) => {
            console.error('reCAPTCHA error:', error);
            throw new Error('reCAPTCHA error. Please refresh and try again.');
          }
        });

        // Render the reCAPTCHA widget
        try {
          await window.recaptchaVerifier.render();
        } catch (renderError) {
          console.error('Error rendering reCAPTCHA:', renderError);
          throw new Error('Failed to load reCAPTCHA. Please refresh the page.');
        }
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
   * @returns {Promise<Object>} User object and profile status
   */
  async verifyOTP(confirmationResult, otp) {
    try {
      console.log('[authService] Verifying OTP...');
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      console.log('[authService] OTP verified, user UID:', user.uid);
      
      // Check if user profile exists
      const profile = await this.getUserProfile(user.uid);
      console.log('[authService] Profile check:', profile);
      
      // If profile doesn't exist, return user without creating profile
      // Profile will be created after user completes the profile modal
      if (!profile.exists) {
        console.log('[authService] No profile found - new user');
        return { user, isNewUser: true };
      }
      
      console.log('[authService] Profile exists - existing user');
      // For existing users, update last login info
      await this.updateUserLastLogin(user.uid);
      
      return { user, isNewUser: false };
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
        // Cleanup error ignored
      }
      window.recaptchaVerifier = null;
    }
  },

  /**
   * Check if a user exists by email or phone number
   * @param {string} email - User's email address
   * @param {string} phoneNumber - User's phone number
   * @returns {Promise<Object|null>} Existing user data or null if not found
   */
  async checkExistingUser(email, phoneNumber) {
    try {
      const usersRef = collection(db, 'users');
      
      // Check by email if provided
      if (email) {
        const emailQuery = query(usersRef, where('email', '==', email));
        const emailSnapshot = await getDocs(emailQuery);
        
        if (!emailSnapshot.empty) {
          const userData = emailSnapshot.docs[0].data();
          return { exists: true, user: userData, uid: emailSnapshot.docs[0].id };
        }
      }
      
      // Check by phone number if provided
      if (phoneNumber) {
        const phoneQuery = query(usersRef, where('phoneNumber', '==', phoneNumber));
        const phoneSnapshot = await getDocs(phoneQuery);
        
        if (!phoneSnapshot.empty) {
          const userData = phoneSnapshot.docs[0].data();
          return { exists: true, user: userData, uid: phoneSnapshot.docs[0].id };
        }
      }
      
      return { exists: false, user: null, uid: null };
    } catch (error) {
      console.error('Error checking existing user:', error);
      throw error;
    }
  },

  /**
   * Get user profile from Firestore
   * @param {string} uid - User's Firebase UID
   * @returns {Promise<Object|null>} User profile data or null if not found
   */
  async getUserProfile(uid) {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { exists: true, data: userSnap.data() };
      }
      
      return { exists: false, data: null };
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },

  /**
   * Update user's last login timestamp
   * @param {string} uid - User's Firebase UID
   * @returns {Promise<void>}
   */
  async updateUserLastLogin(uid) {
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating last login:', error);
      // Don't throw error, just log it
    }
  },

  /**
   * Create complete user profile with all required fields
   * @param {Object} userData - Complete user data
   * @param {string} userData.uid - Firebase user UID
   * @param {string} userData.fullName - User's full name
   * @param {string} userData.email - User's email address
   * @param {string} userData.phoneNumber - User's phone number
   * @param {string} userData.loginMethod - 'google' or 'phone'
   * @param {string} [userData.photoURL] - User's profile photo URL
   * @returns {Promise<void>}
   */
  async createCompleteUserProfile(userData) {
    try {
      console.log('[authService] Creating complete user profile:', userData);
      const { uid, fullName, email, phoneNumber, loginMethod, photoURL } = userData;

      // Validate required fields
      if (!uid || !fullName || !email || !phoneNumber) {
        throw new Error('Missing required fields: uid, fullName, email, and phoneNumber are mandatory');
      }

      console.log('[authService] Creating profile in Firestore...');
      // Create user profile in Firestore
      // Note: Firebase Auth already prevents duplicate emails/phone numbers,
      // so we don't need to check for duplicates here
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        uid: uid,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        displayName: fullName.trim(),
        photoURL: photoURL || null,
        loginMethod: loginMethod,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      console.log('[authService] Profile created successfully in Firestore');
      return { success: true };
    } catch (error) {
      console.error('Error creating complete user profile:', error);
      throw error;
    }
  }
};
