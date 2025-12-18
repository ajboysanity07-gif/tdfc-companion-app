import type { Client, WlnMasterRecord } from '@/types/user';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Avatar, Box, Button, Divider, IconButton, InputAdornment, Skeleton, Stack, TextField, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import BoxHeader from './box-header';
import ImagePreviewModal from './image-preview-modal';
import { useMyTheme } from '@/hooks/use-mytheme';

type Props = {
    client?: Client | null;
    onApprove?: (userId: number) => Promise<void> | void;
    onRejectClick?: () => void;
    onSaveSalary?: (acctno: string, salary: number) => Promise<void> | void;
    showName?: boolean;
    hideBottomActions?: boolean;
    wlnMasterRecords?: WlnMasterRecord[];
    loading?: boolean;
};

type PreviewImage = { src: string; label?: string };
const toAvatarSrc = (client?: Client | null) => {
    const raw = client?.profile_picture_url ?? client?.profile_picture_path ?? '';
    if (!raw) return undefined;
    return raw.startsWith('http') || raw.startsWith('data:') ? raw : `/storage/${raw.replace(/^\/+/, '')}`;
};

const imageSrc = (path?: string | null) => {
    if (!path) return undefined;
    return path.startsWith('http') || path.startsWith('data:') ? path : `/storage/${path.replace(/^\/+/, '')}`;
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
                boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
                bgcolor: 'background.paper',
                cursor: 'pointer',
                transition: 'transform 140ms ease, box-shadow 140ms ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 14px 36px rgba(0,0,0,0.32)',
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
}) => {
    const tw = useMyTheme();
    const borderColor = tw.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)';
    const panelBg = tw.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
    const [salary, setSalary] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewTitle, setPreviewTitle] = useState('');
    const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);
    const wlnRecords = wlnMasterRecords ?? [];
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
                                        direction="row"
                                        spacing={2.5}
                                        alignItems="center"
                                        sx={{
                                            width: '100%',
                                            borderRadius: 5,
                                            border: `1px solid ${borderColor}`,
                                            bgcolor: panelBg,
                                            p: { xs: 2, sm: 2.5 },
                                        }}
                                    >
                                        <Stack spacing={0.9} sx={{ flex: 1 }}>
                                            <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: 0.2, fontSize: { xs: 16, sm: 'inherit' } }}>
                                                <Skeleton width="50%" height={24} />
                                            </Typography>
                                            <Skeleton width="60%" height={18} />
                                            <Skeleton width="40%" height={18} />
                                            <Skeleton width="30%" height={18} />
                                        </Stack>
                                        <Stack spacing={0.85} sx={{ width: { xs: '100%', sm: 150 } }}>
                                            <Skeleton variant="rounded" width="100%" height={36} />
                                            <Skeleton variant="rounded" width="100%" height={36} />
                                        </Stack>
                                    </Stack>
                                ))}
                            </Stack>
                        ) : wlnRecords.length ? (
                            <Stack spacing={1.5}>
                                {wlnRecords.map((rec, idx) => (
                                    <Stack
                                        key={`${rec.lnnumber ?? idx}-${rec.remarks ?? idx}`}
                                        direction="row"
                                        spacing={2.5}
                                        alignItems="center"
                                        sx={{
                                            width: '100%',
                                            borderRadius: 5,
                                            border: `1px solid ${borderColor}`,
                                            bgcolor: panelBg,
                                            p: { xs: 2, sm: 2.5 },
                                        }}
                                    >
                                        <Stack spacing={0.9} sx={{ flex: 1 }}>
                                            <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: 0.2 }}>
                                               {rec.remarks ? String(rec.remarks) : 'No remarks'} 
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: 13, sm: 'inherit' } }}>
                                                {rec.lnnumber ? `Loan no.: ${rec.lnnumber}` : 'Loan'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary"  fontWeight={700}>
                                                {rec.balance !== undefined ? `Balance: ₱${formatBalance(rec.balance)}` : 'Balance: N/A'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatDate(rec.date_end)}
                                            </Typography>
                                        </Stack>
                                        <Stack spacing={0.85} sx={{ width: 150 }}>
                                            <Button variant="contained" color="primary" size="small" fullWidth sx={{ borderRadius: 99, py: { xs: 0.85, sm: 1 } }}>
                                                Schedule
                                            </Button>
                                            <Button variant="outlined" color="inherit" size="small" fullWidth sx={{ borderRadius: 99, py: { xs: 0.85, sm: 1 } }}>
                                                Payments
                                            </Button>
                                        </Stack>
                                    </Stack>
                                    ))}
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
        </Stack>
    );
};

export default ClientDetails;
