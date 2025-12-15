//resources/js/hooks/use-product-management.ts
import axiosClient, { getCsrfCookie } from '@/api/axios-client';
import type { ProductLntype, ProductPayload, WlnType } from '@/types/product-lntype';
import axios, { AxiosResponse } from 'axios';
import { useCallback, useEffect, useState } from 'react';
type ApiListResponse<T> = { data: T[] };
type ApiErrorPayload = { message?: string };

export const useProductManagement = () => {
    const [products, setProducts] = useState<ProductLntype[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [types, setTypes] = useState<WlnType[]>([]);
    const [success, setSuccess] = useState<string | null>(null);

    // Auto-clear success after a short delay so the banner fades out
    useEffect(() => {
        if (!success) return;
        const t = setTimeout(() => setSuccess(null), 3000);
        return () => clearTimeout(t);
    }, [success]);

    const errorMessage = (err: unknown) => {
        if (axios.isAxiosError(err)) {
            const data = err.response?.data as ApiErrorPayload | undefined;
            return data?.message ?? 'Request failed';
        }
        return 'Request failed';
    };

    const toList = (res: AxiosResponse<ProductLntype[] | ApiListResponse<ProductLntype>>) => {
        const body = res.data;
        return Array.isArray(body) ? body : (body?.data ?? []);
    };

    const fetchTypes = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await getCsrfCookie();
            const res = await axiosClient.get<WlnType[]>('/product-types');
            setTypes(res.data);
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch products: GET /api/products
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await getCsrfCookie();
            const response = await axiosClient.get<ProductLntype[] | ApiListResponse<ProductLntype>>('/products');
            // Supports both paginated ({ data: [...] }) and plain array responses
            const list = toList(response);
            setProducts(list);
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    // Create a new product: POST /api/products
    const createProduct = useCallback(
        async (payload: ProductPayload) => {
            setError(null);
            setSuccess(null);
            try {
                await getCsrfCookie();
                const response = await axiosClient.post('/products', payload);
                await fetchProducts();
                setSuccess('Product created successfully');
                return response.data;
            } catch (err) {
                setError(errorMessage(err));
                throw err;
            }
        },
        [fetchProducts],
    );

    // Update a product: PUT /api/products/{product_id}
    const updateProduct = useCallback(
        async (productId: number, payload: Partial<ProductPayload>) => {
            setError(null);
            setSuccess(null);
            try {
                await getCsrfCookie();
                const response = await axiosClient.put(`/products/${productId}`, payload);
                await fetchProducts();
                setSuccess('Product updated successfully');
                return response.data;
            } catch (err) {
                setError(errorMessage(err));
                throw err;
            }
        },
        [fetchProducts],
    );

    // Delete a product: DELETE /api/products/{product_id}
    const deleteProduct = useCallback(
        async (productId: number) => {
            setError(null);
            setSuccess(null);
            try {
                await getCsrfCookie();
                const response = await axiosClient.delete(`/products/${productId}`);
                await fetchProducts();
                setSuccess('Product deleted successfully');
                return response.data;
            } catch (err) {
                setError(errorMessage(err));
                throw err;
            }
        },
        [fetchProducts],
    );

    return {
        products,
        types,
        loading,
        error,
        success,
        fetchTypes,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
    };
};
