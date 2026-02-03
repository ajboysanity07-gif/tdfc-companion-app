import React from 'react';

type Props = {
  title: string;
  subtitle?: string;
};

const BoxHeader: React.FC<Props> = ({ title, subtitle }) => {
  return (
    <div className="flex flex-col gap-0.5 pb-1 mb-2">
      <h4 className="text-2xl font-black text-blue-500" style={{ letterSpacing: '0.3px' }}>
        {title}
      </h4>
      {subtitle && (
        <p className="text-sm text-gray-500">{subtitle}</p>
      )}
      {/* Apple-style slim separator line */}
      <div className="pt-0.75">
        <div
          className="h-0.5 rounded-full bg-gray-300 dark:bg-gray-700"
          style={{ height: 2, borderRadius: 999 }}
        />
      </div>
    </div>
  );
};

export default BoxHeader;
