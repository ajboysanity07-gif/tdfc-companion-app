import { Panel, btn, fdateLong as fd, peso } from '@/components/tdfc/ui';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

interface Transaction {
    key: string;
    svnumber: string;
    description: string;
    date: string | null;
    reference: string;
    deposit: number;
    withdrawal: number;
    raw_balance: number;
}

type SortKey = 'date' | 'svnumber' | 'description' | 'reference' | 'deposit' | 'withdrawal' | 'raw_balance';

const field =
    'h-[38px] w-full rounded-[10px] border border-input bg-background px-3 text-sm shadow-xs focus:border-ring focus:ring-[3px] focus:ring-ring/30 focus:outline-none';
const lbl = 'text-xs font-semibold text-muted-foreground';
const thc = 'px-4 py-2.5 text-xs font-semibold whitespace-nowrap text-muted-foreground';
const amt = (n: number) => (n > 0 ? peso(n) : '—');

export default function SavingsTransactionPage({ transactions }: { transactions: Transaction[] }) {
    const base = usePage<{ base?: string }>().props.base ?? '';
    const [q, setQ] = useState('');
    const [type, setType] = useState('all');
    const [sk, setSk] = useState<SortKey>('date');
    const [asc, setAsc] = useState(false);
    const [per, setPer] = useState(15);
    const [pg, setPg] = useState(0);

    const rows = useMemo(() => {
        const needle = q.trim().toLowerCase();
        return transactions
            .filter((r) => type === 'all' || (type === 'deposit') === r.deposit > 0)
            .filter((r) => !needle || `${r.svnumber} ${r.description} ${r.reference} ${r.date}`.toLowerCase().includes(needle))
            .sort((a, b) => ((a[sk] ?? '') > (b[sk] ?? '') ? 1 : (a[sk] ?? '') < (b[sk] ?? '') ? -1 : 0) * (asc ? 1 : -1));
    }, [transactions, q, type, sk, asc]);

    const deposits = transactions.reduce((a, r) => a + r.deposit, 0);
    const withdrawals = transactions.reduce((a, r) => a + r.withdrawal, 0);
    // Backend order is newest first (date, then control no.), so the first row is the latest.
    const latest = [...transactions].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))[0];
    const total = rows.length;
    const page = Math.min(pg, Math.max(0, Math.ceil(total / per) - 1));
    const s = page * per;
    const view = rows.slice(s, s + per);

    const kpis: [string, string, string][] = [
        ['Total deposits', peso(deposits), 'All credited amounts'],
        ['Total withdrawals', peso(withdrawals), 'All debited amounts'],
        ['Net change', peso(deposits - withdrawals), 'Deposits minus withdrawals'],
        ['Current balance', peso(latest?.raw_balance ?? 0), 'As of latest transaction'],
    ];

    const clear = () => {
        setQ('');
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
    const exportCsv = () => {
        const lines = ['Date,Savings Number,Description,Reference,Deposit,Withdrawal,Balance'].concat(
            rows.map((r) =>
                [r.date ?? '', r.svnumber, r.description, `"${r.reference.replace(/"/g, '""')}"`, r.deposit, r.withdrawal, r.raw_balance].join(','),
            ),
        );
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' }));
        a.download = 'savings-transactions.csv';
        a.click();
        URL.revokeObjectURL(a.href);
    };
    const sortTh = (k: SortKey, label: string, right?: boolean) => (
        <th className={`${thc} ${right ? 'text-right' : 'text-left'}`} aria-sort={sk === k ? (asc ? 'ascending' : 'descending') : 'none'}>
            <button type="button" onClick={() => toggle(k)} className="inline-flex cursor-pointer items-center gap-1 hover:text-foreground">
                {label} {sk === k ? (asc ? '↑' : '↓') : '↕'}
            </button>
        </th>
    );

    return (
        <AppLayout
            breadcrumbs={[...(base ? [{ title: 'Dashboard', href: `${base}/dashboard` }] : []), { title: 'Savings', href: `${base}/savings` }]}
        >
            <Head title="Savings" />
            <div className="grid content-start gap-5 p-4 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-[1_1_260px]">
                        <h1 className="text-2xl font-extrabold">Savings</h1>
                        <p className="mt-1 text-muted-foreground">View your savings deposits and withdrawals</p>
                    </div>
                    <div className="text-[13px] text-muted-foreground">Updated {fd(new Date().toISOString())}</div>
                </div>

                <section
                    aria-label="Savings summary"
                    className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-border bg-border shadow-sm min-[861px]:grid-cols-4"
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
                                Search transactions
                            </label>
                            <input
                                id="q"
                                type="search"
                                value={q}
                                onChange={(e) => {
                                    setQ(e.target.value);
                                    setPg(0);
                                }}
                                placeholder="Reference or description"
                                className={field}
                            />
                        </div>
                        <div className="grid min-w-0 flex-[1_1_140px] gap-1 min-[861px]:flex-[0_1_160px]">
                            <label htmlFor="ftype" className={lbl}>
                                Type
                            </label>
                            <select
                                id="ftype"
                                value={type}
                                onChange={(e) => {
                                    setType(e.target.value);
                                    setPg(0);
                                }}
                                className={field}
                            >
                                <option value="all">All types</option>
                                <option value="deposit">Deposits</option>
                                <option value="withdrawal">Withdrawals</option>
                            </select>
                        </div>
                        <div className="grid min-w-0 flex-[1_1_140px] gap-1 min-[861px]:flex-[0_1_160px]">
                            <label htmlFor="fsort" className={lbl}>
                                Sort by
                            </label>
                            <select
                                id="fsort"
                                value={sk === 'date' ? `date:${asc ? 'asc' : 'desc'}` : 'date:desc'}
                                onChange={(e) => {
                                    setSk('date');
                                    setAsc(e.target.value === 'date:asc');
                                    setPg(0);
                                }}
                                className={field}
                            >
                                <option value="date:desc">Newest first</option>
                                <option value="date:asc">Oldest first</option>
                            </select>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={exportCsv} className={`${btn.base} ${btn.plain} ${btn.sm}`}>
                                Export CSV
                            </button>
                        </div>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="px-4 py-12 text-center text-muted-foreground">
                            <b className="mb-1 block text-[15px] text-foreground">No savings transactions yet</b>
                            When your savings activity is available, deposits and withdrawals will appear here.
                        </div>
                    ) : total === 0 ? (
                        <div className="px-4 py-12 text-center text-muted-foreground">
                            <b className="mb-1 block text-[15px] text-foreground">No transactions match these filters</b>
                            Try clearing search or choosing a different type.
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
                                            {sortTh('svnumber', 'Savings Number')}
                                            {sortTh('description', 'Description')}
                                            {sortTh('reference', 'Reference')}
                                            {sortTh('deposit', 'Deposit', true)}
                                            {sortTh('withdrawal', 'Withdrawal', true)}
                                            {sortTh('raw_balance', 'Balance', true)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {view.map((r) => (
                                            <tr key={r.key} className="border-b border-border last:border-0 even:bg-[oklch(.985_0_0)] hover:bg-muted">
                                                <td className="px-4 py-3.5 text-muted-foreground">{fd(r.date)}</td>
                                                <td className="px-4 py-3.5 font-medium">{r.svnumber}</td>
                                                <td className="px-4 py-3.5 font-bold">{r.description}</td>
                                                <td className="px-4 py-3.5 text-muted-foreground">{r.reference}</td>
                                                <td
                                                    className={`px-4 py-3.5 text-right font-bold tabular-nums ${r.deposit > 0 ? 'text-tdfc-ok-ink' : ''}`}
                                                >
                                                    {amt(r.deposit)}
                                                </td>
                                                <td
                                                    className={`px-4 py-3.5 text-right font-bold tabular-nums ${r.withdrawal > 0 ? 'text-destructive' : ''}`}
                                                >
                                                    {amt(r.withdrawal)}
                                                </td>
                                                <td className="px-4 py-3.5 text-right font-bold tabular-nums">{peso(r.raw_balance)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="min-[861px]:hidden">
                                {view.map((r) => (
                                    <div key={r.key} className="border-b border-border px-4 py-3.5 last:border-0 hover:bg-muted">
                                        <div className="flex justify-between gap-3">
                                            <div>
                                                <b>{r.description}</b>
                                                <div className="mt-0.5 text-[13px] text-muted-foreground">
                                                    {r.svnumber} · {fd(r.date)}
                                                </div>
                                                {r.reference && <div className="mt-0.5 text-[13px] text-muted-foreground">{r.reference}</div>}
                                            </div>
                                            <div className="text-right">
                                                <b className={`block tabular-nums ${r.deposit > 0 ? 'text-tdfc-ok-ink' : 'text-destructive'}`}>
                                                    {r.deposit > 0 ? `+${peso(r.deposit)}` : `-${peso(r.withdrawal)}`}
                                                </b>
                                                <span className="text-xs text-muted-foreground">Bal {peso(r.raw_balance)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-3.5 border-t border-border px-4 py-2.5 text-[13px] text-muted-foreground">
                                <span>
                                    Showing {s + 1}-{Math.min(s + per, total)} of {total} transactions
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
