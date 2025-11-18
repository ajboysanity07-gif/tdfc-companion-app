import { AnimatePresence, motion } from 'framer-motion';
import { PendingUser } from '@/types';
import React from 'react';
import { FormGroup, FormControlLabel, Checkbox, useTheme, alpha } from '@mui/material';
import { XCircle } from 'lucide-react';

interface Props {
  open: boolean;
  user: PendingUser | null;
  rejectionReasons: { code: string; label: string }[];
  selectedReasons: string[];
  processing: boolean;
  onClose: () => void;
  onToggleReason: (code: string) => void;
  onSubmit: () => void;
}

const RejectModal: React.FC<Props> = ({
  open, user, rejectionReasons, selectedReasons, processing,
  onClose, onToggleReason, onSubmit,
}) => {
  const theme = useTheme();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 600;

  const modalBg = theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.paper, 0.98)
    : theme.palette.background.paper;
  const paperBorder = theme.palette.mode === 'dark'
    ? `1.5px solid ${alpha(theme.palette.divider, 0.24)}`
    : `1.5px solid ${theme.palette.divider}`;
  const fieldsetBg = theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.default, 0.93)
    : '#FAFBFB';
  const errorBg = theme.palette.mode === 'dark'
    ? alpha(theme.palette.error.main, 0.12)
    : '#FFF1F1';
  const errorBorder = theme.palette.mode === 'dark'
    ? alpha(theme.palette.error.main, 0.34)
    : '#F57979';

  return (
    <AnimatePresence>
      {open && user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-2 py-4"
          style={{
            background: theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.default, 0.95)
              : alpha('#22223A', 0.11),
            backdropFilter: 'blur(7px)',
            transition: 'background-color 0.3s'
          }}
          onClick={() => !processing && onClose()}
        >
          <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full"
            style={{
              maxWidth: isMobile ? 380 : 480,
              margin: isMobile ? '6vw' : '32px auto',
              borderRadius: 18,
              boxShadow: '0 12px 40px 0 rgba(18,22,29,0.23)',
              background: modalBg,
              border: paperBorder,
              padding: isMobile ? '18px 10px 16px 10px' : '34px 32px 24px 32px',
              minHeight: 320,
              color: theme.palette.text.primary,
              transition: 'background-color 0.3s, border-color 0.3s'
            }}
          >
            {/* Header Row */}
            <div className="flex items-center gap-2 mb-4" style={{ flexWrap: 'wrap', justifyContent: 'flex-start' }}>
              <XCircle style={{ color: theme.palette.error.main, width: isMobile ? 28 : 32, height: isMobile ? 28 : 32 }} />
              <h2
                style={{
                  fontSize: isMobile ? 17 : 20,
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  marginRight: 12,
                  letterSpacing: 0.6,
                  lineHeight: '1.122'
                }}
              >
                Reject Client Registration
              </h2>
            </div>
            <div style={{
              marginBottom: isMobile ? 12 : 18,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}></div>

            {/* LABEL: natural wrapping like a document */}
            <div style={{
              width: '100%',
              color: theme.palette.text.secondary,
              fontSize: isMobile ? 14.5 : 16,
              marginBottom: isMobile ? 10 : 14,
              lineHeight: 1.7,
              fontWeight: 400,
            }}>
              Please select at least one reason for rejecting{' '}
              <span style={{
                fontWeight: 700,
                fontSize: isMobile ? 16.5 : 19,
                color: theme.palette.text.primary,
                textTransform: 'uppercase',
              }}>
                {user?.name}
              </span>
            </div>

            <div
              style={{
                background: fieldsetBg,
                borderRadius: isMobile ? 12 : 16,
                border: `1.2px solid ${theme.palette.divider}`,
                padding: isMobile ? '13px 8px' : '18px 18px',
                marginBottom: isMobile ? 10 : 15
              }}
            >
              <FormGroup>
                {rejectionReasons.map((reason) => (
                  <FormControlLabel
                    key={reason.code}
                    sx={{
                      alignItems: 'center',
                      my: 1,
                      color: theme.palette.text.primary,
                      '& .MuiTypography-root': {
                        color: theme.palette.text.primary,
                        fontWeight: 500,
                        fontSize: isMobile ? 14 : 16,
                        lineHeight: isMobile ? 1.35 : 1.7,
                      }
                    }}
                    control={
                      <Checkbox
                        checked={selectedReasons.includes(reason.code)}
                        onChange={() => onToggleReason(reason.code)}
                        size={isMobile ? 'small' : 'medium'}
                        sx={{
                          mr: isMobile ? 1.2 : 2,
                          color: theme.palette.text.primary,
                          '&.Mui-checked': {
                            color: theme.palette.error.main
                          }
                        }}
                      />
                    }
                    label={reason.label}
                  />
                ))}
              </FormGroup>
            </div>

            <div
              style={{
                background: selectedReasons.length === 0 ? errorBg : fieldsetBg,
                border: `1.25px solid ${selectedReasons.length === 0 ? errorBorder : theme.palette.divider}`,
                borderRadius: isMobile ? 7 : 11,
                marginBottom: isMobile ? 11 : 17,
                padding: isMobile ? '8px 7px' : '10px 13px'
              }}
            >
              {selectedReasons.length === 0
                ? <p style={{
                  color: theme.palette.error.main,
                  fontSize: isMobile ? 13 : 14,
                  margin: 0
                }}>
                  Please select at least one rejection reason.
                </p>
                : <p style={{
                  color: theme.palette.text.secondary,
                  fontSize: isMobile ? 13 : 14,
                  margin: 0
                }}>
                  {selectedReasons.length} reason{selectedReasons.length !== 1 ? 's' : ''} selected
                </p>
              }
            </div>

            {/* Footer Buttons */}
            <div
              className="flex gap-4 pt-2 justify-end"
              style={{ flexWrap: isMobile ? 'wrap' : 'nowrap', gap: isMobile ? 10 : 16 }}
            >
              <button
                onClick={onClose}
                disabled={processing}
                style={{
                  width: isMobile ? '52%' : 140,
                  padding: isMobile ? '11px 0' : '13px 0',
                  borderRadius: isMobile ? 9 : 13,
                  background: theme.palette.action.hover,
                  border: `1.5px solid ${theme.palette.divider}`,
                  color: theme.palette.text.primary,
                  fontWeight: 500,
                  fontSize: isMobile ? 15.2 : 15.7,
                  transition: 'background-color 0.3s, border-color 0.3s',
                  opacity: processing ? 0.6 : 1,
                  pointerEvents: processing ? 'none' : 'auto',
                }}
              >
                Cancel
              </button>
              <button
                onClick={onSubmit}
                disabled={processing || selectedReasons.length === 0}
                style={{
                  width: isMobile ? '44%' : 170,
                  padding: isMobile ? '11px 0' : '13px 0',
                  borderRadius: isMobile ? 9 : 13,
                  background: theme.palette.error.main,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: isMobile ? 15.6 : 16.3,
                  border: 'none',
                  transition: 'background-color 0.3s',
                  opacity: processing || selectedReasons.length === 0 ? 0.6 : 1,
                  pointerEvents: processing || selectedReasons.length === 0 ? 'none' : 'auto',
                }}
              >
                {processing ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RejectModal;
