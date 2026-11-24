// 📄 8. resources/js/components/dashboard/components/LoadingSpinner.tsx
import { FC } from 'react';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({ 
  message = "Loading...", 
  className = "" 
}) => (
  <div 
    className={`flex items-center justify-center py-8 ${className}`}
    role="status" 
    aria-live="polite"
  >
    <div className="flex items-center gap-3">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-red border-t-transparent" />
      <span className="text-muted-foreground">{message}</span>
    </div>
  </div>
);