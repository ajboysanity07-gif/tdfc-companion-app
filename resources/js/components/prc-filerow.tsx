import React from 'react';
import { Plus } from 'lucide-react';

type Props = {
  valueFront?: File | null;
  valueBack?: File | null;
  onClick: () => void;
  display?: string;
};

const PRCFileRow: React.FC<Props> = ({ valueFront, valueBack, onClick, display }) => {
  // Helper to describe what's uploaded
  const getStatusDisplay = () => {
    if (display) return display;
    if (valueFront && valueBack) return 'Front & Back completed ✓';
    if (valueFront) return 'Front completed, back pending';
    if (valueBack) return 'Back completed, front pending';
    return 'Click to upload...';
  };

  return (
    <div className="mb-8">
      <label className="text-[14px] font-bold text-red-text block mb-2">
        Upload PRC ID Photo <span className="text-red-text">*</span>
      </label>
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-3 w-full py-3 px-4 border rounded-lg border-border bg-card active:border-brand-red/40"
      >
        <span className="bg-success-soft text-success rounded-full p-2">
          <Plus className="w-6 h-6" />
        </span>
        <span className="grow truncate text-muted-foreground select-none">
          {getStatusDisplay()}
        </span>
        <span className="text-xs text-muted-foreground select-none">JPEG/PNG/WEBP</span>
      </button>
    </div>
  );
};

export default PRCFileRow;
