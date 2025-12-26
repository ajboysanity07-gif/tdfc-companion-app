export type VRecentTransactions = {
    acctno: string;
    ln_sv_number: string;
    date_in: string | null;
    transaction_type: string | null;
    amount: number | null;
    movement: number | null;
    balance: number | null;
    source: 'LOAN' | 'SAV' | string;
    principal: number | null;
    deposit: number | null;
    withdrawal: number | null;
    payments: number | null;
    debit: number | null;
};

export type ClientDashboardResponse = {
    items: VRecentTransactions[];
};
