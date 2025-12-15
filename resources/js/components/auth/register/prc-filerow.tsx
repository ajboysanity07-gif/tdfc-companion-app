import React from 'react';
import { Plus } from 'lucide-react';

interface Props {
  valueFront?: File | null;
  valueBack?: File | null;
  onClick: () => void;
  display?: React.ReactNode;
}

const PRCFileRow: React.FC<Props> = ({ valueFront, valueBack, onClick, display }) => {
  const getStatusDisplay = () => {
    if (display) return display;
    if (valueFront && valueBack) return 'Front & Back completed';
    if (valueFront) return 'Front completed, back pending';
    if (valueBack) return 'Back completed, front pending';
    return 'Click to upload...';
  };

  return (
    <div className="mb-8">
      <label className="text-[14px] font-bold text-[#F57979] block mb-2">
        Upload PRC ID Photo <span className="text-[#F57979]">*</span>
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
          {getStatusDisplay()}
        </span>
        <span className="text-xs text-black/40 select-none">JPEG/PNG/WEBP</span>
      </button>
    </div>
  );
};

export default PRCFileRow;
