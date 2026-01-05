import axiosClient, { getCsrfCookie } from '@/api/axios-client';
import type { ProductLntype } from '@/types/product-lntype';
import type { 
    LoanApplicationRequest, 
    LoanApplicationResponse
} from '@/types/loan-application';
import axios, { AxiosResponse } from 'axios';
import { useCallback, useState } from 'react';

type ApiListResponse<T> = { 
    success: boolean;
    data: T[];
};

type ApiErrorPayload = { 
    message?: string;
};

export const useLoanApply = () => {
    const [products, setProducts] = useState<ProductLntype[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const errorMessage = (err: unknown) => {
        if (axios.isAxiosError(err)) {
            const data = err.response?.data as ApiErrorPayload | undefined;
            return data?.message ?? 'Request failed';
        }
        return 'Request failed';
    };

    const toList = (res: AxiosResponse<ProductLntype[] | ApiListResponse<ProductLntype>>) => {
        const body = res.data;
        if ('data' in body && Array.isArray(body.data)) {
            return body.data;
        }
        return Array.isArray(body) ? body : [];
    };

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await getCsrfCookie();
            const response = await axiosClient.get<ProductLntype[] | ApiListResponse<ProductLntype>>('/loans/apply');
            const list = toList(response);
            setProducts(list);
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    const submitLoanApplication = useCallback(async (request: LoanApplicationRequest) => {
        setSubmitting(true);
        setSubmitError(null);
        try {
            await getCsrfCookie();
            const response = await axiosClient.post<LoanApplicationResponse>('/loans/apply', request);
            return response.data; // Return success data
        } catch (err) {
            const message = errorMessage(err);
            setSubmitError(message);
            throw new Error(message); // Re-throw so caller can handle it
        } finally {
            setSubmitting(false);
        }
    }, []);

    return {
        products,
        loading,
        error,
        fetchProducts,
        submitLoanApplication,
        submitting,
        submitError,
    };
};
