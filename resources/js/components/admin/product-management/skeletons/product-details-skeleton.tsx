import React from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useMyTheme } from '@/hooks/use-mytheme';

const ProductDetailsSkeleton: React.FC = () => {
    const tw = useMyTheme();
    const isMobile = useMediaQuery('(max-width: 600px)');
    const panelBg = tw.isDark ? '#262626' : '#FFFFFF';
    const panelBorder = tw.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

    return (
        <div
            style={{
                flex: 1,
                borderRadius: 24,
                padding: isMobile ? 20 : 24,
                backgroundColor: tw.isDark ? '#171717' : '#FFFFFF',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
            }}
        >
            {/* Title skeleton */}
            <div
                className="animate-pulse rounded self-center"
                style={{
                    width: '55%',
                    height: isMobile ? 32 : 36,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                }}
            />
            {/* Divider skeleton */}
            <div
                className="animate-pulse rounded self-center"
                style={{
                    height: 2,
                    width: '80%',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                }}
            />

            {/* Form fields panel */}
            <div
                className="flex flex-col gap-1.2"
                style={{
                    backgroundColor: panelBg,
                    borderRadius: 10,
                    padding: isMobile ? 16 : 20,
                    border: `1px solid ${panelBorder}`,
                }}
            >
                <div
                    className="animate-pulse rounded"
                    style={{
                        width: '70%',
                        height: 24,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                    }}
                />
                {[1, 2, 3, 4].map((idx) => (
                    <div
                        key={idx}
                        className="animate-pulse rounded"
                        style={{
                            height: idx === 4 ? 120 : 44,
                            backgroundColor: 'rgba(255,255,255,0.1)',
                        }}
                    />
                ))}
            </div>

            {/* Action buttons */}
            <div
                className={isMobile ? 'flex flex-col gap-1.2' : 'flex flex-row gap-1.2'}
                style={{
                    marginTop: 'auto',
                }}
            >
                <div
                    className="animate-pulse rounded w-full"
                    style={{
                        height: 50,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: 999,
                    }}
                />
                <div
                    className="animate-pulse rounded w-full"
                    style={{
                        height: 50,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: 999,
                    }}
                />
            </div>
        </div>
    );
};

export default ProductDetailsSkeleton;
