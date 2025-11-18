// 📄 7. resources/js/components/dashboard/components/ProgressBar.tsx
import { FC } from 'react';

interface ProgressBarProps {
  percentage: number;
  label: string;
  color: string;
  className?: string;
}

export const ProgressBar: FC<ProgressBarProps> = ({ 
  percentage, 
  label, 
  color, 
  className = "" 
}) => {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  
  return (
    <div className={`mt-2 ${className}`}>
      <div 
        className="h-2 w-full rounded-full bg-gray-200 dark:bg-neutral-700"
        role="progressbar"
        aria-valuenow={clampedPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${clampedPercentage.toFixed(0)}%`}
      >
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{ 
            width: `${clampedPercentage}%`,
            backgroundColor: color
          }}
        />
      </div>
      <div className="mt-1 text-xs font-semibold" style={{ color }}>
        <span className="sr-only">{label} percentage: </span>
        {clampedPercentage.toFixed(0)}%
      </div>
    </div>
  );
};
