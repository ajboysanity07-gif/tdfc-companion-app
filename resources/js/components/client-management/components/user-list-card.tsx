import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

export interface UserListCardProps {
  title: string;
  titleColor: string;
  userCount: number;
  children: React.ReactNode;
  sx?: object;
  className?: string;
}

const UserListCard: React.FC<UserListCardProps> = ({
  title,
  titleColor,
  userCount,
  children,
  sx,
  className,
}) => {
  const theme = useTheme();

  return (
    <Box
      className={className}
      sx={{
        bgcolor: theme.palette.background.paper,
        borderRadius: { xs: 2, sm: 4, md: 5 },
        minHeight: { xs: 180, md: 340 },
        width: '100%',
        maxWidth: { xs: '100%', sm: 650, md: '100%' },
        display: 'flex',
        flexDirection: 'column',
        flex: 1, // Ensure this card stretches in parent Flex/Grid
        p: 2,    // Consistent content padding
        transition: 'background-color 0.3s',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        ...(sx || {}),
      }}
    >
      <Typography
        sx={{
          color: titleColor,
          fontWeight: 800,
          fontSize: { xs: '1rem', sm: '1.08rem', md: '1.2rem' },
          textTransform: 'uppercase',
          letterSpacing: 1,
          mb: { xs: 0.9, md: 1.5 },
          px: 0.5,
          wordBreak: 'break-word',
        }}
      >
        {title} ({userCount})
      </Typography>
      <Box flex={1} display="flex" flexDirection="column">
        {children}
      </Box>
    </Box>
  );
};

export default UserListCard;
