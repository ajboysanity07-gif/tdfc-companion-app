import React from 'react';
import { Plus } from 'lucide-react';

type Props = {
  value?: File | null;
  onClick: () => void;
  display?: string;
};

const PayslipFileRow: React.FC<Props> = ({ value, onClick, display }) => (
  <div className="mb-10">
    <label className="text-[14px] font-bold text-red-text block mb-2">
      Upload LATEST PAYSLIP Photo <span className="text-red-text">*</span>
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
        {display || value?.name || 'Click to upload...'}
      </span>
      <span className="text-xs text-muted-foreground select-none">JPEG/PNG/WEBP</span>
    </button>
  </div>
);

export default PayslipFileRow;
