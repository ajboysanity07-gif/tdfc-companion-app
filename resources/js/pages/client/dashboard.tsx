import { useMyTheme } from '@/hooks/use-mytheme';
import { useClientDashboard } from '@/hooks/use-client-dashboard';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Banknote, CircleX, LogOut, PiggyBank } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useRoute } from 'ziggy-js';
import { createTheme } from 'react-data-table-component';
import SavingsTable from '@/components/dashboard/savings-table';
import FullScreenModalMobile from '@/components/ui/full-screen-modal-mobile';
import { ClientDashboardSkeleton } from '@/components/client/dashboard/skeletons';
import { PAGINATION, DUMMY_VALUES } from '@/lib/constants';

type UserShape = {
    name?: string;
    email?: string;
    avatar?: string | null;
    role?: string | null;
    bname?: string | null;
    class?: string | null;
    class_name?: string | null;
    status?: string | null;
};

type PageProps = {
    auth?: { user?: UserShape | null };
    [key: string]: unknown;
};

const formatCurrency = (amount: number): string => {
    if (!Number.isFinite(amount)) return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 2,
    }).format(amount).replace('PHP', '₱');
};

const formatDate = (iso: string | null): string => {
    if (!iso) return '';
    const date = new Date(iso);
    if (!Number.isFinite(date.getTime())) return iso;
    return date.toLocaleDateString('en-PH');
};

createTheme(
    'rb-dark',
    {
        text: { primary: '#e5e7eb', secondary: '#cbd5e1' },
        background: { default: 'transparent' },
        context: { background: '#374151', text: '#e5e7eb' },
        divider: { default: 'rgba(120,120,120,0.25)' },
        button: { default: '#F57979', hover: '#e26d6d', focus: '#e26d6d' },
        striped: { default: 'rgba(255,255,255,0.02)', text: '#e5e7eb' },
    },
    'dark',
);

export default function CustomerDashboard() {
    const route = useRoute();
    const { props } = usePage<PageProps>();
    const user = props.auth?.user ?? null;
    const acctno = route().params?.acctno as string | undefined;
    const fullName = user?.name ?? 'Customer';
    const avatar = user?.avatar ?? null;
    const clientName = user?.bname ?? fullName;
    const clientClass = user?.class ?? user?.class_name ?? user?.role ?? 'Client';
    const tw = useMyTheme();
    const accent = '#F57979';
    const accentHighlight = '#FFF172';
    const surface = tw.isDark ? '#2f2f2f' : '#ffffff';
    const borderColor = tw.isDark ? '#3a3a3a' : '#e5e7eb';
    const isMobile = useMediaQuery('(max-width:900px)');

    const { transactions, loanClass, savings, loading, error, fetchRecentTransactions } = useClientDashboard(acctno);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(PAGINATION.DASHBOARD_PAGE_SIZE);
    const [showSavingsModal, setShowSavingsModal] = useState(false);
    const showDashboardSkeleton = loading && transactions.length === 0 && savings.length === 0;

    const latestSavingsBalance = useMemo(() => {
        // Find the first (latest by date_in DESC) savings transaction
        const savingsTransaction = transactions.find(t => t.source === 'SAV');
        
        if (savingsTransaction) {
            // Convert balance to number in case it's a string
            const balanceValue = typeof savingsTransaction.balance === 'string' 
                ? parseFloat(savingsTransaction.balance) 
                : (savingsTransaction.balance ?? 0);
            
            if (balanceValue > 0) {
                return formatCurrency(balanceValue);
            }
        }
        return DUMMY_VALUES.SAVINGS_DISPLAY;
    }, [transactions]);

    const initials = useMemo(
        () =>
            fullName
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0]?.toUpperCase() ?? '')
                .join('') || 'CU',
        [fullName],
    );

    const firstName = useMemo(() => {
        const base = clientName?.trim() ?? '';
        if (!base) return 'Customer';
        if (base.includes(',')) {
            const afterComma = base.split(',')[1]?.trim();
            if (afterComma) return afterComma.split(/\s+/)[0] || afterComma;
        }
        return base.split(/\s+/)[0] || base;
    }, [clientName]);

    const paginatedTransactions = useMemo(() => {
        const startIdx = (currentPage - 1) * pageSize;
        const endIdx = startIdx + pageSize;
        return transactions.slice(startIdx, endIdx);
    }, [transactions, currentPage, pageSize]);

    const totalPages = useMemo(() => {
        return Math.ceil(transactions.length / pageSize);
    }, [transactions.length, pageSize]);

    const amountValues = useMemo(() => {
        return paginatedTransactions.map(t => {
            let displayValue = 0;
            let prefix = '';
            let color = tw.isDark ? '#e5e7eb' : '#374151';

            if (t.deposit && t.deposit > 0) {
                displayValue = t.deposit;
                prefix = '+';
                color = '#4c92f1'; // Blue for additions
            } else if (t.withdrawal && t.withdrawal > 0) {
                displayValue = t.withdrawal;
                prefix = '-';
                color = '#f57373'; // Red for deductions
            } else if (t.principal && t.principal > 0) {
                displayValue = t.principal;
                prefix = '';
                color = '#4c92f1'; // Blue for loan release
            } else if (t.payments && t.payments > 0) {
                displayValue = t.payments;
                prefix = '-';
                color = '#f57373'; // Red for payments
            }

            return { displayValue, prefix, color };
        });
    }, [paginatedTransactions, tw.isDark]);

    const transactionDetails = useMemo(() => {
        return paginatedTransactions.map(t => {
            if (t.deposit && t.deposit > 0) {
                return 'Deposit';
            } else if (t.withdrawal && t.withdrawal > 0) {
                return 'Withdrawal';
            } else if (t.principal && t.principal > 0) {
                return 'Principal';
            } else if (t.payments && t.payments > 0) {
                return 'Payment';
            }
            return '';
        });
    }, [paginatedTransactions]);

    const balanceLabels = useMemo(() => {
        return paginatedTransactions.map(() => {
            // Use single neutral color for all balances
            return tw.isDark ? '#9ca3af' : '#6b7280';
        });
    }, [paginatedTransactions, tw.isDark]);

    const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = Math.max(1, parseInt(event.target.value) || 10);
        setPageSize(newSize);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
    };

    useEffect(() => {
        fetchRecentTransactions().catch((err: unknown) => {
            if (import.meta.env.DEV && err instanceof Error) {
                console.error('[Dashboard] Failed to fetch transactions:', err.message);
            }
        });
    }, [fetchRecentTransactions]);

    const handleRetry = () => {
        fetchRecentTransactions().catch((err: unknown) => {
            if (import.meta.env.DEV && err instanceof Error) {
                console.error('[Dashboard] Failed to retry transactions:', err.message);
            }
        });
    };

    const headerBlock = (
        <Box
            sx={{
                borderRadius: 3,
                p: { xs: 2.5, sm: 3 },
                background: tw.isDark ? 'linear-gradient(135deg, #F57979, #b85555)' : 'linear-gradient(135deg, #F57979, #ff9b9b)',
                color: '#ffffff',
                boxShadow: '0 12px 30px rgba(15,23,42,0.16)',
            }}
        >
            <Stack
                direction={{ xs: 'row', sm: 'row' }}
                spacing={{ xs: 2, sm: 3 }}
                alignItems="flex-start"
                justifyContent="space-between"
            >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0, flex: { xs: '0 0 70%', sm: 1 } }}>
                    <Avatar
                        src={avatar || undefined}
                        alt={fullName}
                        sx={{
                            width: { xs: 68, sm: 72 },
                            height: { xs: 68, sm: 72 },
                            bgcolor: 'rgba(255,255,255,0.2)',
                            fontWeight: 800,
                            border: '2px solid rgba(255,255,255,0.4)',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.18)',
                            display: { xs: 'none', sm: 'flex' },
                            flexShrink: 0,
                        }}
                    >
                        {!avatar ? initials : null}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 1.1, color: accentHighlight }}>
                            Welcome
                        </Typography>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 750,
                                lineHeight: 1.1,
                                textTransform: 'capitalize',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: { xs: '100%', sm: '28ch' },
                                mt: -1,
                                fontFamily: 'system-ui, -apple-system, sans-serif',
                            }}
                        >
                            {firstName}
                        </Typography>
                        <Box
                            component="span"
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.75,
                                mt: 0.75,
                                px: 1.25,
                                py: 0.5,
                                borderRadius: 999,
                                backgroundColor: 'rgba(255,255,255,0.16)',
                                fontWeight: 700,
                                fontSize: 13,
                            }}
                        >
                            Class: {loanClass || clientClass}
                        </Box>
                    </Box>
                </Stack>

                <Avatar
                    src={avatar || undefined}
                    alt={fullName}
                    sx={{
                        width: 68,
                        height: 68,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        fontWeight: 800,
                        border: '2px solid rgba(255,255,255,0.4)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.18)',
                        display: { xs: 'flex', sm: 'none' },
                        flexShrink: 0,
                    }}
                >
                    {!avatar ? initials : null}
                </Avatar>
            </Stack>
      <Stack alignItems="center" spacing={0.5} sx={{ width: { xs: '100%', sm: 'auto' }, pt: 2 }}>
                    <Divider sx={{ width: '90%', mb: 1, borderColor: '#ffffff' }} />
                </Stack>
            <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="center"
                sx={{ width: '100%', mt: 2 }}
            >
          
                <Stack alignItems="center" spacing={0.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    <Typography 
                        variant="h3" 
                        sx={{ 
                            fontWeight: 800, 
                            lineHeight: 1, 
                            letterSpacing: { xs: -2, sm: -3 },
                            fontSize: { xs: '2.5rem', sm: '3rem' },
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                        }}
                    >
                        {latestSavingsBalance}
                    </Typography>
                    <Typography variant="overline" sx={{ letterSpacing: 1, color: accentHighlight, fontWeight: 800 }}>
                        Personal Savings
                    </Typography>
                </Stack>
            </Stack>
        </Box>
    );

    const mobileTransactions = (
        <Box
            sx={{
                borderRadius: 2,
                border: `1px solid ${borderColor}`,
                backgroundColor: surface,
                p: { xs: 2, md: 3 },
                boxShadow: tw.isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                    Recent Transactions
                </Typography>
                <Button 
                    size="small" 
                    sx={{ 
                        color: accent, 
                        fontWeight: 700, 
                        textTransform: 'none',
                        '&:hover': {
                            backgroundColor: `${accent}10`,
                            transform: 'translateX(2px)',
                        },
                        transition: 'all 0.2s ease'
                    }}
                >
                    View All
                </Button>
            </Stack>
            <Divider sx={{ mb: 2, borderColor, opacity: 0.6 }} />
            
            {/* Color Legend */}
            <Stack 
                direction="row" 
                spacing={2} 
                sx={{ 
                    mb: 2, 
                    pb: 2, 
                    borderBottom: `1px dashed ${borderColor}`,
                    flexWrap: 'wrap',
                    gap: 1
                }}
            >
                <Stack direction="row" spacing={0.5} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#4c92f1' }} />
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.7 }}>
                        Deposit / Principal
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f57373' }} />
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.7 }}>
                        Withdrawal / Payment
                    </Typography>
                </Stack>
            </Stack>

            {loading && (
                <Stack spacing={1.5} sx={{ py: 1 }}>
                    {Array.from({ length: isMobile ? 4 : 5 }).map((_, idx) => (
                        <Stack
                            key={idx}
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            spacing={2}
                            py={1.5}
                            px={1}
                        >
                            <Stack spacing={0.6}>
                                <Skeleton variant="text" width={140} height={20} />
                                <Skeleton variant="text" width={90} height={16} />
                            </Stack>
                            <Stack spacing={0.6} alignItems="flex-end">
                                <Skeleton variant="text" width={90} height={20} />
                                <Skeleton variant="text" width={80} height={16} />
                            </Stack>
                        </Stack>
                    ))}
                </Stack>
            )}

            {error && !loading && (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                    <Typography color="error" sx={{ mb: 1, fontWeight: 600 }}>
                        {error}
                    </Typography>
                    <Button variant="contained" size="small" onClick={handleRetry} sx={{ backgroundColor: accent }}>
                        Try Again
                    </Button>
                </Box>
            )}

            {!loading && !error && transactions.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    No transactions found.
                </Typography>
            )}

            {!loading && !error && transactions.length > 0 && (
                <>
                    <Stack divider={<Divider flexItem sx={{ borderColor }} />}>
                        {paginatedTransactions.map((t, idx) => {
                            const uniqueKey = `${t.ln_sv_number}-${t.date_in}-${t.amount}-${idx}`;
                            return (
                                <Stack
                                    key={uniqueKey}
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    spacing={2}
                                    py={1.5}
                                    px={1}
                                    sx={{
                                        borderRadius: 1,
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            backgroundColor: tw.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                            transform: 'translateX(4px)',
                                        }
                                    }}
                                >
                                    <Box>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography 
                                                variant="subtitle2" 
                                                sx={{ 
                                                    fontWeight: 700, 
                                                    fontSize: { xs: '0.875rem', md: '1rem' },
                                                    letterSpacing: '0.01em'
                                                }}
                                            >
                                                {t.transaction_type}
                                            </Typography>
                                            <Chip 
                                                label={transactionDetails[idx]} 
                                                size="small"
                                                sx={{ 
                                                    backgroundColor: tw.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                                    color: tw.isDark ? '#d1d5db' : '#4b5563',
                                                    fontWeight: 600,
                                                    fontSize: { xs: '0.7rem', md: '0.75rem' },
                                                    height: { xs: 22, md: 24 },
                                                    border: 'none',
                                                    '& .MuiChip-label': {
                                                        px: 1.5,
                                                    }
                                                }}
                                            />
                                        </Stack>
                                        <Typography 
                                            variant="caption" 
                                            color="text.secondary" 
                                            sx={{ 
                                                fontSize: { xs: '0.75rem', md: '0.8125rem' },
                                                opacity: 0.7,
                                                fontVariantNumeric: 'tabular-nums'
                                            }}
                                        >
                                            {formatDate(t.date_in)}
                                        </Typography>
                                    </Box>
                                    <Box textAlign="right">
                                        <Typography 
                                            variant="subtitle2" 
                                            sx={{ 
                                                fontWeight: 700, 
                                                fontSize: { xs: '0.95rem', md: '1.125rem' }, 
                                                color: amountValues[idx]?.color || '#000000',
                                                fontVariantNumeric: 'tabular-nums',
                                                letterSpacing: '-0.02em'
                                            }}
                                        >
                                            {amountValues[idx]?.prefix}{formatCurrency(Math.abs(amountValues[idx]?.displayValue ?? 0))}
                                        </Typography>
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                fontSize: { xs: '0.75rem', md: '0.8125rem' }, 
                                                color: balanceLabels[idx] || '#000000',
                                                fontVariantNumeric: 'tabular-nums',
                                                opacity: 0.9
                                            }}
                                        >
                                            {formatCurrency(Math.abs(t.balance ?? 0))}
                                        </Typography>
                                    </Box>
                                </Stack>
                            );
                        })}
                    </Stack>

                    <Stack spacing={2} sx={{ pt: 2, borderTop: `1px solid ${borderColor}`}}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    Items per page:
                                </Typography>
                                <input
                                    type="number"
                                    min="1"
                                    value={pageSize}
                                    onChange={handlePageSizeChange}
                                    style={{
                                        width: '60px',
                                        padding: '8px 10px',
                                        border: `1px solid ${borderColor}`,
                                        borderRadius: '6px',
                                        backgroundColor: surface,
                                        color: tw.isDark ? '#e5e7eb' : '#000000',
                                        fontFamily: 'inherit',
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                        textAlign: 'center',
                                        transition: 'all 0.2s ease',
                                    }}
                                />
                            </Stack>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, opacity: 0.8 }}>
                                Page {currentPage} of {totalPages} ({transactions.length} total)
                            </Typography>
                        </Stack>

                        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                onChange={(_, page) => handlePageChange(page)}
                                color="standard"
                                siblingCount={0}
                                boundaryCount={1}
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        color: tw.isDark ? '#e5e7eb' : '#000000',
                                        borderColor: borderColor,
                                        fontWeight: 500,
                                        transition: 'all 0.2s ease',
                                    },
                                    '& .MuiPaginationItem-page.Mui-selected': {
                                        backgroundColor: accent,
                                        color: '#ffffff',
                                        fontWeight: 700,
                                        transform: 'scale(1.05)',
                                        '&:hover': {
                                            backgroundColor: '#e66767',
                                        },
                                    },
                                    '& .MuiPaginationItem-page:hover': {
                                        backgroundColor: `${accent}15`,
                                        transform: 'scale(1.05)',
                                    },
                                }}
                            />
                        </Box>
                    </Stack>
                </>
            )}
        </Box>
    );

    const primaryActions = (
        <Box
            sx={{
                // mt: 1,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: 1.5,
                justifyContent: 'center',
            }}
        >
            {[
                {
                    key: 'loan',
                    title: 'Loan Apply',
                    description: 'Apply for a loan quickly.',
                    icon: <Banknote className="h-8 w-8" />,
                    bg: tw.isDark ? '#2d2d2d' : '#f6f7f9',
                    iconBg: `${accent}20`,
                    color: tw.isDark ? '#e5e7eb' : '#111827',
                },
                {
                    key: 'savings',
                    title: 'Savings',
                    description: 'Manage and grow your savings.',
                    icon: <PiggyBank className="h-8 w-8" />,
                    bg: tw.isDark ? '#2d2d2d' : '#f6f7f9',
                    iconBg: `${accent}20`,
                    color: tw.isDark ? '#e5e7eb' : '#111827',
                },
                {
                    key: 'logout',
                    title: 'Log Out',
                    description: 'End your current session securely.',
                    icon: <LogOut className="h-8 w-8" />,
                    bg: accent,
                    iconBg: 'rgba(255,255,255,0.28)',
                    color: '#ffffff',
                },
            ].map((action) => (
                <Button
                    key={action.key}
                    fullWidth
                    variant="contained"
                    disableElevation
                    onClick={() => {
                        if (action.key === 'loan') {
                            router.get(route('client.loan-calculator', { acctno }));
                        } else if (action.key === 'savings') {
                            setShowSavingsModal(true);
                        } else if (action.key === 'logout') {
                            router.post(route('logout'));
                        }
                    }}
                    sx={{
                        height: '100%',
                        minHeight: 140,
                        justifyContent: 'center',
                        textTransform: 'none',
                        borderRadius: 3,
                        alignItems: 'center',
                        p: { xs: 2.5, sm: 3 },
                        display: action.key === 'logout' ? { xs: 'none', sm: 'flex' } : 'flex',
                        backgroundColor: action.bg,
                        color: action.color,
                        border: `1px solid ${action.key === 'logout' ? accent : borderColor}`,
                        boxShadow: '0 10px 24px rgba(15,23,42,0.12)',
                        transition: 'transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease',
                        '&:hover': {
                            backgroundColor: action.key === 'logout' ? '#e66767' : tw.isDark ? '#353535' : '#ffffff',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 14px 30px rgba(15,23,42,0.16)',
                            borderColor: accent,
                        },
                    }}
                >
                    <Stack spacing={1.25} alignItems="center" sx={{ textAlign: 'center', width: '100%' }}>
                        <Box
                            sx={{
                                display: 'grid',
                                placeItems: 'center',
                                width: 72,
                                height: 72,
                                borderRadius: '50%',
                                backgroundColor: action.iconBg,
                                color: action.key === 'logout' ? '#ffffff' : accent,
                                boxShadow: '0 8px 18px rgba(0,0,0,0.12)',
                            }}
                        >
                            {action.icon}
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            {action.title}
                        </Typography>
                        <Typography
                            variant="body2"
                            color={action.key === 'logout' ? 'rgba(255,255,255,0.85)' : 'text.secondary'}
                            sx={{ display: { xs: 'none', sm: 'block' } }}
                        >
                            {action.description}
                        </Typography>
                    </Stack>
                </Button>
            ))}
        </Box>
    );

    const MobileView = () => (
        <Stack spacing={2}>
            {mobileTransactions}
        </Stack>
    );

    const DesktopView = () => (
        <Stack spacing={2}>
            {mobileTransactions}
        </Stack>
    );

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/client/dashboard' }]}>
            <Head title="Dashboard" />
            {loading ? <LinearProgress color="primary" sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 60 }} /> : null}
            <div className="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
                <Slide in={!!loading} direction="down" mountOnEnter unmountOnExit>
                    <div className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-900/30">
                        Loading...
                    </div>
                </Slide>
                <Slide in={!!error && !loading} direction="down" mountOnEnter unmountOnExit>
                    <div className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-900/30">
                        <CircleX className="h-4 w-4" />
                        <span>{error || 'An error occurred'}</span>
                    </div>
                </Slide>
            </div>
            <Box sx={{ minHeight: '100%', bgcolor: tw.isDark ? '#0b0b0b' : '#f5f5f5', py: 2 }}>
                <Box className="sr-only focus-within:not-sr-only">
                    <a
                        href="#main-content"
                        className="absolute top-0 left-0 z-50 rounded-br-md bg-[#F57979] p-2 text-white focus:ring-2 focus:ring-white focus:outline-none"
                    >
                        Skip to main content
                    </a>
                </Box>

                <Box id="main-content" sx={{ display: 'flex', flexDirection: 'column', gap: 2, px: { xs: 2, sm: 3 }, pb: { xs: 9, sm: 2 }, bgcolor: tw.isDark ? '#0b0b0b' : '#f5f5f5' }}>
                    {showDashboardSkeleton ? (
                        <ClientDashboardSkeleton />
                    ) : (
                        <>
                            <Box>{headerBlock}</Box>
                            {primaryActions}
                            {isMobile ? <MobileView /> : <DesktopView />}
                        </>
                    )}
                </Box>
            </Box>

            {/* Savings Modal */}
            <FullScreenModalMobile
                open={showSavingsModal}
                title="My Savings"
                onClose={() => setShowSavingsModal(false)}
                headerBg={accent}
                headerColor="#ffffff"
                bodySx={{
                    p: { xs: 1.5, md: 2 },
                    pb: { xs: 1.5, md: 2 },
                    flex: '1 1 auto',
                    overflowY: 'auto',
                }}
            >
                <SavingsTable
                    savings={savings}
                    loading={loading}
                    error={error}
                    onRetry={handleRetry}
                    isDark={tw.isDark}
                />
            </FullScreenModalMobile>
        </AppLayout>
    );
}
