import { useState, useCallback } from 'react';
import axios from 'axios';

// Custom hook for product API communication
export function useProductsApi() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Ensure your URL matches your API route!
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // FIX: Change to the real products endpoint for your backend
      const { data } = await axios.get('/api/admin/products');
      setProducts(data);
    } catch {
      setProducts([]); // Optionally show an error, etc.
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = async (typecode: string, payload: Record<string, unknown>) => {
    await axios.put(`/api/admin/products/${typecode}`, payload); // Match route!
    fetchProducts();
  };

  const createProduct = async (payload: Record<string, unknown>) => {
    await axios.post('/api/admin/products', payload);
    fetchProducts();
  };

  const deleteProduct = async (typecode: string) => {
    await axios.delete(`/api/admin/products/${typecode}`);
    fetchProducts();
  };

  return {
    products,
    loading,
    fetchProducts,
    updateProduct,
    createProduct,
    deleteProduct
  };
}
