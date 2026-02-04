import React from 'react';
import { useMyTheme } from '@/hooks/use-mytheme';

const ClientDetailsSkeleton: React.FC = () => {
    const tw = useMyTheme();
    const skeletonColor = tw.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
    return (
        <div
            className="flex flex-col gap-3 items-center w-full max-w-3xl mx-auto"
            style={{
                padding: '16px 32px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.08)',
            }}
        >
            {/* Title skeleton */}
            <div
                className="animate-pulse rounded"
                style={{
                    width: 220,
                    height: 32,
                    backgroundColor: skeletonColor,
                }}
            />
            <div
                style={{
                    width: '100%',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '16px 32px',
                }}
            >
                <div className="flex flex-col gap-2 items-center">
                    {/* Avatar skeleton */}
                    <div
                        className="rounded-full animate-pulse"
                        style={{
                            width: 120,
                            height: 120,
                            backgroundColor: skeletonColor,
                        }}
                    />
                    {/* Name skeleton */}
                    <div
                        className="animate-pulse rounded"
                        style={{
                            width: 160,
                            height: 24,
                            backgroundColor: skeletonColor,
                        }}
                    />
                    {/* Input skeleton */}
                    <div
                        className="animate-pulse rounded w-full"
                        style={{
                            width: '100%',
                            height: 48,
                            backgroundColor: skeletonColor,
                        }}
                    />
                    <div className="flex flex-row gap-2 w-full">
                        <div
                            className="animate-pulse rounded"
                            style={{
                                width: '50%',
                                height: 64,
                                backgroundColor: skeletonColor,
                            }}
                        />
                        <div
                            className="animate-pulse rounded"
                            style={{
                                width: '50%',
                                height: 64,
                                backgroundColor: skeletonColor,
                            }}
                        />
                    </div>
                    {/* Section title skeleton */}
                    <div
                        className="animate-pulse rounded"
                        style={{
                            width: 190,
                            height: 26,
                            backgroundColor: skeletonColor,
                        }}
                    />
                    <div className="flex flex-col gap-1.5 w-full">
                        {[1, 2].map((key) => (
                            <div
                                key={key}
                                style={{
                                    padding: 16,
                                    borderRadius: 8,
                                    border: '1px solid rgba(255,255,255,0.08)',
                                }}
                            >
                                <div
                                    className="animate-pulse rounded mb-1"
                                    style={{
                                        width: '40%',
                                        height: 22,
                                        backgroundColor: skeletonColor,
                                    }}
                                />
                                <div
                                    className="animate-pulse rounded mb-1"
                                    style={{
                                        width: '70%',
                                        height: 18,
                                        backgroundColor: skeletonColor,
                                    }}
                                />
                                <div
                                    className="animate-pulse rounded mb-1"
                                    style={{
                                        width: '50%',
                                        height: 18,
                                        backgroundColor: skeletonColor,
                                    }}
                                />
                                <div className="flex flex-row gap-1.5 mt-1">
                                    <div
                                        className="animate-pulse rounded"
                                        style={{
                                            width: 110,
                                            height: 38,
                                            backgroundColor: skeletonColor,
                                        }}
                                    />
                                    <div
                                        className="animate-pulse rounded"
                                        style={{
                                            width: 110,
                                            height: 38,
                                            backgroundColor: skeletonColor,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDetailsSkeleton;
