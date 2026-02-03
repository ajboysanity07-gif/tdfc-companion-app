import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';
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
    const cardBg = tw.isDark ? '#2f2f2f' : '#f7f7f7';
    const cardBorder = tw.isDark ? '#3a3a3a' : '#e5e5e5';
    const safeItemCount = Math.max(itemCount ?? PRODUCT_LIST_PAGE_SIZE, 1);

    return (
        <Stack spacing={isMobile ? 1.2 : 1.6} sx={fullHeight ? { flex: 1, minHeight: '100%' } : undefined}>
            <Skeleton variant="text" width={140} height={isMobile ? 32 : 38} sx={{ borderRadius: 1.5 }} />
            <Skeleton variant="rounded" height={48} sx={{ borderRadius: 1.5 }} />

            <Box
                sx={{
                    p: isMobile ? 1 : 1.5,
                    borderRadius: 2,
                    bgcolor: panelBg,
                    border: tw.isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
                    flex: fullHeight ? 1 : 'unset',
                }}
            >
                <Stack spacing={isMobile ? 1 : 1.2}>
                    {Array.from({ length: safeItemCount }).map((_, idx) => (
                        <Stack
                            key={idx}
                            direction="row"
                            spacing={isMobile ? 1.2 : 1.4}
                            alignItems="center"
                            sx={{
                                bgcolor: cardBg,
                                border: `1px solid ${cardBorder}`,
                                borderRadius: isMobile ? 2 : 2.5,
                                px: isMobile ? 1.5 : 1.75,
                                py: isMobile ? 1 : 1.2,
                            }}
                        >
                            <Skeleton variant="circular" width={36} height={22} sx={{ borderRadius: 999 }} />
                            <Stack spacing={0.4} sx={{ flex: 1 }}>
                                <Skeleton variant="text" width="60%" height={isMobile ? 20 : 24} />
                                <Stack direction="row" spacing={0.6}>
                                    <Skeleton variant="rounded" width={52} height={18} sx={{ borderRadius: 999 }} />
                                    <Skeleton variant="rounded" width={64} height={18} sx={{ borderRadius: 999 }} />
                                </Stack>
                            </Stack>
                            <Skeleton variant="circular" width={isMobile ? 30 : 34} height={isMobile ? 30 : 34} />
                        </Stack>
                    ))}
                </Stack>
            </Box>
        </Stack>
    );
};

export default ProductListSkeleton;
