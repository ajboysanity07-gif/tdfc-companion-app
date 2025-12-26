import axios from 'axios';
import axiosClient from '@/api/axios-client';
import { useCallback, useState } from 'react';
import type { ClientDashboardResponse, VRecentTransactions } from '@/types/client-dashboard';

export function useClientDashboard(acctno?: string) {
    const [transactions, setTransactions] = useState<VRecentTransactions[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRecentTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const endpoint = acctno ? `/client/${acctno}/dashboard` : '/client-dashboard';
            const { data } = await axiosClient.get<ClientDashboardResponse>(endpoint);
            const list = Array.isArray(data?.items) ? data.items : [];
            setTransactions(list);
            return list;
        } catch (err) {
            const message = axios.isAxiosError(err)
                ? err.response?.data?.message ?? err.message
                : 'Failed to load transactions';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [acctno]);

    return { transactions, loading, error, fetchRecentTransactions, setTransactions };
}
