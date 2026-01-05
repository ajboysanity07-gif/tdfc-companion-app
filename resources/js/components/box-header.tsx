import { Stack, Typography, useTheme } from '@mui/material';
import React from 'react';

type Props = {
  title: string;
  subtitle?: string;
};

const BoxHeader: React.FC<Props> = ({ title, subtitle }) => {
  const theme = useTheme();
  const accent = theme.palette.primary.main;

  return (
    <Stack spacing={0.5} sx={{ pb: 1, mb: 2 }}>
      <Typography
        variant="h4"
        fontWeight={800}
        sx={{ letterSpacing: 0.3, color: accent }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
      {/* Apple-style slim separator line */}
      <Stack sx={{ pt: 0.75 }}>
        <Stack
          sx={{
            height: 2,
            borderRadius: 999,
            bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300],
          }}
        />
      </Stack>
    </Stack>
  );
};

export default BoxHeader;
