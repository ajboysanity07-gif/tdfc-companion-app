import React, { useMemo, useState } from 'react';
import { Box, Button, Divider, Pagination, Skeleton, Stack, Typography } from '@mui/material';
import type { WSavledRecord } from '@/types/client-dashboard';

const SavingsTransactionTypeMap: Record<string, string> = {
    'IN': 'Interest',
    'TX': 'Tax',
    'CS': 'Cash',
    'AJ': 'Adjustment',
    'CK': 'Cheque',
    'RL': 'Released Loan',
};

const getSavingsTransactionType = (code: string): string => {
    return SavingsTransactionTypeMap[code.toUpperCase()] || code;
};

interface SavingsTableProps {
    savings: WSavledRecord[];
    loading?: boolean;
    error?: string | null;
    onRetry?: () => void;
    isDark?: boolean;
}

export default function SavingsTable({
    savings,
    loading = false,
    error = null,
    onRetry,
    isDark = false,
}: SavingsTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const showSkeleton = loading && !error;

    const accent = '#F57979';
    const surface = isDark ? '#2f2f2f' : '#ffffff';
    const borderColor = isDark ? '#3a3a3a' : '#e5e7eb';

    const formatCurrency = (amount: number): string => {
        if (!Number.isFinite(amount)) return 'PHP 0.00';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (iso: string | null): string => {
        if (!iso) return '';
        const date = new Date(iso);
        if (!Number.isFinite(date.getTime())) return iso;
        return date.toLocaleDateString('en-PH');
    };

    const paginatedSavings = useMemo(() => {
        const startIdx = (currentPage - 1) * pageSize;
        const endIdx = startIdx + pageSize;
        return savings.slice(startIdx, endIdx);
    }, [savings, currentPage, pageSize]);

    const totalPages = useMemo(() => {
        return Math.ceil(savings.length / pageSize);
    }, [savings.length, pageSize]);

    const amountValues = useMemo(() => {
        return paginatedSavings.map((row) => {
            let displayValue = 0;
            let prefix = '';
            let color = '#000000'; // default black

            if (row.deposit && row.deposit > 0) {
                displayValue = row.deposit;
                prefix = '+';
                color = '#1976d2'; // blue
            } else if (row.withdrawal && row.withdrawal > 0) {
                displayValue = row.withdrawal;
                prefix = '-';
                color = '#d32f2f'; // red
            }

            return { displayValue, prefix, color };
        });
    }, [paginatedSavings]);


    const transactionTypes = useMemo(() => {
        return paginatedSavings.map((row) => {
            return getSavingsTransactionType(row.cs_ck);
        });
    }, [paginatedSavings]);

    const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = Math.max(1, parseInt(event.target.value) || 10);
        setPageSize(newSize);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
    };

    return (
        <Box
            sx={{
                borderRadius: 2,
                border: `1px solid ${borderColor}`,
                backgroundColor: surface,
                p: { xs: 1.5, md: 2 },
                pb: { xs: 1.5, md: 2 },
                width: '100%',
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Personal Savings Transactions
                </Typography>
            </Stack>
            <Divider sx={{ mb: 2, borderColor }} />

            {showSkeleton && (
                <Stack spacing={1.5}>
                    {Array.from({ length: 5 }).map((_, idx) => (
                        <Stack key={idx} direction="row" alignItems="center" justifyContent="space-between" spacing={2} py={1.5}>
                            <Stack spacing={0.6}>
                                <Skeleton variant="text" width={140} height={20} />
                                <Skeleton variant="text" width={100} height={16} />
                            </Stack>
                            <Stack spacing={0.6} alignItems="flex-end">
                                <Skeleton variant="text" width={90} height={20} />
                                <Skeleton variant="text" width={80} height={16} />
                            </Stack>
                        </Stack>
                    ))}

                    <Stack spacing={1} sx={{ pt: 1, borderTop: `1px solid ${borderColor}` }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
                            <Skeleton variant="rounded" width={120} height={28} sx={{ borderRadius: 1 }} />
                            <Skeleton variant="text" width={140} height={16} />
                        </Stack>
                        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                            <Skeleton variant="rounded" width={180} height={28} sx={{ borderRadius: 999 }} />
                        </Box>
                    </Stack>
                </Stack>
            )}

            {error && !loading && (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                    <Typography color="error" sx={{ mb: 1, fontWeight: 600 }}>
                        {error}
                    </Typography>
                    {onRetry && (
                        <Button variant="contained" size="small" onClick={onRetry} sx={{ backgroundColor: accent }}>
                            Try Again
                        </Button>
                    )}
                </Box>
            )}

            {!loading && !error && savings.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    No savings transactions found.
                </Typography>
            )}

            {!loading && !error && savings.length > 0 && (
                <>
                    <Stack divider={<Divider flexItem sx={{ borderColor }} />}>
                        {paginatedSavings.map((row, idx) => {
                            const uniqueKey = `${row.svnumber}-${row.date_in}-${row.balance}-${idx}`;
                            return (
                                <Stack
                                    key={uniqueKey}
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    spacing={2}
                                    py={1.5}
                                >
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: { xs: '0.875rem', md: '1.125rem' } }}>
                                            {transactionTypes[idx]}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                                            {formatDate(row.date_in)}
                                        </Typography>
                                    </Box>
                                    <Box textAlign="right">
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: { xs: '0.875rem', md: '1.125rem' }, color: amountValues[idx]?.color || '#000000' }}>
                                            {amountValues[idx]?.prefix}{formatCurrency(Math.abs(amountValues[idx]?.displayValue ?? 0))}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                                            {formatCurrency(Math.abs(row.balance ?? 0))}
                                        </Typography>
                                    </Box>
                                </Stack>
                            );
                        })}
                    </Stack>

                    <Stack spacing={1} sx={{ pt: 1, borderTop: `1px solid ${borderColor}`, flexShrink: 0 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    Items per page:
                                </Typography>
                                <input
                                    type="number"
                                    min="1"
                                    value={pageSize}
                                    onChange={handlePageSizeChange}
                                    style={{
                                        width: '50px',
                                        padding: '4px 6px',
                                        border: `1px solid ${borderColor}`,
                                        borderRadius: '4px',
                                        backgroundColor: surface,
                                        color: isDark ? '#e5e7eb' : '#000000',
                                        fontFamily: 'inherit',
                                        fontSize: '0.875rem',
                                    }}
                                />
                            </Stack>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                Page {currentPage} of {totalPages} ({savings.length} total)
                            </Typography>
                        </Stack>

                        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', overflow: 'auto' }}>
                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                onChange={(_, page) => handlePageChange(page)}
                                color="standard"
                                siblingCount={0}
                                boundaryCount={1}
                                size="small"
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        color: isDark ? '#e5e7eb' : '#000000',
                                        borderColor: borderColor,
                                    },
                                    '& .MuiPaginationItem-page.Mui-selected': {
                                        backgroundColor: accent,
                                        color: '#ffffff',
                                        '&:hover': {
                                            backgroundColor: '#e66767',
                                        },
                                    },
                                    '& .MuiPaginationItem-page:hover': {
                                        backgroundColor: `${accent}15`,
                                    },
                                }}
                            />
                        </Box>
                    </Stack>
                </>
            )}
        </Box>
    );
}
