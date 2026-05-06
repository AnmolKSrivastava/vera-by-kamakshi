// src/services/productService.js
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const productService = {
  /**
   * Get all products from Firestore
   * @returns {Promise<Array>} Array of products with IDs
   */
  async getAll() {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      return querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Get a single product by ID
   * @param {string} id - Product document ID
   * @returns {Promise<Object|null>} Product object or null if not found
   */
  async getById(id) {
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  /**
   * Create a new product
   * @param {Object} productData - Product data to create
   * @returns {Promise<string>} Created product ID
   */
  async create(productData) {
    try {
      // Ensure stock is always a number (default to 0)
      const stock = productData.stock !== undefined && productData.stock !== null && productData.stock !== ''
        ? Number(productData.stock)
        : 0;
      
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        stock, // Ensure stock is always set
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  /**
   * Update an existing product
   * @param {string} id - Product document ID
   * @param {Object} productData - Updated product data
   * @returns {Promise<void>}
   */
  async update(id, productData) {
    try {
      // Ensure stock is always a number (default to 0)
      const stock = productData.stock !== undefined && productData.stock !== null && productData.stock !== ''
        ? Number(productData.stock)
        : 0;
      
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, {
        ...productData,
        stock, // Ensure stock is always set
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  /**
   * Delete a product
   * @param {string} id - Product document ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  /**
   * Get featured products (marked as featured or random if none)
   * @param {number} count - Number of products to return
   * @returns {Promise<Array>} Array of featured products
   */
  async getFeatured(count = 4) {
    try {
      const products = await this.getAll();
      
      // First, try to get products marked as featured
      const featuredProducts = products.filter(p => p.featured === true);
      
      if (featuredProducts.length >= count) {
        // If we have enough featured products, return them
        return featuredProducts.slice(0, count);
      } else if (featuredProducts.length > 0) {
        // If we have some featured products but not enough, combine with random
        const remaining = count - featuredProducts.length;
        const nonFeatured = products.filter(p => !p.featured);
        const shuffled = [...nonFeatured].sort(() => 0.5 - Math.random());
        return [...featuredProducts, ...shuffled.slice(0, remaining)];
      } else {
        // If no products are marked as featured, return random products
        const shuffled = [...products].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },

  /**
   * Sync all products to ensure stock field exists and is a number
   * Sets stock to 0 for products without stock field
   * @returns {Promise<Object>} Summary of sync operation
   */
  async syncProductStock() {
    try {
      const products = await this.getAll();
      let updatedCount = 0;
      let alreadySyncedCount = 0;
      const results = [];

      for (const product of products) {
        // Check if stock field is missing, null, undefined, or empty string
        const hasValidStock = product.stock !== undefined && 
                             product.stock !== null && 
                             product.stock !== '';
        
        if (!hasValidStock) {
          // Update product to have stock = 0
          const docRef = doc(db, 'products', product.id);
          await updateDoc(docRef, {
            stock: 0,
            updatedAt: new Date().toISOString()
          });
          
          results.push({
            id: product.id,
            name: product.name,
            oldStock: product.stock,
            newStock: 0
          });
          updatedCount++;
        } else {
          // Ensure stock is a number
          const numericStock = Number(product.stock);
          if (product.stock !== numericStock) {
            const docRef = doc(db, 'products', product.id);
            await updateDoc(docRef, {
              stock: numericStock,
              updatedAt: new Date().toISOString()
            });
            
            results.push({
              id: product.id,
              name: product.name,
              oldStock: product.stock,
              newStock: numericStock,
              type: 'converted'
            });
            updatedCount++;
          } else {
            alreadySyncedCount++;
          }
        }
      }

      return {
        success: true,
        totalProducts: products.length,
        updatedCount,
        alreadySyncedCount,
        results
      };
    } catch (error) {
      console.error('Error syncing product stock:', error);
      throw error;
    }
  }
};
