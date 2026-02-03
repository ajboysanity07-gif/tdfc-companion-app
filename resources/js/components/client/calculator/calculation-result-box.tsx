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
    const formattedValue = formatCurrency(value).replace('PHP', '').replace('₱', '').trim();

    if (isAccent) {
        return (
            <div style={{ marginTop: 16 }}>
                <div
                    style={{
                        marginBottom: 12,
                        display: 'block',
                        textTransform: 'uppercase',
                        letterSpacing: '1.2px',
                        color: styles.accentColor,
                        fontSize: '0.7rem',
                        textAlign: 'center',
                        fontWeight: 900,
                    }}
                >
                    {label}
                </div>
                <div
                    style={{
                        background: styles.isDark
                            ? 'linear-gradient(135deg, #2a4a4a 0%, #1e3a3a 100%)'
                            : 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
                        borderRadius: 8,
                        padding: 24,
                        textAlign: 'center',
                        border: `2px solid ${styles.accentColor}`,
                    }}
                >
                    <h4
                        style={{
                            color: styles.accentColor,
                            fontVariantNumeric: 'tabular-nums',
                            letterSpacing: '-0.02em',
                            fontWeight: 700,
                            fontSize: '2rem',
                        }}
                    >
                        ₱ {formattedValue}*
                    </h4>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div
                style={{
                    marginBottom: 12,
                    display: 'block',
                    textTransform: 'uppercase',
                    letterSpacing: '1.2px',
                    fontSize: '0.7rem',
                    textAlign: 'center',
                    fontWeight: 600,
                    color: '#666',
                }}
            >
                {label}
            </div>
            <div
                style={{
                    backgroundColor: styles.cardBg,
                    borderRadius: 8,
                    padding: 20,
                    textAlign: 'center',
                    border: `2px solid ${styles.cardBorder}`,
                }}
            >
                <h5
                    style={{
                        fontWeight: 700,
                        fontVariantNumeric: 'tabular-nums',
                        fontSize: '1.5rem',
                    }}
                >
                    ₱ {formattedValue}
                </h5>
            </div>
        </div>
    );
}
