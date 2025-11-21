import React from 'react';
import { Box, Skeleton, useTheme } from '@mui/material';

const UserAccordionListSkeleton: React.FC<{ rows?: number; minHeight?: number }> = ({ rows = 8, minHeight = 320 }) => {
  const theme = useTheme();
  const paperBg = theme.palette.background.paper;

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minHeight,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'stretch',
        gap: 1,
      }}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <Box
          key={i}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 2,
            py: 1.25,
            bgcolor: paperBg,
            borderRadius: 2,
            flex: 1,
            minHeight: 48,
          }}
        >
          <Skeleton variant="circular" width={38} height={38} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="35%" height={14} />
          </Box>
          <Skeleton variant="circular" width={22} height={22} />
        </Box>
      ))}
    </Box>
  );
};

export default UserAccordionListSkeleton;
