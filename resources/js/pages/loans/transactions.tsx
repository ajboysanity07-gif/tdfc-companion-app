import { DueBadge, hero, heroBig, pageFrame, paidPct, payAmount, payCard, today } from '@/components/tdfc/loan';
import { Panel, btn, fdateLong as fd, pagerSelect, peso } from '@/components/tdfc/ui';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface Transaction {
    lnnumber: string;
    description: string;
    date: string | null;
    principal: number;
    raw_balance: number;
    next_due: { date: string | null; amount: number } | null;
}

type Sort = 'new' | 'old' | 'big';

const field =
    'h-[38px] w-full rounded-[10px] border border-input bg-background px-3 text-sm shadow-sm focus:border-ring focus:ring-[3px] focus:ring-ring/30 focus:outline-none max-[861px]:h-11';
const lbl = 'text-xs font-semibold text-muted-foreground';
const th = 'border-b border-border px-4 py-2.5 text-xs font-semibold whitespace-nowrap text-muted-foreground';
// On mobile every cell loses its table box and sits in the row's three-column grid.
const td = 'border-b border-border px-4 py-3.5 group-last:border-0 max-[861px]:block max-[861px]:border-0 max-[861px]:p-0';
const dim = 'text-muted-foreground group-hover:text-foreground';
const mainBtn = `${btn.base} border-border bg-background hover:bg-muted max-[861px]:h-11`;
const smBtn = `${btn.base} ${btn.sm} max-[861px]:!h-11`;
const ghostBtn = `${smBtn} border-transparent hover:bg-muted`;

const Empty = ({ title, text, onClear }: { title: string; text: string; onClear?: () => void }) => (
    <div className="px-4 py-12 text-center text-muted-foreground">
        <b className="mb-1 block text-[15px] text-foreground">{title}</b>
        {text}
        {onClear && (
            <div className="mt-3">
                <button type="button" onClick={onClear} className={`${smBtn} border-border bg-background text-foreground hover:bg-muted`}>
                    Clear filters
                </button>
            </div>
        )}
    </div>
);

export default function LoansTransactionPage({ transactions }: { transactions: Transaction[] }) {
    const base = usePage<{ base?: string }>().props.base ?? '';
    const loansUrl = base ? `${base}/loans` : '/loans/transactions';
    const [q, setQ] = useState('');
    const [type, setType] = useState('all');
    const [sort, setSort] = useState<Sort>('new');
    const [per, setPer] = useState(10);
    const [pg, setPg] = useState(0);

    const href = (ln: string, tab: 'details' | 'schedule') => `${loansUrl}/${encodeURIComponent(ln)}?tab=${tab}`;
    const now = today();

    // Active loans, earliest payment date first; loans without a scheduled payment go last.
    const active = transactions.filter((r) => r.raw_balance > 0).sort((a, b) => (a.next_due?.date || '9').localeCompare(b.next_due?.date || '9'));
    // Centavos, so adding many amounts has no float drift.
    const owed = active.reduce((s, r) => s + Math.round(r.raw_balance * 100), 0) / 100;
    const next = active.find((r) => r.next_due?.date);
    const late = active.filter((r) => r.next_due?.date && r.next_due.date < now).length;

    const paid = transactions.filter((r) => r.raw_balance <= 0);
    const types = [...new Set(paid.map((r) => r.description))].sort();
    const needle = q.trim().toLowerCase();
    const rows = paid
        .filter((r) => (type === 'all' || r.description === type) && (!needle || `${r.lnnumber} ${r.description}`.toLowerCase().includes(needle)))
        .sort((a, b) => (sort === 'big' ? b.principal - a.principal : (a.date ?? '').localeCompare(b.date ?? '') * (sort === 'old' ? 1 : -1)));
    const total = rows.length;
    const page = Math.min(pg, Math.max(0, Math.ceil(total / per) - 1));
    const start = page * per;
    const view = rows.slice(start, start + per);
    const clear = () => {
        setQ('');
        setType('all');
        setPg(0);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: base ? 'Dashboard' : 'Loans', href: base ? `${base}/dashboard` : '/loans' },
                { title: 'Transactions', href: loansUrl },
            ]}
        >
            <Head title="Loan Transactions" />
            <div className={pageFrame}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold">Loan Transactions</h1>
                        <p className="mt-1 text-muted-foreground">Track balances, next due dates, and amortization schedules in one place.</p>
                    </div>
                    <div className="text-[13px] text-muted-foreground">Updated {fd(now)}</div>
                </div>

                {transactions.length > 0 && (
                    <section aria-label="Loan summary" className={hero}>
                        <div>
                            <h2 className="text-sm font-semibold">Total you still owe</h2>
                            <b className={heroBig}>{peso(owed)}</b>
                            <p>
                                {active.length
                                    ? `${active.length} active loan${active.length === 1 ? '' : 's'}${late ? ` · ${late} past the payment date` : ''}`
                                    : 'All your loans are fully paid'}
                            </p>
                        </div>
                        {next?.next_due?.date && (
                            <div className={payCard}>
                                <h2 className="text-sm font-semibold">{next.next_due.date < now ? 'Oldest unpaid payment' : 'Next payment'}</h2>
                                <span className={payAmount}>{peso(next.next_due.amount)}</span>
                                <div className="flex flex-wrap items-center gap-2">
                                    <DueBadge date={next.next_due.date} />
                                    <span>{fd(next.next_due.date)}</span>
                                </div>
                                <p className="text-muted-foreground">
                                    {next.description} · {next.lnnumber} · estimated amount
                                </p>
                                <Link href={href(next.lnnumber, 'schedule')} className={`${btn.base} ${btn.dark} mt-1.5 max-[861px]:h-11`}>
                                    View payment schedule
                                </Link>
                            </div>
                        )}
                    </section>
                )}

                {active.length > 0 && (
                    <section aria-labelledby="activeL">
                        <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                            <h2 id="activeL" className="text-base font-bold">
                                Active loans ({active.length})
                            </h2>
                            <p className="text-[13px] text-muted-foreground">Earliest payment date first</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {active.map((r) => {
                                const pct = paidPct(r.raw_balance, r.principal);
                                return (
                                    // Cards stretch to fill the row; a wide one lays its parts out side by side.
                                    <article
                                        key={r.lnnumber}
                                        className="grid min-w-0 flex-[1_1_250px] grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] content-start items-center gap-x-6 gap-y-3.5 rounded-[14px] border border-border bg-card p-[18px] shadow-sm"
                                    >
                                        <div>
                                            <h3 className="text-[15px] font-bold">{r.description}</h3>
                                            <small className="block text-xs text-muted-foreground tabular-nums">
                                                {r.lnnumber} · Released {fd(r.date)}
                                            </small>
                                        </div>
                                        <div>
                                            <small className="block text-xs text-muted-foreground">Balance left</small>
                                            <span className="block text-2xl leading-tight font-extrabold tabular-nums">{peso(r.raw_balance)}</span>
                                            <div className="mt-2 mb-1.5 h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                                                <i
                                                    className="block h-full rounded-full bg-[linear-gradient(90deg,var(--color-tdfc-blue),oklch(.62_.16_250))]"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <small className="block text-xs text-muted-foreground tabular-nums">
                                                {pct}% paid of {peso(r.principal)} borrowed
                                            </small>
                                        </div>
                                        <div className="grid justify-items-start gap-1">
                                            {r.next_due?.date ? (
                                                <>
                                                    <small className="text-xs text-muted-foreground">Payment date {fd(r.next_due.date)}</small>
                                                    <b className="tabular-nums">{peso(r.next_due.amount)}</b>
                                                    <DueBadge date={r.next_due.date} />
                                                </>
                                            ) : (
                                                <small className="text-xs text-muted-foreground">No scheduled payment</small>
                                            )}
                                        </div>
                                        <Link href={href(r.lnnumber, 'details')} aria-label={`View details for ${r.lnnumber}`} className={mainBtn}>
                                            View details
                                        </Link>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                )}

                <Panel className="overflow-hidden">
                    <div className="border-b border-border p-4">
                        <h2 className="text-base font-bold">Fully paid loans</h2>
                        {paid.length > 0 && (
                            <p className="text-[13px] text-muted-foreground">{paid.length} completed · nothing left to pay on these</p>
                        )}
                    </div>

                    {paid.length > 0 && (
                        <div className="flex flex-wrap items-end gap-3 border-b border-border p-4">
                            <div className="grid min-w-0 flex-[1_1_220px] gap-1">
                                <label htmlFor="q" className={lbl}>
                                    Search paid loans
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
                            <div className="grid min-w-0 flex-[0_1_160px] gap-1 max-[861px]:flex-[1_1_140px]">
                                <label htmlFor="ftype" className={lbl}>
                                    Loan type
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
                                    {types.map((t) => (
                                        <option key={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid min-w-0 flex-[0_1_160px] gap-1 max-[861px]:flex-[1_1_140px]">
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
                        </div>
                    )}

                    {transactions.length === 0 ? (
                        <Empty
                            title="No loan transactions yet"
                            text="When your loans are available, they will appear here with balances and schedules."
                        />
                    ) : paid.length === 0 ? (
                        <Empty title="No fully paid loans yet" text="Loans move here once the balance reaches zero." />
                    ) : total === 0 ? (
                        <Empty title="No paid loans match" text="Clear the search or choose a different loan type." onClear={clear} />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse max-[861px]:block">
                                    <thead className="max-[861px]:hidden">
                                        <tr>
                                            <th scope="col" className={`${th} text-left`}>
                                                Released
                                            </th>
                                            <th scope="col" className={`${th} text-left`}>
                                                Loan
                                            </th>
                                            <th scope="col" className={`${th} text-right`}>
                                                Amount borrowed
                                            </th>
                                            <th scope="col" className={th}>
                                                <span className="sr-only">Details</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="max-[861px]:grid max-[861px]:grid-cols-1 max-[861px]:gap-2.5 max-[861px]:p-3">
                                        {view.map((r) => (
                                            <tr
                                                key={r.lnnumber}
                                                className="group hover:bg-muted max-[861px]:grid max-[861px]:grid-cols-[minmax(0,1fr)_auto_auto] max-[861px]:items-center max-[861px]:gap-x-3 max-[861px]:rounded-xl max-[861px]:border max-[861px]:border-border max-[861px]:px-4 max-[861px]:py-2.5 max-[861px]:shadow-sm"
                                            >
                                                <td className={`${td} ${dim} whitespace-nowrap max-[861px]:!hidden`}>{fd(r.date)}</td>
                                                <td className={td}>
                                                    <b className="block font-semibold">{r.description}</b>
                                                    <small className={`block text-xs ${dim}`}>
                                                        {r.lnnumber}
                                                        <span className="min-[861px]:hidden"> · {fd(r.date)}</span>
                                                    </small>
                                                </td>
                                                <td className={`${td} text-right tabular-nums`}>{peso(r.principal)}</td>
                                                <td className={`${td} w-[1%] max-[861px]:w-auto`}>
                                                    <Link
                                                        href={href(r.lnnumber, 'details')}
                                                        aria-label={`View details for ${r.lnnumber}`}
                                                        className={ghostBtn}
                                                    >
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-3.5 border-t border-border px-4 py-2.5 text-[13px] text-muted-foreground">
                                <span>
                                    Showing {start + 1}-{start + view.length} of {total} paid loans
                                </span>
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <label htmlFor="per">Rows</label>
                                    <select
                                        id="per"
                                        value={per}
                                        onChange={(e) => {
                                            setPer(+e.target.value);
                                            setPg(0);
                                        }}
                                        className={`${pagerSelect} py-0 text-[13px] text-foreground max-[861px]:!h-11`}
                                    >
                                        {[10, 15, 25, 50].map((n) => (
                                            <option key={n}>{n}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        className={`${ghostBtn} text-foreground max-[861px]:min-w-11`}
                                        disabled={page === 0}
                                        onClick={() => setPg(page - 1)}
                                        aria-label="Previous page"
                                    >
                                        ‹
                                    </button>
                                    <button
                                        type="button"
                                        className={`${ghostBtn} text-foreground max-[861px]:min-w-11`}
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
