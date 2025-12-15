import React from 'react';
import { Plus } from 'lucide-react';

interface Props {
  value?: File | null;
  onClick: () => void;
  display?: React.ReactNode;
}

const PayslipFileRow: React.FC<Props> = ({ value, onClick, display }) => (
  <div className="mb-10">
    <label className="text-[14px] font-bold text-[#F57979] block mb-2">
      Upload LATEST PAYSLIP Photo <span className="text-[#F57979]">*</span>
    </label>
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 w-full py-3 px-4 border rounded-lg border-gray-200 bg-white active:border-[#F57979]/40"
    >
      <span className="bg-green-100 text-green-600 rounded-full p-2">
        <Plus className="w-6 h-6" />
      </span>
      <span className="grow truncate text-black/40 select-none">
        {display || value?.name || 'Click to upload...'}
      </span>
      <span className="text-xs text-black/40 select-none">JPEG/PNG/WEBP</span>
    </button>
  </div>
);

export default PayslipFileRow;
