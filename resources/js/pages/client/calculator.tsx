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
import { Box, useMediaQuery, Snackbar, Alert } from '@mui/material';
import FullScreenModalMobile from '@/components/ui/full-screen-modal-mobile';
import { useEffect, useState } from 'react';
import type { ProductLntype } from '@/types/product-lntype';

export default function LoanTransactions() {
    const isMobile = useMediaQuery('(max-width:900px)');
    const { products, loading, error, fetchProducts, submitLoanApplication, submitting, submitError } = useLoanApply();
    const [selectedProduct, setSelectedProduct] = useState<ProductLntype | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [calculatorModalOpen, setCalculatorModalOpen] = useState<boolean>(false);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

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
            // Optionally: You can also show the computed_result or other data from result.data
            console.log('Loan application response:', result);
        } catch (err) {
            // Error is already handled by the hook and shown in the calculator
            console.error('Submission failed:', err);
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
                selectedProduct={selectedProduct}
                onSubmit={handleSubmit}
                submitting={submitting}
                submitError={submitError}
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
