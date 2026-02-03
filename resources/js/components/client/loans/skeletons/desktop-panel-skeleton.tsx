import React from 'react';
import { useMyTheme } from '@/hooks/use-mytheme';

type Props = {
    showMessage?: boolean;
};

const DesktopPanelSkeleton: React.FC<Props> = ({ showMessage = false }) => {
    const tw = useMyTheme();
    const skeletonBg = tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

    if (showMessage) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                <h6 className="text-white font-semibold">
                    Select a loan action
                </h6>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Choose Schedule or Payments to view details.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full p-2">
            {/* Header skeleton */}
            <div className="flex flex-row gap-2 items-center mb-3">
                <div 
                    className="rounded animate-pulse"
                    style={{ 
                        width: 200,
                        height: 28,
                        backgroundColor: skeletonBg,
                    }} 
                />
                <div 
                    className="rounded animate-pulse"
                    style={{ 
                        width: 80,
                        height: 36,
                        backgroundColor: skeletonBg,
                    }} 
                />
            </div>

            {/* Content skeleton */}
            <div className="space-y-1">
                {Array.from({ length: 8 }).map((_, idx) => (
                    <div
                        key={idx}
                        className="grid gap-2 p-2 rounded animate-pulse"
                        style={{
                            gridTemplateColumns: 'repeat(5, 1fr)',
                            backgroundColor: tw.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                            animationDelay: `${idx * 0.05}s`,
                        }}
                    >
                        {Array.from({ length: 5 }).map((_, colIdx) => (
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

export default DesktopPanelSkeleton;
