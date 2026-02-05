import React from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useMyTheme } from '@/hooks/use-mytheme';

const ProductDetailsSkeleton: React.FC = () => {
    const tw = useMyTheme();
    const isMobile = useMediaQuery('(max-width: 600px)');
    const skeletonColor = tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
    const textColor = tw.isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';

    const SectionTitle = ({ width = '180px' }: { width?: string }) => (
        <div
            className="animate-pulse rounded"
            style={{
                width,
                height: 16,
                backgroundColor: skeletonColor,
                marginTop: 24,
                marginBottom: 12,
            }}
        />
    );

    const Label = ({ width = '100px' }: { width?: string }) => (
        <div
            className="animate-pulse rounded"
            style={{
                width,
                height: 12,
                backgroundColor: skeletonColor,
                marginBottom: 8,
            }}
        />
    );

    const InputField = ({ height = 44 }: { height?: number }) => (
        <div
            className="animate-pulse rounded-lg"
            style={{
                width: '100%',
                height,
                backgroundColor: skeletonColor,
            }}
        />
    );

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
                gap: 0,
            }}
        >
            {/* Title: Product Details */}
            <div
                className="animate-pulse rounded self-center"
                style={{
                    width: '50%',
                    height: 28,
                    backgroundColor: skeletonColor,
                    marginBottom: 8,
                }}
            />

            {/* Subtitle */}
            <div
                style={{
                    fontSize: '0.75rem',
                    color: textColor,
                    marginBottom: 16,
                }}
            >
                Fields marked with * are required.
            </div>

            {/* Product Name */}
            <Label width="110px" />
            <InputField />

            {/* Enable/Disable Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
                <div
                    className="animate-pulse rounded-full"
                    style={{
                        width: 50,
                        height: 28,
                        backgroundColor: skeletonColor,
                    }}
                />
                <div
                    className="animate-pulse rounded"
                    style={{
                        width: 180,
                        height: 14,
                        backgroundColor: skeletonColor,
                    }}
                />
            </div>

            {/* TYPE RELATION TAGS */}
            <SectionTitle width="160px" />
            <Label width="50px" />
            <InputField />

            {/* LOAN CONFIGURATION */}
            <SectionTitle width="170px" />
            
            {/* Scheme + Mode row */}
            <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                    <Label width="65px" />
                    <InputField />
                </div>
                <div style={{ flex: 1 }}>
                    <Label width="50px" />
                    <InputField />
                </div>
            </div>

            {/* Rate + Max Term row */}
            <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                <div style={{ flex: 1 }}>
                    <Label width="70px" />
                    <InputField />
                </div>
                <div style={{ flex: 1 }}>
                    <Label width="110px" />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                            <InputField />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: '0.65rem', color: textColor }}>editable?</span>
                            <div
                                className="animate-pulse rounded-full"
                                style={{
                                    width: 44,
                                    height: 24,
                                    backgroundColor: skeletonColor,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* MAX AMORTIZATION */}
            <SectionTitle width="160px" />
            
            {/* Info text */}
            <div
                className="animate-pulse rounded"
                style={{
                    width: '90%',
                    height: 14,
                    backgroundColor: skeletonColor,
                    marginBottom: 12,
                }}
            />

            {/* Max Amortization Mode */}
            <Label width="170px" />
            <InputField />

            {/* Max Amortization Value */}
            <div style={{ marginTop: 16 }}>
                <Label width="140px" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                        <InputField />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: '0.65rem', color: textColor }}>editable?</span>
                        <div
                            className="animate-pulse rounded-full"
                            style={{
                                width: 44,
                                height: 24,
                                backgroundColor: skeletonColor,
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* FEES & CHARGES */}
            <SectionTitle width="140px" />

            {/* Fee fields in grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                {[1, 2, 3, 4].map((idx) => (
                    <div key={idx}>
                        <Label width="100px" />
                        <InputField />
                    </div>
                ))}
            </div>

            {/* TERMS & CONDITIONS */}
            <SectionTitle width="180px" />
            <InputField height={100} />

            {/* Action buttons */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: 12,
                    marginTop: 24,
                }}
            >
                <div
                    className="animate-pulse rounded-full"
                    style={{
                        flex: 1,
                        height: 48,
                        backgroundColor: skeletonColor,
                    }}
                />
                <div
                    className="animate-pulse rounded-full"
                    style={{
                        flex: 1,
                        height: 48,
                        backgroundColor: skeletonColor,
                    }}
                />
            </div>
        </div>
    );
};

export default ProductDetailsSkeleton;
