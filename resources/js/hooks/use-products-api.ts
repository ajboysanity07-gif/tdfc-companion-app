import { useState, useCallback } from 'react';
import axios from 'axios';
import type { ProductLntype } from '@/types/product-lntype'; // Import type

export function useProductsApi() {
  const [products, setProducts] = useState<ProductLntype[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data } = await axios.get<ProductLntype[]>('/api/products');
    setProducts(data);
    setLoading(false);
  }, []);

  const updateProduct = async (typecode: string, payload: Partial<ProductLntype>) => {
    await axios.put(`/api/products/${typecode}`, payload);
    fetchProducts();
  };

  const createProduct = async (payload: Partial<ProductLntype>) => {
    await axios.post('/api/products', payload);
    fetchProducts();
  };

  const deleteProduct = async (typecode: string) => {
    await axios.delete(`/api/products/${typecode}`);
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
