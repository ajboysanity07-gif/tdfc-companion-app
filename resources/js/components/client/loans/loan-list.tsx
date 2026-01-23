import { useEffect, useState } from 'react';
import { Box, Stack, Typography, Button, Tooltip, TextField, InputAdornment, Pagination, useMediaQuery } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CalculateIcon from '@mui/icons-material/Calculate';
import { router, usePage } from '@inertiajs/react';
import { useMyTheme } from '@/hooks/use-mytheme';
import AmortschedTable from '@/components/common/amortsched-table';
import PaymentLedgerTable from '@/components/common/payment-ledger-table';
import FullScreenModalMobile from '@/components/ui/full-screen-modal-mobile';
import { LoanListSkeleton } from './skeletons';
import type { WlnMasterRecord, AmortschedDisplayEntry, WlnLedEntry } from '@/types/user';
import axiosClient from '@/api/axios-client';
import { PAGINATION } from '@/lib/constants';

declare global {
    interface Window {
        __LOANLIST_RENDERED?: boolean;
    }
}

type AuthUser = {
    acctno?: string | null;
};

type PageProps = {
    auth?: { user?: AuthUser | null };
    acctno?: string | null;
};

type Props = {
    onOpenCalculator: (loan: WlnMasterRecord) => void;
    onScheduleClick?: (loan: WlnMasterRecord) => void;
    onLedgerClick?: (loan: WlnMasterRecord) => void;
    desktopMode?: boolean;
};

export default function LoanList({ onOpenCalculator, onScheduleClick, onLedgerClick, desktopMode = false }: Props) {
    const tw = useMyTheme();
    const isMobile = useMediaQuery('(max-width:900px)');
    const { props, url } = usePage<PageProps>();
    const urlMatch = url.match(/\/client\/([^/]+)/);
    const urlAcctno = urlMatch ? urlMatch[1] : '';
    const customerAcct = props.acctno ?? props.auth?.user?.acctno ?? urlAcctno ?? '';
    const calculatorUrl = customerAcct ? `/client/${customerAcct}/loan-calculator` : '/loan-calculator';
    const borderColor = tw.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const panelBg = tw.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';

    const [wlnRecords, setWlnRecords] = useState<WlnMasterRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(PAGINATION.LOANS_PAGE_SIZE);

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
        const controller = new AbortController();
        
        const fetchLoans = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axiosClient.get('/loans', { signal: controller.signal });
                setWlnRecords(response.data.wlnMasterRecords || []);
            } catch (err: unknown) {
                if (err instanceof Error && err.name === 'CanceledError') return;
                
                const axiosError = err as { response?: { data?: { message?: string } } };
                const message = axiosError?.response?.data?.message || 'Failed to load loans';
                setError(message);
                
                if (import.meta.env.DEV) {
                    console.error('[LoanList] Failed to fetch loans:', err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchLoans();
        return () => controller.abort();
    }, []);

    // Fetch amortization schedule
    const fetchAmortsched = async (lnnumber: string) => {
        setAmortschedLoading((prev) => ({ ...prev, [lnnumber]: true }));
        try {
            const response = await axiosClient.get(`/loans/${lnnumber}/amortization`);
            setAmortschedByLnnumber((prev) => ({ ...prev, [lnnumber]: response.data.schedule || [] }));
        } catch (err: unknown) {
            if (import.meta.env.DEV && err instanceof Error) {
                console.error('[LoanList] Failed to fetch amortization schedule:', err.message);
            }
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
        } catch (err: unknown) {
            if (import.meta.env.DEV && err instanceof Error) {
                console.error('[LoanList] Failed to fetch ledger:', err.message);
            }
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
        if (desktopMode && onScheduleClick) {
            onScheduleClick(record);
        } else {
            setActiveLoan(record);
            setScheduleOpen(true);
        }
    };

    const openLedger = (record: WlnMasterRecord) => {
        if (!record?.lnnumber) return;
        if (desktopMode && onLedgerClick) {
            onLedgerClick(record);
        } else {
            setLedgerLoan(record);
            setLedgerOpen(true);
        }
    };

    const refreshSchedule = () => {
        if (activeLnnumber) {
            fetchAmortsched(activeLnnumber);
        }
    };

    // Filter loans based on search query
    const filteredRecords = wlnRecords.filter(rec => {
        if (!searchQuery) return true;
        const search = searchQuery.toLowerCase();
        return (
            String(rec.lntype || '').toLowerCase().includes(search) ||
            String(rec.lnnumber || '').toLowerCase().includes(search) ||
            rec.balance?.toString().includes(search)
        );
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
    };

    if (loading) {
        return <LoanListSkeleton desktopMode={desktopMode} />;
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
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h5" fontWeight={700} sx={{ color: '#F57979', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                        Active Loans
                    </Typography>
                    {!isMobile && (
                        <Button
                            variant="contained"
                            size="medium"
                            startIcon={<CalculateIcon sx={{ fontSize: { xs: '18px', sm: '20px' } }} />}
                            onClick={() => router.visit(calculatorUrl)}
                            sx={{
                                bgcolor: '#F57979',
                                color: 'white',
                                fontWeight: 600,
                                textTransform: 'none',
                                borderRadius: 3,
                                px: { xs: 2, sm: 3 },
                                py: { xs: 0.8, sm: 1.2 },
                                fontSize: { xs: '0.813rem', sm: '0.875rem' },
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                                    transform: 'translateY(-2px)',
                                },
                            }}
                        >
                            New Transaction
                        </Button>
                    )}
                </Box>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search loans"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            bgcolor: tw.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                            borderRadius: 2,
                        }
                    }}
                />
            </Box>
            <Stack spacing={1.5} width="100%">
                {paginatedRecords.map((rec, idx) => {
                    const hasSchedule = amortschedByLnnumber[rec.lnnumber ?? '']?.length > 0;
                    const schedLoadingThis = amortschedLoading[rec.lnnumber ?? ''];

                    return (
                        <Box
                            key={rec.lnnumber || idx}
                            sx={{
                                width: '100%',
                                borderRadius: 2,
                                bgcolor: tw.isDark ? '#262626' : '#FFFFFF',
                                border: '1px solid',
                                borderColor: tw.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                                p: 2.5,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: tw.isDark ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
                                },
                            }}
                        >
                            <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
                                {/* Loan info */}
                                <Stack spacing={0.5} flex={1}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography 
                                            variant="h6" 
                                            fontWeight={700} 
                                            sx={{ 
                                                textTransform: 'uppercase',
                                                fontSize: '0.95rem',
                                                lineHeight: 1.2,
                                            }}
                                        >
                                            {rec.remarks ? String(rec.remarks).trim() : 'LOAN'}
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
                                            fontWeight: 400,
                                            fontSize: '0.8rem',
                                        }}
                                    >
                                        Loan no.: {rec.lnnumber || 'N/A'}
                                    </Typography>
                                    
                                    <Typography 
                                        variant="h6" 
                                        fontWeight={700} 
                                        sx={{ 
                                            fontSize: '0.9rem',
                                            mt: 1,
                                        }}
                                    >
                                        Balance: <Box component="span" sx={{ color: '#F57979' }}>₱{rec.balance ? Number(rec.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</Box>
                                    </Typography>
                                    
                                    {rec.date_end && (
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                color: 'text.secondary',
                                                fontWeight: 400,
                                                fontSize: '0.8rem',
                                            }}
                                        >
                                            {new Date(rec.date_end).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                                        </Typography>
                                    )}
                                </Stack>

                                {/* Action buttons - stacked vertically */}
                                <Stack direction="column" spacing={1} sx={{ minWidth: 120 }}>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        fullWidth
                                        onClick={() => onOpenCalculator(rec)}
                                        data-loan-action
                                        sx={{
                                            bgcolor: '#F57979',
                                            color: 'white',
                                            fontWeight: 700,
                                            fontSize: '0.7rem',
                                            textTransform: 'uppercase',
                                            borderRadius: 6,
                                            px: 3,
                                            py: 0.75,
                                            boxShadow: 'none',
                                            '&:hover': {
                                                bgcolor: '#e14e4e',
                                                boxShadow: 'none',
                                            },
                                        }}
                                    >
                                        Renew
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        onClick={() => openSchedule(rec)}
                                        disabled={schedLoadingThis || !hasSchedule}
                                        sx={{
                                            borderWidth: 1,
                                            borderColor: tw.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                                            fontWeight: 700,
                                            fontSize: '0.7rem',
                                            textTransform: 'uppercase',
                                            borderRadius: 6,
                                            px: 3,
                                            py: 0.75,
                                            '&:hover': {
                                                borderWidth: 1,
                                                borderColor: tw.isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)',
                                                bgcolor: tw.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                            },
                                            '&:disabled': {
                                                borderColor: 'rgba(245, 121, 121, 0.2)',
                                                color: 'rgba(255, 255, 255, 0.3)',
                                            },
                                        }}
                                    >
                                        {schedLoadingThis ? 'Loading...' : 'Schedule'}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        onClick={() => openLedger(rec)}
                                        sx={{
                                            borderWidth: 1,
                                            borderColor: tw.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                                            fontWeight: 700,
                                            fontSize: '0.7rem',
                                            textTransform: 'uppercase',
                                            borderRadius: 6,
                                            px: 3,
                                            py: 0.75,
                                            '&:hover': {
                                                borderWidth: 1,
                                                borderColor: tw.isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)',
                                                bgcolor: tw.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
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

            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination 
                        count={totalPages} 
                        page={currentPage} 
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                color: tw.isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                                '&.Mui-selected': {
                                    bgcolor: '#F57979',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: '#e14e4e',
                                    },
                                },
                                '&:hover': {
                                    bgcolor: tw.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                                },
                            },
                        }}
                    />
                </Box>
            )}

            {/* Modals for Mobile Only */}
            {!desktopMode && (
                <>
                    {/* Amortization Schedule Modal */}
                    <FullScreenModalMobile
                        open={scheduleOpen}
                        onClose={() => setScheduleOpen(false)}
                        title={`Amortization - ${activeLoan?.lnnumber || ''}`}
                        bodyClassName="amort-schedule-open"
                    >
                        <AmortschedTable 
                            rows={scheduleRows} 
                            loading={scheduleLoading} 
                            onRefresh={refreshSchedule}
                            exportMeta={{
                                clientName: customerAcct,
                                lnnumber: activeLoan?.lnnumber ?? null,
                                remarks: activeLoan?.remarks ?? null,
                                lastPaymentDate: activeLoan?.date_end ?? null,
                            }}
                        />
                    </FullScreenModalMobile>

                    {/* Payment Ledger Modal */}
                    <FullScreenModalMobile
                        open={ledgerOpen}
                        onClose={() => setLedgerOpen(false)}
                        title={`Ledger - ${ledgerLoan?.lnnumber || ''}`}
                        bodyClassName="payment-ledger-open"
                    >
                        <PaymentLedgerTable 
                            rows={ledgerRows} 
                            loading={ledgerLoading}
                            exportMeta={{
                                clientName: customerAcct,
                                lnnumber: ledgerLoan?.lnnumber ?? null,
                                remarks: ledgerLoan?.remarks ?? null,
                                lastPaymentDate: ledgerLoan?.date_end ?? null,
                            }}
                        />
                    </FullScreenModalMobile>
                </>
            )}


        </>
    );
}
