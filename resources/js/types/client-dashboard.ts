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

export type WSavledRecord = {
    controlno: string;
    svstatus: string;
    acctno: string;
    svnumber: string;
    typecode: string;
    svtype: string;
    date_in: string | null;
    mreference: string;
    cs_ck: string;
    deposit: number;
    withdrawal: number;
    balance: number;
};

export type ClientDashboardResponse = {
    items: VRecentTransactions[];
    loanClass?: string | null;
    savings?: WSavledRecord[];
};
