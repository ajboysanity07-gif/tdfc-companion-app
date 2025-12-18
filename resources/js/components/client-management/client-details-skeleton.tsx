import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';

const ClientDetailsSkeleton: React.FC = () => {
    return (
        <Stack
            spacing={3}
            alignItems="center"
            sx={{
                width: '100%',
                maxWidth: 900,
                mx: 'auto',
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.08)',
            }}
        >
            <Skeleton variant="text" width={220} height={32} />
            <Box
                sx={{
                    width: '100%',
                    borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.08)',
                    p: { xs: 2, sm: 3 },
                }}
            >
                <Stack spacing={2} alignItems="center">
                    <Skeleton variant="circular" width={120} height={120} />
                    <Skeleton variant="text" width={160} height={24} />
                    <Skeleton variant="rounded" width="100%" height={48} />
                    <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                        <Skeleton variant="rounded" width="50%" height={64} />
                        <Skeleton variant="rounded" width="50%" height={64} />
                    </Stack>
                    <Skeleton variant="text" width={190} height={26} />
                    <Stack spacing={1.5} sx={{ width: '100%' }}>
                        {[1, 2].map((key) => (
                            <Box
                                key={key}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    border: '1px solid rgba(255,255,255,0.08)',
                                }}
                            >
                                <Skeleton variant="text" width="40%" height={22} />
                                <Skeleton variant="text" width="70%" height={18} />
                                <Skeleton variant="text" width="50%" height={18} />
                                <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
                                    <Skeleton variant="rounded" width={110} height={38} />
                                    <Skeleton variant="rounded" width={110} height={38} />
                                </Stack>
                            </Box>
                        ))}
                    </Stack>
                </Stack>
            </Box>
        </Stack>
    );
};

export default ClientDetailsSkeleton;
