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
import { motion, AnimatePresence } from 'framer-motion';
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
        <div
            style={{
                borderRadius: '1.5rem',
                padding: '2.5rem',
                background: tw.isDark ? 'linear-gradient(135deg, #F57979, #b85555)' : 'linear-gradient(135deg, #F57979, #ff9b9b)',
                color: '#ffffff',
                boxShadow: '0 12px 30px rgba(15,23,42,0.16)',
            }}
        >
            <div className="flex flex-row gap-3 items-start justify-between">
                <div className="flex flex-row gap-2 items-center min-w-0 flex-1 max-sm:hidden">
                    <div
                        className="shrink-0 flex items-center justify-center"
                        style={{
                            width: '72px',
                            height: '72px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            fontWeight: 800,
                            border: '2px solid rgba(255,255,255,0.4)',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.18)',
                        }}
                    >
                        {!avatar ? initials : (avatar && <img src={avatar} alt={fullName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-bold tracking-wider text-yellow-300" style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1.1px' }}>
                            Welcome
                        </div>
                        <h1
                            className="font-bold text-2xl leading-tight capitalize truncate"
                            style={{
                                fontWeight: 750,
                                textTransform: 'capitalize',
                                maxWidth: '28ch',
                                fontFamily: 'system-ui, -apple-system, sans-serif',
                                marginTop: '-0.25rem',
                            }}
                        >
                            {firstName}
                        </h1>
                        <span
                            className="inline-flex items-center rounded-full"
                            style={{
                                gap: '0.75px',
                                marginTop: '0.75rem',
                                paddingLeft: '1.25rem',
                                paddingRight: '1.25rem',
                                paddingTop: '0.5rem',
                                paddingBottom: '0.5rem',
                                backgroundColor: 'rgba(255,255,255,0.16)',
                                fontWeight: 700,
                                fontSize: '13px',
                            }}
                        >
                            Class: {loanClass || clientClass}
                        </span>
                    </div>
                </div>

                <div className="flex sm:hidden flex-row gap-3 items-center flex-1">
                    <div
                        className="shrink-0 flex items-center justify-center"
                        style={{
                            width: '68px',
                            height: '68px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            fontWeight: 800,
                            border: '2px solid rgba(255,255,255,0.4)',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.18)',
                        }}
                    >
                        {!avatar ? initials : (avatar && <img src={avatar} alt={fullName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-bold tracking-wider text-yellow-300" style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Welcome
                        </div>
                        <h1
                            className="font-bold leading-tight capitalize truncate"
                            style={{
                                fontWeight: 750,
                                fontSize: '1.5rem',
                                textTransform: 'capitalize',
                                fontFamily: 'system-ui, -apple-system, sans-serif',
                                marginTop: '-0.125rem',
                            }}
                        >
                            {firstName}
                        </h1>
                        <span
                            className="inline-flex items-center rounded-full"
                            style={{
                                marginTop: '0.5rem',
                                paddingLeft: '1rem',
                                paddingRight: '1rem',
                                paddingTop: '0.375rem',
                                paddingBottom: '0.375rem',
                                backgroundColor: 'rgba(255,255,255,0.16)',
                                fontWeight: 700,
                                fontSize: '11px',
                            }}
                        >
                            Class {loanClass || clientClass}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center gap-0.5 w-full sm:w-auto pt-2">
                <div className="w-11/12 mb-1" style={{ borderBottom: '1px solid #ffffff', opacity: 1 }} />
            </div>
            <div className="flex flex-row gap-2 items-center justify-center w-full mt-2">
                <div className="flex flex-col items-center gap-0.5 w-full sm:w-auto">
                    <h2 
                        className="font-black leading-none"
                        style={{ 
                            fontWeight: 800, 
                            lineHeight: 1, 
                            letterSpacing: '-2px',
                            fontSize: '2.5rem',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                        }}
                    >
                        {latestSavingsBalance}
                    </h2>
                    <div className="font-bold text-yellow-300" style={{ letterSpacing: '1px', fontSize: '0.875rem', textTransform: 'uppercase' }}>
                        Personal Savings
                    </div>
                </div>
            </div>
        </div>
    );

    const mobileTransactions = (
        <div
            style={{
                borderRadius: '0.5rem',
                border: `1px solid ${borderColor}`,
                backgroundColor: surface,
                padding: '2rem',
                boxShadow: tw.isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
            }}
        >
            <div className="flex flex-row justify-between items-center mb-1">
                <h3 className="font-bold tracking-tight">
                    Recent Transactions
                </h3>
                <Button 
                    size="sm"
                    className="hover:bg-opacity-10 hover:scale-100"
                    style={{ 
                        color: accent, 
                        fontWeight: 700,
                        backgroundColor: 'transparent',
                        transition: 'all 0.2s ease'
                    }}
                >
                    View All
                </Button>
            </div>
            <div className="mb-2 opacity-60" style={{ borderBottom: `1px solid ${borderColor}` }} />
            
            {/* Color Legend */}
            <div 
                className="flex flex-row gap-2 mb-2 pb-2 flex-wrap"
                style={{ 
                    borderBottom: `1px dashed ${borderColor}`,
                }}
            >
                <div className="flex flex-row gap-0.5 items-center">
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4c92f1' }} />
                    <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                        Deposit / Principal
                    </span>
                </div>
                <div className="flex flex-row gap-0.5 items-center">
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f57373' }} />
                    <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                        Withdrawal / Payment
                    </span>
                </div>
            </div>

            {loading && (
                <div className="flex flex-col gap-1.5 py-1">
                    {Array.from({ length: isMobile ? 4 : 5 }).map((_, idx) => (
                        <div
                            key={idx}
                            className="flex flex-row items-center justify-between gap-2 py-1.5 px-1"
                        >
                            <div className="flex flex-col gap-0.6">
                                <Skeleton style={{ width: 140, height: 20 }} />
                                <Skeleton style={{ width: 90, height: 16 }} />
                            </div>
                            <div className="flex flex-col gap-0.6 items-end">
                                <Skeleton style={{ width: 90, height: 20 }} />
                                <Skeleton style={{ width: 80, height: 16 }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {error && !loading && (
                <div className="py-3 text-center">
                    <p style={{ color: '#dc2626', marginBottom: '0.5rem', fontWeight: 600 }}>
                        {error}
                    </p>
                    <Button variant="outline" size="sm" onClick={handleRetry} style={{ backgroundColor: accent, color: 'white' }}>
                        Try Again
                    </Button>
                </div>
            )}

            {!loading && !error && transactions.length === 0 && (
                <p style={{ color: '#6b7280', paddingTop: '3rem', paddingBottom: '3rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    No transactions found.
                </p>
            )}

            {!loading && !error && transactions.length > 0 && (
                <>
                    <div>
                        {paginatedTransactions.map((t, idx) => {
                            const uniqueKey = `${t.ln_sv_number}-${t.date_in}-${t.amount}-${idx}`;
                            return (
                                <div key={uniqueKey}>
                                    <div
                                        className="flex flex-row items-center justify-between gap-2 py-1.5 px-1 rounded transition-all duration-200 cursor-pointer"
                                        style={{
                                            backgroundColor: tw.isDark ? 'rgba(255,255,255,0.03)' : 'transparent',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = tw.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.02)';
                                            e.currentTarget.style.transform = 'translateX(4px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = tw.isDark ? 'rgba(255,255,255,0.03)' : 'transparent';
                                            e.currentTarget.style.transform = 'translateX(0)';
                                        }}
                                    >
                                        <div>
                                            <div className="flex flex-row gap-1 items-center">
                                                <span 
                                                    className="font-bold"
                                                    style={{ fontSize: '0.875rem', letterSpacing: '0.01em' }}
                                                >
                                                    {t.transaction_type}
                                                </span>
                                                <span 
                                                    className="px-1.5 text-xs font-semibold rounded"
                                                    style={{ 
                                                        backgroundColor: tw.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                                        color: tw.isDark ? '#d1d5db' : '#4b5563',
                                                        height: '22px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    {transactionDetails[idx]}
                                                </span>
                                            </div>
                                            <p 
                                                style={{ 
                                                    fontSize: '0.75rem',
                                                    opacity: 0.7,
                                                    color: '#6b7280',
                                                    fontVariantNumeric: 'tabular-nums'
                                                }}
                                            >
                                                {formatDate(t.date_in)}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p 
                                                className="font-bold"
                                                style={{ 
                                                    fontSize: '1rem', 
                                                    color: amountValues[idx]?.color || '#000000',
                                                    fontVariantNumeric: 'tabular-nums',
                                                    letterSpacing: '-0.02em'
                                                }}
                                            >
                                                {amountValues[idx]?.prefix}{formatCurrency(Math.abs(amountValues[idx]?.displayValue ?? 0))}
                                            </p>
                                            <p 
                                                style={{ 
                                                    fontSize: '0.75rem', 
                                                    color: balanceLabels[idx] || '#000000',
                                                    fontVariantNumeric: 'tabular-nums',
                                                    opacity: 0.9
                                                }}
                                            >
                                                {formatCurrency(Math.abs(t.balance ?? 0))}
                                            </p>
                                        </div>
                                    </div>
                                    {idx < paginatedTransactions.length - 1 && (
                                        <div style={{ borderBottom: `1px solid ${borderColor}` }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex flex-col gap-2 pt-2" style={{ borderTop: `1px solid ${borderColor}`}}>
                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                            <div className="flex flex-row gap-1 items-center">
                                <span className="font-semibold text-sm">
                                    Items per page:
                                </span>
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
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500, opacity: 0.8 }}>
                                Page {currentPage} of {totalPages} ({transactions.length} total)
                            </span>
                        </div>

                        <div className="flex justify-center w-full">
                            <div className="flex gap-1">
                                {totalPages > 0 && Array.from({ length: totalPages }).map((_, idx) => {
                                    const pageNum = idx + 1;
                                    const isActive = pageNum === currentPage;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className="px-2.5 py-1.5 rounded font-medium text-sm transition-all duration-200"
                                            style={{
                                                color: isActive ? '#ffffff' : (tw.isDark ? '#e5e7eb' : '#000000'),
                                                borderColor: borderColor,
                                                fontWeight: isActive ? 700 : 500,
                                                backgroundColor: isActive ? accent : 'transparent',
                                                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isActive) {
                                                    e.currentTarget.style.backgroundColor = `${accent}15`;
                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = isActive ? accent : 'transparent';
                                                e.currentTarget.style.transform = isActive ? 'scale(1.05)' : 'scale(1)';
                                            }}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    const primaryActions = (
        <div
            className="grid gap-3"
            style={{
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                gap: '0.75rem',
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
                    bg: '#f78080',
                    iconBg: 'rgba(255,255,255,0.28)',
                    color: '#ffffff',
                },
            ].map((action) => (
                <Button
                    key={action.key}
                    className="w-full"
                    onClick={() => {
                        if (action.key === 'loan') {
                            router.get(route('client.loan-calculator', { acctno }));
                        } else if (action.key === 'savings') {
                            setShowSavingsModal(true);
                        } else if (action.key === 'logout') {
                            router.post(route('logout'));
                        }
                    }}
                    style={{
                        height: '100%',
                        minHeight: '120px',
                        justifyContent: 'center',
                        textTransform: 'none',
                        borderRadius: '1.5rem',
                        alignItems: 'center',
                        padding: '1.5rem',
                        display: (action.key === 'logout' && isMobile) ? 'none' : 'flex',
                        backgroundColor: action.bg,
                        color: action.color,
                        border: `1px solid ${action.key === 'logout' ? accent : borderColor}`,
                        boxShadow: '0 10px 24px rgba(15,23,42,0.12)',
                        transition: 'transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease',
                        cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = action.key === 'logout' ? '#e66767' : (tw.isDark ? '#353535' : '#ffffff');
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 14px 30px rgba(15,23,42,0.16)';
                        e.currentTarget.style.borderColor = accent;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = action.bg;
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 10px 24px rgba(15,23,42,0.12)';
                    }}
                >
                    <div className="flex flex-col gap-1.25 items-center text-center w-full">
                        <div
                            className="flex items-center justify-center rounded-full"
                            style={{
                                width: '72px',
                                height: '72px',
                                backgroundColor: action.iconBg,
                                color: action.key === 'logout' ? '#ffffff' : accent,
                                boxShadow: '0 8px 18px rgba(0,0,0,0.12)',
                            }}
                        >
                            {action.icon}
                        </div>
                        <h4 className="font-black">{action.title}</h4>
                        <p
                            className="text-sm hidden sm:block"
                            style={{
                                color: action.key === 'logout' ? 'rgba(255,255,255,0.85)' : '#6b7280'
                            }}
                        >
                            {action.description}
                        </p>
                    </div>
                </Button>
            ))}
        </div>
    );

    const MobileView = () => (
        <div className="flex flex-col gap-2">
            {mobileTransactions}
        </div>
    );

    const DesktopView = () => (
        <div className="flex flex-col gap-2">
            {mobileTransactions}
        </div>
    );

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/client/dashboard' }]}>
            <Head title="Dashboard" />
            {loading ? <div className="fixed top-0 left-0 w-full h-1 bg-linear-to-r from-red-500 to-blue-500 z-50 animate-pulse" /> : null}
            <div className="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ y: -100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -100, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-900/30"
                        >
                            Loading...
                        </motion.div>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {error && !loading && (
                        <motion.div
                            initial={{ y: -100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -100, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-900/30"
                        >
                            <CircleX className="h-4 w-4" />
                            <span>{error || 'An error occurred'}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div style={{ minHeight: '100%', backgroundColor: tw.isDark ? '#0b0b0b' : '#f5f5f5', paddingTop: '2rem' }}>
                <div className="sr-only focus-within:not-sr-only">
                    <a
                        href="#main-content"
                        className="absolute top-0 left-0 z-50 rounded-br-md bg-[#F57979] p-2 text-white focus:ring-2 focus:ring-white focus:outline-none"
                    >
                        Skip to main content
                    </a>
                </div>

                <div id="main-content" className="flex flex-col gap-2 px-4 sm:px-6" style={{ backgroundColor: tw.isDark ? '#0b0b0b' : '#f5f5f5', paddingBottom: isMobile ? '100px' : '2rem' }}>
                    {showDashboardSkeleton ? (
                        <ClientDashboardSkeleton />
                    ) : (
                        <>
                            <div>{headerBlock}</div>
                            {primaryActions}
                            {isMobile ? <MobileView /> : <DesktopView />}
                        </>
                    )}
                </div>
            </div>

            {/* Savings Modal */}
            <FullScreenModalMobile
                open={showSavingsModal}
                title="My Savings"
                onClose={() => setShowSavingsModal(false)}
                headerBg={accent}
                headerColor="#ffffff"
                bodySx={{
                    padding: '16px',
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
