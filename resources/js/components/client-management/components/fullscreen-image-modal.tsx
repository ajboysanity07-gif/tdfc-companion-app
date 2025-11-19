import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PendingUser } from '@/types/user';

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
  if (!open || !imageUrl) return null;

  const showPrCpair = imageUrl === 'prc-both' && modalImagesUser;

  // Overlay
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 999,
    background: 'rgba(18,22,36,0.67)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    width: '100vw',
    height: '100vh',
    overflow: 'auto',
  };

  // Header top left
  const headerStyle: React.CSSProperties = {
    position: 'absolute',
    left: isMobile ? 20 : 46,
    top: isMobile ? 18 : 28,
    color: '#fff',
    fontWeight: 900,
    fontSize: isMobile ? 26 : 36,
    letterSpacing: '0.01em',
    zIndex: 1501,
    textShadow: '0 2px 14px #000a',
    margin: 0,
    pointerEvents: 'none',
  };

  // Close button top right
  const closeStyle: React.CSSProperties = {
    position: 'absolute',
    right: isMobile ? 16 : 48,
    top: isMobile ? 18 : 26,
    color: '#fff',
    fontWeight: 500,
    fontSize: isMobile ? 20 : 27,
    cursor: 'pointer',
    userSelect: 'none',
    background: 'none',
    border: 'none',
    zIndex: 1501,
    textShadow: '0 2px 10px #000a',
    padding: '4px 12px',
  };

  // Absolutely center images (and labels)
  const centeredContentStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '53%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: showPrCpair && isMobile ? 'column' : (showPrCpair ? 'row' : 'column'),
    gap: showPrCpair ? (isMobile ? 32 : 80) : 0,
    zIndex: 10,
    padding: isMobile ? '0 0' : '0 0',
  };

  const imgStyle: React.CSSProperties = {
    maxWidth: isMobile ? '92vw' : '660px',
    maxHeight: isMobile ? '29vh' : '70vh',
    borderRadius: 22,
    objectFit: 'cover',
    background: '#17171b',
  };

  const labelStyle: React.CSSProperties = {
    color: '#fff',
    fontWeight: 500,
    fontSize: isMobile ? 19 : 28,
    marginTop: 14,
    textAlign: 'center',
    letterSpacing: '0.01em',
    opacity: 0.98,
    textShadow: '0 1px 7px #000b',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={overlayStyle}
        onClick={onClose}
      >
        {/* Header top left, Close top right */}
        <span style={headerStyle}>{title}</span>
        <button style={closeStyle} aria-label="Close" onClick={onClose}>
          Close&nbsp;×
        </button>
        <div style={centeredContentStyle} onClick={e => e.stopPropagation()}>
          {showPrCpair && modalImagesUser ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={`/storage/${modalImagesUser.prc_id_photo_front}`}
                  alt="PRC Front"
                  style={imgStyle}
                  onError={e => { e.currentTarget.src = '/images/placeholder-document.png'; }}
                />
                <div style={labelStyle}>Front</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={`/storage/${modalImagesUser.prc_id_photo_back}`}
                  alt="PRC Back"
                  style={imgStyle}
                  onError={e => { e.currentTarget.src = '/images/placeholder-document.png'; }}
                />
                <div style={labelStyle}>Back</div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={imageUrl}
                alt={title}
                style={imgStyle}
                onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/placeholder-document.png'; }}
              />
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FullScreenImageModal;
