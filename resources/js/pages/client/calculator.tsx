import MobileViewLayout from '@/components/mobile-view-layout';
import DesktopViewLayout from '@/components/desktop-view-layout';
import HeaderBlock from '@/components/management/header-block';
import BoxHeader from '@/components/box-header';
import ProductList from '@/components/client/calculator/product-list';
import LoanCalculator from '@/components/client/calculator/loan-calculator';
import { useLoanApply } from '@/hooks/use-loan-apply';
import type { LoanApplicationRequest } from '@/types/loan-application';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Box, LinearProgress, Slide, useMediaQuery, Snackbar, Alert } from '@mui/material';
import { CircleCheckBig, CircleX } from 'lucide-react';
import FullScreenModalMobile from '@/components/ui/full-screen-modal-mobile';
import { useEffect, useState } from 'react';
import type { ProductLntype } from '@/types/product-lntype';
import axiosClient from '@/api/axios-client';
import type { WlnMasterRecord } from '@/types/user';
import { evaluate } from 'mathjs';

interface LoanDefaults {
    productName: string;
    typecode: string | null | undefined;
    termMonths: number | null;
    oldBalance: number | null;
}

export default function LoanTransactions() {
    const isMobile = useMediaQuery('(max-width:900px)');
    const { products, loading, error, fetchProducts, submitLoanApplication, submitting, submitError } = useLoanApply();
    const [selectedProduct, setSelectedProduct] = useState<ProductLntype | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [calculatorModalOpen, setCalculatorModalOpen] = useState<boolean>(false);
    const [userLoans, setUserLoans] = useState<WlnMasterRecord[]>([]);
    const [loanDefaults, setLoanDefaults] = useState<LoanDefaults | null>(null);
    const [productWithComputed, setProductWithComputed] = useState<ProductLntype | null>(null);

    const toNumber = (value: unknown) => {
        if (value === null || value === undefined || value === '') {
            return null;
        }
        if (typeof value === 'string') {
            const cleaned = value.trim().replace(/,/g, '');
            if (cleaned === '') return null;
            const num = Number(cleaned);
            return Number.isFinite(num) ? num : null;
        }
        const num = Number(value);
        return Number.isFinite(num) ? num : null;
    };

    useEffect(() => {
        const controller = new AbortController();
        
        // Fetch products WITHOUT include_hidden so filtering applies
        fetchProducts(false);
        
        // Fetch user's active loans
        axiosClient.get('/loans', { signal: controller.signal })
            .then(response => {
                const loans = response.data.wlnMasterRecords || [];
                setUserLoans(loans);
            })
            .catch((err: unknown) => {
                if (err instanceof Error && err.name !== 'CanceledError') {
                    if (import.meta.env.DEV) {
                        console.error('Failed to fetch user loans:', err);
                    }
                }
            });

        return () => controller.abort();
    }, [fetchProducts]);

    // Update loanDefaults when product is selected
    useEffect(() => {
        if (!selectedProduct) {
            setLoanDefaults(null);
            setProductWithComputed(null);
            return;
        }

        // Find matching loan by typecode
        const matchingLoan = userLoans.find(loan => 
            selectedProduct.tags?.some(tag => tag.typecode === loan.typecode) ||
            selectedProduct.types?.some(type => type.typecode === loan.typecode)
        );

        if (matchingLoan) {
            if (import.meta.env.DEV) {
                console.log('[Calculator] Found matching loan for product:', matchingLoan);
            }
            
            let computedAmortization = selectedProduct.computed_result;
            
            // Recalculate formula if available
            if (selectedProduct.max_amortization_formula && matchingLoan.balance) {
                try {
                    const balance = toNumber(matchingLoan.balance) ?? 0;
                    const termMonths = toNumber(matchingLoan.term_mons) ?? selectedProduct.max_term_months ?? 0;
                    const interestRate = selectedProduct.interest_rate ?? 0;
                    
                    const formula = selectedProduct.max_amortization_formula
                        .replace(/balance/gi, balance.toString())
                        .replace(/term_mons/gi, termMonths.toString())
                        .replace(/term/gi, termMonths.toString())
                        .replace(/interest_rate/gi, interestRate.toString())
                        .replace(/interest/gi, interestRate.toString());
                    
                    // Use mathjs for safe mathematical expression evaluation
                    const computed = evaluate(formula);
                    
                    if (typeof computed === 'number' && Number.isFinite(computed) && computed > 0) {
                        computedAmortization = computed;
                    } else if (selectedProduct.max_amortization && selectedProduct.max_amortization > 0) {
                        computedAmortization = selectedProduct.max_amortization;
                    } else {
                        computedAmortization = balance;
                    }
                    
                    if (import.meta.env.DEV) {
                        console.log('[Calculator] Computed amortization:', computedAmortization);
                    }
                } catch (error) {
                    if (import.meta.env.DEV) {
                        console.error('[Calculator] Formula evaluation error:', error);
                    }
                    computedAmortization = selectedProduct.max_amortization || toNumber(matchingLoan.balance) || 0;
                }
            }
            
            // Set product with computed result
            setProductWithComputed({
                ...selectedProduct,
                computed_result: computedAmortization,
            });
            
            setLoanDefaults({
                productName: matchingLoan.remarks?.trim() || selectedProduct.product_name,
                typecode: matchingLoan.typecode,
                termMonths: toNumber(matchingLoan.term_mons),
                oldBalance: toNumber(matchingLoan.balance),
            });
        } else {
            // No matching loan, use product as-is
            setProductWithComputed(selectedProduct);
            setLoanDefaults(null);
        }
    }, [selectedProduct, userLoans]);

    useEffect(() => {
        // Open modal when product is selected on mobile
        if (isMobile && selectedProduct) {
            setCalculatorModalOpen(true);
        }
    }, [selectedProduct, isMobile]);

    useEffect(() => {
        // Add/remove body class for FAB visibility control
        if (calculatorModalOpen) {
            document.body.classList.add('calculator-modal-open');
        } else {
            document.body.classList.remove('calculator-modal-open');
        }
        return () => {
            document.body.classList.remove('calculator-modal-open');
        };
    }, [calculatorModalOpen]);

    const handleSubmit = async (request: LoanApplicationRequest) => {
        try {
            const result = await submitLoanApplication(request);
            setSuccessMessage(result.message || 'Loan application submitted successfully!');
            if (import.meta.env.DEV) {
                console.log('[Calculator] Loan application response:', result);
            }
        } catch (err: unknown) {
            if (import.meta.env.DEV && err instanceof Error) {
                console.error('[Calculator] Submission failed:', err.message);
            }
        }
    };

    const handleCloseSuccess = () => {
        setSuccessMessage(null);
    };

    const handleCloseCalculatorModal = () => {
        setCalculatorModalOpen(false);
        // Clear selected product to allow reselection
        setSelectedProduct(null);
    };

    const header = <HeaderBlock title="Available Loan Products" subtitle="Choose a loan product to apply" />;

    const leftSection = (
        <Box>
            <BoxHeader title="Available Transactions" />
            <ProductList
                products={products}
                loading={loading}
                error={error}
                selectedProduct={selectedProduct}
                onSelectProduct={setSelectedProduct}
            />
        </Box>
    );

    const productDetails = (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <BoxHeader title="Loan Calculator" />
            <LoanCalculator
                selectedProduct={productWithComputed || selectedProduct}
                onSubmit={handleSubmit}
                submitting={submitting}
                submitError={submitError}
                loading={loading}
                loanDefaults={loanDefaults}
            />
        </Box>
    );

    if (isMobile) {
        return (
            <AppLayout>
                <Head title="Available Transactions" />
                {!calculatorModalOpen && header}
                <MobileViewLayout>
                    {leftSection}
                </MobileViewLayout>
                
                {/* Calculator Modal for Mobile */}
                <FullScreenModalMobile
                    open={calculatorModalOpen}
                    onClose={handleCloseCalculatorModal}
                    title="Loan Calculator"
                    headerBg="#F57979"
                    bodySx={{ p: 3 }}
                    zIndex={1300}
                    titleSx={{ fontSize: { xs: 20, sm: 24 } }}
                >
                    <LoanCalculator
                        selectedProduct={selectedProduct}
                        onSubmit={handleSubmit}
                        submitting={submitting}
                        submitError={submitError}
                        loading={loading}
                    />
                </FullScreenModalMobile>

                <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={handleCloseSuccess}>
                    <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
                        {successMessage}
                    </Alert>
                </Snackbar>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Available Transactions" />
            {loading ? <LinearProgress color="primary" sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 60 }} /> : null}
            <div className="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
                <Slide in={!!successMessage} direction="down" mountOnEnter unmountOnExit>
                    <div className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30">
                        <CircleCheckBig className="h-4 w-4" />
                        <span>{successMessage}</span>
                    </div>
                </Slide>
                <Slide in={!!loading} direction="down" mountOnEnter unmountOnExit>
                    <div className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-900/30">
                        Loading...
                    </div>
                </Slide>
                <Slide in={!!error && !loading} direction="down" mountOnEnter unmountOnExit>
                    <div className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-900/30">
                        <CircleX className="h-4 w-4" />
                        <span>{error || 'An error occurred'}</span>
                    </div>
                </Slide>
            </div>
            {header}
            <DesktopViewLayout
                left={leftSection}
                right={productDetails}
                leftSx={{ p: 3, minHeight: 600 }}
                rightSx={{ p: 3, minHeight: 600 }}
            />
            <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={handleCloseSuccess}>
                <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
                    {successMessage}
                </Alert>
            </Snackbar>
        </AppLayout>
    );
}
