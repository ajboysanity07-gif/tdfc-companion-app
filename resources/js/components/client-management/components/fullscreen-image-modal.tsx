import React from 'react';
import { PendingUser } from '@/types/user';
import { alpha, useTheme } from '@mui/material/styles';
import { AnimatePresence, motion } from 'framer-motion';
import Box from '@mui/material/Box';

interface FullScreenImageModalProps {
  open: boolean;
  imageUrl: string | null;
  title: string;
  modalImagesUser: PendingUser | null;
  isMobile: boolean;
  onClose: () => void;
}

const FullScreenImageModal: React.FC<FullScreenImageModalProps> = ({
  open,
  imageUrl,
  title,
  modalImagesUser,
  isMobile,
  onClose,
}) => {
  const theme = useTheme();
  if (!open || !imageUrl) return null;

  const showPrCpair = imageUrl === 'prc-both' && modalImagesUser;
  const docFallback = '/images/prc-sample-front.png';
  const prcFrontSrc = showPrCpair && modalImagesUser
    ? `/storage/${modalImagesUser.prc_id_photo_front}` : null

  const prcBackSrc = showPrCpair && modalImagesUser
    ? `/storage/${modalImagesUser.prc_id_photo_back}` : null;
  const modalImgMaxWidth = showPrCpair
    ? isMobile
      ? '88vw'
      : '42vw'
    : isMobile
      ? '92vw'
      : '86vw';
  const modalImgMaxHeight = isMobile ? '70vh' : '82vh';

  // Styles for overlay/background
  const overlayColor =
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.default, 0.77)
      : alpha(theme.palette.background.default, 0.85);

  // Header and close button
  const headerSx = {
    position: 'absolute',
    left: isMobile ? 20 : 46,
    top: isMobile ? 18 : 28,
    color: theme.palette.text.primary,
    fontWeight: 900,
    fontSize: isMobile ? 26 : 36,
    letterSpacing: '0.01em',
    zIndex: 1501,
    margin: 0,
    pointerEvents: 'none',
  };

  const closeSx = {
    position: 'absolute',
    right: isMobile ? 16 : 48,
    top: isMobile ? 18 : 26,
    color: theme.palette.text.primary,
    fontWeight: 500,
    fontSize: isMobile ? 20 : 27,
    cursor: 'pointer',
    userSelect: 'none',
    background: 'none',
    border: 'none',
    zIndex: 1501,
    padding: '4px 12px',
    transition: 'color 0.15s',
    '&:hover': {
      transform: 'scale(1.037)',
      color: theme.palette.secondary.main,
    },
  };

  // Centered content flex styles
  const centeredContentSx = {
    position: 'absolute',
    left: '50%',
    top: '53%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: showPrCpair && isMobile ? 'column' : showPrCpair ? 'row' : 'column',
    gap: showPrCpair ? (isMobile ? 4 : 10) : 0,
    zIndex: 10,
    padding: 0,
  };

  // Wrapper for each image+label
  const imageWrapperSx = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    gap: 1.5,
    m: showPrCpair && !isMobile ? 1.8 : 0.8,
    width: '100%',
    maxWidth: modalImgMaxWidth,
    padding: 0,
    '&:hover .fs-img': {
      transform: 'scale(1.02)',
      boxShadow: theme.palette.mode === 'dark'
        ? '0 20px 50px rgba(0,0,0,0.48), 0 0 0 1px rgba(255,255,255,0.12)'
        : '0 22px 54px rgba(15,23,42,0.22), 0 0 0 1px rgba(255,255,255,0.3)',
    },
    '&:hover .img-label': {
      transform: 'scale(1.02)',
      opacity: 1,
    },
  };

  // Image itself
  const imgSx = {
    display: 'block',
    width: '100%',
    maxWidth: '100%',
    height: 'auto',
    maxHeight: modalImgMaxHeight,
    objectFit: 'contain',
    background: 'transparent',
    borderRadius: 5,
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    transformOrigin: 'center',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 18px 44px rgba(0,0,0,0.42), 0 0 0 1px rgba(255,255,255,0.08)'
      : '0 18px 44px rgba(15,23,42,0.18), 0 0 0 1px rgba(255,255,255,0.25)',
  };

  // Label for the image
  const labelSx = {
    color: theme.palette.text.primary,
    fontWeight: 550,
    fontSize: isMobile ? 19 : 28,
    mt: 1,
    textAlign: 'center',
    letterSpacing: '0.01em',
    opacity: 0.98,
    transition: 'color 0.18s, text-shadow 0.18s, transform 0.18s',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999,
          background: overlayColor,
          backdropFilter: 'blur(11px)',
          WebkitBackdropFilter: 'blur(11px)',
          width: '100vw',
          height: '100vh',
          overflow: 'auto',
        }}
        onClick={onClose}
      >
        <Box component="span" sx={headerSx}>
          {title}
        </Box>
        <Box
          component="button"
          sx={closeSx}
          aria-label="Close"
          onClick={onClose}
        >
          Close&nbsp;×
        </Box>
        <Box sx={centeredContentSx} onClick={e => e.stopPropagation()}>
          {showPrCpair && modalImagesUser ? (
            <>
              <Box sx={imageWrapperSx}>
              <Box
                  component="img"
                  className="fs-img"
                  src={prcFrontSrc || docFallback}
                  alt="PRC Front"
                  sx={imgSx}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = docFallback;
                  }}
                />
                <Box className="img-label" sx={labelSx}>Front</Box>
              </Box>
              <Box sx={imageWrapperSx}>
              <Box
                component="img"
                className="fs-img"
                src={prcBackSrc || docFallback}
                alt="PRC Back"
                sx={imgSx}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = docFallback;
                  }}
                />
                <Box className="img-label" sx={labelSx}>Back</Box>
              </Box>
            </>
          ) : (
            <Box sx={imageWrapperSx}>
              <Box
                component="img"
                className="fs-img"
                src={imageUrl as string}
                alt={title}
                sx={imgSx}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  (e.currentTarget as HTMLImageElement).src = docFallback;
                }}
              />
              {/* Optional: Single image label if desired */}
            </Box>
          )}
        </Box>
      </motion.div>
    </AnimatePresence>
  );
};

export default FullScreenImageModal;
