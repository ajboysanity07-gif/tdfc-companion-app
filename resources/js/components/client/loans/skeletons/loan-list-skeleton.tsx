import React from 'react';
import { Box, Stack } from '@mui/material';
import { useMyTheme } from '@/hooks/use-mytheme';

export const LOAN_LIST_SKELETON_COUNT = 4;

type Props = {
    itemCount?: number;
    desktopMode?: boolean;
};

const LoanListSkeleton: React.FC<Props> = ({ itemCount = LOAN_LIST_SKELETON_COUNT, desktopMode = false }) => {
    const tw = useMyTheme();
    const cardBg = tw.isDark ? '#3a3a3a' : 'rgba(0,0,0,0.04)';
    const skeletonBg = tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
    const safeItemCount = Math.max(itemCount, 1);

    return (
        <>
            {/* Header skeleton */}
            <Box sx={{ mb: 3 }}>
                <Box 
                    sx={{ 
                        width: desktopMode ? '60%' : '50%',
                        height: 32,
                        bgcolor: skeletonBg,
                        borderRadius: 1,
                        mb: 2,
                        animation: 'pulse 1.5s ease-in-out infinite',
                        '@keyframes pulse': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: 0.5 },
                        },
                    }} 
                />
                <Box 
                    sx={{ 
                        width: '100%',
                        height: 40,
                        bgcolor: skeletonBg,
                        borderRadius: 2,
                        animation: 'pulse 1.5s ease-in-out infinite',
                    }} 
                />
            </Box>

            <Stack spacing={2} width="100%">
                {Array.from({ length: safeItemCount }).map((_, idx) => (
                    <Box
                        key={idx}
                        sx={{
                            width: '100%',
                            borderRadius: 2,
                            bgcolor: cardBg,
                            border: 'none',
                            p: 2.5,
                            animation: 'pulse 1.5s ease-in-out infinite',
                            animationDelay: `${idx * 0.1}s`,
                        }}
                    >
                        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
                            {/* Left side - Loan info */}
                            <Stack spacing={0.5} flex={1}>
                                {/* Loan Title */}
                                <Box 
                                    sx={{ 
                                        width: '60%',
                                        height: 22,
                                        bgcolor: skeletonBg,
                                        borderRadius: 1,
                                    }} 
                                />
                                
                                {/* Loan Number */}
                                <Box 
                                    sx={{ 
                                        width: '70%',
                                        height: 18,
                                        bgcolor: skeletonBg,
                                        borderRadius: 1,
                                        mt: 0.5,
                                    }} 
                                />
                                
                                {/* Balance */}
                                <Box 
                                    sx={{ 
                                        width: '55%',
                                        height: 20,
                                        bgcolor: skeletonBg,
                                        borderRadius: 1,
                                        mt: 1,
                                    }} 
                                />
                                
                                {/* Date */}
                                <Box 
                                    sx={{ 
                                        width: '40%',
                                        height: 18,
                                        bgcolor: skeletonBg,
                                        borderRadius: 1,
                                    }} 
                                />
                            </Stack>

                            {/* Right side - Action buttons */}
                            <Stack direction="column" spacing={1} sx={{ minWidth: 120 }}>
                                <Box 
                                    sx={{ 
                                        height: 32,
                                        bgcolor: skeletonBg,
                                        borderRadius: 6,
                                    }} 
                                />
                                <Box 
                                    sx={{ 
                                        height: 32,
                                        bgcolor: skeletonBg,
                                        borderRadius: 6,
                                    }} 
                                />
                                <Box 
                                    sx={{ 
                                        height: 32,
                                        bgcolor: skeletonBg,
                                        borderRadius: 6,
                                    }} 
                                />
                            </Stack>
                        </Stack>
                    </Box>
                ))}
            </Stack>
        </>
    );
};

export default LoanListSkeleton;
