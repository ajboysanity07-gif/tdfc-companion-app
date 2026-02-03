import React from 'react';
import { useMyTheme } from '@/hooks/use-mytheme';
import { colors } from '@/lib/tailwind-theme';

type Props = {
  title: string;
  subtitle?: string;
};

const BoxHeader: React.FC<Props> = ({ title, subtitle }) => {
  const tw = useMyTheme();
  const accent = colors.red;

  return (
    <div className="p-1 mb-2">
      <h2
        className="text-2xl md:text-3xl font-extrabold tracking-widest"
        style={{ color: accent, letterSpacing: '0.3px' }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {subtitle}
        </p>
      )}
      {/* Apple-style slim separator line */}
      <div className={`h-0.5 mt-3 rounded-full ${tw.isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
    </div>
  );
};

export default BoxHeader;
