import { useEffect, useState } from 'react';
import type { ProductLntype } from '@/types/product-lntype';

type LoanDefaults = {
    productName?: string | null;
    typecode?: string | null;
    termMonths?: number | null;
    amortization?: number | null;
    existingBalance?: number | null;
} | null;

interface CalculationResult {
    termMonths: number;
    amortization: number;
    existingBalance: number;
    serviceFee: number;
    lrf: number;
    documentStamp: number;
    mortPlusNotarial: number;
    totalDeductions: number;
    estimatedNetProceeds: number;
    monthlyPayment: number;
}

export const useLoanCalculation = (
    selectedProduct: ProductLntype | null,
    loanDefaults: LoanDefaults,
): CalculationResult & {
    setTermMonths: (value: number) => void;
    setAmortization: (value: number) => void;
    setExistingBalance: (value: number) => void;
} => {
    const [termMonths, setTermMonths] = useState<number>(0);
    const [amortization, setAmortization] = useState<number>(0);
    const [existingBalance, setExistingBalance] = useState<number>(0);

    // Initialize term months
    useEffect(() => {
        if (typeof loanDefaults?.termMonths === 'number' && Number.isFinite(loanDefaults.termMonths)) {
            setTermMonths(loanDefaults.termMonths);
        } else if (selectedProduct?.max_term_months) {
            setTermMonths(selectedProduct.max_term_months);
        }
    }, [selectedProduct?.max_term_months, loanDefaults?.termMonths]);

    // Initialize amortization (prioritize computed_result from formula evaluation)
    useEffect(() => {
        if (selectedProduct?.computed_result != null && Number.isFinite(selectedProduct.computed_result) && selectedProduct.computed_result > 0) {
            setAmortization(selectedProduct.computed_result);
        } else if (selectedProduct?.max_amortization && selectedProduct.max_amortization > 0) {
            setAmortization(selectedProduct.max_amortization);
        } else if (!loanDefaults && typeof selectedProduct?.max_amortization === 'number') {
            setAmortization(selectedProduct.max_amortization);
        }
    }, [selectedProduct?.computed_result, selectedProduct?.max_amortization, loanDefaults]);

    // Initialize existing balance from wlnmaster
    useEffect(() => {
        if (typeof loanDefaults?.existingBalance === 'number' && Number.isFinite(loanDefaults.existingBalance)) {
            setExistingBalance(loanDefaults.existingBalance);
        } else if (!loanDefaults) {
            setExistingBalance(0);
        }
    }, [loanDefaults?.existingBalance, loanDefaults]);

    // Calculate all derived values
    // Note: amortization is already net of existing balance (calculated in backend for renewals)
    // Existing balance is shown separately for informational purposes only
    const serviceFee = (Number(selectedProduct?.service_fee || 0) / 100) * amortization;
    const lrf = (Number(selectedProduct?.lrf || 0) / 100) * amortization;

    const docStampValue = Number(selectedProduct?.document_stamp || 0);
    const documentStamp = docStampValue > 100 ? docStampValue : (docStampValue / 100) * amortization;

    const mortPlusNotarial = Number(selectedProduct?.mort_plus_notarial || 0);

    const totalDeductions = serviceFee + lrf + documentStamp + mortPlusNotarial;
    const estimatedNetProceeds = Math.max(0, amortization - totalDeductions);

    // Calculate monthly payment
    const monthlyPayment = (() => {
        if (termMonths === 0 || amortization === 0) return 0;

        const interestRate = Number(selectedProduct?.interest_rate || 0);

        if (interestRate === 0) {
            return amortization / termMonths;
        }

        const monthlyRate = interestRate / 12 / 100;
        const power = Math.pow(1 + monthlyRate, termMonths);
        return (amortization * (monthlyRate * power)) / (power - 1);
    })();

    return {
        termMonths,
        setTermMonths,
        amortization,
        setAmortization,
        existingBalance,
        setExistingBalance,
        serviceFee,
        lrf,
        documentStamp,
        mortPlusNotarial,
        totalDeductions,
        estimatedNetProceeds,
        monthlyPayment,
    };
};
