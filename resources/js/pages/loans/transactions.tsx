import { Badge, Panel, btn, fdateLong as fd, peso } from '@/components/tdfc/ui';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

interface Transaction {
    lnnumber: string;
    description: string;
    date: string | null;
    principal: number;
    raw_balance: number;
    next_due: { date: string | null; amount: number } | null;
}

type SortKey = 'date' | 'lnnumber' | 'description' | 'principal' | 'balance';

const SORTS: string[][] = [
    ['date:desc', 'Newest first'],
    ['date:asc', 'Oldest first'],
    ['balance:desc', 'Balance high to low'],
    ['balance:asc', 'Balance low to high'],
    ['principal:desc', 'Principal high to low'],
];
const COL: Record<SortKey, 'date' | 'lnnumber' | 'description' | 'principal' | 'raw_balance'> = {
    date: 'date',
    lnnumber: 'lnnumber',
    description: 'description',
    principal: 'principal',
    balance: 'raw_balance',
};

const field =
    'h-[38px] w-full rounded-[10px] border border-input bg-background px-3 text-sm shadow-xs focus:border-ring focus:ring-[3px] focus:ring-ring/30 focus:outline-none';
const lbl = 'text-xs font-semibold text-muted-foreground';
const thc = 'px-4 py-2.5 text-xs font-semibold whitespace-nowrap text-muted-foreground';

const statusBadge = (r: Transaction) => (r.raw_balance > 0 ? <Badge tone="info">Active</Badge> : <Badge tone="ok">Fully paid</Badge>);
const nextText = (r: Transaction) => (r.raw_balance > 0 && r.next_due ? `${fd(r.next_due.date)} · ${peso(r.next_due.amount)}` : 'Completed');

export default function LoansTransactionPage({ transactions }: { transactions: Transaction[] }) {
    const base = usePage<{ base?: string }>().props.base ?? '';
    const loansUrl = base ? `${base}/loans` : '/loans/transactions';
    const [q, setQ] = useState('');
    const [status, setStatus] = useState('all');
    const [type, setType] = useState('all');
    const [sk, setSk] = useState<SortKey>('date');
    const [asc, setAsc] = useState(false);
    const [per, setPer] = useState(10);
    const [pg, setPg] = useState(0);

    const types = useMemo(() => [...new Set(transactions.map((r) => r.description))].sort(), [transactions]);
    const rows = useMemo(() => {
        const needle = q.trim().toLowerCase();
        const col = COL[sk];
        return transactions
            .filter((r) => (status === 'all' || (r.raw_balance > 0 ? 'active' : 'paid') === status) && (type === 'all' || r.description === type))
            .filter((r) => !needle || `${r.lnnumber} ${r.description} ${r.raw_balance > 0 ? 'active' : 'paid'}`.toLowerCase().includes(needle))
            .sort((a, b) => ((a[col] ?? '') > (b[col] ?? '') ? 1 : (a[col] ?? '') < (b[col] ?? '') ? -1 : 0) * (asc ? 1 : -1));
    }, [transactions, q, status, type, sk, asc]);

    const active = transactions.filter((r) => r.raw_balance > 0);
    const next = active.filter((r) => r.next_due).sort((a, b) => (a.next_due!.date ?? '').localeCompare(b.next_due!.date ?? ''))[0];
    const total = rows.length;
    const page = Math.min(pg, Math.max(0, Math.ceil(total / per) - 1));
    const s = page * per;
    const view = rows.slice(s, s + per);
    const href = (ln: string) => `${loansUrl}/${encodeURIComponent(ln)}`;
    const clear = () => {
        setQ('');
        setStatus('all');
        setType('all');
        setSk('date');
        setAsc(false);
        setPg(0);
    };
    const toggle = (k: SortKey) => {
        setAsc(sk === k ? !asc : true);
        setSk(k);
        setPg(0);
    };
    const sortTh = (k: SortKey, label: string, right?: boolean) => (
        <th className={`${thc} ${right ? 'text-right' : 'text-left'}`} aria-sort={sk === k ? (asc ? 'ascending' : 'descending') : 'none'}>
            <button type="button" onClick={() => toggle(k)} className="inline-flex cursor-pointer items-center gap-1 hover:text-foreground">
                {label} {sk === k ? (asc ? '↑' : '↓') : '↕'}
            </button>
        </th>
    );

    const kpis: [string, string, string][] = [
        ['Active loans', String(active.length), 'Loans with remaining balance'],
        ['Outstanding balance', peso(active.reduce((a, r) => a + r.raw_balance, 0)), 'Across active loans'],
        [
            'Next due',
            next ? peso(next.next_due!.amount) : 'No due payments',
            next ? `${next.lnnumber} · ${fd(next.next_due!.date)}` : 'All loans are settled',
        ],
        ['Filtered results', String(total), total === transactions.length ? 'Showing all loans' : 'Based on current filters'],
    ];
    const selects: [string, string, string, (v: string) => void, string[][]][] = [
        [
            'fstatus',
            'Status',
            status,
            setStatus,
            [
                ['all', 'All statuses'],
                ['active', 'Active'],
                ['paid', 'Fully paid'],
            ],
        ],
        ['ftype', 'Loan type', type, setType, [['all', 'All types'], ...types.map((t) => [t, t])]],
        [
            'fsort',
            'Sort by',
            `${sk}:${asc ? 'asc' : 'desc'}`,
            (v) => {
                const [k, d] = v.split(':');
                setSk(k as SortKey);
                setAsc(d === 'asc');
            },
            SORTS,
        ],
    ];

    return (
        <AppLayout
            breadcrumbs={[
                { title: base ? 'Dashboard' : 'Loans', href: base ? `${base}/dashboard` : '/loans' },
                { title: 'Transactions', href: loansUrl },
            ]}
        >
            <Head title="Loan Transactions" />
            <div className="grid content-start gap-5 p-4 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold">Loan Transactions</h1>
                        <p className="mt-1 text-muted-foreground">Track balances, next due dates, and amortization schedules in one place.</p>
                    </div>
                    <div className="text-[13px] text-muted-foreground">Updated {fd(new Date().toISOString())}</div>
                </div>

                <section
                    aria-label="Loan summary"
                    className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-border bg-border shadow-sm min-[701px]:grid-cols-4"
                >
                    {kpis.map(([l, v, n]) => (
                        <div key={l} className="bg-card px-[18px] py-4">
                            <label className="block text-xs font-medium text-muted-foreground">{l}</label>
                            <b className="mt-1 block text-xl tabular-nums">{v}</b>
                            <small className="mt-1 block text-xs text-muted-foreground">{n}</small>
                        </div>
                    ))}
                </section>

                <Panel className="overflow-hidden">
                    <div className="flex flex-wrap items-end gap-3 border-b border-border bg-[oklch(.995_0_0)] p-4">
                        <div className="grid min-w-0 flex-[1_1_220px] gap-1">
                            <label htmlFor="q" className={lbl}>
                                Search loans
                            </label>
                            <input
                                id="q"
                                type="search"
                                value={q}
                                onChange={(e) => {
                                    setQ(e.target.value);
                                    setPg(0);
                                }}
                                placeholder="Loan number or type"
                                className={field}
                            />
                        </div>
                        {selects.map(([id, label, value, on, opts]) => (
                            <div key={id} className="grid min-w-0 flex-[1_1_140px] gap-1 min-[861px]:flex-[0_1_160px]">
                                <label htmlFor={id} className={lbl}>
                                    {label}
                                </label>
                                <select
                                    id={id}
                                    value={value}
                                    onChange={(e) => {
                                        on(e.target.value);
                                        setPg(0);
                                    }}
                                    className={field}
                                >
                                    {opts.map(([v, t]) => (
                                        <option key={v} value={v}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>

                    {transactions.length === 0 ? (
                        <div className="px-4 py-12 text-center text-muted-foreground">
                            <b className="mb-1 block text-[15px] text-foreground">No loan transactions yet</b>
                            When your loans are available, they will appear here with balances and schedules.
                        </div>
                    ) : total === 0 ? (
                        <div className="px-4 py-12 text-center text-muted-foreground">
                            <b className="mb-1 block text-[15px] text-foreground">No loans match these filters</b>
                            Try clearing search, changing status, or selecting a different loan type.
                            <div className="mt-3">
                                <button onClick={clear} className={`${btn.base} ${btn.plain} ${btn.sm}`}>
                                    Clear filters
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="hidden overflow-x-auto min-[861px]:block">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-border">
                                            {sortTh('date', 'Date')}
                                            {sortTh('lnnumber', 'Loan Number')}
                                            {sortTh('description', 'Type')}
                                            <th className={`${thc} text-left`}>Status</th>
                                            <th className={`${thc} text-left`}>Next due</th>
                                            {sortTh('principal', 'Principal', true)}
                                            {sortTh('balance', 'Balance', true)}
                                            <th className={`${thc} text-left`}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {view.map((r) => (
                                            <tr
                                                key={r.lnnumber}
                                                className="border-b border-border last:border-0 even:bg-[oklch(.985_0_0)] hover:bg-muted"
                                            >
                                                <td className="px-4 py-3.5 text-muted-foreground">{fd(r.date)}</td>
                                                <td className="px-4 py-3.5 font-medium">{r.lnnumber}</td>
                                                <td className="px-4 py-3.5 font-bold">{r.description}</td>
                                                <td className="px-4 py-3.5">{statusBadge(r)}</td>
                                                <td className="px-4 py-3.5 text-[13px] text-muted-foreground">{nextText(r)}</td>
                                                <td className="px-4 py-3.5 text-right font-bold tabular-nums">{peso(r.principal)}</td>
                                                <td className="px-4 py-3.5 text-right font-bold tabular-nums">{peso(r.raw_balance)}</td>
                                                <td className="px-4 py-3.5">
                                                    <Link
                                                        href={href(r.lnnumber)}
                                                        aria-label={`View details for ${r.lnnumber}`}
                                                        className={`${btn.base} ${btn.dark} ${btn.sm}`}
                                                    >
                                                        View details
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="min-[861px]:hidden">
                                {view.map((r) => (
                                    <article
                                        key={r.lnnumber}
                                        role="link"
                                        tabIndex={0}
                                        aria-label={`Open ${r.lnnumber} details`}
                                        onClick={() => router.visit(href(r.lnnumber))}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                router.visit(href(r.lnnumber));
                                            }
                                        }}
                                        className="cursor-pointer border-b border-border px-4 py-3.5 last:border-0 hover:bg-muted"
                                    >
                                        <div className="flex justify-between gap-3">
                                            <div>
                                                <b>{r.description}</b>
                                                <div className="mt-0.5 text-[13px] text-muted-foreground">
                                                    {r.lnnumber} · {fd(r.date)}
                                                </div>
                                                <div className="mt-0.5 text-[13px] text-muted-foreground">Next due: {nextText(r)}</div>
                                            </div>
                                            <div className="text-right">
                                                <b className="block tabular-nums">{peso(r.raw_balance)}</b>
                                                <span className="text-xs text-muted-foreground">Balance</span>
                                            </div>
                                        </div>
                                        <div className="mt-2.5">{statusBadge(r)}</div>
                                    </article>
                                ))}
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-3.5 border-t border-border px-4 py-2.5 text-[13px] text-muted-foreground">
                                <span>
                                    Showing {s + 1}-{Math.min(s + per, total)} of {total} loans
                                </span>
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <label htmlFor="per">Rows</label>
                                    <select
                                        id="per"
                                        aria-label="Rows per page"
                                        value={per}
                                        onChange={(e) => {
                                            setPer(+e.target.value);
                                            setPg(0);
                                        }}
                                        className="h-[30px] rounded-lg border border-input bg-background px-1.5"
                                    >
                                        {[10, 15, 25, 50].map((n) => (
                                            <option key={n}>{n}</option>
                                        ))}
                                    </select>
                                    <button
                                        className={`${btn.base} ${btn.sm} border-transparent hover:bg-muted`}
                                        disabled={page === 0}
                                        onClick={() => setPg(page - 1)}
                                        aria-label="Previous page"
                                    >
                                        ‹
                                    </button>
                                    <button
                                        className={`${btn.base} ${btn.sm} border-transparent hover:bg-muted`}
                                        disabled={s + per >= total}
                                        onClick={() => setPg(page + 1)}
                                        aria-label="Next page"
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </Panel>
            </div>
        </AppLayout>
    );
}
