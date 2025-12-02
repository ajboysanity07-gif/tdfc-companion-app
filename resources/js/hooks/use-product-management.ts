//resources/js/hooks/use-product-management.ts
import type { ProductLntype, ProductPayload, WlnType } from '@/types/product-lntype';
import axios, { AxiosResponse } from 'axios';
import { useCallback, useState } from 'react';

type ApiListResponse<T> = { data: T[] };
type ApiErrorPayload = { message?: string };



export const useProductManagement = () => {
    const [products, setProducts] = useState<ProductLntype[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [types, setTypes] = useState<WlnType[]>([]);

    const errorMessage = (err: unknown) => {
        if (axios.isAxiosError(err)) {
            const data = err.response?.data as ApiErrorPayload | undefined;
            return data?.message ?? 'Request failed';
        }
        return 'Request failed';
    };

    const toList = (res: AxiosResponse<ProductLntype[] | ApiListResponse<ProductLntype>>) => {
        const body = res.data;
        return Array.isArray(body) ? body : body?.data ?? [];
    };

    const fetchTypes = useCallback(async () =>{
        try{
            const res = await axios.get<WlnType[]>('/api/product-types')
            setTypes(res.data);
        }catch (err){
            setError (errorMessage(err));
        }
    },[])

    // Fetch products: GET /api/products
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<ProductLntype[] | ApiListResponse<ProductLntype>>('/api/products');
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
            const response = await axios.post('/api/products', payload);
            await fetchProducts();
            return response.data;
        },
        [fetchProducts],
    );

    // Update a product: PUT /api/products/{product_id}
    const updateProduct = useCallback(
        async (productId: number, payload: Partial<ProductPayload>) => {
            setError(null);
            const response = await axios.put(`/api/products/${productId}`, payload);
            await fetchProducts();
            return response.data;
        },
        [fetchProducts],
    );

    // Delete a product: DELETE /api/products/{product_id}
    const deleteProduct = useCallback(
        async (productId: number) => {
            setError(null);
            const response = await axios.delete(`/api/products/${productId}`);
            await fetchProducts();
            return response.data;
        },
        [fetchProducts],
    );

    return {
        products,
        types,
        loading,
        error,
        fetchTypes,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
    };
};
