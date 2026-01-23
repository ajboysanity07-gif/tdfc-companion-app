import FullScreenModalMobile from '@/components/ui/full-screen-modal-mobile';
import { useMyTheme } from '@/hooks/use-mytheme';
import type { LoanApplicationRequest } from '@/types/loan-application';
import type { ProductLntype } from '@/types/product-lntype';
import { LoanCalculatorSkeleton } from './skeletons';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Stack, TextField, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import CurrencyInput from 'react-currency-input-field';
import { createPortal } from 'react-dom';

type Props = {
    selectedProduct: ProductLntype | null;
    onSubmit?: (request: LoanApplicationRequest) => Promise<void>;
    submitting?: boolean;
    submitError?: string | null;
    loading?: boolean;
    forceModalTerms?: boolean; // Force terms to show in modal (for right panel view)
    loanDefaults?: {
        productName?: string | null;
        typecode?: string | null;
        termMonths?: number | null;
        amortization?: number | null;
        oldBalance?: number | null;
    } | null;
};

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

export default function LoanCalculator({ selectedProduct, loanDefaults, loading = false, forceModalTerms = false }: Props) {
    const tw = useMyTheme();
    const isMobile = useMediaQuery('(max-width:900px)');
    const [termMonths, setTermMonths] = useState<number>(0);
    const [amortization, setAmortization] = useState<number>(0);
    const [oldBalance, setOldBalance] = useState<number>(0);
    const [termsModalOpen, setTermsModalOpen] = useState<boolean>(false);
    const [showFloatingButton, setShowFloatingButton] = useState<boolean>(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const disclaimerRef = useRef<HTMLDivElement>(null);
    const [appContentElement, setAppContentElement] = useState<HTMLElement | null>(null);

    // Find the app-content element for modal portal
    useEffect(() => {
        if (forceModalTerms) {
            const appContent = document.querySelector('[data-app-content="true"]') as HTMLElement;
            setAppContentElement(appContent);
        }
    }, [forceModalTerms]);

    // Update termMonths and amortization when selectedProduct or loanDefaults changes
    useEffect(() => {
        console.log('=== Calculator useEffect ===');
        console.log('selectedProduct:', selectedProduct);
        console.log('loanDefaults:', loanDefaults);
        
        // Use loanDefaults values if provided (from wlnmaster), otherwise use product defaults
        if (typeof loanDefaults?.termMonths === 'number' && Number.isFinite(loanDefaults.termMonths)) {
            console.log('✓ Setting term from wlnmaster.term_mons:', loanDefaults.termMonths);
            setTermMonths(loanDefaults.termMonths);
        } else if (selectedProduct?.max_term_months) {
            console.log('✓ Setting term from product.max_term_months:', selectedProduct.max_term_months);
            setTermMonths(selectedProduct.max_term_months);
        }

        // CRITICAL: Always prioritize computed_result (from max_amortization_formula evaluation)
        // This is the amortization calculated using the loan's balance and term from wlnmaster
        // computed_result should NEVER be overridden by the raw amortization from wlnmaster
        if (selectedProduct?.computed_result != null && Number.isFinite(selectedProduct.computed_result) && selectedProduct.computed_result > 0) {
            console.log('✓✓✓ Using computed_result from formula evaluation:', selectedProduct.computed_result);
            setAmortization(selectedProduct.computed_result);
            console.log('  (Ignoring wlnmaster.amortization:', loanDefaults?.amortization, ')');
        } else if (selectedProduct?.max_amortization && selectedProduct.max_amortization > 0) {
            console.log('✓ Using product.max_amortization:', selectedProduct.max_amortization);
            setAmortization(selectedProduct.max_amortization);
        } else if (!loanDefaults && typeof selectedProduct?.max_amortization === 'number') {
            // Only use product amortization if no loan defaults
            console.log('✓ Using product.max_amortization (no loan):', selectedProduct.max_amortization);
            setAmortization(selectedProduct.max_amortization);
        } else if (selectedProduct) {
            console.log('⚠ No valid amortization found, computed_result:', selectedProduct.computed_result, 'max_amortization:', selectedProduct.max_amortization);
        }
        // DO NOT fallback to loanDefaults.amortization when coming from loans page
        // The raw amortization from wlnmaster should NEVER be used directly
    }, [selectedProduct, loanDefaults]);

    // Update oldBalance when loanDefaults changes
    useEffect(() => {
        console.log('=== Old Balance Update ===');
        console.log('loanDefaults:', loanDefaults);
        console.log('loanDefaults.oldBalance:', loanDefaults?.oldBalance, 'Type:', typeof loanDefaults?.oldBalance);
        
        if (typeof loanDefaults?.oldBalance === 'number' && Number.isFinite(loanDefaults.oldBalance)) {
            console.log('✓ Setting oldBalance to:', loanDefaults.oldBalance);
            setOldBalance(loanDefaults.oldBalance);
        } else if (!loanDefaults) {
            console.log('✓ No loanDefaults, setting oldBalance to 0');
            setOldBalance(0);
        } else {
            console.log('⚠ oldBalance is invalid, keeping current value');
        }
    }, [loanDefaults?.oldBalance, loanDefaults]);

    // Handle scroll to hide/show floating button on mobile
    useEffect(() => {
        if (!isMobile || !disclaimerRef.current) return;

        // Use IntersectionObserver to detect when disclaimer is visible
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Hide button when disclaimer is visible, show when not visible
                setShowFloatingButton(!entry.isIntersecting);
            },
            {
                threshold: 0.1, // Trigger when 10% of disclaimer is visible
                rootMargin: '-20px', // Add some buffer
            },
        );

        observer.observe(disclaimerRef.current);

        return () => {
            observer.disconnect();
        };
    }, [isMobile]);

    const cardBg = tw.isDark ? '#2f2f2f' : '#ffffff';
    const cardBorder = tw.isDark ? '#3a3a3a' : '#d4d4d4';
    const accentColor = '#F57979';

    // Calculate due amount and net proceeds
    const dueAmount = amortization + oldBalance;

    // Calculate fees
    // Service fee and LRF are percentages
    const serviceFee = (Number(selectedProduct?.service_fee || 0) / 100) * amortization;
    const lrf = (Number(selectedProduct?.lrf || 0) / 100) * amortization;

    // Document stamp: if > 100, treat as absolute value, otherwise as percentage
    const docStampValue = Number(selectedProduct?.document_stamp || 0);
    const documentStamp = docStampValue > 100 ? docStampValue : (docStampValue / 100) * amortization;

    const mortPlusNotarial = Number(selectedProduct?.mort_plus_notarial || 0); // Fixed amount

    const totalDeductions = serviceFee + lrf + documentStamp + mortPlusNotarial + oldBalance;
    const estimatedNetProceeds = Math.max(0, amortization - totalDeductions);

    // Calculate monthly payment
    const calculateMonthlyPayment = (): number => {
        if (termMonths === 0 || amortization === 0) return 0;

        const interestRate = Number(selectedProduct?.interest_rate || 0);

        if (interestRate === 0) {
            // No interest - simple division
            return amortization / termMonths;
        }

        // Monthly interest rate (annual rate / 12 / 100)
        const monthlyRate = interestRate / 12 / 100;

        // Amortization formula: P * [r * (1 + r)^n] / [(1 + r)^n - 1]
        const power = Math.pow(1 + monthlyRate, termMonths);
        const monthlyPayment = (amortization * (monthlyRate * power)) / (power - 1);

        return monthlyPayment;
    };

    const monthlyPayment = calculateMonthlyPayment();

    if (loading && !selectedProduct) {
        return <LoanCalculatorSkeleton />;
    }

    return (
        <Box ref={containerRef}>
            <Stack spacing={isMobile ? 2.5 : 3}>
                {/* Product Display (Read-only) */}
                <Box>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{ mb: 1.5, display: 'block', textTransform: 'uppercase', letterSpacing: 1.2, fontSize: '0.7rem', textAlign: 'center' }}
                    >
                        Product
                    </Typography>
                    <TextField
                        fullWidth
                        variant="outlined"
                        value={(loanDefaults?.productName || selectedProduct?.product_name || '').trim()}
                        placeholder="Select a product from the list"
                        InputProps={{
                            readOnly: true,
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                fontSize: isMobile ? '1rem' : '1.25rem',
                                fontWeight: 700,
                                borderRadius: 3,
                            },
                            '& .MuiOutlinedInput-input': {
                                textAlign: 'center !important',
                                cursor: 'default',
                                padding: isMobile ? '12px 14px' : '16.5px 14px',
                            },
                        }}
                    />
                </Box>

                {/* Term in Months */}
                <Box>
                    <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center" sx={{ mb: 1.5 }}>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={600}
                            sx={{ textTransform: 'uppercase', letterSpacing: 1.2, fontSize: '0.7rem' }}
                        >
                            Term in Months
                        </Typography>
                        {selectedProduct?.is_max_term_editable === false && (
                            <Tooltip title="• This field is disabled by admin" arrow placement="top" enterTouchDelay={0} leaveTouchDelay={3000}>
                                <InfoOutlinedIcon
                                    sx={{ fontSize: 14, color: 'text.secondary', cursor: 'help', opacity: 0.7, '&:hover': { opacity: 1 } }}
                                />
                            </Tooltip>
                        )}
                    </Stack>
                    <TextField
                        fullWidth
                        variant="outlined"
                        type="number"
                        value={termMonths || ''}
                        onChange={(e) => setTermMonths(Number(e.target.value))}
                        placeholder="0"
                        disabled={selectedProduct?.is_max_term_editable === false}
                        inputProps={{ min: 0, max: selectedProduct?.max_term_months || undefined }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                fontSize: isMobile ? '1.25rem' : '1.5rem',
                                fontWeight: 700,
                                borderRadius: 3,
                            },
                            '& .MuiOutlinedInput-input': {
                                textAlign: 'center',
                                cursor: selectedProduct?.is_max_term_editable === false ? 'default' : 'text',
                                padding: isMobile ? '12px 14px' : '16.5px 14px',
                            },
                        }}
                    />
                </Box>

                {/* Amortization */}
                <Box>
                    <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center" sx={{ mb: 1.5 }}>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={600}
                            sx={{ textTransform: 'uppercase', letterSpacing: 1.2, fontSize: '0.7rem' }}
                        >
                            Amortization
                        </Typography>
                        {(selectedProduct?.max_amortization_formula || selectedProduct?.is_max_amortization_editable === false) && (
                            <Tooltip
                                title={
                                    <Box component="div" sx={{ whiteSpace: 'pre-line' }}>
                                        {selectedProduct?.max_amortization_formula && `• Formula: ${selectedProduct.max_amortization_formula}`}
                                        {selectedProduct?.max_amortization_formula && selectedProduct?.is_max_amortization_editable === false && '\n'}
                                        {selectedProduct?.is_max_amortization_editable === false && '• This field is disabled by admin'}
                                    </Box>
                                }
                                arrow
                                placement="top"
                                enterTouchDelay={0}
                                leaveTouchDelay={3000}
                            >
                                <InfoOutlinedIcon
                                    sx={{ fontSize: 14, color: 'text.secondary', cursor: 'help', opacity: 0.7, '&:hover': { opacity: 1 } }}
                                />
                            </Tooltip>
                        )}
                    </Stack>
                    <CurrencyInput
                        value={amortization || undefined}
                        onValueChange={(value) => {
                            const numValue = value ? parseFloat(value) : 0;
                            const maxAmount = selectedProduct?.computed_result || Infinity;
                            // Only update if within max or if clearing field
                            if (numValue <= maxAmount) {
                                setAmortization(numValue);
                            }
                        }}
                        placeholder="0.00"
                        disabled={selectedProduct?.is_max_amortization_editable === false}
                        prefix="₱ "
                        decimalsLimit={2}
                        decimalScale={2}
                        allowNegativeValue={false}
                        style={{
                            width: '100%',
                            fontSize: isMobile ? '1.25rem' : '1.5rem',
                            fontWeight: 700,
                            textAlign: 'center',
                            padding: isMobile ? '12px 14px' : '16.5px 14px',
                            borderRadius: '12px',
                            border: tw.isDark ? '1px solid rgba(255, 255, 255, 0.23)' : '1px solid rgba(0, 0, 0, 0.23)',
                            backgroundColor: 'transparent',
                            color: tw.isDark ? '#fff' : '#000',
                            cursor: selectedProduct?.is_max_amortization_editable === false ? 'default' : 'text',
                        }}
                    />
                    {selectedProduct &&
                        !loanDefaults &&
                        ['BASIC', 'CUSTOM'].includes(selectedProduct.max_amortization_mode) &&
                        selectedProduct.computed_result === 0 && (
                            <Typography variant="caption" color="error" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
                                Unable to calculate max amortization. Please ensure your salary record is configured.
                            </Typography>
                        )}
                </Box>

                {/* Old Balance */}
                <Box>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{ mb: 1.5, display: 'block', textTransform: 'uppercase', letterSpacing: 1.2, fontSize: '0.7rem', textAlign: 'center' }}
                    >
                        Old Balance
                    </Typography>
                    <CurrencyInput
                        value={oldBalance || undefined}
                        onValueChange={(value) => setOldBalance(value ? parseFloat(value) : 0)}
                        placeholder="0.00"
                        prefix="₱ "
                        decimalsLimit={2}
                        decimalScale={2}
                        allowNegativeValue={false}
                        style={{
                            width: '100%',
                            fontSize: isMobile ? '1.25rem' : '1.5rem',
                            fontWeight: 700,
                            textAlign: 'center',
                            padding: isMobile ? '12px 14px' : '16.5px 14px',
                            borderRadius: '12px',
                            border: tw.isDark ? '1px solid rgba(255, 255, 255, 0.23)' : '1px solid rgba(0, 0, 0, 0.23)',
                            backgroundColor: 'transparent',
                            color: tw.isDark ? '#fff' : '#000',
                        }}
                    />
                </Box>

                {/* Due Amount (Read-only) */}
                <Box>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{ mb: 1.5, display: 'block', textTransform: 'uppercase', letterSpacing: 1.2, fontSize: '0.7rem', textAlign: 'center' }}
                    >
                        Due Amount
                    </Typography>
                    <Box
                        sx={{
                            bgcolor: cardBg,
                            borderRadius: 2,
                            p: 2.5,
                            textAlign: 'center',
                            border: `2px solid ${cardBorder}`,
                        }}
                    >
                        <Typography variant="h5" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                            ₱ {formatCurrency(dueAmount).replace('PHP', '').replace('₱', '').trim()}
                        </Typography>
                    </Box>
                </Box>

                {/* Monthly Payment */}
                <Box>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{ mb: 1.5, display: 'block', textTransform: 'uppercase', letterSpacing: 1.2, fontSize: '0.7rem', textAlign: 'center' }}
                    >
                        *Estimated Monthly Payment
                    </Typography>
                    <Box
                        sx={{
                            bgcolor: cardBg,
                            borderRadius: 2,
                            p: 2.5,
                            textAlign: 'center',
                            border: `2px solid ${cardBorder}`,
                        }}
                    >
                        <Typography variant="h5" fontWeight={700}>
                            ₱ {formatCurrency(monthlyPayment).replace('PHP', '').replace('₱', '').trim()}
                        </Typography>
                    </Box>
                </Box>

                {/* Estimated Net Proceeds */}
                <Box sx={{ mt: 2 }}>
                    <Typography
                        variant="caption"
                        fontWeight={900}
                        sx={{
                            mb: 1.5,
                            display: 'block',
                            textTransform: 'uppercase',
                            letterSpacing: 1.2,
                            color: accentColor,
                            fontSize: '0.7rem',
                            textAlign: 'center',
                        }}
                    >
                        *Estimated Net Proceeds
                    </Typography>
                    <Box
                        sx={{
                            background: tw.isDark
                                ? 'linear-gradient(135deg, #2a4a4a 0%, #1e3a3a 100%)'
                                : 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
                            borderRadius: 2,
                            p: 3,
                            textAlign: 'center',
                            border: `2px solid ${accentColor}`,
                        }}
                    >
                        <Typography variant="h4" sx={{ color: accentColor, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                            <Box component="span" sx={{ fontWeight: 700 }}>
                                ₱ {formatCurrency(estimatedNetProceeds).replace('PHP', '').replace('₱', '').trim()}*
                            </Box>
                        </Typography>
                    </Box>
                </Box>

                {/* Disclaimer */}
                <Typography
                    ref={disclaimerRef}
                    variant="caption"
                    sx={{
                        display: 'block',
                        fontSize: '0.7rem',
                        color: 'text.secondary',
                        lineHeight: 1.8,
                        fontStyle: 'italic',
                        textAlign: 'center',
                        fontWeight: 600,
                    }}
                >
                    * Subject to further delinquent balances deduction.
                    <br />
                    Estimated values may vary based on actual processing.
                </Typography>
                {/* Terms and Conditions - Desktop View (only when not in modal mode) */}
                {!isMobile && !forceModalTerms && selectedProduct?.terms && (
                    <Box>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={600}
                            sx={{
                                mb: 1.5,
                                display: 'block',
                                textTransform: 'uppercase',
                                letterSpacing: 1.2,
                                fontSize: '0.7rem',
                                textAlign: 'center',
                            }}
                        >
                            Terms and Conditions
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={8}
                            value={selectedProduct.terms}
                            InputProps={{
                                readOnly: true,
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    fontSize: '0.875rem',
                                    lineHeight: 1.6,
                                    borderRadius: 3,
                                },
                            }}
                        />
                    </Box>
                )}
            </Stack>

            {/* Floating Info Action Button - Mobile or Modal Mode */}
            {(isMobile || forceModalTerms) && selectedProduct?.terms && (
                <IconButton
                    size="large"
                    onClick={() => setTermsModalOpen(true)}
                    sx={{
                        position: 'fixed',
                        bottom: 20,
                        right: 24,
                        width: 60,
                        height: 60,
                        color: '#fff',
                        bgcolor: accentColor,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        zIndex: 1000,
                        opacity: showFloatingButton ? 1 : 0,
                        transform: showFloatingButton ? 'scale(1)' : 'scale(0.8)',
                        pointerEvents: showFloatingButton ? 'auto' : 'none',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                            bgcolor: '#e66767',
                        },
                    }}
                    aria-label="More information"
                >
                    <InfoOutlinedIcon sx={{ fontSize: 28 }} />
                </IconButton>
            )}

            {/* Terms and Conditions Modal - Mobile uses fullscreen, Desktop uses Dialog */}
            {isMobile ? (
                <FullScreenModalMobile
                    open={termsModalOpen}
                    onClose={() => setTermsModalOpen(false)}
                    title={selectedProduct?.product_name ? `${selectedProduct.product_name} Terms` : 'Terms and Conditions'}
                    headerBg="#F57979"
                    bodySx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
                    titleSx={{ fontSize: { xs: 18, sm: 22 } }}
                    zIndex={1400}
                >
                    <TextField
                        fullWidth
                        multiline
                        rows={20}
                        value={selectedProduct?.terms || 'No terms and conditions available.'}
                        InputProps={{
                            readOnly: true,
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                fontSize: '1.1rem',
                                lineHeight: 1.7,
                            },
                        }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 1, mt: 2 }}>
                        <IconButton
                            onClick={() => setTermsModalOpen(false)}
                            size="large"
                            sx={{
                                bgcolor: '#f57373',
                                color: '#fff',
                                width: 56,
                                height: 56,
                                '&:hover': {
                                    bgcolor: '#e66767',
                                },
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="caption" fontWeight={600} sx={{ color: '#f57373' }}>
                            Close
                        </Typography>
                    </Box>
                </FullScreenModalMobile>
            ) : forceModalTerms && appContentElement ? createPortal(
                <Dialog
                    open={termsModalOpen}
                    onClose={() => setTermsModalOpen(false)}
                    maxWidth="md"
                    fullWidth
                    container={appContentElement}
                    disablePortal
                    BackdropProps={{
                        sx: {
                            position: 'absolute',
                        }
                    }}
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            maxHeight: '80vh',
                            position: 'absolute',
                        }
                    }}
                    sx={{
                        position: 'absolute',
                        zIndex: 1300,
                    }}
                >
                    <DialogTitle sx={{ 
                        bgcolor: '#F57979', 
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 2,
                    }}>
                        <Typography variant="h6" component="span">
                            {selectedProduct?.product_name ? `${selectedProduct.product_name} Terms` : 'Terms and Conditions'}
                        </Typography>
                        <IconButton
                            onClick={() => setTermsModalOpen(false)}
                            sx={{ color: 'white' }}
                            size="small"
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ p: 3, mt: 2 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={15}
                            value={selectedProduct?.terms || 'No terms and conditions available.'}
                            InputProps={{
                                readOnly: true,
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    fontSize: '0.95rem',
                                    lineHeight: 1.6,
                                },
                            }}
                        />
                    </DialogContent>
                </Dialog>,
                appContentElement
            ) : null}
        </Box>
    );
}
