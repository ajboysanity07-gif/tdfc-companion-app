import { useEffect, useState } from 'react';
import { Box, Stack, Typography, Button, CircularProgress, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useMyTheme } from '@/hooks/use-mytheme';
import AmortschedTable from '@/components/admin/client-management/amortsched-table';
import PaymentLedgerTable from '@/components/admin/client-management/payment-ledger-table';
import FullScreenModalMobile from '@/components/ui/full-screen-modal-mobile';
import type { WlnMasterRecord, AmortschedDisplayEntry, WlnLedEntry } from '@/types/user';
import axiosClient from '@/api/axios-client';

declare global {
    interface Window {
        __LOANLIST_RENDERED?: boolean;
    }
}

export default function LoanList() {
    const tw = useMyTheme();
    const borderColor = tw.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const panelBg = tw.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';

    const [wlnRecords, setWlnRecords] = useState<WlnMasterRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // DEBUG: Show if component is rendering and how many loans are loaded
    if (process.env.NODE_ENV !== 'production') {
        console.log('LoanList rendered. Loan count:', wlnRecords.length);
    }

    const [scheduleOpen, setScheduleOpen] = useState(false);
    const [activeLoan, setActiveLoan] = useState<WlnMasterRecord | null>(null);
    const [amortschedByLnnumber, setAmortschedByLnnumber] = useState<Record<string, AmortschedDisplayEntry[]>>({});
    const [amortschedLoading, setAmortschedLoading] = useState<Record<string, boolean>>({});

    const [ledgerOpen, setLedgerOpen] = useState(false);
    const [ledgerLoan, setLedgerLoan] = useState<WlnMasterRecord | null>(null);
    const [wlnLedByLnnumber, setWlnLedByLnnumber] = useState<Record<string, WlnLedEntry[]>>({});
    const [wlnLedLoading, setWlnLedLoading] = useState<Record<string, boolean>>({});

    const activeLnnumber = activeLoan?.lnnumber ?? null;
    const ledgerLnnumber = ledgerLoan?.lnnumber ?? null;
    const scheduleRows = activeLnnumber && amortschedByLnnumber ? amortschedByLnnumber[activeLnnumber] ?? [] : [];
    const scheduleLoading = activeLnnumber ? !!amortschedLoading[activeLnnumber] : false;
    const ledgerRows = ledgerLnnumber && wlnLedByLnnumber ? wlnLedByLnnumber[ledgerLnnumber] ?? [] : [];
    const ledgerLoading = ledgerLnnumber ? !!wlnLedLoading[ledgerLnnumber] : false;

    // Fetch loans
    useEffect(() => {
        // DEBUG: Show a visible message on the page
        if (typeof window !== 'undefined') {
            window.__LOANLIST_RENDERED = true;
        }
        const fetchLoans = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('Fetching loans from /loans...');
                const response = await axiosClient.get('/loans');
                console.log('Loans response:', response.data);
                setWlnRecords(response.data.wlnMasterRecords || []);
            } catch (err: unknown) {
                const error = err as { response?: { data?: { message?: string } } };
                console.error('Failed to fetch loans:', err);
                setError(error?.response?.data?.message || 'Failed to load loans');
            } finally {
                setLoading(false);
            }
        };

        fetchLoans();
    }, []);

    // Fetch amortization schedule
    const fetchAmortsched = async (lnnumber: string) => {
        setAmortschedLoading((prev) => ({ ...prev, [lnnumber]: true }));
        try {
            const response = await axiosClient.get(`/loans/${lnnumber}/amortization`);
            setAmortschedByLnnumber((prev) => ({ ...prev, [lnnumber]: response.data.schedule || [] }));
        } catch (err) {
            console.error('Failed to fetch amortization schedule:', err);
            setAmortschedByLnnumber((prev) => ({ ...prev, [lnnumber]: [] }));
        } finally {
            setAmortschedLoading((prev) => ({ ...prev, [lnnumber]: false }));
        }
    };

    // Fetch ledger
    const fetchWlnLed = async (lnnumber: string) => {
        setWlnLedLoading((prev) => ({ ...prev, [lnnumber]: true }));
        try {
            const response = await axiosClient.get(`/loans/${lnnumber}/ledger`);
            setWlnLedByLnnumber((prev) => ({ ...prev, [lnnumber]: response.data.ledger || [] }));
        } catch (err) {
            console.error('Failed to fetch ledger:', err);
            setWlnLedByLnnumber((prev) => ({ ...prev, [lnnumber]: [] }));
        } finally {
            setWlnLedLoading((prev) => ({ ...prev, [lnnumber]: false }));
        }
    };

    // Prefetch amortization schedules
    useEffect(() => {
        if (!wlnRecords.length) return;
        wlnRecords.forEach((rec) => {
            const ln = rec.lnnumber;
            if (!ln) return;
            const alreadyHasData = amortschedByLnnumber[ln] !== undefined;
            const isLoading = !!amortschedLoading[ln];
            if (!alreadyHasData && !isLoading) {
                fetchAmortsched(ln);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wlnRecords]);

    useEffect(() => {
        if (!scheduleOpen || !activeLnnumber) return;
        if (!amortschedByLnnumber[activeLnnumber]) {
            fetchAmortsched(activeLnnumber);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scheduleOpen, activeLnnumber]);

    useEffect(() => {
        if (!ledgerOpen || !ledgerLnnumber) return;
        if (!wlnLedByLnnumber[ledgerLnnumber]) {
            fetchWlnLed(ledgerLnnumber);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ledgerOpen, ledgerLnnumber]);

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
        if (activeLnnumber) {
            fetchAmortsched(activeLnnumber);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    if (!wlnRecords.length) {
        return (
            <Box
                sx={{
                    textAlign: 'center',
                    py: 6,
                    px: 3,
                    borderRadius: 2,
                    border: `1px dashed ${borderColor}`,
                    bgcolor: panelBg,
                }}
            >
                <Typography variant="h6" fontWeight={700} gutterBottom>
                    No Loans Found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    You don't have any loan applications yet.
                </Typography>
            </Box>
        );
    }

    return (
        <>
            {/* DEBUG: Visible message for blank page troubleshooting */}
            <Box sx={{ p: 2, bgcolor: '#ffe0e0', color: '#b71c1c', mb: 2, borderRadius: 2 }}>
                LoanList component rendered. Loans loaded: {wlnRecords.length}
            </Box>
            <Stack spacing={2} width="100%">
                {wlnRecords.map((rec, idx) => {
                    const hasSchedule = amortschedByLnnumber[rec.lnnumber ?? '']?.length > 0;
                    const schedLoadingThis = amortschedLoading[rec.lnnumber ?? ''];

                    return (
                        <Box
                            key={rec.lnnumber || idx}
                            sx={{
                                width: '100%',
                                borderRadius: 3,
                                bgcolor: tw.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                                border: `1px solid ${borderColor}`,
                                p: { xs: 2.5, sm: 3 },
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: tw.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: tw.isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.1)',
                                },
                            }}
                        >
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2.5, sm: 3 }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
                                {/* Left side - Loan info */}
                                <Stack spacing={1.5} flex={1}>
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
                                            {rec.lntype ? String(rec.lntype) : 'LOAN'}
                                        </Typography>
                                        {!hasSchedule && !schedLoadingThis && (
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
                                        Loan no.: {rec.lnnumber || 'N/A'}
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
                                        Balance: <Box component="span" sx={{ color: '#F57979' }}>₱{rec.balance ? Number(rec.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</Box>
                                    </Typography>
                                    
                                    {rec.date_end && (
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
                                            {new Date(rec.date_end).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                                        </Typography>
                                    )}
                                </Stack>

                                {/* Right side - Action buttons */}
                                <Stack direction="column" spacing={1.5} minWidth={{ xs: '100%', sm: 180 }}>
                                    <Button
                                        variant="contained"
                                        size="medium"
                                        fullWidth
                                        onClick={() => openSchedule(rec)}
                                        disabled={schedLoadingThis || !hasSchedule}
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
                                        {schedLoadingThis ? 'Loading...' : 'Schedule'}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="medium"
                                        fullWidth
                                        onClick={() => openLedger(rec)}
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
                                        }}
                                    >
                                        Payments
                                    </Button>
                                </Stack>
                            </Stack>
                        </Box>
                    );
                })}
            </Stack>

            {/* Amortization Schedule Modal */}
            <FullScreenModalMobile
                open={scheduleOpen}
                onClose={() => setScheduleOpen(false)}
                title={`Amortization - ${activeLoan?.lnnumber || ''}`}
                bodyClassName="amort-schedule-open"
            >
                <AmortschedTable rows={scheduleRows} loading={scheduleLoading} onRefresh={refreshSchedule} />
            </FullScreenModalMobile>

            {/* Payment Ledger Modal */}
            <FullScreenModalMobile
                open={ledgerOpen}
                onClose={() => setLedgerOpen(false)}
                title={`Ledger - ${ledgerLoan?.lnnumber || ''}`}
                bodyClassName="payment-ledger-open"
            >
                <PaymentLedgerTable rows={ledgerRows} loading={ledgerLoading} />
            </FullScreenModalMobile>

            {/* Floating Action Button - adjust position above nav bar */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: { xs: 10, sm: 40 }, // 80px for mobile nav bar, 40px for desktop
                    right: 24,
                    zIndex: 1201,
                }}
            >
                {/* Replace with your actual FAB component if needed */}
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        bgcolor: '#ff7b7b',
                        color: '#fff',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                        fontSize: 32,
                        cursor: 'pointer',
                        transition: 'box-shadow 0.2s',
                        '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.22)' },
                    }}
                >
                    <span style={{ lineHeight: 1 }}>&uarr;</span>
                </Box>
            </Box>
        </>
    );
}
