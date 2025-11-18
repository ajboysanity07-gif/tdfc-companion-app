// 📄 resources/js/components/dashboard/hooks/useStats.ts
import { useMemo } from 'react';
import type { Transaction, DashboardStats } from '../types';
import { TransactionType } from '../types';

export const useStats = (transactions: Transaction[]): DashboardStats => {
  return useMemo(() => {
    const initialStats: DashboardStats = {
      savingsTotal: 0,
      loanBalance: 0,
      loanPercentage: 0,
      transactionCount: transactions.length
    };

    if (transactions.length === 0) {
      return initialStats;
    }

    let savingsTotal = 0;
    let loanBalance = 0;
    let loanCount = 0;

    for (const transaction of transactions) {
      const code = transaction.lnnumber.toUpperCase();
      const principal = Number(transaction.principal) || 0;
      const rawBalance = Number(transaction.raw_balance) || 0;

      if (code.startsWith(TransactionType.SAVINGS)) {
        savingsTotal += principal;
      }
      
      if (code.startsWith(TransactionType.LOAN)) {
        loanBalance += rawBalance;
        loanCount++;
      }
    }

    const loanPercentage = transactions.length > 0 ? (loanCount / transactions.length) * 100 : 0;

    return {
      savingsTotal,
      loanBalance,
      loanPercentage,
      transactionCount: transactions.length
    };
  }, [transactions]);
};
