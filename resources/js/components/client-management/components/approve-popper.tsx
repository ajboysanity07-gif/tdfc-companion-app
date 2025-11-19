import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Popper, ClickAwayListener, useTheme, alpha } from '@mui/material';
import type { PendingUser } from '@/types/user';
import { motion, AnimatePresence } from 'framer-motion';

interface ApprovePopperProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  user: PendingUser | null;
  isMobile: boolean;
  processing: boolean;
  onCancel: () => void;
  onApprove: () => void;
}

const ApprovePopper: React.FC<ApprovePopperProps> = ({
  open,
  anchorEl,
  user,
  isMobile,
  processing,
  onCancel,
  onApprove,
}) => {
  const [showContent, setShowContent] = useState(open);
  const theme = useTheme();
  const popperBg =
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.96)
      : theme.palette.background.paper;
  const borderColor =
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.divider, 0.32)
      : '#eee';

  useEffect(() => {
    setShowContent(open);
  }, [open, anchorEl]);

  const handleExited = () => {
    onCancel();
  };

  const handleClickAway = () => {
    setShowContent(false);
  };

  if (!anchorEl) return null;

  return (
    <Popper open={true} anchorEl={anchorEl} placement="top" style={{ zIndex: 2200 }}>
      <ClickAwayListener onClickAway={handleClickAway}>
        <div>
          <AnimatePresence onExitComplete={handleExited}>
            {showContent && (
              <motion.div
                key="popper-content"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ type: 'spring', stiffness: 400, damping: 35, duration: 0.22 }}
                style={{ position: 'relative' }}
              >
                <Box
                  sx={{
                    p: isMobile ? 2.2 : 3,
                    bgcolor: popperBg,
                    borderRadius: 2,
                    boxShadow: 3,
                    minWidth: isMobile ? 180 : 250,
                    border: `1.5px solid ${borderColor}`,
                    position: 'relative',
                  }}
                >
                  <Typography sx={{ fontWeight: 500 }}>
                    Approve registration for
                  </Typography>
                  <Typography sx={{ fontWeight: 700, ml: isMobile ? 2 : 3 }}>
                    {user?.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button onClick={handleClickAway} disabled={processing}>
                      Cancel
                    </Button>
                    <Button
                      onClick={onApprove}
                      color="success"
                      variant="contained"
                      disabled={processing}
                    >
                      Yes
                    </Button>
                  </Box>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ClickAwayListener>
    </Popper>
  );
};

export default ApprovePopper;
