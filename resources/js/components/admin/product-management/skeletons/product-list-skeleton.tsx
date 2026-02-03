import React from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useMyTheme } from '@/hooks/use-mytheme';

export const PRODUCT_LIST_PAGE_SIZE = 6;

type Props = {
    itemCount?: number;
    fullHeight?: boolean;
};

const ProductListSkeleton: React.FC<Props> = ({ itemCount = PRODUCT_LIST_PAGE_SIZE, fullHeight = false }) => {
    const tw = useMyTheme();
    const isMobile = useMediaQuery('(max-width: 600px)');
    const panelBg = tw.isDark ? '#262626' : 'rgba(0,0,0,0.04)';
    const panelBorder = tw.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
    const cardBg = tw.isDark ? '#2f2f2f' : '#f7f7f7';
    const cardBorder = tw.isDark ? '#3a3a3a' : '#e5e5e5';
    const safeItemCount = Math.max(itemCount ?? PRODUCT_LIST_PAGE_SIZE, 1);

    return (
        <div
            className={`flex flex-col ${fullHeight ? 'flex-1 min-h-full' : ''}`}
            style={{ gap: isMobile ? 9 : 13 }}
        >
            {/* Title skeleton */}
            <div
                className="animate-pulse rounded"
                style={{
                    width: 140,
                    height: isMobile ? 32 : 38,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 6,
                }}
            />
            {/* Search skeleton */}
            <div
                className="animate-pulse rounded"
                style={{
                    height: 48,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 6,
                }}
            />

            {/* Product list panel */}
            <div
                style={{
                    padding: isMobile ? 8 : 12,
                    borderRadius: 8,
                    backgroundColor: panelBg,
                    border: `1px solid ${panelBorder}`,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
                    flex: fullHeight ? 1 : 'unset',
                }}
            >
                <div className="flex flex-col" style={{ gap: isMobile ? 8 : 10 }}>
                    {Array.from({ length: safeItemCount }).map((_, idx) => (
                        <div
                            key={idx}
                            className="flex flex-row items-center"
                            style={{
                                gap: isMobile ? 10 : 11,
                                backgroundColor: cardBg,
                                border: `1px solid ${cardBorder}`,
                                borderRadius: isMobile ? 8 : 10,
                                padding: `${isMobile ? 8 : 10}px`,
                            }}
                        >
                            {/* Icon/status skeleton */}
                            <div
                                className="rounded-full animate-pulse flex-shrink-0"
                                style={{
                                    width: 36,
                                    height: 22,
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                }}
                            />
                            {/* Content area */}
                            <div className="flex flex-col flex-1" style={{ gap: 3 }}>
                                {/* Product name skeleton */}
                                <div
                                    className="animate-pulse rounded"
                                    style={{
                                        width: '60%',
                                        height: isMobile ? 20 : 24,
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                    }}
                                />
                                {/* Tags skeleton */}
                                <div className="flex flex-row" style={{ gap: 5 }}>
                                    <div
                                        className="animate-pulse rounded-full"
                                        style={{
                                            width: 52,
                                            height: 18,
                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                        }}
                                    />
                                    <div
                                        className="animate-pulse rounded-full"
                                        style={{
                                            width: 64,
                                            height: 18,
                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                        }}
                                    />
                                </div>
                            </div>
                            {/* Action menu skeleton */}
                            <div
                                className="rounded-full animate-pulse flex-shrink-0"
                                style={{
                                    width: isMobile ? 30 : 34,
                                    height: isMobile ? 30 : 34,
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductListSkeleton;
