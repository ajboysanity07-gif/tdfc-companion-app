// resources/js/hooks/use-products-api.ts
import { useState, useCallback } from 'react';
import axios from 'axios';
import type { ProductLntype } from '@/types/product-lntype';

type ToggleAction = 'activate' | 'deactivate';

export function useProductsApi() {
  const [products, setProducts] = useState<ProductLntype[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get<ProductLntype[]>('/api/products');
      setProducts(data);
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to load products'
          : 'Failed to load products';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleDisplay = useCallback(
    async (typecode: string, show: boolean) => {
      setError(null);
      try {
        const url = show
          ? `/api/products/${typecode}/activate`
          : `/api/products/${typecode}/deactivate`;
        await axios.post(url);
        // Refresh to reflect the latest display state
        await fetchProducts();
      } catch (err) {
        const message =
          err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to update product'
            : 'Failed to update product';
        setError(message);
        throw err;
      }
    },
    [fetchProducts]
  );

  return {
    products,
    loading,
    error,
    fetchProducts,
    toggleDisplay,
  };
}
