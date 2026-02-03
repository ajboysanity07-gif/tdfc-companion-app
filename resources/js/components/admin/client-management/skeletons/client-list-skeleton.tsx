import React from 'react';
import { Box, Skeleton, Stack, useMediaQuery } from '@mui/material';
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

    const containerStyles = {
        p: isMobile ? 1 : 1.5,
        borderRadius: 2,
        bgcolor: tw.isDark ? '#171717' : '#FAFAFA',
        border: tw.isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
        flex: fullHeight ? 1 : 'unset',
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? 1 : 1.25,
    } as const;

    return (
        <Stack spacing={isMobile ? 1.1 : 1.6} sx={fullHeight ? { flex: 1, minHeight: '100%', alignItems: 'stretch' } : undefined}>
            {showTabs ? (
                <Stack direction="row" spacing={1} justifyContent="space-between" sx={{ px: 0.5 }}>
                    {[1, 2, 3].map((idx) => (
                        <Skeleton
                            key={idx}
                            variant="rounded"
                            height={isMobile ? 32 : 36}
                            width="100%"
                            sx={{ borderRadius: 1.5 }}
                        />
                    ))}
                </Stack>
            ) : null}

            <Box sx={containerStyles}>
                <Skeleton variant="rounded" height={48} sx={{ borderRadius: 1.5 }} />

                <Stack spacing={isMobile ? 1 : 1.1} sx={{ mt: 0.5 }}>
                    {Array.from({ length: safeItemCount }).map((_, idx) => (
                        <Stack
                            key={idx}
                            direction="row"
                            spacing={isMobile ? 1.1 : 1.25}
                            alignItems="center"
                            sx={{
                                bgcolor: tw.isDark ? '#262626' : '#FFFFFF',
                                border: tw.isDark ? '1px solid #3a3a3a' : '1px solid #e5e5e5',
                                borderRadius: isMobile ? 2 : 2.5,
                                px: isMobile ? 1.25 : 1.5,
                                py: isMobile ? 1 : 1.2,
                            }}
                        >
                            <Skeleton variant="circular" width={isMobile ? 44 : 52} height={isMobile ? 44 : 52} />
                            <Skeleton variant="text" width="60%" height={isMobile ? 24 : 28} sx={{ borderRadius: 1 }} />
                            <Skeleton variant="circular" width={isMobile ? 30 : 34} height={isMobile ? 30 : 34} sx={{ ml: 'auto' }} />
                        </Stack>
                    ))}
                </Stack>
            </Box>
        </Stack>
    );
};

export default ClientListSkeleton;
