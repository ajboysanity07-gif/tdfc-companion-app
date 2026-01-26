import { Box, Typography } from '@mui/material';
import { useCalculatorStyles } from '@/hooks/use-calculator-styles';

type Props = {
    label: string;
    value: number;
    isAccent?: boolean;
};

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

export default function CalculationResultBox({ label, value, isAccent = false }: Props) {
    const styles = useCalculatorStyles();

    if (isAccent) {
        return (
            <Box sx={{ mt: 2 }}>
                <Typography
                    variant="caption"
                    fontWeight={900}
                    sx={{
                        mb: 1.5,
                        display: 'block',
                        textTransform: 'uppercase',
                        letterSpacing: 1.2,
                        color: styles.accentColor,
                        fontSize: '0.7rem',
                        textAlign: 'center',
                    }}
                >
                    {label}
                </Typography>
                <Box
                    sx={{
                        background: styles.isDark
                            ? 'linear-gradient(135deg, #2a4a4a 0%, #1e3a3a 100%)'
                            : 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        border: `2px solid ${styles.accentColor}`,
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            color: styles.accentColor,
                            fontVariantNumeric: 'tabular-nums',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        <Box component="span" sx={{ fontWeight: 700 }}>
                            ₱ {formatCurrency(value).replace('PHP', '').replace('₱', '').trim()}*
                        </Box>
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
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
                {label}
            </Typography>
            <Box
                sx={{
                    bgcolor: styles.cardBg,
                    borderRadius: 2,
                    p: 2.5,
                    textAlign: 'center',
                    border: `2px solid ${styles.cardBorder}`,
                }}
            >
                <Typography
                    variant="h5"
                    fontWeight={700}
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    ₱ {formatCurrency(value).replace('PHP', '').replace('₱', '').trim()}
                </Typography>
            </Box>
        </Box>
    );
}
