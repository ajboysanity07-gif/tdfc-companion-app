import React from 'react';
import { Box, Divider, Skeleton, Stack } from '@mui/material';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useMyTheme } from '@/hooks/use-mytheme';

const ClientDashboardSkeleton: React.FC = () => {
    const tw = useMyTheme();
    const isMobile = useMediaQuery('(max-width:900px)');
    const surface = tw.isDark ? '#2f2f2f' : '#f5f5f5';
    const borderColor = tw.isDark ? '#3a3a3a' : '#e5e7eb';
    const actionCount = isMobile ? 2 : 3;
    const rowCount = isMobile ? 4 : 5;

    return (
        <Stack spacing={2}>
            <Box
                sx={{
                    borderRadius: 3,
                    p: { xs: 2.5, sm: 3 },
                    backgroundColor: surface,
                    border: `1px solid ${borderColor}`,
                    boxShadow: tw.isDark ? '0 12px 30px rgba(0,0,0,0.3)' : '0 12px 30px rgba(15,23,42,0.08)',
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                        <Skeleton variant="circular" width={isMobile ? 56 : 72} height={isMobile ? 56 : 72} />
                        <Stack spacing={1} sx={{ minWidth: 0 }}>
                            <Skeleton variant="text" width={90} height={16} />
                            <Skeleton variant="text" width={isMobile ? 120 : 160} height={isMobile ? 28 : 32} />
                            <Skeleton variant="rounded" width={110} height={22} sx={{ borderRadius: 999 }} />
                        </Stack>
                    </Stack>
                    {!isMobile && <Skeleton variant="circular" width={64} height={64} />}
                </Stack>

                <Stack alignItems="center" spacing={1} sx={{ pt: 2 }}>
                    <Divider sx={{ width: '90%', borderColor }} />
                    <Skeleton variant="text" width={isMobile ? 160 : 200} height={isMobile ? 34 : 40} />
                    <Skeleton variant="text" width={120} height={16} />
                </Stack>
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    gap: 1.5,
                }}
            >
                {Array.from({ length: actionCount }).map((_, idx) => (
                    <Box
                        key={idx}
                        sx={{
                            borderRadius: 3,
                            border: `1px solid ${borderColor}`,
                            backgroundColor: surface,
                            p: { xs: 2.5, sm: 3 },
                            minHeight: 140,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Stack spacing={1.25} alignItems="center" sx={{ width: '100%' }}>
                            <Skeleton variant="circular" width={64} height={64} />
                            <Skeleton variant="text" width="60%" height={24} />
                            {!isMobile && <Skeleton variant="text" width="80%" height={16} />}
                        </Stack>
                    </Box>
                ))}
            </Box>

            <Box
                sx={{
                    borderRadius: 2,
                    border: `1px solid ${borderColor}`,
                    backgroundColor: surface,
                    p: { xs: 2, md: 3 },
                    boxShadow: tw.isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
                }}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Skeleton variant="text" width="45%" height={26} />
                    <Skeleton variant="rounded" width={70} height={28} sx={{ borderRadius: 999 }} />
                </Stack>
                <Divider sx={{ mb: 2, borderColor }} />

                <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Skeleton variant="circular" width={8} height={8} />
                        <Skeleton variant="text" width={90} height={16} />
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Skeleton variant="circular" width={8} height={8} />
                        <Skeleton variant="text" width={110} height={16} />
                    </Stack>
                </Stack>

                <Stack spacing={1.5}>
                    {Array.from({ length: rowCount }).map((_, idx) => (
                        <Stack key={idx} direction="row" alignItems="center" justifyContent="space-between" spacing={2} py={1}>
                            <Stack spacing={0.6}>
                                <Skeleton variant="text" width={140} height={20} />
                                <Skeleton variant="text" width={100} height={16} />
                            </Stack>
                            <Stack spacing={0.6} alignItems="flex-end">
                                <Skeleton variant="text" width={90} height={20} />
                                <Skeleton variant="text" width={80} height={16} />
                            </Stack>
                        </Stack>
                    ))}
                </Stack>

                <Stack spacing={1} sx={{ pt: 2, borderTop: `1px solid ${borderColor}` }}>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        justifyContent="space-between"
                    >
                        <Skeleton variant="rounded" width={140} height={32} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="text" width={140} height={16} />
                    </Stack>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Skeleton variant="rounded" width={180} height={32} sx={{ borderRadius: 999 }} />
                    </Box>
                </Stack>
            </Box>
        </Stack>
    );
};

export default ClientDashboardSkeleton;
