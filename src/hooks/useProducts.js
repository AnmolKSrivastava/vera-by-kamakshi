// src/hooks/useProducts.js
import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';

/**
 * Hook to fetch all products
 * @returns {Object} { products, loading, error, refetch }
 */
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { 
    products, 
    loading, 
    error, 
    refetch: fetchProducts 
  };
};

/**
 * Hook to fetch a single product by ID
 * @param {string} id - Product ID
 * @returns {Object} { product, loading, error, refetch }
 */
export const useProduct = (id) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduct = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await productService.getById(id);
      setProduct(data);
    } catch (err) {
      setError(err.message);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { 
    product, 
    loading, 
    error, 
    refetch: fetchProduct 
  };
};

/**
 * Hook to fetch featured products
 * @param {number} count - Number of products to fetch
 * @returns {Object} { products, loading, error, refetch }
 */
export const useFeaturedProducts = (count = 4) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeatured = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getFeatured(count);
      setProducts(data);
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [count]);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  return { 
    products, 
    loading, 
    error, 
    refetch: fetchFeatured 
  };
};
