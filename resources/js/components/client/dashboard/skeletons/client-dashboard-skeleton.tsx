import React from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useMyTheme } from '@/hooks/use-mytheme';

const ClientDashboardSkeleton: React.FC = () => {
    const tw = useMyTheme();
    const isMobile = useMediaQuery('(max-width:900px)');
    const surface = tw.isDark ? '#2f2f2f' : '#f5f5f5';
    const borderColor = tw.isDark ? '#3a3a3a' : '#e5e7eb';
    const skeletonColor = tw.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
    const actionCount = isMobile ? 2 : 3;
    const rowCount = isMobile ? 4 : 5;

    return (
        <div className="flex flex-col gap-2">
            <div
                style={{
                    borderRadius: 24,
                    padding: isMobile ? 20 : 24,
                    backgroundColor: surface,
                    border: `1px solid ${borderColor}`,
                    boxShadow: tw.isDark ? '0 12px 30px rgba(0,0,0,0.3)' : '0 12px 30px rgba(15,23,42,0.08)',
                }}
            >
                <div className="flex flex-row gap-2 items-center justify-between">
                    <div className="flex flex-row gap-2 items-center" style={{ minWidth: 0, flex: 1 }}>
                        {/* Avatar skeleton */}
                        <div
                            className="rounded-full shrink-0"
                            style={{
                                width: isMobile ? 56 : 72,
                                height: isMobile ? 56 : 72,
                                backgroundColor: skeletonColor,
                                animation: 'pulse 1.5s ease-in-out infinite',
                            }}
                        />
                        <div className="flex flex-col gap-1" style={{ minWidth: 0 }}>
                            <div 
                                style={{
                                    width: 90,
                                    height: 16,
                                    backgroundColor: skeletonColor,
                                    borderRadius: 4,
                                    animation: 'pulse 1.5s ease-in-out infinite',
                                }}
                            />
                            <div
                                style={{
                                    width: isMobile ? 120 : 160,
                                    height: isMobile ? 28 : 32,
                                    backgroundColor: skeletonColor,
                                    borderRadius: 4,
                                    animation: 'pulse 1.5s ease-in-out infinite',
                                }}
                            />
                            <div
                                style={{
                                    width: 110,
                                    height: 22,
                                    backgroundColor: skeletonColor,
                                    borderRadius: 999,
                                    animation: 'pulse 1.5s ease-in-out infinite',
                                }}
                            />
                        </div>
                    </div>
                    {!isMobile && (
                        <div
                            className="rounded-full shrink-0"
                            style={{
                                width: 64,
                                height: 64,
                                backgroundColor: skeletonColor,
                                animation: 'pulse 1.5s ease-in-out infinite',
                            }}
                        />
                    )}
                </div>

                <div className="flex flex-col items-center gap-1" style={{ paddingTop: 16 }}>
                    <div
                        style={{
                            width: '90%',
                            height: 1,
                            backgroundColor: borderColor,
                        }}
                    />
                    <div
                        style={{
                            width: isMobile ? 160 : 200,
                            height: isMobile ? 34 : 40,
                            backgroundColor: skeletonColor,
                            borderRadius: 4,
                            animation: 'pulse 1.5s ease-in-out infinite',
                        }}
                    />
                    <div
                        style={{
                            width: 120,
                            height: 16,
                            backgroundColor: skeletonColor,
                            borderRadius: 4,
                            animation: 'pulse 1.5s ease-in-out infinite',
                        }}
                    />
                </div>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                    gap: 12,
                }}
            >
                {Array.from({ length: actionCount }).map((_, idx) => (
                    <div
                        key={idx}
                        style={{
                            borderRadius: 24,
                            border: `1px solid ${borderColor}`,
                            backgroundColor: surface,
                            padding: isMobile ? 20 : 24,
                            minHeight: 140,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <div className="flex flex-col gap-1.25 items-center w-full">
                            <div
                                className="rounded-full"
                                style={{
                                    width: 64,
                                    height: 64,
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    animation: 'pulse 1.5s ease-in-out infinite',
                                }}
                            />
                            <div
                                style={{
                                    width: '60%',
                                    height: 24,
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    borderRadius: 4,
                                    animation: 'pulse 1.5s ease-in-out infinite',
                                }}
                            />
                            {!isMobile && (
                                <div
                                    style={{
                                        width: '80%',
                                        height: 16,
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        borderRadius: 4,
                                        animation: 'pulse 1.5s ease-in-out infinite',
                                    }}
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div
                style={{
                    borderRadius: 8,
                    border: `1px solid ${borderColor}`,
                    backgroundColor: surface,
                    padding: isMobile ? 16 : 24,
                    boxShadow: tw.isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
                }}
            >
                <div className="flex flex-row justify-between items-center" style={{ marginBottom: 8 }}>
                    <div
                        style={{
                            width: '45%',
                            height: 26,
                            backgroundColor: skeletonColor,
                            borderRadius: 4,
                            animation: 'pulse 1.5s ease-in-out infinite',
                        }}
                    />
                    <div
                        style={{
                            width: 70,
                            height: 28,
                            backgroundColor: skeletonColor,
                            borderRadius: 999,
                            animation: 'pulse 1.5s ease-in-out infinite',
                        }}
                    />
                </div>
                <div
                    style={{
                        marginBottom: 16,
                        height: 1,
                        backgroundColor: borderColor,
                    }}
                />

                <div className="flex flex-row gap-2 flex-wrap" style={{ marginBottom: 16 }}>
                    <div className="flex flex-row gap-1 items-center">
                        <div
                            className="rounded-full"
                            style={{
                                width: 8,
                                height: 8,
                                backgroundColor: 'rgba(255,255,255,0.1)',
                            }}
                        />
                        <div
                            style={{
                                width: 90,
                                height: 16,
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                borderRadius: 4,
                                animation: 'pulse 1.5s ease-in-out infinite',
                            }}
                        />
                    </div>
                    <div className="flex flex-row gap-1 items-center">
                        <div
                            className="rounded-full"
                            style={{
                                width: 8,
                                height: 8,
                                backgroundColor: 'rgba(255,255,255,0.1)',
                            }}
                        />
                        <div
                            style={{
                                width: 110,
                                height: 16,
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                borderRadius: 4,
                                animation: 'pulse 1.5s ease-in-out infinite',
                            }}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    {Array.from({ length: rowCount }).map((_, idx) => (
                        <div key={idx} className="flex flex-row items-center justify-between gap-2" style={{ paddingTop: 8, paddingBottom: 8 }}>
                            <div className="flex flex-col gap-0.6">
                                <div
                                    style={{
                                        width: 140,
                                        height: 20,
                                        backgroundColor: skeletonColor,
                                        borderRadius: 4,
                                        animation: 'pulse 1.5s ease-in-out infinite',
                                    }}
                                />
                                <div
                                    style={{
                                        width: 100,
                                        height: 16,
                                        backgroundColor: skeletonColor,
                                        borderRadius: 4,
                                        animation: 'pulse 1.5s ease-in-out infinite',
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-0.6 items-end">
                                <div
                                    style={{
                                        width: 90,
                                        height: 20,
                                        backgroundColor: skeletonColor,
                                        borderRadius: 4,
                                        animation: 'pulse 1.5s ease-in-out infinite',
                                    }}
                                />
                                <div
                                    style={{
                                        width: 80,
                                        height: 16,
                                        backgroundColor: skeletonColor,
                                        borderRadius: 4,
                                        animation: 'pulse 1.5s ease-in-out infinite',
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-1" style={{ paddingTop: 16, borderTop: `1px solid ${borderColor}` }}>
                    <div
                        className={isMobile ? 'flex flex-col gap-1' : 'flex flex-row gap-1 items-center justify-between'}
                        style={isMobile ? { alignItems: 'flex-start' } : {}}
                    >
                        <div
                            style={{
                                width: 140,
                                height: 32,
                                backgroundColor: skeletonColor,
                                borderRadius: 4,
                                animation: 'pulse 1.5s ease-in-out infinite',
                            }}
                        />
                        <div
                            style={{
                                width: 140,
                                height: 16,
                                backgroundColor: skeletonColor,
                                borderRadius: 4,
                                animation: 'pulse 1.5s ease-in-out infinite',
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div
                            style={{
                                width: 180,
                                height: 32,
                                backgroundColor: skeletonColor,
                                borderRadius: 999,
                                animation: 'pulse 1.5s ease-in-out infinite',
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboardSkeleton;
