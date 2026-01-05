// types/loan-application.ts

// Request payload for submitting a loan application
export interface LoanApplicationRequest {
    product_id: number;
    term_months: number;
    amortization: number;
    old_balance: number;
}

// Product info returned in loan application response
export interface LoanApplicationProduct {
    id: number;
    name: string;
    interest_rate: number;
    mode: string;
    schemes: string;
    types: unknown[]; // Could be typed more specifically based on your needs
}

// Loan details in the response
export interface LoanApplicationDetails {
    term_months: number;
    amortization: number;
    old_balance: number;
    due_amount: number;
    computed_result: number; // The dynamically calculated max amortization
}

// Fee breakdown in the response
export interface LoanApplicationFees {
    service_fee: number;
    lrf: number;
    document_stamp: number;
    mort_plus_notarial: number;
    total_deductions: number;
}

// Full loan application data in success response
export interface LoanApplicationData {
    acctno: string;
    product: LoanApplicationProduct;
    loan_details: LoanApplicationDetails;
    fees: LoanApplicationFees;
    estimated_net_proceeds: number;
}

// Success response from POST /api/loans/apply
export interface LoanApplicationResponse {
    success: true;
    message: string;
    data: LoanApplicationData;
}

// Error response (422 validation errors)
export interface LoanApplicationError {
    success: false;
    message: string;
}

// Union type for all possible responses
export type LoanApplicationResult = LoanApplicationResponse | LoanApplicationError;
