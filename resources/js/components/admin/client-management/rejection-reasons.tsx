import React from 'react';
import type { RejectionReasonEntry } from '@/types/user';

type Props = {
    reasons: RejectionReasonEntry[];
    selected: string[];
    onToggle: (code: string) => void;
    emptyMessage?: string;
};

const RejectionReasons: React.FC<Props> = ({ reasons, selected, onToggle, emptyMessage = 'No reasons available.' }) => {
    if (!reasons || reasons.length === 0) {
        return (
            <p className="text-sm text-gray-500">
                {emptyMessage}
            </p>
        );
    }

    return (
        <div className="flex flex-row gap-1 flex-wrap" style={{ rowGap: 8 }}>
            {reasons.map((reason) => {
                const isSelected = selected.includes(reason.code);
                const label = reason.label ?? reason.code;
                return (
                    <button
                        key={reason.code}
                        onClick={() => onToggle(reason.code)}
                        className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-colors ${
                            isSelected
                                ? 'bg-red-500 text-white border-red-500'
                                : 'bg-transparent text-gray-700 border border-gray-300 hover:border-gray-400'
                        }`}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
};

export default RejectionReasons;
