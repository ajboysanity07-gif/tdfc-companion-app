import React from 'react';
import { useMyTheme } from '@/hooks/use-mytheme';

export const LOAN_LIST_SKELETON_COUNT = 4;

type Props = {
    itemCount?: number;
    desktopMode?: boolean;
};

const LoanListSkeleton: React.FC<Props> = ({ itemCount = LOAN_LIST_SKELETON_COUNT, desktopMode = false }) => {
    const tw = useMyTheme();
    const cardBg = tw.isDark ? '#3a3a3a' : 'rgba(0,0,0,0.04)';
    const skeletonBg = tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
    const safeItemCount = Math.max(itemCount, 1);

    return (
        <>
            {/* Header skeleton */}
            <div style={{ marginBottom: 24 }}>
                <div 
                    style={{
                        width: desktopMode ? '60%' : '50%',
                        height: 32,
                        backgroundColor: skeletonBg,
                        borderRadius: 4,
                        marginBottom: 16,
                        animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                />
                <div 
                    style={{
                        width: '100%',
                        height: 40,
                        backgroundColor: skeletonBg,
                        borderRadius: 8,
                        animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                />
            </div>

            <div className="flex flex-col gap-2 w-full">
                {Array.from({ length: safeItemCount }).map((_, idx) => (
                    <div
                        key={idx}
                        style={{
                            width: '100%',
                            borderRadius: 8,
                            backgroundColor: cardBg,
                            border: 'none',
                            padding: 20,
                            animation: 'pulse 1.5s ease-in-out infinite',
                            animationDelay: `${idx * 0.1}s`,
                        }}
                    >
                        <div className="flex flex-row gap-3 items-center justify-between">
                            {/* Left side - Loan info */}
                            <div className="flex flex-col gap-0.5 flex-1">
                                {/* Loan Title */}
                                <div 
                                    style={{
                                        width: '60%',
                                        height: 22,
                                        backgroundColor: skeletonBg,
                                        borderRadius: 4,
                                    }}
                                />
                                
                                {/* Loan Number */}
                                <div 
                                    style={{
                                        width: '70%',
                                        height: 18,
                                        backgroundColor: skeletonBg,
                                        borderRadius: 4,
                                        marginTop: 4,
                                    }}
                                />
                                
                                {/* Balance */}
                                <div 
                                    style={{
                                        width: '55%',
                                        height: 20,
                                        backgroundColor: skeletonBg,
                                        borderRadius: 4,
                                        marginTop: 8,
                                    }}
                                />
                                
                                {/* Date */}
                                <div 
                                    style={{
                                        width: '40%',
                                        height: 18,
                                        backgroundColor: skeletonBg,
                                        borderRadius: 4,
                                    }}
                                />
                            </div>

                            {/* Right side - Action buttons */}
                            <div className="flex flex-col gap-1" style={{ minWidth: 120 }}>
                                <div 
                                    style={{
                                        height: 32,
                                        backgroundColor: skeletonBg,
                                        borderRadius: 24,
                                    }}
                                />
                                <div 
                                    style={{
                                        height: 32,
                                        backgroundColor: skeletonBg,
                                        borderRadius: 24,
                                    }}
                                />
                                <div 
                                    style={{
                                        height: 32,
                                        backgroundColor: skeletonBg,
                                        borderRadius: 24,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default LoanListSkeleton;
