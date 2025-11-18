// resources/js/pages/dashboard.tsx - CORRECTED DROP-IN REPLACEMENT
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { Banknote, CreditCard, PiggyBank, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState, memo, useCallback } from 'react';
import DataTable, { createTheme, type TableColumn } from 'react-data-table-component';

// Fixed types for Inertia compatibility
type UserShape = { 
  name?: string; 
  email?: string; 
  avatar?: string | null; 
  role?: string | null 
};

type PageProps = { 
  auth?: { user?: UserShape | null };
  [key: string]: unknown; // ESLint fix: use unknown instead of any
};

type RecentRow = {
  lnnumber: string;
  description: string;
  date: string | null;
  principal: number;
  raw_balance: number;
};

// Improved utility functions
const formatCurrency = (amount: number): string => {
  if (!Number.isFinite(amount)) {
    return '₱0.00';
  }
  return new Intl.NumberFormat('en-PH', { 
    style: 'currency', 
    currency: 'PHP', 
    maximumFractionDigits: 2 
  }).format(amount);
};

const formatDate = (iso: string | null): string => {
  if (!iso) return '';
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) {
    return iso;
  }
  return date.toLocaleDateString('en-PH');
};

const getFirstName = (fullName: string): string => {
  if (fullName.includes(',')) {
    return fullName.split(',')[1]?.trim().split(' ')[0] ?? fullName;
  }
  return fullName.split(' ')[0] ?? fullName;
};

// Improved Loading Component
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center py-8" role="status" aria-live="polite">
    <div className="flex items-center gap-3">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#F57979] border-t-transparent" />
      <span className="text-gray-600 dark:text-neutral-400">Loading transactions...</span>
    </div>
  </div>
));
LoadingSpinner.displayName = 'LoadingSpinner';

// Error Message Component
const ErrorMessage = memo<{ message: string; onRetry?: () => void }>(({ message, onRetry }) => (
  <div className="py-8 text-center" role="alert">
    <div className="max-w-md mx-auto">
      <div className="text-red-600 dark:text-red-400 mb-4">
        <p className="font-medium">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-[#F57979] text-white rounded-lg hover:bg-[#e26d6d] transition-colors focus:outline-none focus:ring-2 focus:ring-[#F57979] focus:ring-offset-2"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
));
ErrorMessage.displayName = 'ErrorMessage';

// Dark theme (keep existing)
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

export default function Dashboard() {
  const { props } = usePage<PageProps>();
  const user = props.auth?.user ?? null;
  const fullName = user?.name ?? 'Customer';
  const avatar = user?.avatar ?? null;

  // State with improved error handling
  const [rows, setRows] = useState<RecentRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Improved fetch with proper error handling
  useEffect(() => {
    let alive = true;
    
    const fetchData = async () => {
      if (!alive) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/transactions/recent', { 
          headers: { 'X-Requested-With': 'XMLHttpRequest' } 
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!alive) return;
        
        const items: RecentRow[] = Array.isArray(data?.items) ? data.items : [];
        setRows(items);
      } catch (err) {
        if (!alive) return;
        
        console.error('Failed to fetch transactions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
        setRows([]);
      }
      
      if (alive) {
        setLoading(false);
      }
    };
    
    fetchData();
    
    return () => {
      alive = false;
    };
  }, []);

  // Retry function - triggers a re-fetch
  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    setRows([]);
    
    // Re-trigger the fetch
    fetch('/api/transactions/recent', { 
      headers: { 'X-Requested-With': 'XMLHttpRequest' } 
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const items: RecentRow[] = Array.isArray(data?.items) ? data.items : [];
        setRows(items);
        setLoading(false);
      })
      .catch(err => {
        console.error('Retry failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
        setLoading(false);
      });
  }, []);

  // Stats calculation (keep your existing logic)
  const stats = useMemo(() => {
    let svPrincipal = 0;
    let lnBalance = 0;
    let countLN = 0;
    const total = rows.length;

    for (const r of rows) {
      const code = (r.lnnumber ?? '').toUpperCase();
      const principal = Number(r.principal ?? 0);
      const rawBal = Number(r.raw_balance ?? 0);

      if (code.startsWith('SV')) {
        svPrincipal += principal;
      }
      if (code.startsWith('LN')) {
        lnBalance += rawBal;
        countLN++;
      }
    }
    const lnPercent = total > 0 ? (countLN / total) * 100 : 0;

    return { svPrincipal, lnBalance, lnPercent };
  }, [rows]);

  const savings = stats.svPrincipal;
  const deposits = stats.svPrincipal;
  const withdrawals = stats.lnBalance;
  const depositsChange = stats.lnPercent;
  const withdrawalsChange = stats.lnPercent;

  // Filter loan transactions
  const allRows = useMemo(() => 
    rows.filter(r => (r.lnnumber ?? '').toUpperCase().startsWith('LN')), 
    [rows]
  );

  // Fixed DataTable columns
  const columns = useMemo<TableColumn<RecentRow>[]>(() => [
    {
      name: 'Date',
      selector: (r: RecentRow) => formatDate(r.date),
      sortable: true,
      grow: 1,
      cell: (r: RecentRow) => (
        <time 
          dateTime={r.date || undefined}
          className="text-sm text-gray-600 dark:text-neutral-300"
        >
          {formatDate(r.date)}
        </time>
      ),
    },
    {
      name: 'Description',
      selector: (r: RecentRow) => r.description,
      sortable: true,
      grow: 2,
      cell: (r: RecentRow) => (
        <span className="font-semibold text-gray-800 dark:text-neutral-100">
          {r.description}
        </span>
      ),
    },
    {
      name: 'Amount',
      selector: (r: RecentRow) => r.principal,
      sortable: true,
      cell: (r: RecentRow) => {
        const val = Number(r.principal ?? 0);
        return (
          <span className="font-semibold text-gray-800 dark:text-neutral-100">
            {formatCurrency(Math.abs(val))}
          </span>
        );
      },
    },
  ], []);

  // Theme detection
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const tableTheme = isDark ? 'rb-dark' : 'default';

  const firstName = getFirstName(fullName);

  // Mobile View Component
  const Mobile = () => (
    <section className="md:hidden">
      <div className="relative -mx-4 mb-6 rounded-b-4xl bg-[#F57979] px-6 pt-6 pb-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg/5 font-extrabold">Welcome,</p>
            <h1 className="text-4xl font-extrabold tracking-tight">{firstName}</h1>
            <p className="mt-2 text-2xl/6 font-medium opacity-90">{(user?.role ?? 'customer').toLowerCase()}</p>
          </div>
          <div className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-white/60">
            {avatar ? (
              <img src={avatar} alt={`${fullName}'s avatar`} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center bg-white/20 text-white">
                <span aria-hidden="true">👤</span>
                <span className="sr-only">{fullName}'s avatar placeholder</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 text-center">
          <div className="text-[64px] leading-none tracking-tight">
            <span>₱</span>
            <span className="font-extrabold">
              {savings.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="mt-2 text-2xl font-extrabold uppercase">Personal Savings</p>
        </div>

        <div className="mt-4 h-0.5 w-full bg-white/80" />

        <div className="mt-5 rounded-3xl bg-[#FFE57E] px-6 py-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                className="grid size-20 place-items-center rounded-2xl bg-[#87bfd3] transition-colors hover:bg-[#9cc4d2] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#FFE57E]"
                aria-label="Apply for loan"
              >
                <Banknote className="size-10 text-white" aria-hidden="true" />
              </button>
              <span className="text-lg font-bold text-[#1f4d5a]">Loan Apply</span>
            </div>

            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                className="grid size-20 place-items-center rounded-2xl bg-[#87bfd3] transition-colors hover:bg-[#9cc4d2] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#FFE57E]"
                aria-label="Manage savings"
              >
                <PiggyBank className="size-10 text-white" aria-hidden="true" />
              </button>
              <span className="text-lg font-bold text-[#1a3f7a]">Savings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-neutral-100">Recent Transactions</h2>
          <a 
            href="#" 
            className="text-sm font-semibold text-[#F57979] hover:underline focus:outline-none focus:ring-2 focus:ring-[#F57979] focus:ring-offset-2 rounded"
          >
            View All
          </a>
        </div>

        {loading && <LoadingSpinner />}
        
        {error && <ErrorMessage message={error} onRetry={handleRetry} />}
        
        {!loading && !error && allRows.length === 0 && (
          <div className="px-2 py-4 text-sm text-gray-500 dark:text-neutral-400 text-center">
            No transactions found.
          </div>
        )}

        {!loading && !error && allRows.length > 0 && (
          <ul className="divide-y divide-gray-200 dark:divide-neutral-800">
            {allRows.map((t, idx) => {
              const principal = Number(t.principal ?? 0);
              const balanceRow = principal - Number(t.raw_balance ?? 0);

              return (
                <li key={t.lnnumber || `transaction-${idx}`} className="flex items-start justify-between px-2 py-4">
                  <div className="pr-4">
                    <div className="font-semibold text-gray-900 dark:text-neutral-100">{t.description}</div>
                    <time 
                      dateTime={t.date || undefined}
                      className="text-sm text-gray-500 dark:text-neutral-400"
                    >
                      {formatDate(t.date)}
                    </time>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-gray-800 dark:text-neutral-100">
                      {formatCurrency(Math.abs(principal))}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-neutral-400">
                      {formatCurrency(Math.abs(balanceRow))}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );

  // Desktop View Component
  const Desktop = () => (
    <section className="hidden md:block">
      <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Balance */}
          <div className="col-span-12 rounded-2xl border border-gray-200 bg-[#F7F9FC] p-4 lg:col-span-4 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-neutral-100">Balance</h3>
            <div className="rounded-2xl bg-[#F57979] p-5 text-white shadow-sm">
              <p className="text-sm/5 opacity-90">Welcome,</p>
              <h4 className="mt-1 text-2xl font-extrabold tracking-wide">{fullName.toUpperCase()}</h4>
              <p className="text-sm/5 opacity-90">{(user?.role ?? 'customer').toLowerCase()}</p>

              <div className="mt-6 text-[44px] leading-none font-extrabold">
                ₱{savings.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </div>
              <p className="mt-2 text-sm font-semibold uppercase opacity-90">Personal Savings</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="col-span-12 rounded-2xl border border-gray-200 bg-[#F7F9FC] p-4 lg:col-span-4 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-neutral-100">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-5">
              <a 
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-[#F57979] focus:ring-offset-2" 
                href="#"
                aria-label="Apply for loan"
              >
                <div className="grid size-9 place-items-center rounded-lg bg-[#86c7ff]/30 text-[#1a3f7a]" aria-hidden="true">
                  <Banknote className="size-5" />
                </div>
                <span className="text-sm font-semibold text-gray-800 dark:text-neutral-100">Loan Apply</span>
              </a>
              <a 
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-[#F57979] focus:ring-offset-2" 
                href="#"
                aria-label="Manage savings"
              >
                <div className="grid size-9 place-items-center rounded-lg bg-[#86c7ff]/30 text-[#1a3f7a]" aria-hidden="true">
                  <PiggyBank className="size-5" />
                </div>
                <span className="text-sm font-semibold text-gray-800 dark:text-neutral-100">Savings</span>
              </a>
              <a 
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-[#F57979] focus:ring-offset-2" 
                href="#"
                aria-label="Manage cards"
              >
                <div className="grid size-9 place-items-center rounded-lg bg-[#86c7ff]/30 text-[#1a3f7a]" aria-hidden="true">
                  <CreditCard className="size-5" />
                </div>
                <span className="text-sm font-semibold text-gray-800 dark:text-neutral-100">Cards</span>
              </a>
              <a 
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-[#F57979] focus:ring-offset-2" 
                href="#"
                aria-label="Manage beneficiaries"
              >
                <div className="grid size-9 place-items-center rounded-lg bg-[#86c7ff]/30 text-[#1a3f7a]" aria-hidden="true">
                  <UsersRound className="size-5" />
                </div>
                <span className="text-sm font-semibold text-gray-800 dark:text-neutral-100">Beneficiaries</span>
              </a>
            </div>
          </div>

          {/* Overview */}
          <div className="col-span-12 rounded-2xl border border-gray-200 bg-[#F7F9FC] p-4 lg:col-span-4 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-neutral-100">Overview</h3>

            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
              <div className="text-sm font-semibold text-gray-700 dark:text-neutral-200">Deposits</div>
              <div className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-neutral-50">
                {formatCurrency(deposits)}
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-neutral-700">
                <div
                  className="h-2 rounded-full bg-[#22c55e] transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, depositsChange))}%` }}
                />
              </div>
              <div className="mt-1 text-xs font-semibold text-[#22c55e]">
                {depositsChange.toFixed(0)}%
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
              <div className="text-sm font-semibold text-gray-700 dark:text-neutral-200">Withdrawals</div>
              <div className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-neutral-50">
                {formatCurrency(withdrawals)}
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-neutral-700">
                <div
                  className="h-2 rounded-full bg-[#ef4444] transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, withdrawalsChange))}%` }}
                />
              </div>
              <div className="mt-1 text-xs font-semibold text-[#ef4444]">
                {withdrawalsChange.toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Recent Transactions Table */}
          <div className="col-span-12 rounded-2xl border border-gray-200 bg-[#F7F9FC] p-4 dark:border-neutral-700 dark:bg-neutral-900">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-neutral-100">Recent Transactions</h3>
              <a 
                href="#" 
                className="text-sm font-semibold text-[#F57979] hover:underline focus:outline-none focus:ring-2 focus:ring-[#F57979] focus:ring-offset-2 rounded"
              >
                View All
              </a>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-2 dark:border-neutral-700 dark:bg-neutral-800">
              {error ? (
                <ErrorMessage message={error} onRetry={handleRetry} />
              ) : (
                <DataTable
                  columns={columns}
                  data={allRows}
                  progressPending={loading}
                  striped
                  highlightOnHover
                  responsive
                  theme={tableTheme}
                  pagination
                  paginationPerPage={10}
                  paginationRowsPerPageOptions={[5, 10, 15, 20]}
                  noDataComponent={
                    <div className="py-8 text-center text-gray-500 dark:text-neutral-400">
                      No loan transactions found
                    </div>
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: 'customer/dashboard' }]}>
      <Head title="Dashboard" />
      
      {/* Skip links for accessibility */}
      <div className="sr-only focus-within:not-sr-only">
        <a 
          href="#main-content" 
          className="absolute top-0 left-0 z-50 p-2 bg-[#F57979] text-white rounded-br-md focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to main content
        </a>
      </div>

      <div id="main-content" className="w-full pt-0 px-4 py-4 sm:px-6 lg:px-8">
        <Mobile />
        <Desktop />
      </div>
    </AppLayout>
  );
}