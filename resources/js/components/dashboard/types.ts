// 📄 1. resources/js/components/dashboard/types.ts
export interface User {
  readonly name: string;
  readonly email: string;
  readonly avatar: string | null;
  readonly role: 'admin' | 'customer' | 'manager' | null;
}

export interface AuthContext {
  readonly user: User | null;
}

export interface PageProps {
  readonly auth: AuthContext | null;
}

export interface Transaction {
  readonly id: string;
  readonly lnnumber: string;
  readonly description: string;
  readonly date: string | null;
  readonly principal: number;
  readonly raw_balance: number;
}

export enum TransactionType {
  SAVINGS = 'SV',
  LOAN = 'LN'
}

export interface DashboardStats {
  readonly savingsTotal: number;
  readonly loanBalance: number;
  readonly loanPercentage: number;
  readonly transactionCount: number;
}
