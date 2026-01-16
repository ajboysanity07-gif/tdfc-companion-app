import type { Client, WlnMasterRecord } from '@/types/user';
import type { AmortschedDisplayEntry } from '@/types/user';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Avatar, Box, Button, Divider, IconButton, InputAdornment, Skeleton, Stack, TextField, Typography, Tooltip } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import BoxHeader from '@/components/box-header';
import ImagePreviewModal from './image-preview-modal';
import AmortschedTable from '@/components/common/amortsched-table';
import FullScreenModalMobile from '../../ui/full-screen-modal-mobile';
import { useMyTheme } from '@/hooks/use-mytheme';
import PaymentLedgerTable from '@/components/common/payment-ledger-table';
import type { WlnLedEntry } from '@/types/user';

type Props = {
    client?: Client | null;
    onApprove?: (userId: number) => Promise<void> | void;
    onRejectClick?: () => void;
    onSaveSalary?: (acctno: string, salary: number) => Promise<void> | void;
    showName?: boolean;
    hideBottomActions?: boolean;
    wlnMasterRecords?: WlnMasterRecord[];
    loading?: boolean;
    fetchAmortsched?: (lnnumber: string) => Promise<unknown> | void;
    amortschedByLnnumber?: Record<string, AmortschedDisplayEntry[]>;
    amortschedLoading?: Record<string, boolean>;
    fetchWlnLed?: (lnnumber: string) => Promise<unknown> | void;
    wlnLedByLnnumber?: Record<string, WlnLedEntry[]>;
    wlnLedLoading?: Record<string, boolean>;
};

type PreviewImage = { src: string; label?: string };
const toAvatarSrc = (client?: Client | null) => {
    const raw = client?.profile_picture_url ?? client?.profile_picture_path ?? '';
    if (!raw) return undefined;
    if (raw.startsWith('http') || raw.startsWith('data:') || raw.startsWith('/storage')) return raw;
    return `/storage/${raw.replace(/^\/+/, '')}`;
};

const imageSrc = (path?: string | null) => {
    if (!path) return undefined;
    if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('/storage')) return path;
    return `/storage/${path.replace(/^\/+/, '')}`;
};

const Thumb: React.FC<{
    label: string;
    images: PreviewImage[];
    onOpen: (title: string, images: PreviewImage[]) => void;
    split?: boolean;
}> = ({ label, images, onOpen, split = false }) => {
    if (!images.length) {
        return (
            <Box
                sx={{
                    width: '100%',
                    height: 90,
                    maxWidth: 220,
                    borderRadius: 8,
                    border: '1px dashed rgba(255,255,255,0.16)',
                    bgcolor: 'action.hover',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.secondary',
                    fontWeight: 700,
                }}
            >
                No {label}
            </Box>
        );
    }

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                height: 90,
                maxWidth: 220,
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.3)',
                bgcolor: 'background.paper',
                cursor: 'pointer',
                transition: 'transform 140ms ease, box-shadow 140ms ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.4)',
                },
            }}
            onClick={() => onOpen(label, images)}
        >
            {split ? (
                <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
                    {[images[0], images[1] ?? images[0]].map((img, idx) => (
                        <Box
                            key={`${img.src}-${idx}`}
                            component="img"
                            src={img.src}
                            alt={img.label || label}
                            sx={{
                                width: '50%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRight: idx === 0 ? '1px solid rgba(0,0,0,0.12)' : 'none',
                            }}
                        />
                    ))}
                </Box>
            ) : (
                <Box component="img" src={images[0].src} alt={images[0].label || label} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}

            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(0,0,0,0.35)',
                    opacity: 0,
                    transition: 'opacity 150ms ease',
                    '&:hover': { opacity: 1 },
                }}
            >
                <IconButton color="inherit" sx={{ bgcolor: 'rgba(255,255,255,0.18)' }}>
                    <VisibilityIcon sx={{ color: 'white' }} />
                </IconButton>
            </Box>

            <Box
                sx={{
                    position: 'absolute',
                    left: 10,
                    bottom: 10,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    px: 1.5,
                    py: 0.4,
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: 12,
                }}
            >
                {label}
            </Box>
        </Box>
    );
};

const ClientDetails: React.FC<Props> = ({
    client,
    onApprove,
    onRejectClick,
    onSaveSalary,
    showName = true,
    hideBottomActions = false,
    wlnMasterRecords,
    loading = false,
    fetchAmortsched,
    amortschedByLnnumber,
    amortschedLoading,
    fetchWlnLed,
    wlnLedByLnnumber,
    wlnLedLoading,
}) => {
    const tw = useMyTheme();
    const borderColor = tw.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)';
    const panelBg = tw.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
    const [salary, setSalary] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewTitle, setPreviewTitle] = useState('');
    const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);
    const [scheduleOpen, setScheduleOpen] = useState(false);
    const [activeLoan, setActiveLoan] = useState<WlnMasterRecord | null>(null);
    const [ledgerOpen, setLedgerOpen] = useState(false);
    const [ledgerLoan, setLedgerLoan] = useState<WlnMasterRecord | null>(null);
    const wlnRecords = useMemo(() => wlnMasterRecords ?? [], [wlnMasterRecords]);
    const isWlnLoading = loading || wlnMasterRecords === undefined;
    const formatDate = (raw: unknown) => {
        if (!raw) return 'N/A';
        const date = raw instanceof Date ? raw : new Date(String(raw));
        if (Number.isNaN(date.getTime())) return String(raw);
        return date.toLocaleDateString('en-US', { month: 'numeric', day: '2-digit', year: 'numeric' });
    };

    const formatSalary = (raw: string) => {
        const numeric = Number(String(raw).replace(/,/g, ''));
        if (Number.isNaN(numeric)) return { numeric: NaN, formatted: raw };
        const formatted = new Intl.NumberFormat('en-PH', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(numeric);
        return { numeric, formatted };
    };

    const formatBalance = (raw: unknown) => {
        const numeric = Number(raw);
        if (!Number.isNaN(numeric)) {
            return new Intl.NumberFormat('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(numeric);
        }
        return raw != null ? String(raw) : 'N/A';
    };

    useEffect(() => {
        if (client?.salary_amount != null) {
            const { formatted } = formatSalary(String(client.salary_amount));
            setSalary(formatted);
        } else {
            setSalary('');
        }
        setError(null);
    }, [client]);

    useEffect(() => {
        setScheduleOpen(false);
        setActiveLoan(null);
        setLedgerOpen(false);
        setLedgerLoan(null);
    }, [client?.user_id]);

    const prcImages = useMemo(() => {
        const imgs: PreviewImage[] = [];
        const front = imageSrc(client?.prc_id_photo_front);
        const back = imageSrc(client?.prc_id_photo_back);
        if (front) imgs.push({ src: front, label: 'PRC Front' });
        if (back) imgs.push({ src: back, label: 'PRC Back' });
        return imgs;
    }, [client]);

    const payslipImages = useMemo(() => {
        const slip = imageSrc(client?.payslip_photo_path);
        return slip ? [{ src: slip, label: 'Payslip' }] : [];
    }, [client]);

    const activeLnnumber = activeLoan?.lnnumber ?? null;

    const scheduleRows = useMemo(
        () => (activeLnnumber && amortschedByLnnumber ? amortschedByLnnumber[activeLnnumber] ?? [] : []),
        [activeLnnumber, amortschedByLnnumber],
    );

    const scheduleLoading = activeLnnumber ? !!amortschedLoading?.[activeLnnumber] : false;
    const ledgerLnnumber = ledgerLoan?.lnnumber ?? null;
    const ledgerRows = useMemo(() => (ledgerLnnumber && wlnLedByLnnumber ? wlnLedByLnnumber[ledgerLnnumber] ?? [] : []), [ledgerLnnumber, wlnLedByLnnumber]);
    const ledgerLoading = ledgerLnnumber ? !!wlnLedLoading?.[ledgerLnnumber] : false;

    // Prefetch amortization schedules for all WLN records so buttons can be disabled upfront when no schedule exists.
    useEffect(() => {
        if (!fetchAmortsched || !Array.isArray(wlnRecords) || !wlnRecords.length) return;
        wlnRecords.forEach((rec) => {
            const ln = rec.lnnumber;
            if (!ln) return;
            const alreadyHasData = amortschedByLnnumber?.[ln] !== undefined;
            const isLoading = !!amortschedLoading?.[ln];
            if (!alreadyHasData && !isLoading) {
                fetchAmortsched(ln);
            }
        });
    }, [fetchAmortsched, wlnRecords, amortschedByLnnumber, amortschedLoading]);

    useEffect(() => {
        if (!scheduleOpen || !activeLnnumber || !fetchAmortsched) return;
        if (!amortschedByLnnumber?.[activeLnnumber]) {
            fetchAmortsched(activeLnnumber);
        }
    }, [scheduleOpen, activeLnnumber, fetchAmortsched, amortschedByLnnumber]);

    useEffect(() => {
        if (!ledgerOpen || !ledgerLnnumber || !fetchWlnLed) return;
        if (!wlnLedByLnnumber?.[ledgerLnnumber]) {
            fetchWlnLed(ledgerLnnumber);
        }
    }, [ledgerOpen, ledgerLnnumber, fetchWlnLed, wlnLedByLnnumber]);

    const openSchedule = (record: WlnMasterRecord) => {
        if (!record?.lnnumber) return;
        setActiveLoan(record);
        setScheduleOpen(true);
    };

    const openLedger = (record: WlnMasterRecord) => {
        if (!record?.lnnumber) return;
        setLedgerLoan(record);
        setLedgerOpen(true);
    };

    const refreshSchedule = () => {
        if (fetchAmortsched && activeLnnumber) {
            fetchAmortsched(activeLnnumber);
        }
    };

    const handleSaveSalary = () => {
        if (!client) return;
        const { numeric, formatted } = formatSalary(salary);
        if (Number.isNaN(numeric)) {
            setError('Salary must be a number');
            return;
        }
        setSalary(formatted);
        setError(null);
        onSaveSalary?.(client.acctno, numeric);
    };

    const handleApprove = () => {
        if (!client) return;
        onApprove?.(client.user_id);
    };

    const isApproved = client?.status === 'approved';

    const openPreview = (title: string, images: PreviewImage[]) => {
        if (!images.length) return;
        setPreviewTitle(title);
        setPreviewImages(images);
        setPreviewOpen(true);
    };

    if (!client) {
        return (
            <Box
                sx={{
                    width: '100%',
                    maxWidth: 900,
                    mx: 'auto',
                    p: { xs: 3, sm: 4 },
                    borderRadius: 2,
                    border: `1px dashed ${borderColor}`,
                    bgcolor: tw.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                    color: 'text.secondary',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 480,
                }}
            >
                <Typography variant="h6" fontWeight={800}>
                    No client selected
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Choose a client from the list to view details.
                </Typography>
            </Box>
        );
    }

    return (
        <Stack
            spacing={3}
            alignItems="center"
            sx={{
                width: '100%',
                maxWidth: 900,
                mx: 'auto',
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
                border: `1px solid ${borderColor}`,
                boxSizing: 'border-box',
                flex: 1,
                minHeight: 'auto',
                alignSelf: 'stretch',
            }}
        >
            {showName ? <BoxHeader title={client.name} /> : null}
            <Divider
                sx={{
                    width: '100%',
                    opacity: 0.32,
                    borderColor: borderColor,
                }}
            />

            <Stack spacing={2.5} alignItems="center" sx={{ width: '100%' }}>
                <Avatar
                    src={toAvatarSrc(client)}
                    alt={client.name}
                    sx={{ width: 120, height: 120, fontSize: 38, fontWeight: 800, boxShadow: '0 12px 32px rgba(0,0,0,0.25)' }}
                />

                <Stack spacing={1} alignItems="center" textAlign="center" sx={{ width: '100%', maxWidth: isApproved ? '100%' : 520 }}>
                    {!isApproved
                        ? [
                              { label: 'Email', value: client.email },
                              { label: 'Account No.', value: client.acctno },
                          ].map((item) => (
                              <Stack key={item.label} spacing={0.4} alignItems="center" sx={{ width: '100%' }}>
                                  <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 0.3, color: 'text.secondary' }}>
                                      {item.label}
                                  </Typography>
                                  <Box
                                      sx={{
                                          width: '100%',
                                          borderRadius: 6,
                                          bgcolor: panelBg,
                                          border: `1px solid ${borderColor}`,
                                          px: 1.5,
                                          py: 1,
                                          textAlign: 'center',
                                      }}
                                  >
                                      <Typography variant="h6" fontWeight={800}>
                                          {item.value}
                                      </Typography>
                                  </Box>
                              </Stack>
                          ))
                        : null}

                    {isApproved ? (
                        <Stack spacing={0.4} alignItems="center" sx={{ width: '100%', maxWidth: 520 }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 0.3, color: 'text.secondary' }}>
                                Account No.
                            </Typography>
                            <Box
                                sx={{
                                    width: '100%',
                                    borderRadius: 6,
                                    bgcolor: panelBg,
                                    border: `1px solid ${borderColor}`,
                                    px: 1.5,
                                    py: 1.1,
                                    textAlign: 'center',
                                }}
                            >
                                <Typography variant="subtitle1" fontWeight={800}>
                                    {client.acctno}
                                </Typography>
                            </Box>
                        </Stack>
                    ) : null}

                    <Stack
                        direction={isApproved ? 'row' : 'column'}
                        spacing={1}
                        alignItems="stretch"
                        sx={{
                            width: '100%',
                            maxWidth: isApproved ? { xs: 520, sm: 620 } : 520,
                            mx: 'auto',
                        }}
                    >
                        {client.class ? (
                            <Stack spacing={0.4} alignItems="center" sx={{ width: isApproved ? 'auto' : '100%', flex: 1, minWidth: 0 }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 0.3, color: 'text.secondary' }}>
                                    Class
                                </Typography>
                                <Box
                                    sx={{
                                        width: '100%',
                                        borderRadius: isApproved ? 6.5 : 6,
                                        bgcolor: panelBg,
                                        border: `1px solid ${borderColor}`,
                                        px: 1.5,
                                        py: isApproved ? 2 : 1.5,
                                        textAlign: 'center',
                                    }}
                                >
                                    <Typography variant="subtitle1" fontWeight={800}>
                                        CLASS {client.class?.toUpperCase()}
                                    </Typography>
                                </Box>
                            </Stack>
                        ) : null}

                        <Stack spacing={0.4} alignItems="center" sx={{ width: isApproved ? 'auto' : '100%', flex: 1, minWidth: 0 }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 0.3, color: 'text.secondary' }}>
                                Salary
                            </Typography>
                            <Box
                                sx={{
                                    width: '100%',
                                    borderRadius: 6,
                                    bgcolor: panelBg,
                                    border: `1px solid ${borderColor}`,
                                    px: 1.5,
                                    py: 1.3,
                                    textAlign: 'center',
                                }}
                            >
                                <TextField
                                    fullWidth
                                    size="small"
                                    value={salary}
                                    onChange={(e) => setSalary(e.target.value)}
                                    placeholder="0.00"
                                    onBlur={handleSaveSalary}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">{'\u20B1'}</InputAdornment>,
                                        sx: {
                                            borderRadius: 4,
                                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                            '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                            '& input': { textAlign: 'center', fontWeight: 700, fontSize: 16 },
                                        },
                                    }}
                                    inputProps={{ inputMode: 'decimal' }}
                                />
                                {error ? (
                                    <Typography variant="body2" color="error" fontWeight={700} sx={{ mt: 0.5 }}>
                                        {error}
                                    </Typography>
                                ) : null}
                            </Box>
                        </Stack>
                    </Stack>
                </Stack>



                {!isApproved ? (
                    <>
                        <Divider flexItem sx={{ opacity: 0.08, width: '100%' }} />
                        <Stack spacing={2} width="100%" alignItems="center">
                            <Stack spacing={0.75} width="100%" maxWidth={480} alignItems="center">
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: 0.5, color: 'text.secondary' }}>
                                    PRC ID
                                </Typography>
                                <Thumb label="PRC ID" images={prcImages} onOpen={openPreview} split />
                            </Stack>

                            <Stack spacing={0.75} width="100%" maxWidth={480} alignItems="center">
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: 0.5, color: 'text.secondary' }}>
                                    Payslip
                                </Typography>
                                <Thumb label="Payslip" images={payslipImages} onOpen={openPreview} />
                            </Stack>
                        </Stack>
                    </>
                ) : null}

                {isApproved ? (
                    <Stack spacing={0.75} alignItems="center" width="100%">
                        <Stack spacing={0.75} width="100%" mt={1}>
                            <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 800, letterSpacing: 0.5, color: 'text.secondary', textAlign: 'center', width: '100%' }}
                            >
                                WLN Master Records
                            </Typography>
                        {isWlnLoading ? (
                            <Stack spacing={1.5}>
                                {[1, 2].map((idx) => (
                                    <Stack
                                        key={idx}
                                        direction={{ xs: 'column', sm: 'row' }}
                                        spacing={{ xs: 2.5, sm: 3 }}
                                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                                        justifyContent="space-between"
                                        sx={{
                                            width: '100%',
                                            borderRadius: 3,
                                            border: `1px solid ${borderColor}`,
                                            bgcolor: panelBg,
                                            p: { xs: 2.5, sm: 3 },
                                        }}
                                    >
                                        <Stack spacing={1.5} sx={{ flex: 1 }}>
                                            <Skeleton width="60%" height={28} sx={{ borderRadius: 1 }} />
                                            <Skeleton width="50%" height={20} sx={{ borderRadius: 1 }} />
                                            <Skeleton width="55%" height={24} sx={{ borderRadius: 1 }} />
                                            <Skeleton width="35%" height={20} sx={{ borderRadius: 1 }} />
                                        </Stack>
                                        <Stack direction="column" spacing={1.5} sx={{ width: { xs: '100%', sm: 180 } }}>
                                            <Skeleton variant="rounded" width="100%" height={42} sx={{ borderRadius: 2 }} />
                                            <Skeleton variant="rounded" width="100%" height={42} sx={{ borderRadius: 2 }} />
                                        </Stack>
                                    </Stack>
                                ))}
                            </Stack>
                        ) : wlnRecords.length ? (
                            <Stack spacing={1.5}>
                                {wlnRecords.map((rec, idx) => {
                                    const scheduleData = rec.lnnumber ? amortschedByLnnumber?.[rec.lnnumber] : undefined;
                                    const scheduleKnownEmpty = Array.isArray(scheduleData) && scheduleData.length === 0;
                                    const scheduleLoadingForLn = rec.lnnumber ? !!amortschedLoading?.[rec.lnnumber] : false;
                                    const scheduleDisabled = !rec.lnnumber || scheduleLoadingForLn || scheduleKnownEmpty;

                                    return (
                                    <Stack
                                        key={`${rec.lnnumber ?? idx}-${rec.remarks ?? idx}`}
                                        direction={{ xs: 'column', sm: 'row' }}
                                        spacing={{ xs: 2.5, sm: 3 }}
                                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                                        justifyContent="space-between"
                                        sx={{
                                            width: '100%',
                                            borderRadius: 3,
                                            border: `1px solid ${borderColor}`,
                                            bgcolor: panelBg,
                                            p: { xs: 2.5, sm: 3 },
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                bgcolor: tw.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: tw.isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.1)',
                                            },
                                        }}
                                    >
                                        <Stack spacing={1.5} sx={{ flex: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography 
                                                    variant="h6" 
                                                    fontWeight={800} 
                                                    sx={{ 
                                                        textTransform: 'uppercase', 
                                                        letterSpacing: 0.8,
                                                        fontSize: '1.25rem',
                                                        lineHeight: 1.2,
                                                    }}
                                                >
                                                   {rec.remarks ? String(rec.remarks) : 'LOAN'} 
                                                </Typography>
                                                {scheduleKnownEmpty && !scheduleLoadingForLn && (
                                                    <Tooltip 
                                                        title="No amortization schedule available for this loan" 
                                                        arrow 
                                                        placement="top"
                                                        enterTouchDelay={0}
                                                        leaveTouchDelay={3000}
                                                    >
                                                        <InfoOutlinedIcon 
                                                            fontSize="small" 
                                                            sx={{ 
                                                                color: 'text.secondary',
                                                                cursor: 'help',
                                                            }} 
                                                        />
                                                    </Tooltip>
                                                )}
                                            </Box>
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    color: 'text.secondary', 
                                                    fontWeight: 500,
                                                    fontSize: '0.875rem',
                                                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif',
                                                    fontVariantNumeric: 'tabular-nums',
                                                }}
                                            >
                                                {rec.lnnumber ? `Loan no.: ${rec.lnnumber}` : 'Loan no.: N/A'}
                                            </Typography>
                                            <Typography 
                                                variant="h6" 
                                                fontWeight={800} 
                                                sx={{ 
                                                    color: 'text.primary', 
                                                    fontSize: '1.125rem',
                                                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif',
                                                    fontVariantNumeric: 'tabular-nums',
                                                    lineHeight: 1.3,
                                                }}
                                            >
                                                Balance: <Box component="span" sx={{ color: '#F57979' }}>
                                                    {rec.balance !== undefined ? `₱${formatBalance(rec.balance)}` : '₱0.00'}
                                                </Box>
                                            </Typography>
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    color: 'text.secondary', 
                                                    fontWeight: 600,
                                                    fontSize: '0.875rem',
                                                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif',
                                                    fontVariantNumeric: 'tabular-nums',
                                                }}
                                            >
                                                {formatDate(rec.date_end)}
                                            </Typography>
                                        </Stack>
                                        <Stack direction="column" spacing={1.5} sx={{ width: { xs: '100%', sm: 180 }, minWidth: { xs: '100%', sm: 180 } }}>
                                            <Button
                                                variant="contained"
                                                size="medium"
                                                fullWidth
                                                onClick={() => openSchedule(rec)}
                                                disabled={scheduleDisabled}
                                                sx={{
                                                    bgcolor: '#F57979',
                                                    color: 'white',
                                                    fontWeight: 700,
                                                    fontSize: '0.875rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 0.8,
                                                    borderRadius: 8,
                                                    py: 1.25,
                                                    boxShadow: '0 4px 12px rgba(245, 121, 121, 0.3)',
                                                    '&:hover': {
                                                        bgcolor: '#e14e4e',
                                                        boxShadow: '0 6px 16px rgba(245, 121, 121, 0.4)',
                                                        transform: 'translateY(-1px)',
                                                    },
                                                    '&:disabled': {
                                                        bgcolor: 'rgba(245, 121, 121, 0.3)',
                                                        color: 'rgba(255, 255, 255, 0.5)',
                                                        boxShadow: 'none',
                                                    },
                                                }}
                                            >
                                                {scheduleLoadingForLn ? 'Loading...' : 'Schedule'}
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                size="medium"
                                                fullWidth
                                                onClick={() => openLedger(rec)}
                                                disabled={!rec.lnnumber}
                                                sx={{
                                                    borderWidth: 2,
                                                    borderColor: tw.isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
                                                    color: 'text.primary',
                                                    fontWeight: 700,
                                                    fontSize: '0.875rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 0.8,
                                                    borderRadius: 8,
                                                    py: 1.25,
                                                    '&:hover': {
                                                        borderWidth: 2,
                                                        borderColor: tw.isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                                                        bgcolor: tw.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                                                        transform: 'translateY(-1px)',
                                                    },
                                                    '&:disabled': {
                                                        opacity: 0.5,
                                                    },
                                                }}
                                            >
                                                Payments
                                            </Button>
                                        </Stack>
                                    </Stack>
                                    );
                                })}
                                </Stack>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No WLN master records available.
                                </Typography>
                            )}
                        </Stack>
                    </Stack>
                ) : null}

                {!hideBottomActions ? (
                    <Stack
                        direction="column"
                        spacing={1}
                        justifyContent="center"
                        alignItems="stretch"
                        sx={{ display: client.status === 'pending' ? 'flex' : 'none', width: '100%', pt: 1 }}
                    >
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<ThumbDownAltIcon />}
                            onClick={onRejectClick}
                            fullWidth
                            sx={{ borderRadius: 999, px: 3, boxShadow: 'none' }}
                        >
                            Reject
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<ThumbUpAltIcon />}
                            onClick={handleApprove}
                            fullWidth
                            sx={{ borderRadius: 999, px: 3, boxShadow: 'none' }}
                        >
                            Accept
                        </Button>
                    </Stack>
                ) : null}
            </Stack>

            <ImagePreviewModal open={previewOpen} title={previewTitle} images={previewImages} onClose={() => setPreviewOpen(false)} />
            <FullScreenModalMobile
                open={scheduleOpen}
                title={activeLnnumber ? `Amortization Schedule (${activeLnnumber})` : 'Amortization Schedule'}
                onClose={() => setScheduleOpen(false)}
                headerBg="#f57979"
                headerColor="#fff"
                bodySx={{ p: { xs: 1.5, sm: 2.5 } }}
                bodyClassName="app-modal-open"
            >
                <AmortschedTable
                    rows={scheduleRows}
                    loading={scheduleLoading}
                    onRefresh={refreshSchedule}
                    exportMeta={{
                        clientName: client?.name ?? null,
                        lnnumber: activeLnnumber,
                        remarks: activeLoan?.remarks ? String(activeLoan.remarks) : null,
                        lastPaymentDate: activeLoan?.date_end ? String(activeLoan.date_end) : null,
                    }}
                />
            </FullScreenModalMobile>
            <FullScreenModalMobile
                open={ledgerOpen}
                title={ledgerLnnumber ? `Payment Ledger (${ledgerLnnumber})` : 'Payment Ledger'}
                onClose={() => setLedgerOpen(false)}
                headerBg="#f57979"
                headerColor="#fff"
                bodySx={{ p: { xs: 1.5, sm: 2.5 } }}
                bodyClassName="app-modal-open"
            >
                <PaymentLedgerTable
                    rows={ledgerRows}
                    loading={ledgerLoading}
                    onRefresh={ledgerLnnumber && fetchWlnLed ? () => fetchWlnLed(ledgerLnnumber) : undefined}
                    exportMeta={{
                        clientName: client?.name ?? null,
                        lnnumber: ledgerLnnumber,
                        remarks: ledgerLoan?.remarks ? String(ledgerLoan.remarks) : null,
                        lastPaymentDate: ledgerLoan?.date_end ? String(ledgerLoan.date_end) : null,
                    }}
                />
            </FullScreenModalMobile>
        </Stack>
    );
};

export default ClientDetails;
