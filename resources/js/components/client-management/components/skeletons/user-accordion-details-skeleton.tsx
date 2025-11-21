import React from 'react';
import { Box, Skeleton } from '@mui/material';

const UserAccordionDetailsSkeleton: React.FC<{ minHeight?: number }> = ({ minHeight = 240 }) => (
  <Box sx={{ px: { xs: 0.5, sm: 2 }, py: { xs: 0.7, sm: 1.25 }, width: '100%', minHeight }}>
    {/* Header line */}
    <Skeleton variant="text" width="45%" height={24} sx={{ mb: 2, mx: 'auto' }} />

    {/* Details rows, e.g. Email, Phone */}
    {[1, 2, 3, 4].map((_, i) => (
      <Box key={i} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Skeleton variant="circular" width={20} height={20} />
        <Skeleton variant="text" width="25%" height={18} />
        <Skeleton variant="text" width="55%" height={18} />
      </Box>
    ))}

    {/* Thumbnails */}
    <Box sx={{ display: 'flex', gap: 2, mb: 3, mt: 2 }}>
      <Skeleton variant="rectangular" width={80} height={40} sx={{ borderRadius: 2 }} />
      <Skeleton variant="rectangular" width={80} height={40} sx={{ borderRadius: 2 }} />
    </Box>

    {/* Chip/Badge skeleton */}
    <Box sx={{ textAlign: 'center', mb: 2 }}>
      <Skeleton variant="rounded" width={96} height={28} sx={{ mx: 'auto', borderRadius: 15 }} />
    </Box>

    {/* Action buttons */}
    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
      <Skeleton variant="rectangular" width={110} height={38} sx={{ borderRadius: 7 }} />
      <Skeleton variant="rectangular" width={110} height={38} sx={{ borderRadius: 7 }} />
    </Box>
  </Box>
);

export default UserAccordionDetailsSkeleton;
