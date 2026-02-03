import React from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';

const LoanCalculatorSkeleton: React.FC = () => {
    const isMobile = useMediaQuery('(max-width:900px)');
    const skeletonBg = 'rgba(255,255,255,0.08)';

    return (
        <div style={{ minHeight: isMobile ? 'auto' : 845 }}>
            <div className={`flex flex-col ${isMobile ? 'gap-2.5' : 'gap-3'}`}>
                {/* Product field */}
                <div>
                    <div style={{ width: 80, height: 14, backgroundColor: skeletonBg, borderRadius: 4, margin: '0 auto 6px' }} />
                    <div style={{ height: isMobile ? 44 : 53, backgroundColor: skeletonBg, borderRadius: 12 }} />
                </div>

                {/* Term in Months field */}
                <div>
                    <div style={{ width: 130, height: 14, backgroundColor: skeletonBg, borderRadius: 4, margin: '0 auto 6px' }} />
                    <div style={{ height: isMobile ? 44 : 53, backgroundColor: skeletonBg, borderRadius: 12 }} />
                </div>

                {/* Amortization field */}
                <div>
                    <div style={{ width: 120, height: 14, backgroundColor: skeletonBg, borderRadius: 4, margin: '0 auto 6px' }} />
                    <div style={{ height: isMobile ? 44 : 53, backgroundColor: skeletonBg, borderRadius: 12 }} />
                </div>

                {/* Old Balance field */}
                <div>
                    <div style={{ width: 100, height: 14, backgroundColor: skeletonBg, borderRadius: 4, margin: '0 auto 6px' }} />
                    <div style={{ height: isMobile ? 44 : 53, backgroundColor: skeletonBg, borderRadius: 12 }} />
                </div>

                {/* Due Amount (display box) */}
                <div>
                    <div style={{ width: 110, height: 14, backgroundColor: skeletonBg, borderRadius: 4, margin: '0 auto 6px' }} />
                    <div style={{ height: isMobile ? 70 : 80, backgroundColor: skeletonBg, borderRadius: 8 }} />
                </div>

                {/* Monthly Payment (display box) */}
                <div>
                    <div style={{ width: 200, height: 14, backgroundColor: skeletonBg, borderRadius: 4, margin: '0 auto 6px' }} />
                    <div style={{ height: isMobile ? 70 : 80, backgroundColor: skeletonBg, borderRadius: 8 }} />
                </div>

                {/* Net Proceeds (highlighted box) */}
                <div style={{ marginTop: 8 }}>
                    <div style={{ width: 180, height: 14, backgroundColor: skeletonBg, borderRadius: 4, margin: '0 auto 6px' }} />
                    <div style={{ height: isMobile ? 88 : 100, backgroundColor: skeletonBg, borderRadius: 8 }} />
                </div>

                {/* Disclaimer text */}
                <div>
                    <div style={{ width: '90%', height: 12, backgroundColor: skeletonBg, borderRadius: 4, margin: '0 auto' }} />
                    <div style={{ width: '85%', height: 12, backgroundColor: skeletonBg, borderRadius: 4, margin: '2px auto 0' }} />
                </div>

                {/* Terms and Conditions - Desktop only */}
                {!isMobile && (
                    <div>
                        <div style={{ width: 180, height: 14, backgroundColor: skeletonBg, borderRadius: 4, margin: '0 auto 6px' }} />
                        <div style={{ height: 200, backgroundColor: skeletonBg, borderRadius: 12 }} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoanCalculatorSkeleton;
