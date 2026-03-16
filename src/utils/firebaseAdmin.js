// src/utils/firebaseAdmin.js
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
      console.warn('[Firestore] No admin documents found. Please create the "admin" collection in Firestore.');
      return [];
    }
    
    // Extract emails from document IDs
    const adminEmails = querySnapshot.docs.map(doc => doc.id);
    console.log('[Firestore] Loaded admin emails:', adminEmails.length, 'admin(s)');
    
    return adminEmails;
  } catch (err) {
    console.error('[Firestore] Error fetching admin emails:', err);
    return [];
  }
}
