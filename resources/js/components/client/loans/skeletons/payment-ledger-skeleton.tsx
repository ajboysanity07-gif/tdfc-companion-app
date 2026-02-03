import React from 'react';
import { useMyTheme } from '@/hooks/use-mytheme';

type Props = {
    rowCount?: number;
};

const PaymentLedgerSkeleton: React.FC<Props> = ({ rowCount = 10 }) => {
    const tw = useMyTheme();
    const skeletonBg = tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
    const cardBg = tw.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';

    return (
        <div className="w-full">
            {/* Table Header */}
            <div 
                className="grid gap-2 p-2 rounded mb-1 animate-pulse"
                style={{ 
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    backgroundColor: cardBg,
                }}
            >
                {Array.from({ length: 4 }).map((_, idx) => (
                    <div
                        key={idx}
                        className="rounded"
                        style={{
                            height: 20,
                            backgroundColor: skeletonBg,
                        }}
                    />
                ))}
            </div>

            {/* Table Rows */}
            <div className="space-y-0.5">
                {Array.from({ length: rowCount }).map((_, idx) => (
                    <div
                        key={idx}
                        className="grid gap-2 p-2 rounded animate-pulse"
                        style={{
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            backgroundColor: cardBg,
                            animationDelay: `${idx * 0.05}s`,
                        }}
                    >
                        {Array.from({ length: 4 }).map((_, colIdx) => (
                            <div
                                key={colIdx}
                                className="rounded"
                                style={{
                                    height: 18,
                                    backgroundColor: skeletonBg,
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PaymentLedgerSkeleton;
