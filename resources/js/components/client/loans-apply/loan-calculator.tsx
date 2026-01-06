import { useMyTheme } from '@/hooks/use-mytheme';
import type { ProductLntype } from '@/types/product-lntype';
import type { LoanApplicationRequest } from '@/types/loan-application';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Stack, TextField, Typography, IconButton, useMediaQuery, Modal, Slide } from '@mui/material';
import { useState, useEffect } from 'react';
import CurrencyInput from 'react-currency-input-field';
import FullScreenModalMobile from '@/components/ui/full-screen-modal-mobile';

type Props = {
    selectedProduct: ProductLntype | null;
    onSubmit?: (request: LoanApplicationRequest) => Promise<void>;
    submitting?: boolean;
    submitError?: string | null;
};

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

export default function LoanCalculator({ selectedProduct }: Props) {
    const tw = useMyTheme();
    const isMobile = useMediaQuery('(max-width:900px)');
    const [termMonths, setTermMonths] = useState<number>(0);
    const [amortization, setAmortization] = useState<number>(0);
    const [oldBalance, setOldBalance] = useState<number>(0);
    const [termsModalOpen, setTermsModalOpen] = useState<boolean>(false);

    // Update termMonths and amortization when selectedProduct changes
    useEffect(() => {
        if (selectedProduct?.max_term_months) {
            setTermMonths(selectedProduct.max_term_months);
        }
        if (selectedProduct?.computed_result) {
            setAmortization(selectedProduct.computed_result);
        }
    }, [selectedProduct]);

    const cardBg = tw.isDark ? '#2f2f2f' : '#f7f7f7';
    const cardBorder = tw.isDark ? '#3a3a3a' : '#e5e5e5';
    const accentColor = '#F57979';

    // Calculate due amount and net proceeds
    const dueAmount = amortization + oldBalance;
    
    // Calculate fees
    // Service fee and LRF are percentages
    const serviceFee = (Number(selectedProduct?.service_fee || 0) / 100) * amortization;
    const lrf = (Number(selectedProduct?.lrf || 0) / 100) * amortization;
    
    // Document stamp: if > 100, treat as absolute value, otherwise as percentage
    const docStampValue = Number(selectedProduct?.document_stamp || 0);
    const documentStamp = docStampValue > 100 
        ? docStampValue 
        : (docStampValue / 100) * amortization;
    
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
        const monthlyPayment = amortization * (monthlyRate * power) / (power - 1);
        
        return monthlyPayment;
    };

    const monthlyPayment = calculateMonthlyPayment();

    return (
        <Box>
            <Stack spacing={isMobile ? 2 : 3}>
            {/* Product Display (Read-only) */}
            <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }}>
                    Product
                </Typography>
                <TextField
                    fullWidth
                    variant="outlined"
                    value={selectedProduct?.product_name || ''}
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
                            textAlign: 'center',
                            cursor: 'default',
                            padding: isMobile ? '12px 14px' : '16.5px 14px',
                        },
                    }}
                />
            </Box>

            {/* Term in Months */}
            <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }}>
                    Term in Months
                </Typography>
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
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }}>
                    Amortization
                </Typography>
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
                {selectedProduct && ['BASIC', 'CUSTOM'].includes(selectedProduct.max_amortization_mode) && selectedProduct.computed_result === 0 && (
                    <Typography variant="caption" color="error" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
                        Unable to calculate max amortization. Please ensure your salary record is configured.
                    </Typography>
                )}
            </Box>

            {/* Old Balance */}
            <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }}>
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
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }}>
                    Due Amount
                </Typography>
                <Box
                    sx={{
                        bgcolor: cardBg,
                        borderRadius: 3,
                        p: 2,
                        textAlign: 'center',
                        border: `1px solid ${cardBorder}`,
                    }}
                >
                    <Typography variant="h5" fontWeight={700}>
                        {formatCurrency(dueAmount).replace('PHP', '₱')}
                    </Typography>
                </Box>
            </Box>

            {/* Monthly Payment */}
            <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }}>
                    *Estimated Monthly Payment
                </Typography>
                <Box
                    sx={{
                        bgcolor: cardBg,
                        borderRadius: 3,
                        p: 2,
                        textAlign: 'center',
                        border: `1px solid ${cardBorder}`,
                    }}
                >
                    <Typography variant="h5" fontWeight={700}>
                        {formatCurrency(monthlyPayment).replace('PHP', '₱')}
                    </Typography>
                </Box>
            </Box>

            {/* Estimated Net Proceeds */}
            <Box>
                <Typography variant="caption" fontWeight={600} sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 1, color: accentColor, textAlign: 'center' }}>
                    *Estimated Net Proceeds
                </Typography>
                <Box
                    sx={{
                        bgcolor: tw.isDark ? '#2a4a4a' : '#e0f7fa',
                        borderRadius: 3,
                        p: 2.5,
                        textAlign: 'center',
                        border: `2px solid ${accentColor}`,
                    }}
                >
                    <Typography variant="h4" fontWeight={700} sx={{ color: accentColor }}>
                        {formatCurrency(estimatedNetProceeds).replace('PHP', '₱')}*
                    </Typography>
                </Box>
            </Box>

            {/* Disclaimer */}
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ justifyContent: 'center', mb: 8 }}>
                <Typography variant="body2" fontWeight={600} color="info.main">
                    *Subject to further delinquent balances deduction.
                </Typography>
            </Stack>
        </Stack>

        {/* Floating Info Action Button */}
        <IconButton 
            size="large"
            onClick={() => setTermsModalOpen(true)}
            sx={{ 
                position: isMobile ? 'fixed' : 'absolute',
                bottom: isMobile ? 20 : 16,
                right: isMobile ? 24 : 16,
                width: isMobile ? 60 : 48,
                height: isMobile ? 60 : 48,
                color: 'info.main',
                bgcolor: '#fff',
                boxShadow: '0 10px 24px rgba(0,0,0,0.22)',
                border: '1px solid rgba(0,0,0,0.08)',
                zIndex: 1350,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.95)',
                    transform: 'scale(1.05)',
                    boxShadow: '0 12px 28px rgba(0,0,0,0.25)',
                },
            }}
            aria-label="More information"
        >
            <InfoOutlinedIcon sx={{ fontSize: isMobile ? 28 : 24 }} />
        </IconButton>

        {/* Terms and Conditions Modal */}
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
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <IconButton
                        onClick={() => setTermsModalOpen(false)}
                        size="large"
                        sx={{
                            bgcolor: 'error.main',
                            color: '#fff',
                            width: 56,
                            height: 56,
                            '&:hover': {
                                bgcolor: 'error.dark',
                            },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </FullScreenModalMobile>
        ) : (
            <Modal
                open={termsModalOpen}
                onClose={() => setTermsModalOpen(false)}
                aria-labelledby="terms-modal-title"
                closeAfterTransition
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                        sx: { 
                            backdropFilter: 'blur(4px)',
                        }
                    }
                }}
            >
                <Slide direction="up" in={termsModalOpen} timeout={{ enter: 400, exit: 300 }}>
                    <Box
                        sx={{
                            width: { xs: '90%', sm: '80%', md: '70%', lg: '60%' },
                            maxWidth: 800,
                            bgcolor: 'background.paper',
                            boxShadow: 24,
                            borderRadius: 2,
                            p: 4,
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            outline: 'none',
                        }}
                    >
                        <Typography 
                            id="terms-modal-title" 
                            variant="h5" 
                            component="h2" 
                            fontWeight={700}
                            sx={{ mb: 3, color: '#F57979' }}
                        >
                            {selectedProduct?.product_name ? `${selectedProduct.product_name} Terms` : 'Terms and Conditions'}
                        </Typography>
                    
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
                                fontSize: '1rem',
                                lineHeight: 1.6,
                            },
                            mb: 3,
                        }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <IconButton
                            onClick={() => setTermsModalOpen(false)}
                            size="large"
                            sx={{
                                bgcolor: 'error.main',
                                color: '#fff',
                                width: 56,
                                height: 56,
                                '&:hover': {
                                    bgcolor: 'error.dark',
                                },
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    </Box>
                </Slide>
            </Modal>
        )}
        </Box>
    );
}
