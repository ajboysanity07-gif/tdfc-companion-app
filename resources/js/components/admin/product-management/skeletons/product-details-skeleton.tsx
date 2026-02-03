import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useMyTheme } from '@/hooks/use-mytheme';

const ProductDetailsSkeleton: React.FC = () => {
    const tw = useMyTheme();
    const isMobile = useMediaQuery('(max-width: 600px)');
    const panelBg = tw.isDark ? '#262626' : '#FAFAFA';

    return (
        <Box
            sx={{
                flex: 1,
                borderRadius: 3,
                p: isMobile ? 2.5 : 3,
                bgcolor: tw.isDark ? '#171717' : '#FAFAFA',
                boxShadow: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}
        >
            <Skeleton variant="text" width="55%" height={isMobile ? 32 : 36} sx={{ alignSelf: 'center', borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={2} width="80%" sx={{ alignSelf: 'center', borderRadius: 1 }} />

            <Stack spacing={1.2} sx={{ bgcolor: panelBg, borderRadius: 2.5, p: isMobile ? 2 : 2.5, border: tw.isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' }}>
                <Skeleton variant="text" width="70%" height={24} />
                <Skeleton variant="rounded" height={44} />
                <Skeleton variant="rounded" height={44} />
                <Skeleton variant="rounded" height={44} />
                <Skeleton variant="rounded" height={120} />
            </Stack>

            <Stack direction={isMobile ? 'column' : 'row'} spacing={1.2} sx={{ mt: 'auto' }}>
                <Skeleton variant="rounded" height={50} width="100%" sx={{ borderRadius: 999 }} />
                <Skeleton variant="rounded" height={50} width="100%" sx={{ borderRadius: 999 }} />
            </Stack>
        </Box>
    );
};

export default ProductDetailsSkeleton;
