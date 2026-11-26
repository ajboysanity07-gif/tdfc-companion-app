import { Panel, btn, fdateLong as fd, mockupText, pagerSelect, peso } from '@/components/tdfc/ui';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { Fragment, useState } from 'react';

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

type Flow = 'all' | 'in' | 'out';
type Sort = 'new' | 'old' | 'big';

// ponytail: reference codes seen so far; unknown codes show as-is. Move to a server lookup if the list grows.
const LABELS: Record<string, string> = { WD: 'Withdrawal', 'Loan Rel.': 'Loan release', 'Service Fee': 'Service fee' };
const label = (r: Transaction) =>
    LABELS[r.reference] ?? (r.reference.startsWith('Renewal') ? 'Renewal' : r.reference || (r.deposit > 0 ? 'Deposit' : 'Withdrawal'));
// Centavos, so adding many amounts has no float drift.
const sum = (rows: Transaction[], k: 'deposit' | 'withdrawal' | 'raw_balance') => rows.reduce((s, r) => s + Math.round(r[k] * 100), 0) / 100;
const month = (iso: string | null) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-PH', { year: 'numeric', month: 'long' }) : 'No date');

const field =
    'h-10 w-full rounded-[10px] border border-input bg-background px-3 text-sm shadow-sm focus:border-ring focus:ring-[3px] focus:ring-ring/30 focus:outline-none max-[861px]:h-11';
const lbl = 'text-xs font-semibold text-muted-foreground';
const th = 'border-b border-border px-4 py-2.5 text-xs font-semibold whitespace-nowrap text-muted-foreground';
// On mobile every cell loses its table box and sits in the row's two-column grid.
const td = 'border-b border-border px-4 py-3.5 group-last:border-0 max-[861px]:block max-[861px]:border-0 max-[861px]:p-0';
const pos = 'text-[color-mix(in_oklch,var(--success)_85%,var(--foreground))]';
const neg = 'text-[color-mix(in_oklch,var(--destructive)_85%,var(--foreground))]';
const smBtn = `${btn.base} ${btn.sm} border-border bg-background hover:bg-muted`;

const Empty = ({ title, text, onClear }: { title: string; text: string; onClear?: () => void }) => (
    <div className="px-4 py-12 text-center text-muted-foreground">
        <b className="mb-1 block text-[15px] text-foreground">{title}</b>
        {text}
        {onClear && (
            <div className="mt-3">
                <button type="button" onClick={onClear} className={smBtn}>
                    Clear filters
                </button>
            </div>
        )}
    </div>
);

export default function SavingsTransactionPage({ transactions }: { transactions: Transaction[] }) {
    const base = usePage<{ base?: string }>().props.base ?? '';
    const [acct, setAcct] = useState('');
    const [q, setQ] = useState('');
    const [flow, setFlow] = useState<Flow>('all');
    const [sort, setSort] = useState<Sort>('new');
    const [per, setPer] = useState(15);
    const [pg, setPg] = useState(0);

    // Rows arrive newest first (same-day rows too), so an account's balance is its first row.
    const accounts = transactions.filter((r, i) => transactions.findIndex((x) => x.svnumber === r.svnumber) === i);
    const selected = accounts.find((a) => a.svnumber === acct);
    const mine = transactions.filter((r) => !acct || r.svnumber === acct);
    const needle = q.trim().toLowerCase();
    const rows = mine.filter(
        (r) =>
            (flow === 'all' || (flow === 'in' ? r.deposit > 0 : r.withdrawal > 0)) &&
            (!needle || `${r.svnumber} ${r.description} ${r.reference} ${label(r)} ${fd(r.date)}`.toLowerCase().includes(needle)),
    );
    if (sort === 'old') rows.reverse();
    if (sort === 'big') rows.sort((a, b) => b.deposit + b.withdrawal - (a.deposit + a.withdrawal));

    const total = rows.length;
    const page = Math.min(pg, Math.max(0, Math.ceil(total / per) - 1));
    const start = page * per;
    const view = rows.slice(start, start + per);

    const select = (svnumber: string) => {
        setAcct(svnumber);
        setPg(0);
    };
    const clear = () => {
        setQ('');
        setFlow('all');
        setPg(0);
    };
    const exportCsv = () => {
        const lines = [
            ['Date', 'Savings Number', 'Description', 'Reference', 'Deposit', 'Withdrawal', 'Balance'],
            ...rows.map((r) => [r.date ?? '', r.svnumber, r.description, r.reference, r.deposit, r.withdrawal, r.raw_balance]),
        ].map((cells) => cells.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','));
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' }));
        a.download = 'savings-transactions.csv';
        a.click();
        URL.revokeObjectURL(a.href);
    };

    return (
        <AppLayout
            breadcrumbs={[...(base ? [{ title: 'Dashboard', href: `${base}/dashboard` }] : []), { title: 'Savings', href: `${base}/savings` }]}
        >
            <Head title="Savings" />
            <div
                className={`grid grid-cols-[minmax(0,1fr)] content-start gap-5 p-4 max-[861px]:min-h-screen max-[861px]:bg-background max-md:pb-6 min-[861px]:p-6 ${mockupText}`}
            >
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                    <div>
                        <h1 className="text-2xl font-extrabold max-[861px]:text-[22px]">Savings</h1>
                        <p className="mt-1 text-muted-foreground max-[861px]:text-[13px]">See what you have, in which account, and how it changed</p>
                    </div>
                    <small className="text-[13px] text-muted-foreground">Updated {fd(new Date().toLocaleDateString('en-CA'))}</small>
                </div>

                <section aria-labelledby="totalL" className="rounded-tdfc-card bg-tdfc-coral px-7 py-6 text-tdfc-on-coral max-[861px]:p-5">
                    <h2 id="totalL" className="text-sm font-semibold">
                        Total balance
                    </h2>
                    <b className="my-1 block text-[clamp(36px,5vw,52px)] leading-[1.15] font-extrabold tracking-[-0.02em] tabular-nums">
                        {peso(sum(accounts, 'raw_balance'))}
                    </b>
                    <p className="text-sm">
                        {transactions.length
                            ? `${accounts.length === 1 ? '1 account' : `${accounts.length} accounts added together`} · last transaction ${fd(transactions[0].date)}`
                            : 'No account activity yet'}
                    </p>
                </section>

                {accounts.length > 0 && (
                    <section aria-labelledby="acctL">
                        <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                            <h2 id="acctL" className="text-base font-bold">
                                Your accounts
                            </h2>
                            <p className="text-[13px] text-muted-foreground">Select an account to see only its history</p>
                        </div>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 max-[861px]:grid-cols-1">
                            {accounts.map((a) => {
                                const on = a.svnumber === acct;
                                const sub = `text-xs tabular-nums ${on ? 'text-foreground' : 'text-muted-foreground'}`;
                                return (
                                    <button
                                        key={a.svnumber}
                                        type="button"
                                        aria-pressed={on}
                                        onClick={() => select(on ? '' : a.svnumber)}
                                        className={`grid cursor-pointer content-start gap-0.5 rounded-[14px] border p-4 text-left shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tdfc-coral-ink max-[861px]:grid-cols-[minmax(0,1fr)_auto] max-[861px]:gap-x-3 max-[861px]:p-3.5 ${on ? 'border-foreground bg-muted ring-1 ring-foreground' : 'border-border bg-card hover:border-muted-foreground'}`}
                                    >
                                        <span className="font-bold">{a.description}</span>
                                        <span className={sub}>{a.svnumber}</span>
                                        <span className="mt-2.5 mb-0.5 text-[22px] font-extrabold tabular-nums max-[861px]:col-start-2 max-[861px]:row-span-2 max-[861px]:row-start-1 max-[861px]:m-0 max-[861px]:self-center max-[861px]:text-lg">
                                            {peso(a.raw_balance)}
                                        </span>
                                        <span className={`${sub} max-[861px]:col-span-full max-[861px]:mt-1.5`}>Last activity {fd(a.date)}</span>
                                        <span className="mt-2.5 text-[13px] font-semibold underline underline-offset-[3px] max-[861px]:hidden">
                                            {on ? 'Showing history below' : 'View history'}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                )}

                <Panel className="overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-border p-4">
                        <div>
                            <h2 className="text-base font-bold">Transaction history</h2>
                            <p aria-live="polite" className="text-[13px] text-muted-foreground">
                                {selected ? `${selected.description} · ${selected.svnumber}` : 'All accounts'}
                            </p>
                            {selected && (
                                <button type="button" onClick={() => select('')} className={`${smBtn} mt-2 max-[861px]:!h-11`}>
                                    Show all accounts
                                </button>
                            )}
                        </div>
                        <dl className="flex flex-wrap gap-x-6 gap-y-2">
                            <div>
                                <dt className="text-xs text-muted-foreground">Money in, all time</dt>
                                <dd className={`text-base font-bold tabular-nums ${pos}`}>+{peso(sum(mine, 'deposit'))}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-muted-foreground">Money out, all time</dt>
                                <dd className={`text-base font-bold tabular-nums ${neg}`}>−{peso(sum(mine, 'withdrawal'))}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="flex flex-wrap items-end gap-3 border-b border-border px-4 py-3">
                        <div className="grid min-w-0 flex-[1_1_220px] gap-1 max-[861px]:basis-full">
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
                                placeholder="Account, reference or type"
                                className={field}
                            />
                        </div>
                        <div className="grid min-w-0 flex-[0_1_180px] gap-1 max-[861px]:flex-[1_1_140px]">
                            <label htmlFor="ftype" className={lbl}>
                                Show
                            </label>
                            <select
                                id="ftype"
                                value={flow}
                                onChange={(e) => {
                                    setFlow(e.target.value as Flow);
                                    setPg(0);
                                }}
                                className={field}
                            >
                                <option value="all">Money in and out</option>
                                <option value="in">Money in only</option>
                                <option value="out">Money out only</option>
                            </select>
                        </div>
                        <div className="grid min-w-0 flex-[0_1_180px] gap-1 max-[861px]:flex-[1_1_140px]">
                            <label htmlFor="fsort" className={lbl}>
                                Sort by
                            </label>
                            <select
                                id="fsort"
                                value={sort}
                                onChange={(e) => {
                                    setSort(e.target.value as Sort);
                                    setPg(0);
                                }}
                                className={field}
                            >
                                <option value="new">Newest first</option>
                                <option value="old">Oldest first</option>
                                <option value="big">Largest amount</option>
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={exportCsv}
                            disabled={!total}
                            className={`${btn.base} border-border bg-background hover:bg-muted max-[861px]:h-11 max-[861px]:flex-[1_1_100%]`}
                        >
                            Export CSV
                        </button>
                    </div>

                    {transactions.length === 0 ? (
                        <Empty title="No savings transactions yet" text="Deposits and withdrawals will appear here." />
                    ) : total === 0 ? (
                        <Empty title="No transactions match" text="Clear the search or show both money in and out." onClear={clear} />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse max-[861px]:block">
                                    <thead className="max-[861px]:hidden">
                                        <tr>
                                            <th scope="col" className={`${th} text-left`}>
                                                Date
                                            </th>
                                            <th scope="col" className={`${th} text-left`}>
                                                {acct ? 'Transaction' : 'Transaction and account'}
                                            </th>
                                            <th scope="col" className={`${th} text-right`}>
                                                Amount
                                            </th>
                                            <th scope="col" className={`${th} text-right`}>
                                                {acct ? 'Balance after' : 'Account balance after'}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="max-[861px]:block">
                                        {view.map((r, i) => {
                                            const head =
                                                sort !== 'big' && (i === 0 || month(r.date) !== month(view[i - 1].date)) ? month(r.date) : null;
                                            const isIn = r.deposit > 0;
                                            const dim = 'text-muted-foreground group-hover:text-foreground';
                                            return (
                                                <Fragment key={r.key}>
                                                    {head && (
                                                        <tr className="max-[861px]:block">
                                                            <th
                                                                colSpan={4}
                                                                scope="colgroup"
                                                                className="border-b border-border bg-muted px-4 py-2 text-left text-xs font-semibold max-[861px]:block max-[861px]:border-0"
                                                            >
                                                                {head}
                                                            </th>
                                                        </tr>
                                                    )}
                                                    <tr className="group hover:bg-muted max-[861px]:grid max-[861px]:grid-cols-[minmax(0,1fr)_auto] max-[861px]:gap-x-3 max-[861px]:border-b max-[861px]:border-border max-[861px]:px-4 max-[861px]:py-3 max-[861px]:last:border-0">
                                                        <td className={`${td} ${dim} w-[1%] pr-6 whitespace-nowrap max-[861px]:!hidden`}>
                                                            {fd(r.date)}
                                                        </td>
                                                        <td
                                                            className={`${td} max-[861px]:col-start-1 max-[861px]:row-span-2 max-[861px]:row-start-1`}
                                                        >
                                                            <b className="block font-semibold">{label(r)}</b>
                                                            <small className={`block text-xs ${dim}`}>
                                                                <span className="min-[861px]:hidden">
                                                                    {fd(r.date)}
                                                                    {!acct && ' · '}
                                                                </span>
                                                                {!acct && r.description}
                                                            </small>
                                                        </td>
                                                        <td
                                                            className={`${td} text-right text-base font-bold whitespace-nowrap tabular-nums max-[861px]:col-start-2 ${isIn ? pos : neg}`}
                                                        >
                                                            {isIn ? '+' : '−'}
                                                            {peso(isIn ? r.deposit : r.withdrawal)}
                                                        </td>
                                                        <td
                                                            className={`${td} ${dim} text-right whitespace-nowrap tabular-nums max-[861px]:col-start-2 max-[861px]:text-xs max-[861px]:before:content-['Balance_']`}
                                                        >
                                                            {peso(r.raw_balance)}
                                                        </td>
                                                    </tr>
                                                </Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-border px-4 py-2.5 text-[13px] text-muted-foreground">
                                <span>
                                    {start + 1}–{start + view.length} of {total} transactions
                                </span>
                                <div className="flex items-center gap-2.5">
                                    <label htmlFor="per">Rows</label>
                                    <select
                                        id="per"
                                        value={per}
                                        onChange={(e) => {
                                            setPer(+e.target.value);
                                            setPg(0);
                                        }}
                                        className={`${pagerSelect} !h-8 py-0 text-[13px] text-foreground max-[861px]:!h-11`}
                                    >
                                        {[10, 15, 25, 50].map((n) => (
                                            <option key={n}>{n}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        className={`${smBtn} text-foreground max-[861px]:!h-11 max-[861px]:min-w-11`}
                                        disabled={page === 0}
                                        onClick={() => setPg(page - 1)}
                                        aria-label="Previous page"
                                    >
                                        ‹
                                    </button>
                                    <button
                                        type="button"
                                        className={`${smBtn} text-foreground max-[861px]:!h-11 max-[861px]:min-w-11`}
                                        disabled={start + per >= total}
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
