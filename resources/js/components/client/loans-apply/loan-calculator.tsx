import { useMyTheme } from '@/hooks/use-mytheme';
import type { ProductLntype } from '@/types/product-lntype';
import type { LoanApplicationRequest } from '@/types/loan-application';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Stack, TextField, Typography, Button, Alert } from '@mui/material';
import { useState } from 'react';

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

export default function LoanCalculator({ selectedProduct, onSubmit, submitting = false, submitError }: Props) {
    const tw = useMyTheme();
    const [termMonths, setTermMonths] = useState<number>(0);
    const [amortization, setAmortization] = useState<number>(0);
    const [oldBalance, setOldBalance] = useState<number>(0);

    const cardBg = tw.isDark ? '#2f2f2f' : '#f7f7f7';
    const cardBorder = tw.isDark ? '#3a3a3a' : '#e5e5e5';
    const accentColor = '#F57979';

    const handleSubmit = async () => {
        if (!selectedProduct || !onSubmit) return;

        const request: LoanApplicationRequest = {
            product_id: selectedProduct.product_id,
            term_months: termMonths,
            amortization: amortization,
            old_balance: oldBalance,
        };

        await onSubmit(request);
    };

    const isFormValid = selectedProduct && termMonths > 0 && amortization > 0;

    // Calculate due amount (amortization + old balance)
    const dueAmount = amortization + oldBalance;

    // Calculate estimated net proceeds (simplified calculation)
    // This should be replaced with actual calculation logic based on product fees
    const serviceFee = selectedProduct?.service_fee || 0;
    const lrf = selectedProduct?.lrf || 0;
    const documentStamp = selectedProduct?.document_stamp || 0;
    const mortPlusNotarial = selectedProduct?.mort_plus_notarial || 0;
    
    const totalDeductions = serviceFee + lrf + documentStamp + mortPlusNotarial + oldBalance;
    const estimatedNetProceeds = Math.max(0, amortization - totalDeductions);

    return (
        <Stack spacing={3}>
            {/* Product Display (Read-only) */}
            <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }}>
                    Product
                </Typography>
                <TextField
                    fullWidth
                    variant="standard"
                    value={selectedProduct?.product_name || ''}
                    placeholder="Select a product from the list"
                    InputProps={{
                        readOnly: true,
                    }}
                    sx={{
                        '& .MuiInput-root': {
                            fontSize: '1.25rem',
                            fontWeight: 700,
                        },
                        '& .MuiInput-input': {
                            textAlign: 'center',
                            cursor: 'default',
                        },
                        '& .MuiInput-underline:before': {
                            borderBottomColor: cardBorder,
                            borderBottomWidth: 2,
                        },
                        '& .MuiInput-underline:after': {
                            borderBottomColor: selectedProduct ? accentColor : cardBorder,
                            borderBottomWidth: 2,
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
                    variant="standard"
                    type="number"
                    value={termMonths || ''}
                    onChange={(e) => setTermMonths(Number(e.target.value))}
                    placeholder="0"
                    inputProps={{ min: 0, max: selectedProduct?.max_term_days ? Math.floor(selectedProduct.max_term_days / 30) : undefined }}
                    sx={{
                        '& .MuiInput-root': {
                            fontSize: '1.5rem',
                            fontWeight: 700,
                        },
                        '& .MuiInput-input': {
                            textAlign: 'center',
                        },
                    }}
                />
            </Box>

            {/* Amortization */}
            <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }}>
                    Amortization
                </Typography>
                <TextField
                    fullWidth
                    variant="standard"
                    type="number"
                    value={amortization || ''}
                    onChange={(e) => setAmortization(Number(e.target.value))}
                    placeholder="₱0.00"
                    inputProps={{ min: 0, max: selectedProduct?.max_amortization || undefined }}
                    sx={{
                        '& .MuiInput-root': {
                            fontSize: '1.5rem',
                            fontWeight: 700,
                        },
                        '& .MuiInput-input': {
                            textAlign: 'center',
                        },
                    }}
                />
            </Box>

            {/* Old Balance */}
            <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }}>
                    Old Balance
                </Typography>
                <TextField
                    fullWidth
                    variant="standard"
                    type="number"
                    value={oldBalance || ''}
                    onChange={(e) => setOldBalance(Number(e.target.value))}
                    placeholder="₱0.00"
                    inputProps={{ min: 0 }}
                    sx={{
                        '& .MuiInput-root': {
                            fontSize: '1.5rem',
                            fontWeight: 700,
                        },
                        '& .MuiInput-input': {
                            textAlign: 'center',
                        },
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
                    <Typography variant="h5" fontWeight={800}>
                        {formatCurrency(dueAmount)}
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
                    <Typography variant="h4" fontWeight={900} sx={{ color: accentColor }}>
                        {formatCurrency(estimatedNetProceeds)}*
                    </Typography>
                </Box>
            </Box>

            {/* Disclaimer */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: tw.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                }}
            >
                <InfoOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', textDecoration: 'underline' }}>
                    Subject to further delinquent balances deduction
                </Typography>
            </Box>

            {/* Submit Error */}
            {submitError && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {submitError}
                </Alert>
            )}

            {/* Submit Button */}
            <Button
                variant="contained"
                size="large"
                fullWidth
                disabled={!isFormValid || submitting}
                onClick={handleSubmit}
                sx={{
                    bgcolor: accentColor,
                    color: 'white',
                    fontWeight: 700,
                    py: 1.5,
                    borderRadius: 2,
                    '&:hover': {
                        bgcolor: '#e06868',
                    },
                    '&:disabled': {
                        bgcolor: cardBorder,
                        color: 'text.disabled',
                    },
                }}
            >
                {submitting ? 'Submitting...' : 'Submit Loan Application'}
            </Button>
        </Stack>
    );
}
