import React from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useMyTheme } from '@/hooks/use-mytheme';

export const CLIENT_PRODUCT_LIST_SKELETON_COUNT = 6;

type Props = {
    itemCount?: number;
};

const ProductListSkeleton: React.FC<Props> = ({ itemCount }) => {
    const tw = useMyTheme();
    const isMobile = useMediaQuery('(max-width: 600px)');
    const defaultCount = isMobile ? 4 : CLIENT_PRODUCT_LIST_SKELETON_COUNT;
    const safeItemCount = Math.max(itemCount ?? defaultCount, 1);
    const cardBg = tw.isDark ? '#2f2f2f' : '#f7f7f7';
    const cardBorder = tw.isDark ? '#3a3a3a' : '#e5e5e5';

    return (
        <div className={`flex flex-col ${isMobile ? 'gap-1' : 'gap-1.25'}`}>
            {Array.from({ length: safeItemCount }).map((_, idx) => (
                <div
                    key={idx}
                    className="rounded-lg overflow-hidden"
                    style={{
                        borderRadius: isMobile ? 8 : 10,
                        backgroundColor: cardBg,
                        border: `2px solid ${cardBorder}`,
                    }}
                >
                    <div style={{ paddingLeft: isMobile ? 12 : 16, paddingRight: isMobile ? 12 : 16, paddingTop: isMobile ? 8 : 12, paddingBottom: isMobile ? 8 : 12 }}>
                        <div className="w-full flex flex-col items-center text-center gap-2">
                            {/* Title skeleton */}
                            <div 
                                className="animate-pulse rounded"
                                style={{
                                    width: isMobile ? '70%' : '60%',
                                    height: isMobile ? 22 : 26,
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                }}
                            />
                            {/* Tags skeleton */}
                            <div className="flex flex-row gap-0.5 justify-center flex-wrap">
                                <div className="animate-pulse rounded-full" style={{ width: 52, height: 20, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                                <div className="animate-pulse rounded-full" style={{ width: 64, height: 20, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                                <div className="animate-pulse rounded-full" style={{ width: 48, height: 20, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductListSkeleton;
