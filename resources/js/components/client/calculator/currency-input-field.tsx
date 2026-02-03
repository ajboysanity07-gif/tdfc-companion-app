import CurrencyInput from 'react-currency-input-field';
import { useCalculatorStyles } from '@/hooks/use-calculator-styles';
import { useMediaQuery } from '@/hooks/use-media-query';

type Props = {
    value: number | undefined;
    onValueChange: (value: number) => void;
    placeholder?: string;
    disabled?: boolean;
    maxAmount?: number;
};

export default function CurrencyInputField({ value, onValueChange, placeholder = '0.00', disabled = false, maxAmount }: Props) {
    const styles = useCalculatorStyles();
    const isMobile = useMediaQuery('(max-width:900px)');

    return (
        <CurrencyInput
            value={value}
            onValueChange={(val) => {
                const numValue = val ? parseFloat(val) : 0;
                if (!numValue || (maxAmount && numValue <= maxAmount) || !maxAmount) {
                    onValueChange(numValue);
                }
            }}
            placeholder={placeholder}
            disabled={disabled}
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
                border: styles.inputBorder,
                backgroundColor: styles.inputBg,
                color: styles.inputColor,
                cursor: disabled ? 'default' : 'text',
            }}
        />
    );
}
