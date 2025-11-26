import { PendingUser, RejectionReasonEntry } from '@/types/user';
import { alpha, Box, Checkbox, FormControlLabel, FormGroup, useTheme } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

interface RejectModalProps {
    open: boolean;
    user: PendingUser | null;
    rejectionReasons: RejectionReasonEntry[];
    selectedReasons: string[];
    processing: boolean;
    onClose: () => void;
    onToggleReason: (code: string) => void;
    onSubmit: () => void;
}

const RejectModal: React.FC<RejectModalProps> = ({
    open,
    user,
    rejectionReasons,
    selectedReasons,
    processing,
    onClose,
    onToggleReason,
    onSubmit,
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // Error/red branding — always visible!
    const errorMain = theme.palette.error.main;
    const errorBg = isDark ? alpha(theme.palette.error.main, 0.08) : alpha(theme.palette.error.main, 0.1);
    const iconBg = errorMain;
    const iconColor = isDark ? theme.palette.common.white : theme.palette.error.contrastText;

    // General text
    const mainText = theme.palette.text.primary;
    const secondaryText = theme.palette.text.secondary;

    // Main background (card)
    const cardBg = theme.palette.background.paper;
    const overlayColor =
        theme.palette.mode === 'dark' ? alpha(theme.palette.background.default, 0.73) : alpha(theme.palette.background.default, 0.85);

    // Divider: always visible. Lighter and more opaque in light, darker in dark mode
    const dividerColor = isDark ? alpha(theme.palette.divider, 0.32) : alpha(theme.palette.divider, 0.53);

    const borderColor = isDark ? alpha(theme.palette.divider, 0.45) : alpha(theme.palette.text.primary, 0.3);
    // Custom checkbox colors
    const checkboxUnchecked = isDark ? alpha(theme.palette.grey[400], 0.7) : alpha(theme.palette.grey[600], 0.6);

    const checkboxHover = isDark ? alpha(errorMain, 0.12) : alpha(errorMain, 0.08);

    // const checkboxBorder = isDark
    //   ? alpha(theme.palette.divider, 0.4)
    //   : alpha(theme.palette.divider, 0.6);

    const capitalizedName =
        user && user.name
            ? user.name
                  .split(' ')
                  .map((word) => word.toUpperCase())
                  .join(' ')
            : '';

    return (
        <AnimatePresence>
            {open && user && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        background: overlayColor,
                        backdropFilter: 'blur(18px)',
                        WebkitBackdropFilter: 'blur(18px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onClick={processing ? undefined : onClose}
                >
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: 520,
                            borderRadius: 15,
                            background: cardBg,
                            padding: theme.spacing(5, 4, 3, 4),
                            boxShadow: theme.shadows[16],
                            color: mainText,
                            border: `1.5px solid ${dividerColor}`,
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                        }}
                    >
                        {/* Header row: Icon + Title + X */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: 4,
                            }}
                        >
                            {/* Red Close Circle */}
                            <div
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: '50%',
                                    background: iconBg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 12,
                                    flexShrink: 0,
                                    boxShadow: `0 2px 8px ${alpha(errorMain, 0.2)}`,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 25,
                                        color: iconColor,
                                        fontWeight: 700,
                                        lineHeight: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginTop: 3,
                                    }}
                                >
                                    ×
                                </span>
                            </div>
                            <span
                                style={{
                                    fontWeight: 700,
                                    fontSize: 22,
                                    color: mainText,
                                    flex: 1,
                                    marginRight: 28,
                                    letterSpacing: 0.01,
                                    textShadow: isDark ? '0 2px 9px #222d' : undefined,
                                }}
                            >
                                Reject Client Registration
                            </span>
                            <button
                                onClick={onClose}
                                disabled={processing}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: dividerColor,
                                    fontWeight: 600,
                                    fontSize: 27,
                                    cursor: 'pointer',
                                    marginLeft: 10,
                                    lineHeight: 1,
                                }}
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>
                        {/* Apple/IOS style divider */}
                        <div
                            style={{
                                margin: '18px 0 12px 0',
                                width: '100%',
                                height: 1,
                                background: dividerColor,
                                opacity: 1,
                            }}
                        />
                        {/* Subtitle and Client Name */}
                        <div
                            style={{
                                color: secondaryText,
                                fontSize: 17,
                                lineHeight: 1.7,
                                fontWeight: 400,
                            }}
                        >
                            Select rejection reasons for
                        </div>
                        <div
                            style={{
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: 0.01,
                                color: mainText,
                                marginBottom: 21,
                                fontSize: 26,
                                textShadow: isDark ? '0 1px 10px #111c' : undefined,
                            }}
                        >
                            {capitalizedName}
                        </div>
                        {/* Checkbox options */}
                        <Box sx={{ mb: 2 }}>
                            <FormGroup>
                                {rejectionReasons.map((reason) => {
                                    const isChecked = selectedReasons.includes(reason.code);
                                    return (
                                            <Box
                                                key={reason.code}
                                                sx={{
                                                border: `1.2px solid ${isChecked ? errorMain : borderColor}`,
                                                borderRadius: 1.8,
                                                mb: 1.1,
                                                px: isChecked ? 1.5 : 1.2,
                                                py: isChecked ? 0.7 : 0.4,
                                                backgroundColor: isChecked
                                                    ? alpha(errorMain, isDark ? 0.12 : 0.08)
                                                    : 'transparent',
                                                transform: isChecked ? 'scale(1.02)' : 'scale(1)',
                                                boxShadow: 'none',
                                                transition: 'border 0.2s, background-color 0.2s, transform 0.18s ease',
                                                }}
                                            >
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={isChecked}
                                                        onChange={() => onToggleReason(reason.code)}
                                                        disabled={processing}
                                                        sx={{
                                                            color: isChecked ? errorMain : checkboxUnchecked,
                                                            padding: '9px',
                                                            '&.Mui-checked': {
                                                                color: errorMain,
                                                            },
                                                            '&:hover': {
                                                                backgroundColor: checkboxHover,
                                                            },
                                                            '&.Mui-disabled': {
                                                                color: alpha(theme.palette.text.disabled, 0.3),
                                                            },
                                                            '& .MuiSvgIcon-root': {
                                                                fontSize: 26,
                                                                borderRadius: '4px',
                                                            },
                                                            '& .MuiTouchRipple-root': {
                                                                color: errorMain,
                                                            },
                                                            marginRight: 2,
                                                            marginLeft: 1,
                                                            transition: 'all 0.2s ease-in-out',
                                                        }}
                                                    />
                                                }
                                                        label={
                                                            <span
                                                                style={{
                                                                    fontSize: isChecked ? 17.5 : 17,
                                                                    color: isChecked ? errorMain : mainText,
                                                                    fontWeight: isChecked ? 700 : 600,
                                                                }}
                                                            >
                                                                {reason.label}
                                                            </span>
                                                        }
                                                sx={{
                                                    padding: 0,
                                                    alignItems: 'center',
                                                }}
                                            />
                                        </Box>
                                    );
                                })}
                            </FormGroup>
                        </Box>
                        {/* selected reason count warning */}
                        <div
                            style={{
                                margin: '17px 0 0 0',
                                padding: '12px 15px 10px 14px',
                                borderRadius: 13,
                                background: errorBg,
                                color: errorMain,
                                fontWeight: 600,
                                fontSize: 15,
                                minHeight: 24,
                                minWidth: '66%',
                                textAlign: 'left',
                                letterSpacing: 0.01,
                            }}
                        >
                            {selectedReasons.length === 1
                                ? '1 reason selected'
                                : selectedReasons.length > 1
                                  ? `${selectedReasons.length} reasons selected`
                                  : '\u00A0'}
                        </div>
                        {/* Button row */}
                        <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
                            <button
                                onClick={onClose}
                                disabled={processing}
                                style={{
                                    flex: 1,
                                    background: isDark ? alpha(cardBg, 0.33) : alpha(cardBg, 0.44),
                                    color: mainText,
                                    border: 'none',
                                    borderRadius: 99,
                                    fontWeight: 600,
                                    fontSize: 19,
                                    padding: '14px 0',
                                    cursor: 'pointer',
                                    boxShadow: isDark ? '0 2px 8px #0003' : undefined,
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onSubmit}
                                disabled={processing || selectedReasons.length === 0}
                                style={{
                                    flex: 1,
                                    background: selectedReasons.length === 0 || processing ? alpha(errorMain, 0.13) : errorMain,
                                    color: theme.palette.common.white,
                                    fontWeight: 700,
                                    fontSize: 19,
                                    border: 'none',
                                    borderRadius: 99,
                                    padding: '14px 0',
                                    cursor: processing || selectedReasons.length === 0 ? 'not-allowed' : 'pointer',
                                    boxShadow: isDark ? `0 4px 22px ${alpha(errorMain, 0.14)}` : undefined,
                                    transition: 'background 0.18s',
                                }}
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RejectModal;
