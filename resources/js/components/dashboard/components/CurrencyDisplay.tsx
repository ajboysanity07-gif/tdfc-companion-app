// 📄 6. resources/js/components/dashboard/components/CurrencyDisplay.tsx
import { FC } from 'react';
import { formatters } from '../utils/formatters';

interface CurrencyDisplayProps {
  amount: number;
  label?: string;
  className?: string;
}

export const CurrencyDisplay: FC<CurrencyDisplayProps> = ({ 
  amount, 
  label, 
  className = "" 
}) => {
  const formattedAmount = formatters.currency(amount);
  
  return (
    <span className={className}>
      <span className="sr-only">
        {label && `${label}: `}
        {amount} Philippine Pesos
      </span>
      <span aria-hidden="true">{formattedAmount}</span>
    </span>
  );
};