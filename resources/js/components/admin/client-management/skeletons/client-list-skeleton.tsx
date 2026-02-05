import React from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useMyTheme } from '@/hooks/use-mytheme';

export const CLIENT_LIST_PAGE_SIZE = 9;

type Props = {
    itemCount?: number;
    fullHeight?: boolean;
    showTabs?: boolean;
    showSearch?: boolean;
};

const ClientListSkeleton: React.FC<Props> = ({ itemCount = CLIENT_LIST_PAGE_SIZE, fullHeight = false, showTabs = true, showSearch = true }) => {
    const tw = useMyTheme();
    const isMobile = useMediaQuery('(max-width: 600px)');
    const safeItemCount = Math.max(itemCount ?? CLIENT_LIST_PAGE_SIZE, 1);

    const containerBg = tw.isDark ? '#171717' : '#FFFFFF';
    const containerBorder = tw.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
    const itemBg = tw.isDark ? '#262626' : '#F5F5F5';
    const itemBorder = tw.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
    const skeletonColor = tw.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
    const padding = isMobile ? 8 : 12;
    const gap = isMobile ? 8 : 10;

    return (
        <div
            className={`flex flex-col ${fullHeight ? 'flex-1 min-h-full items-stretch' : ''}`}
            style={{ gap: isMobile ? 8 : 13 }}
        >
            {showTabs ? (
                <div className="flex flex-row gap-1 justify-between px-0.5">
                    {[1, 2, 3].map((idx) => (
                        <div
                            key={idx}
                            className="animate-pulse rounded w-full"
                            style={{
                                height: isMobile ? 32 : 36,
                                backgroundColor: skeletonColor,
                                borderRadius: 6,
                            }}
                        />
                    ))}
                </div>
            ) : null}

            <div
                style={{
                    padding: showSearch ? `${padding}px` : 0,
                    borderRadius: showSearch ? 8 : 0,
                    backgroundColor: showSearch ? containerBg : 'transparent',
                    border: showSearch ? `1px solid ${containerBorder}` : 'none',
                    boxShadow: showSearch ? 'inset 0 1px 0 rgba(255,255,255,0.02)' : 'none',
                    flex: fullHeight ? 1 : 'unset',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: `${gap}px`,
                }}
            >
                {showSearch && (
                    <div
                        className="animate-pulse rounded w-full"
                        style={{
                            height: 48,
                            backgroundColor: skeletonColor,
                            borderRadius: 6,
                        }}
                    />
                )}

                <div
                    className="flex flex-col"
                    style={{ gap: isMobile ? 8 : 8, marginTop: showSearch ? 4 : 0 }}
                >
                    {Array.from({ length: safeItemCount }).map((_, idx) => (
                        <div
                            key={idx}
                            className="flex flex-row items-center"
                            style={{
                                gap: isMobile ? 8 : 10,
                                backgroundColor: itemBg,
                                border: `1px solid ${itemBorder}`,
                                borderRadius: isMobile ? 8 : 10,
                                padding: `${isMobile ? 8 : 12}px`,
                            }}
                        >
                            <div
                                className="rounded-full shrink-0 animate-pulse"
                                style={{
                                    width: isMobile ? 44 : 52,
                                    height: isMobile ? 44 : 52,
                                    backgroundColor: skeletonColor,
                                }}
                            />
                            <div
                                className="animate-pulse rounded flex-1"
                                style={{
                                    width: '60%',
                                    height: isMobile ? 24 : 28,
                                    backgroundColor: skeletonColor,
                                }}
                            />
                            <div
                                className="rounded-full shrink-0 animate-pulse"
                                style={{
                                    width: isMobile ? 30 : 34,
                                    height: isMobile ? 30 : 34,
                                    backgroundColor: skeletonColor,
                                    marginLeft: 'auto',
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ClientListSkeleton;
