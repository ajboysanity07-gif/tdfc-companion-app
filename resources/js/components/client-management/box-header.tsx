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
    <Stack spacing={0.5} sx={{ pb: 1, mb: 2, width: '100%', alignItems: 'center' }}>
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
    </Stack>
  );
};

export default BoxHeader;
