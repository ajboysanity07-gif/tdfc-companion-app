// 📄 9. resources/js/components/dashboard/components/ErrorMessage.tsx
import { FC } from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: FC<ErrorMessageProps> = ({ 
  message, 
  onRetry, 
  className = "" 
}) => (
  <div className={`py-8 text-center ${className}`} role="alert">
    <div className="max-w-md mx-auto">
      <div className="text-red-600 dark:text-red-400 mb-4">
        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p className="font-medium">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-[#F57979] text-white rounded-lg hover:bg-[#e26d6d] transition-colors focus:outline-none focus:ring-2 focus:ring-[#F57979] focus:ring-offset-2"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);
