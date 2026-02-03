import React from 'react';
import { Box, Stack } from '@mui/material';
import { useMediaQuery } from '@/hooks/use-media-query';

const LoanCalculatorSkeleton: React.FC = () => {
    const isMobile = useMediaQuery('(max-width:900px)');
    const skeletonBg = 'rgba(255,255,255,0.08)';

    return (
        <Box sx={{ minHeight: isMobile ? 'auto' : 845 }}>
            <Stack spacing={isMobile ? 2.5 : 3}>
                {/* Product field */}
                <Box>
                    <Box sx={{ width: 80, height: 14, bgcolor: skeletonBg, borderRadius: 1, mx: 'auto', mb: 1.5 }} />
                    <Box sx={{ height: isMobile ? 44 : 53, bgcolor: skeletonBg, borderRadius: 3 }} />
                </Box>

                {/* Term in Months field */}
                <Box>
                    <Box sx={{ width: 130, height: 14, bgcolor: skeletonBg, borderRadius: 1, mx: 'auto', mb: 1.5 }} />
                    <Box sx={{ height: isMobile ? 44 : 53, bgcolor: skeletonBg, borderRadius: 3 }} />
                </Box>

                {/* Amortization field */}
                <Box>
                    <Box sx={{ width: 120, height: 14, bgcolor: skeletonBg, borderRadius: 1, mx: 'auto', mb: 1.5 }} />
                    <Box sx={{ height: isMobile ? 44 : 53, bgcolor: skeletonBg, borderRadius: 3 }} />
                </Box>

                {/* Old Balance field */}
                <Box>
                    <Box sx={{ width: 100, height: 14, bgcolor: skeletonBg, borderRadius: 1, mx: 'auto', mb: 1.5 }} />
                    <Box sx={{ height: isMobile ? 44 : 53, bgcolor: skeletonBg, borderRadius: 3 }} />
                </Box>

                {/* Due Amount (display box) */}
                <Box>
                    <Box sx={{ width: 110, height: 14, bgcolor: skeletonBg, borderRadius: 1, mx: 'auto', mb: 1.5 }} />
                    <Box sx={{ height: isMobile ? 70 : 80, bgcolor: skeletonBg, borderRadius: 2 }} />
                </Box>

                {/* Monthly Payment (display box) */}
                <Box>
                    <Box sx={{ width: 200, height: 14, bgcolor: skeletonBg, borderRadius: 1, mx: 'auto', mb: 1.5 }} />
                    <Box sx={{ height: isMobile ? 70 : 80, bgcolor: skeletonBg, borderRadius: 2 }} />
                </Box>

                {/* Net Proceeds (highlighted box) */}
                <Box sx={{ mt: 2 }}>
                    <Box sx={{ width: 180, height: 14, bgcolor: skeletonBg, borderRadius: 1, mx: 'auto', mb: 1.5 }} />
                    <Box sx={{ height: isMobile ? 88 : 100, bgcolor: skeletonBg, borderRadius: 2 }} />
                </Box>

                {/* Disclaimer text */}
                <Box>
                    <Box sx={{ width: '90%', height: 12, bgcolor: skeletonBg, borderRadius: 1, mx: 'auto' }} />
                    <Box sx={{ width: '85%', height: 12, bgcolor: skeletonBg, borderRadius: 1, mx: 'auto', mt: 0.5 }} />
                </Box>

                {/* Terms and Conditions - Desktop only */}
                {!isMobile && (
                    <Box>
                        <Box sx={{ width: 180, height: 14, bgcolor: skeletonBg, borderRadius: 1, mx: 'auto', mb: 1.5 }} />
                        <Box sx={{ height: 200, bgcolor: skeletonBg, borderRadius: 3 }} />
                    </Box>
                )}
            </Stack>
        </Box>
    );
};

export default LoanCalculatorSkeleton;
