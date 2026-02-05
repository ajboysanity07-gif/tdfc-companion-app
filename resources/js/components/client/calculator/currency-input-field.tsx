import CurrencyInput from 'react-currency-input-field';
import { useMediaQuery } from '@/hooks/use-media-query';

type Props = {
    value: number | undefined;
    onValueChange: (value: number) => void;
    placeholder?: string;
    disabled?: boolean;
    maxAmount?: number;
};

export default function CurrencyInputField({ value, onValueChange, placeholder = '0.00', disabled = false, maxAmount }: Props) {
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
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-bold text-center"
            style={{
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                padding: isMobile ? '8px 12px' : '10px 12px',
            }}
        />
    );
}
