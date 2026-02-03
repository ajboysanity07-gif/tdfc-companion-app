import FullScreenModalMobile from '@/components/ui/full-screen-modal-mobile';
import CurrencyInputField from './currency-input-field';
import CalculationResultBox from './calculation-result-box';
import type { LoanApplicationRequest } from '@/types/loan-application';
import type { ProductLntype } from '@/types/product-lntype';
import { LoanCalculatorSkeleton } from './skeletons';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLoanCalculation } from '@/hooks/use-loan-calculation';
import { useCalculatorStyles } from '@/hooks/use-calculator-styles';

type Props = {
    selectedProduct: ProductLntype | null;
    onSubmit?: (request: LoanApplicationRequest) => Promise<void>;
    submitting?: boolean;
    submitError?: string | null;
    loading?: boolean;
    forceModalTerms?: boolean;
    loanDefaults?: {
        productName?: string | null;
        typecode?: string | null;
        termMonths?: number | null;
        amortization?: number | null;
        oldBalance?: number | null;
    } | null;
};

export default function LoanCalculator({ selectedProduct, loanDefaults, loading = false, forceModalTerms = false }: Props) {
    const isMobile = useMediaQuery('(max-width:900px)');
    const styles = useCalculatorStyles();
    const {
        termMonths,
        setTermMonths,
        amortization,
        setAmortization,
        existingBalance,
        estimatedNetProceeds,
        monthlyPayment,
    } = useLoanCalculation(selectedProduct, loanDefaults);

    const [termsModalOpen, setTermsModalOpen] = useState<boolean>(false);
    const [showFloatingButton, setShowFloatingButton] = useState<boolean>(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const disclaimerRef = useRef<HTMLDivElement>(null);
    const [appContentElement, setAppContentElement] = useState<HTMLElement | null>(null);

    useEffect(() => {
        if (forceModalTerms) {
            const appContent = document.querySelector('[data-app-content="true"]') as HTMLElement;
            setAppContentElement(appContent);
        }
    }, [forceModalTerms]);

    // Handle scroll to hide/show floating button on mobile
    useEffect(() => {
        if (!isMobile || !disclaimerRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setShowFloatingButton(!entry.isIntersecting);
            },
            {
                threshold: 0.1,
                rootMargin: '-20px',
            },
        );

        observer.observe(disclaimerRef.current);

        return () => {
            observer.disconnect();
        };
    }, [isMobile]);

    if (loading && !selectedProduct) {
        return <LoanCalculatorSkeleton />;
    }

    return (
        <Box ref={containerRef}>
            <Stack spacing={isMobile ? 2.5 : 3}>
                {/* Product Display */}
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
                    <CurrencyInputField
                        value={amortization || undefined}
                        onValueChange={setAmortization}
                        maxAmount={selectedProduct?.computed_result || undefined}
                        disabled={selectedProduct?.is_max_amortization_editable === false}
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

                {/* Results Section */}
                <CalculationResultBox label="Amortization Amount" value={amortization} />
                {existingBalance > 0 && (
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
                            Existing Balance
                        </Typography>
                        <Box
                            sx={{
                                bgcolor: styles.cardBg,
                                borderRadius: 2,
                                p: 2.5,
                                textAlign: 'center',
                                border: `2px solid ${styles.cardBorder}`,
                                opacity: 0.7,
                            }}
                        >
                            <Typography
                                variant="h5"
                                fontWeight={700}
                                sx={{ fontVariantNumeric: 'tabular-nums', color: 'text.secondary' }}
                            >
                                ₱ {(existingBalance).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Typography>
                        </Box>
                    </Box>
                )}
                <CalculationResultBox label="*Estimated Monthly Payment" value={monthlyPayment} />
                <CalculationResultBox label="*Estimated Net Proceeds" value={estimatedNetProceeds} isAccent />

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

                {/* Terms and Conditions - Desktop View */}
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

            {/* Floating Info Button */}
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
                        bgcolor: styles.accentColor,
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

            {/* Terms Modal */}
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
