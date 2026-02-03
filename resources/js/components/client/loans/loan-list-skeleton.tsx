import React from 'react';
import { useMyTheme } from '../../../hooks/use-mytheme';
import { useMediaQuery } from '@/hooks/use-media-query';

export const LOAN_LIST_SKELETON_COUNT = 4;

type Props = {
    itemCount?: number;
};

const LoanListSkeleton: React.FC<Props> = ({ itemCount }) => {
    const tw = useMyTheme();
    const isMobile = useMediaQuery('(max-width: 600px)');
    const defaultCount = isMobile ? 3 : LOAN_LIST_SKELETON_COUNT;
    const safeItemCount = Math.max(itemCount ?? defaultCount, 1);
    
    // iOS-style colors with more depth
    const cardBg = tw.isDark 
        ? 'rgba(28, 28, 30, 0.8)' 
        : 'rgba(255, 255, 255, 0.95)';
    const skeletonBg = tw.isDark 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(0, 0, 0, 0.06)';
    const shadowColor = tw.isDark
        ? 'rgba(0, 0, 0, 0.5)'
        : 'rgba(0, 0, 0, 0.08)';

    return (
        <div className="flex flex-col gap-3 w-full">
            {Array.from({ length: safeItemCount }).map((_, idx) => (
                <div
                    key={idx}
                    style={{
                        width: '100%',
                        borderRadius: 16,
                        backgroundColor: cardBg,
                        backdropFilter: 'blur(20px)',
                        boxShadow: `0 2px 16px ${shadowColor}, 0 1px 4px ${shadowColor}`,
                        padding: isMobile ? 24 : 28,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.backgroundColor = tw.isDark ? 'rgba(38, 38, 40, 0.95)' : 'rgba(255, 255, 255, 1)';
                        e.currentTarget.style.boxShadow = `0 4px 24px ${shadowColor}, 0 2px 8px ${shadowColor}`;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = '';
                        e.currentTarget.style.backgroundColor = cardBg;
                        e.currentTarget.style.boxShadow = `0 2px 16px ${shadowColor}, 0 1px 4px ${shadowColor}`;
                    }}
                >
                    <div className={isMobile ? 'flex flex-col gap-3' : 'flex flex-row gap-4'} style={{ alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between' }}>
                        {/* Left side - Loan info */}
                        <div className="flex flex-col gap-2 flex-1">
                            {/* Loan Title */}
                            <div 
                                style={{ 
                                    width: isMobile ? '60%' : '45%',
                                    height: 26,
                                    backgroundColor: skeletonBg,
                                    borderRadius: 8,
                                    animation: 'pulse 1.5s ease-in-out infinite',
                                }} 
                            />
                            
                            {/* Loan Number */}
                            <div 
                                style={{ 
                                    width: isMobile ? '70%' : '52%',
                                    height: 20,
                                    backgroundColor: skeletonBg,
                                    borderRadius: 6,
                                    animation: 'pulse 1.5s ease-in-out 0.2s infinite',
                                }} 
                            />
                            
                            {/* Balance */}
                            <div 
                                style={{ 
                                    width: isMobile ? '50%' : '38%',
                                    height: 28,
                                    backgroundColor: skeletonBg,
                                    borderRadius: 8,
                                    animation: 'pulse 1.5s ease-in-out 0.4s infinite',
                                }} 
                            />
                            
                            {/* Date */}
                            <div 
                                style={{ 
                                    width: isMobile ? '40%' : '30%',
                                    height: 18,
                                    backgroundColor: skeletonBg,
                                    borderRadius: 6,
                                    animation: 'pulse 1.5s ease-in-out 0.6s infinite',
                                }} 
                            />
                        </div>

                        {/* Right side - Action buttons */}
                        <div 
                            className="flex flex-col gap-2"
                            style={{
                                width: isMobile ? '100%' : 180,
                                minWidth: isMobile ? '100%' : 180,
                            }}
                        >
                            <div 
                                style={{ 
                                    height: 44,
                                    backgroundColor: skeletonBg,
                                    borderRadius: 12,
                                    animation: 'pulse 1.5s ease-in-out 0.3s infinite',
                                }} 
                            />
                            <div 
                                style={{ 
                                    height: 44,
                                    backgroundColor: skeletonBg,
                                    borderRadius: 12,
                                    animation: 'pulse 1.5s ease-in-out 0.5s infinite',
                                }} 
                            />
                            <div 
                                style={{ 
                                    height: 44,
                                    backgroundColor: skeletonBg,
                                    borderRadius: 12,
                                    animation: 'pulse 1.5s ease-in-out 0.7s infinite',
                                }} 
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LoanListSkeleton;
