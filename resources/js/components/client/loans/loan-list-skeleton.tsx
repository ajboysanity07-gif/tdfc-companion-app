import React from 'react';
import { Box, Stack, useMediaQuery, useTheme } from '@mui/material';
import { useMyTheme } from '../../../hooks/use-mytheme';

export const LOAN_LIST_SKELETON_COUNT = 4;

type Props = {
    itemCount?: number;
};

const LoanListSkeleton: React.FC<Props> = ({ itemCount }) => {
    const theme = useTheme();
    const tw = useMyTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const defaultCount = isMobile ? 3 : LOAN_LIST_SKELETON_COUNT;
    const safeItemCount = Math.max(itemCount ?? defaultCount, 1);
    
    // iOS-style colors with more depth
    const cardBg = tw.isDark 
        ? 'rgba(28, 28, 30, 0.8)' 
        : 'rgba(255, 255, 255, 0.95)';
    const skeletonBg = tw.isDark 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(0, 0, 0, 0.06)';
    const shadowColor = tw.isDark
        ? 'rgba(0, 0, 0, 0.5)'
        : 'rgba(0, 0, 0, 0.08)';

    return (
        <Stack spacing={3} width="100%">
            {Array.from({ length: safeItemCount }).map((_, idx) => (
                <Box
                    key={idx}
                    sx={{
                        width: '100%',
                        borderRadius: 4,
                        bgcolor: cardBg,
                        backdropFilter: 'blur(20px)',
                        boxShadow: `0 2px 16px ${shadowColor}, 0 1px 4px ${shadowColor}`,
                        p: { xs: 3, sm: 3.5 },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            bgcolor: tw.isDark ? 'rgba(38, 38, 40, 0.95)' : 'rgba(255, 255, 255, 1)',
                            boxShadow: `0 4px 24px ${shadowColor}, 0 2px 8px ${shadowColor}`,
                        },
                    }}
                >
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={{ xs: 3, sm: 4 }}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        justifyContent="space-between"
                    >
                        {/* Left side - Loan info */}
                        <Stack spacing={2} flex={1}>
                            {/* Loan Title */}
                            <Box 
                                sx={{ 
                                    width: isMobile ? '60%' : '45%',
                                    height: 26,
                                    bgcolor: skeletonBg,
                                    borderRadius: 2,
                                    animation: 'pulse 1.5s ease-in-out infinite',
                                    '@keyframes pulse': {
                                        '0%, 100%': { opacity: 1 },
                                        '50%': { opacity: 0.5 },
                                    },
                                }} 
                            />
                            
                            {/* Loan Number */}
                            <Box 
                                sx={{ 
                                    width: isMobile ? '70%' : '52%',
                                    height: 20,
                                    bgcolor: skeletonBg,
                                    borderRadius: 1.5,
                                    animation: 'pulse 1.5s ease-in-out 0.2s infinite',
                                    '@keyframes pulse': {
                                        '0%, 100%': { opacity: 1 },
                                        '50%': { opacity: 0.5 },
                                    },
                                }} 
                            />
                            
                            {/* Balance */}
                            <Box 
                                sx={{ 
                                    width: isMobile ? '50%' : '38%',
                                    height: 28,
                                    bgcolor: skeletonBg,
                                    borderRadius: 2,
                                    animation: 'pulse 1.5s ease-in-out 0.4s infinite',
                                    '@keyframes pulse': {
                                        '0%, 100%': { opacity: 1 },
                                        '50%': { opacity: 0.5 },
                                    },
                                }} 
                            />
                            
                            {/* Date */}
                            <Box 
                                sx={{ 
                                    width: isMobile ? '40%' : '30%',
                                    height: 18,
                                    bgcolor: skeletonBg,
                                    borderRadius: 1.5,
                                    animation: 'pulse 1.5s ease-in-out 0.6s infinite',
                                    '@keyframes pulse': {
                                        '0%, 100%': { opacity: 1 },
                                        '50%': { opacity: 0.5 },
                                    },
                                }} 
                            />
                        </Stack>

                        {/* Right side - Action buttons */}
                        <Stack 
                            direction="column" 
                            spacing={2} 
                            minWidth={{ xs: '100%', sm: 180 }}
                        >
                            <Box 
                                sx={{ 
                                    height: 44,
                                    bgcolor: skeletonBg,
                                    borderRadius: 3,
                                    animation: 'pulse 1.5s ease-in-out 0.3s infinite',
                                    '@keyframes pulse': {
                                        '0%, 100%': { opacity: 1 },
                                        '50%': { opacity: 0.5 },
                                    },
                                }} 
                            />
                            <Box 
                                sx={{ 
                                    height: 44,
                                    bgcolor: skeletonBg,
                                    borderRadius: 3,
                                    animation: 'pulse 1.5s ease-in-out 0.5s infinite',
                                    '@keyframes pulse': {
                                        '0%, 100%': { opacity: 1 },
                                        '50%': { opacity: 0.5 },
                                    },
                                }} 
                            />
                            <Box 
                                sx={{ 
                                    height: 44,
                                    bgcolor: skeletonBg,
                                    borderRadius: 3,
                                    animation: 'pulse 1.5s ease-in-out 0.7s infinite',
                                    '@keyframes pulse': {
                                        '0%, 100%': { opacity: 1 },
                                        '50%': { opacity: 0.5 },
                                    },
                                }} 
                            />
                        </Stack>
                    </Stack>
                </Box>
            ))}
        </Stack>
    );
};

export default LoanListSkeleton;
