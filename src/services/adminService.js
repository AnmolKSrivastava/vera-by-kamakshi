// src/services/adminService.js
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Fetch admin emails from Firestore
 * Admin emails are stored as document IDs in the 'admin' collection
 * @returns {Promise<Array<string>>} Array of admin email addresses
 */
export async function fetchAdminEmails() {
  try {
    const adminCollection = collection(db, 'admin');
    const querySnapshot = await getDocs(adminCollection);
    
    if (querySnapshot.empty) {
      console.warn('[AdminService] No admin documents found. Please create the "admin" collection in Firestore.');
      return [];
    }
    
    // Extract emails from document IDs
    const adminEmails = querySnapshot.docs.map(doc => doc.id);
    console.log('[AdminService] Loaded admin emails:', adminEmails.length, 'admin(s)');
    
    return adminEmails;
  } catch (error) {
    // Suppress permission errors (expected for non-admin users)
    if (!error.code?.includes('permission')) {
      console.error('[AdminService] Error fetching admin emails:', error);
    }
    return [];
  }
}

/**
 * Check if a user is an admin
 * @param {string} email - User email to check
 * @returns {Promise<boolean>} True if user is admin
 */
export async function isAdmin(email) {
  try {
    if (!email) return false;
    const adminEmails = await fetchAdminEmails();
    return adminEmails.includes(email);
  } catch (error) {
    console.error('[AdminService] Error checking admin status:', error);
    return false;
  }
}
