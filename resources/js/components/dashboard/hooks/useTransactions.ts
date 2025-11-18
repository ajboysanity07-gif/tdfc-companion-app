// 📄 3. resources/js/components/dashboard/hooks/useTransactions.ts
import { useCallback, useEffect, useState } from 'react';
import type { Transaction } from '../types';

interface ApiResponse<T> {
  readonly success: boolean;
  readonly items: T[];
  readonly message?: string;
}

export const useTransactions = () => {
  const [state, setState] = useState<{
    transactions: Transaction[];
    loading: boolean;
    error: string | null;
  }>({
    transactions: [],
    loading: true,
    error: null
  });

  const fetchTransactions = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch('/api/transactions/recent', {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: ApiResponse<Transaction> = await response.json();
      
      setState({
        transactions: data.items || [],
        loading: false,
        error: null
      });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';
      
      setState({
        transactions: [],
        loading: false,
        error: errorMessage
      });
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions: state.transactions,
    loading: state.loading,
    error: state.error,
    refetch: fetchTransactions
  };
};