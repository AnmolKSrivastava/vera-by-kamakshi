// src/services/storageService.js
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

export const storageService = {
  /**
   * Upload a file to Firebase Storage
   * @param {File} file - File to upload
   * @param {string} folder - Storage folder (e.g., 'product-images', 'user-avatars')
   * @returns {Promise<string>} Download URL of uploaded file
   */
  async uploadFile(file, folder = 'uploads') {
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  /**
   * Upload product image
   * @param {File} file - Image file to upload
   * @returns {Promise<string>} Download URL
   */
  async uploadProductImage(file) {
    return this.uploadFile(file, 'product-images');
  },

  /**
   * Upload user avatar
   * @param {File} file - Avatar image file
   * @returns {Promise<string>} Download URL
   */
  async uploadUserAvatar(file) {
    return this.uploadFile(file, 'user-avatars');
  },

  /**
   * Delete a file from Firebase Storage
   * @param {string} fileUrl - Full URL of the file to delete
   * @returns {Promise<void>}
   */
  async deleteFile(fileUrl) {
    try {
      // Extract path from URL
      const url = new URL(fileUrl);
      const pathStart = url.pathname.indexOf('/o/') + 3;
      const pathEnd = url.pathname.indexOf('?');
      const filePath = decodeURIComponent(
        url.pathname.substring(pathStart, pathEnd)
      );
      
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
};
