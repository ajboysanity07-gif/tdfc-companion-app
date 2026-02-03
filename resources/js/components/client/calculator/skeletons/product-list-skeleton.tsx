import React from 'react';
import { Box, Paper, Skeleton, Stack } from '@mui/material';
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
        <Stack spacing={isMobile ? 1 : 1.25}>
            {Array.from({ length: safeItemCount }).map((_, idx) => (
                <Paper
                    key={idx}
                    elevation={2}
                    sx={{
                        borderRadius: isMobile ? 2 : 2.5,
                        overflow: 'hidden',
                        bgcolor: cardBg,
                        border: `2px solid ${cardBorder}`,
                    }}
                >
                    <Box sx={{ px: isMobile ? 1.5 : 2, py: isMobile ? 1 : 1.5 }}>
                        <Stack sx={{ width: '100%', alignItems: 'center', textAlign: 'center' }} spacing={0.8}>
                            <Skeleton variant="text" width={isMobile ? '70%' : '60%'} height={isMobile ? 22 : 26} />
                            <Stack direction="row" spacing={0.5} justifyContent="center" flexWrap="wrap">
                                <Skeleton variant="rounded" width={52} height={20} sx={{ borderRadius: 999 }} />
                                <Skeleton variant="rounded" width={64} height={20} sx={{ borderRadius: 999 }} />
                                <Skeleton variant="rounded" width={48} height={20} sx={{ borderRadius: 999 }} />
                            </Stack>
                        </Stack>
                    </Box>
                </Paper>
            ))}
        </Stack>
    );
};

export default ProductListSkeleton;
