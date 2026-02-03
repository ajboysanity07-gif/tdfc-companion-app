import React from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useMyTheme } from '@/hooks/use-mytheme';

export const CLIENT_LIST_PAGE_SIZE = 9;

type Props = {
    itemCount?: number;
    fullHeight?: boolean;
    showTabs?: boolean;
};

const ClientListSkeleton: React.FC<Props> = ({ itemCount = CLIENT_LIST_PAGE_SIZE, fullHeight = false, showTabs = true }) => {
    const tw = useMyTheme();
    const isMobile = useMediaQuery('(max-width: 600px)');
    const safeItemCount = Math.max(itemCount ?? CLIENT_LIST_PAGE_SIZE, 1);

    const containerBg = tw.isDark ? '#171717' : '#FAFAFA';
    const containerBorder = tw.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
    const itemBg = tw.isDark ? '#262626' : '#FFFFFF';
    const itemBorder = tw.isDark ? '#3a3a3a' : '#e5e5e5';
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
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                borderRadius: 6,
                            }}
                        />
                    ))}
                </div>
            ) : null}

            <div
                style={{
                    padding: `${padding}px`,
                    borderRadius: 8,
                    backgroundColor: containerBg,
                    border: `1px solid ${containerBorder}`,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
                    flex: fullHeight ? 1 : 'unset',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: `${gap}px`,
                }}
            >
                <div
                    className="animate-pulse rounded w-full"
                    style={{
                        height: 48,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: 6,
                    }}
                />

                <div
                    className="flex flex-col"
                    style={{ gap: isMobile ? 8 : 8, marginTop: 4 }}
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
                                className="rounded-full flex-shrink-0 animate-pulse"
                                style={{
                                    width: isMobile ? 44 : 52,
                                    height: isMobile ? 44 : 52,
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                }}
                            />
                            <div
                                className="animate-pulse rounded flex-1"
                                style={{
                                    width: '60%',
                                    height: isMobile ? 24 : 28,
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                }}
                            />
                            <div
                                className="rounded-full flex-shrink-0 animate-pulse"
                                style={{
                                    width: isMobile ? 30 : 34,
                                    height: isMobile ? 30 : 34,
                                    backgroundColor: 'rgba(255,255,255,0.1)',
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
