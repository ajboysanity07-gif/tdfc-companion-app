import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useMyTheme } from '@/hooks/use-mytheme';

type Props = {
    showMessage?: boolean;
};

const DesktopPanelSkeleton: React.FC<Props> = ({ showMessage = false }) => {
    const tw = useMyTheme();
    const skeletonBg = tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

    if (showMessage) {
        return (
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                textAlign: 'center',
                gap: 1
            }}>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    Select a loan action
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Choose Schedule or Payments to view details.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', p: 2 }}>
            {/* Header skeleton */}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Box 
                    sx={{ 
                        width: 200,
                        height: 28,
                        bgcolor: skeletonBg,
                        borderRadius: 1,
                        animation: 'pulse 1.5s ease-in-out infinite',
                        '@keyframes pulse': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: 0.5 },
                        },
                    }} 
                />
                <Box 
                    sx={{ 
                        width: 80,
                        height: 36,
                        bgcolor: skeletonBg,
                        borderRadius: 1,
                        animation: 'pulse 1.5s ease-in-out infinite',
                        animationDelay: '0.1s',
                    }} 
                />
            </Stack>

            {/* Content skeleton */}
            <Stack spacing={1}>
                {Array.from({ length: 8 }).map((_, idx) => (
                    <Box
                        key={idx}
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(5, 1fr)',
                            gap: 2,
                            p: 2,
                            bgcolor: tw.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                            borderRadius: 1,
                            animation: 'pulse 1.5s ease-in-out infinite',
                            animationDelay: `${idx * 0.05}s`,
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

export default DesktopPanelSkeleton;
