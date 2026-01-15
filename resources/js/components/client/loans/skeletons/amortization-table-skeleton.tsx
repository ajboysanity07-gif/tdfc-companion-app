import React from 'react';
import { Box, Stack } from '@mui/material';
import { useMyTheme } from '@/hooks/use-mytheme';

type Props = {
    rowCount?: number;
};

const AmortizationTableSkeleton: React.FC<Props> = ({ rowCount = 10 }) => {
    const tw = useMyTheme();
    const skeletonBg = tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
    const cardBg = tw.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';

    return (
        <Box sx={{ width: '100%' }}>
            {/* Table Header */}
            <Box 
                sx={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 2,
                    p: 2,
                    bgcolor: cardBg,
                    borderRadius: 1,
                    mb: 1,
                }}
            >
                {Array.from({ length: 5 }).map((_, idx) => (
                    <Box
                        key={idx}
                        sx={{
                            height: 20,
                            bgcolor: skeletonBg,
                            borderRadius: 1,
                            animation: 'pulse 1.5s ease-in-out infinite',
                        }}
                    />
                ))}
            </Box>

            {/* Table Rows */}
            <Stack spacing={0.5}>
                {Array.from({ length: rowCount }).map((_, idx) => (
                    <Box
                        key={idx}
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(5, 1fr)',
                            gap: 2,
                            p: 2,
                            bgcolor: cardBg,
                            borderRadius: 1,
                            animation: 'pulse 1.5s ease-in-out infinite',
                            animationDelay: `${idx * 0.05}s`,
                            '@keyframes pulse': {
                                '0%, 100%': { opacity: 1 },
                                '50%': { opacity: 0.5 },
                            },
                        }}
                    >
                        {Array.from({ length: 5 }).map((_, colIdx) => (
                            <Box
                                key={colIdx}
                                sx={{
                                    height: 18,
                                    bgcolor: skeletonBg,
                                    borderRadius: 1,
                                }}
                            />
                        ))}
                    </Box>
                ))}
            </Stack>
        </Box>
    );
};

export default AmortizationTableSkeleton;
