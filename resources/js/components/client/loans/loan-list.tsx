import { useEffect, useState } from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CalculateIcon from '@mui/icons-material/Calculate';
import BlockIcon from '@mui/icons-material/Block';
import { router, usePage } from '@inertiajs/react';
import { useMyTheme } from '@/hooks/use-mytheme';
import { useMediaQuery } from '@/hooks/use-media-query';
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

    // Helper function to get tooltip message and icon based on disable reason
    const getDisableReasonTooltip = (rec: WlnMasterRecord): { message: string; icon: React.ReactNode } | null => {
        if (!rec.is_renew_disabled) {
            return null;
        }

        // Renewal is disabled when: typecode is missing, product not found, or is_multiple=false
        return {
            message: 'This product type is not available for renewal. Contact your administrator for more information.',
            icon: <BlockIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
        };
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
            <div style={{ textAlign: 'center', paddingY: 16 }}>
                <div style={{ color: '#ef5350' }}>{error}</div>
            </div>
        );
    }

    if (!wlnRecords.length) {
        return (
            <div
                style={{
                    textAlign: 'center',
                    paddingY: 24,
                    paddingX: 12,
                    borderRadius: 8,
                    border: `1px dashed ${borderColor}`,
                    backgroundColor: panelBg,
                }}
            >
                <h6 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8 }}>
                    No Loans Found
                </h6>
                <p style={{ fontSize: '0.875rem', color: tw.isDark ? '#999' : '#666', margin: 0 }}>
                    You don't have any loan applications yet.
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <h5 style={{ color: '#F57979', fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 700, margin: 0 }}>
                        Active Loans
                    </h5>
                    {!isMobile && (
                        <button
                            onClick={() => router.visit(calculatorUrl)}
                            style={{
                                backgroundColor: '#F57979',
                                color: 'white',
                                fontWeight: 600,
                                textTransform: 'none',
                                borderRadius: 12,
                                paddingX: isMobile ? 8 : 12,
                                paddingY: isMobile ? 6 : 10,
                                fontSize: isMobile ? '0.813rem' : '0.875rem',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.2)';
                                e.currentTarget.style.transform = 'none';
                            }}
                        >
                            <CalculateIcon sx={{ fontSize: isMobile ? '18px' : '20px' }} />
                            New Transaction
                        </button>
                    )}
                </div>
                <div style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: 8,
                    backgroundColor: tw.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }}>
                    <SearchIcon style={{ color: tw.isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} />
                    <input
                        type="text"
                        placeholder="Search loans"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            flex: 1,
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: tw.isDark ? 'white' : 'black',
                            fontSize: '0.875rem',
                            outline: 'none',
                        }}
                    />
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                {paginatedRecords.map((rec, idx) => {
                    const hasSchedule = amortschedByLnnumber[rec.lnnumber ?? '']?.length > 0;
                    const schedLoadingThis = amortschedLoading[rec.lnnumber ?? ''];

                    return (
                        <div
                            key={rec.lnnumber || idx}
                            style={{
                                width: '100%',
                                borderRadius: 8,
                                backgroundColor: tw.isDark ? '#262626' : '#f5f5f5',
                                border: `2px solid ${tw.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)'}`,
                                padding: 10,
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = tw.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = tw.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)';
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
                                {/* Loan info */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <h6 
                                            style={{ 
                                                textTransform: 'uppercase',
                                                fontSize: '0.95rem',
                                                lineHeight: 1.2,
                                                fontWeight: 700,
                                                margin: 0,
                                            }}
                                        >
                                            {rec.remarks ? String(rec.remarks).trim() : 'LOAN'}
                                        </h6>
                                        {!hasSchedule && !schedLoadingThis && (
                                            <div title="No amortization schedule available for this loan" style={{ cursor: 'help' }}>
                                                <InfoOutlinedIcon 
                                                    fontSize="small" 
                                                    style={{ 
                                                        color: tw.isDark ? '#999' : '#666',
                                                    }} 
                                                />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <p 
                                        style={{ 
                                            color: tw.isDark ? '#999' : '#666',
                                            fontWeight: 400,
                                            fontSize: '0.8rem',
                                            margin: 0,
                                        }}
                                    >
                                        Loan no.: {rec.lnnumber || 'N/A'}
                                    </p>
                                    
                                    <h6 
                                        style={{ 
                                            fontSize: '0.9rem',
                                            fontWeight: 700,
                                            marginTop: 4,
                                            margin: 0,
                                        }}
                                    >
                                        Balance: <span style={{ color: '#F57979' }}>₱{rec.balance ? Number(rec.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</span>
                                    </h6>
                                    
                                    {rec.date_end && (
                                        <p 
                                            style={{ 
                                                color: tw.isDark ? '#999' : '#666',
                                                fontWeight: 400,
                                                fontSize: '0.8rem',
                                                margin: 0,
                                            }}
                                        >
                                            {new Date(rec.date_end).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                                        </p>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 120 }}>
                                    {(() => {
                                        const tooltipInfo = getDisableReasonTooltip(rec);
                                        return (
                                            <div title={tooltipInfo ? tooltipInfo.message : ''}>
                                                <button
                                                    onClick={() => onOpenCalculator(rec)}
                                                    disabled={rec.is_renew_disabled}
                                                    style={{
                                                        width: '100%',
                                                        backgroundColor: '#F57979',
                                                        color: 'white',
                                                        fontWeight: 700,
                                                        fontSize: '0.7rem',
                                                        textTransform: 'uppercase',
                                                        borderRadius: 12,
                                                        paddingX: 12,
                                                        paddingY: 3,
                                                        border: 'none',
                                                        cursor: rec.is_renew_disabled ? 'not-allowed' : 'pointer',
                                                        boxShadow: 'none',
                                                        opacity: rec.is_renew_disabled ? 0.5 : 1,
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!rec.is_renew_disabled) {
                                                            e.currentTarget.style.backgroundColor = '#e14e4e';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#F57979';
                                                    }}
                                                >
                                                    Renew
                                                </button>
                                            </div>
                                        );
                                    })()}
                                    <button
                                        onClick={() => openSchedule(rec)}
                                        disabled={schedLoadingThis || !hasSchedule}
                                        style={{
                                            width: '100%',
                                            borderWidth: 1,
                                            borderStyle: 'solid',
                                            borderColor: tw.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                                            fontWeight: 700,
                                            fontSize: '0.7rem',
                                            textTransform: 'uppercase',
                                            borderRadius: 12,
                                            paddingX: 12,
                                            paddingY: 3,
                                            backgroundColor: 'transparent',
                                            color: tw.isDark ? 'white' : 'black',
                                            cursor: (schedLoadingThis || !hasSchedule) ? 'not-allowed' : 'pointer',
                                            opacity: (schedLoadingThis || !hasSchedule) ? 0.5 : 1,
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!schedLoadingThis && hasSchedule) {
                                                e.currentTarget.style.borderColor = tw.isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)';
                                                e.currentTarget.style.backgroundColor = tw.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = tw.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)';
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        {schedLoadingThis ? 'Loading...' : 'Schedule'}
                                    </button>
                                    <button
                                        onClick={() => openLedger(rec)}
                                        style={{
                                            width: '100%',
                                            borderWidth: 1,
                                            borderStyle: 'solid',
                                            borderColor: tw.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                                            fontWeight: 700,
                                            fontSize: '0.7rem',
                                            textTransform: 'uppercase',
                                            borderRadius: 12,
                                            paddingX: 12,
                                            paddingY: 3,
                                            backgroundColor: 'transparent',
                                            color: tw.isDark ? 'white' : 'black',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = tw.isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)';
                                            e.currentTarget.style.backgroundColor = tw.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = tw.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)';
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        Payments
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                        <button
                            onClick={() => handlePageChange(null as any, Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '4px',
                                border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}`,
                                backgroundColor: tw.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                color: tw.isDark ? 'white' : 'black',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                opacity: currentPage === 1 ? 0.5 : 1,
                            }}
                        >
                            ←
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = i + Math.max(1, currentPage - 2);
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(null as any, pageNum)}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}`,
                                        backgroundColor: pageNum === currentPage ? '#F57979' : (tw.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                                        color: pageNum === currentPage ? 'white' : (tw.isDark ? 'white' : 'black'),
                                        cursor: 'pointer',
                                        fontWeight: pageNum === currentPage ? 700 : 400,
                                    }}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => handlePageChange(null as any, Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '4px',
                                border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}`,
                                backgroundColor: tw.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                color: tw.isDark ? 'white' : 'black',
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                opacity: currentPage === totalPages ? 0.5 : 1,
                            }}
                        >
                            →
                        </button>
                    </div>
                </div>
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
