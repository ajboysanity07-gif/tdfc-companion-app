import React from 'react';

type Props = {
  title: string;
  subtitle?: string;
};

const BoxHeader: React.FC<Props> = ({ title, subtitle }) => {
  return (
    <div className="flex flex-col gap-0.5 pb-1 mb-2 w-full items-center">
      <h4 className="text-2xl font-black text-blue-500" style={{ letterSpacing: '0.3px' }}>
        {title}
      </h4>
      {subtitle && (
        <p className="text-sm text-gray-500">{subtitle}</p>
      )}
    </div>
  );
};

export default BoxHeader;
