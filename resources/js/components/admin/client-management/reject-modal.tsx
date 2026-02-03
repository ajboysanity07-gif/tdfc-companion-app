import axiosClient, { getCsrfCookie } from '@/api/axios-client';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Skeleton,
    Stack,
    Typography,
} from '@mui/material';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import BlockIcon from '@mui/icons-material/Block';
import type { RejectionReasonEntry } from '@/types/user';

type Props = {
    open: boolean;
    reasons: RejectionReasonEntry[];
    selected?: string[];
    onClose: () => void;
    onSubmit: (codes: string[]) => void;
    clientName?: string;
};

const RejectModal: React.FC<Props> = ({ open, reasons, selected = [], onClose, onSubmit, clientName }) => {
    const [fallbackReasons, setFallbackReasons] = useState<RejectionReasonEntry[]>([]);
    const [loadingReasons, setLoadingReasons] = useState(false);
    const [localSelected, setLocalSelected] = useState<string[]>(selected ?? []);

    const normalizeReasons = (body: unknown): RejectionReasonEntry[] => {
        if (Array.isArray(body)) return body as RejectionReasonEntry[];
        if (body && typeof body === 'object') {
            const maybeObj = body as { data?: unknown; reasons?: unknown };
            if (Array.isArray(maybeObj.reasons)) return maybeObj.reasons as RejectionReasonEntry[];
            if (maybeObj.data) {
                const data = maybeObj.data as { data?: unknown } | unknown[];
                if (Array.isArray(data)) return data as RejectionReasonEntry[];
                if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
                    return (data as { data: RejectionReasonEntry[] }).data;
                }
            }
        }
        return [];
    };

    useEffect(() => {
        if (!open) return;
        // Always fetch to ensure we have fresh reasons
        setLoadingReasons(true);
        getCsrfCookie()
            .catch(() => null)
            .then(() =>
                axiosClient.get<
                    | RejectionReasonEntry[]
                    | { data: RejectionReasonEntry[] }
                    | { data: { data: RejectionReasonEntry[] } }
                    | { reasons: RejectionReasonEntry[] }
                >('/rejection-reasons'),
            )
            .then((res) => {
                const list = normalizeReasons(res.data);
                setFallbackReasons(list);
            })
            .catch(() => setFallbackReasons([]))
            .finally(() => setLoadingReasons(false));
    }, [open]);

    useEffect(() => {
        setLocalSelected(selected ?? []);
    }, [selected, open]);

    const safeReasons = useMemo(() => {
        if (Array.isArray(reasons) && reasons.length) return reasons;
        return fallbackReasons;
    }, [reasons, fallbackReasons]);

    const reasonCount = (Array.isArray(safeReasons) && safeReasons.length ? safeReasons.length : 0) || 6;
    const listMinHeight = reasonCount * 56; // keep modal height stable between loading and loaded states

    const toggle = (code: string) => {
        setLocalSelected((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 5,
                    bgcolor: 'rgba(18,18,20,0.9)',
                    backdropFilter: 'blur(22px)',
                    boxShadow: '0 26px 70px rgba(0,0,0,0.35)',
                    border: '1px solid rgba(255,255,255,0.08)',
                },
            }}
            className={!tw.isDark ? 'bg-white/96' : ''}
        >
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 900, letterSpacing: 0.4 }}>Reject Client</DialogTitle>
            <DialogContent dividers sx={{ pt: 1 }}>
                <Typography variant="body2" sx={{ mb: 0.5, textAlign: 'center', fontWeight: 700 }}>
                    Select rejection reasons for {clientName ?? 'this client'}.
                </Typography>
                <Typography variant="body2" sx={{ mb: 1.5, textAlign: 'center', color: 'text.secondary' }}>
                    You can choose more than one reason.
                </Typography>
                {loadingReasons ? (
                    <Box
                        sx={{
                            p: 1,
                            borderRadius: 3,
                            bgcolor: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            display: 'grid',
                            gridTemplateColumns: '1fr',
                            gap: 0.75,
                            minHeight: listMinHeight,
                        }}
                    >
                        {[...Array(reasonCount)].map((_, i) => (
                            <Box
                                key={i}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    px: 1.25,
                                    py: 1,
                                    borderRadius: 2,
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    bgcolor: 'rgba(255,255,255,0.03)',
                                }}
                                className={!tw.isDark ? 'bg-black/2' : ''}
                            >
                                <Skeleton variant="rounded" width={18} height={18} sx={{ borderRadius: 1 }} />
                                <Skeleton
                                    variant="text"
                                    width="72%"
                                    height={18}
                                    sx={{ bgcolor: tw.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' }}
                                />
                            </Box>
                        ))}
                    </Box>
                ) : safeReasons.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        No rejection reasons configured.
                    </Typography>
                ) : (
                    <Box
                        sx={{
                            p: 1,
                            borderRadius: 3,
                            bgcolor: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            display: 'grid',
                            gridTemplateColumns: '1fr',
                            gap: 0.75,
                            minHeight: listMinHeight,
                        }}
                    >
                        {safeReasons.map((reason) => {
                            const key = reason.code ?? String(reason.id ?? reason.label ?? Math.random());
                            const label = reason.label ?? reason.code ?? 'Reason';
                            const code = reason.code ?? String(reason.id ?? label);
                            const selectedReason = localSelected.includes(code);
                            return (
                                <Box
                                    key={key}
                                    sx={{
                                        px: 1.25,
                                        py: 1,
                                        borderRadius: 2,
                                        border: selectedReason ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.14)',
                                        bgcolor: selectedReason ? 'rgba(239,68,68,0.10)' : 'rgba(255,255,255,0.02)',
                                        transition: 'all 140ms ease',
                                        '&:hover': {
                                            borderColor: '#ef4444',
                                            bgcolor: 'rgba(239,68,68,0.06)',
                                        },
                                    }}
                                >
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={selectedReason}
                                                onChange={() => toggle(code)}
                                                color="error"
                                                size="small"
                                            />
                                        }
                                        label={
                                            <Typography variant="body2" fontWeight={700} color="text.primary">
                                                {label}
                                            </Typography>
                                        }
                                        sx={{ m: 0, width: '100%' }}
                                    />
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Stack direction="row" spacing={1} width="100%">
                    <Button fullWidth variant="outlined" onClick={onClose} sx={{ borderRadius: 999 }} startIcon={<CancelOutlinedIcon />}>
                        Cancel
                    </Button>
                    <Button
                        fullWidth
                        color="error"
                        variant="contained"
                        onClick={() => {
                            onSubmit(localSelected);
                            onClose();
                        }}
                        sx={{ borderRadius: 999, boxShadow: '0 10px 24px rgba(220,38,38,0.28)' }}
                        startIcon={<BlockIcon />}
                    >
                        Reject
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};

export default RejectModal;
