import { Badge, Panel, btn, fdateLong, peso } from '@/components/tdfc/ui';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ChevronLeft, Download, FileText, Printer } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

interface Loan {
    lnnumber: string;
    description: string;
    released: string | null;
    matures: string | null;
    principal: number;
    balance: number;
    interest_rate: number;
    installment: string;
    term_months: number;
}

interface HistoryItem {
    date: string | null;
    description: string;
    reference: string;
    amount: number;
    balance: number;
    controlno: string;
}

interface ScheduleRow {
    date: string | null;
    payPrincipal: number;
    payInterest: number;
    amortization: number;
    balance: number;
    status: 'paid' | 'due' | 'upcoming';
}

type Tab = 'details' | 'schedule';

const statusBadge = {
    paid: <Badge tone="ok">Paid</Badge>,
    due: <Badge tone="warn">Next due</Badge>,
    upcoming: <Badge>Upcoming</Badge>,
};

const Dl = ({ l, v, b }: { l: string; v: string; b?: boolean }) => (
    <div>
        <label className="block text-[13px] font-medium text-muted-foreground">{l}</label>
        <p className={`mt-0.5 text-sm ${b ? 'font-bold' : ''}`}>{v}</p>
    </div>
);

const th = 'sticky top-0 z-1 border-b border-border bg-[oklch(.98_0_0)] px-5 py-3 text-[11px] tracking-[.04em] text-muted-foreground uppercase';
const td = 'border-b border-border px-5 py-3 text-sm';
const kpiCell = 'bg-card px-[18px] py-4';

const PRINT_CSS = `@media print{
  @page{size:A4;margin:14mm 14mm 16mm}
  body>*:not(#print-doc){display:none!important}
  #print-doc{display:block!important;color:#000;background:#fff;font-size:10.5pt}
}`;

const today = () => new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });

function ScheduleDocument({
    loan,
    schedule,
    totals,
    user,
}: {
    loan: Loan;
    schedule: ScheduleRow[];
    totals: { p: number; i: number; am: number };
    user?: { name?: string; acctno?: string | null };
}) {
    const c = 'border-b border-neutral-300 px-2 py-1.5';
    const info: [string, string][] = [
        ['Borrower', user?.name ?? '—'],
        ['Loan Number', loan.lnnumber],
        ['Loan Type', loan.description],
        ['Date Released', fdateLong(loan.released)],
        ['Principal', peso(loan.principal)],
        ['Term', loan.term_months ? `${loan.term_months} months` : '—'],
        ['Interest Rate', `${loan.interest_rate}%`],
        ['Outstanding Balance', peso(loan.balance)],
    ];
    if (typeof document === 'undefined') return null;
    return createPortal(
        <div id="print-doc" className="hidden">
            <style>{PRINT_CSS}</style>
            <img src="/images/Header.png" alt="Triple Diamond Finance Corp." className="block h-auto w-full" />
            <h2 className="mt-4 mb-3 text-center text-[15pt] font-extrabold tracking-[.14em] uppercase">Amortization Schedule</h2>
            <div className="mb-3.5 grid grid-cols-2 border border-black">
                {info.map(([l, v], i) => (
                    <div
                        key={l}
                        className={`flex justify-between gap-3 px-2.5 py-1 ${i % 2 === 0 ? 'border-r border-neutral-300' : ''} ${i < info.length - 2 ? 'border-b border-neutral-300' : ''}`}
                    >
                        <span className="text-neutral-600">{l}</span>
                        <b className="text-right">{v}</b>
                    </div>
                ))}
            </div>
            <table className="w-full border-collapse border border-black tabular-nums">
                <thead>
                    <tr className="bg-neutral-200">
                        {['#', 'Due Date', 'Pay Principal', 'Pay Interest', 'Amortization', 'Balance', 'Status'].map((h, i) => (
                            <th key={h} className={`${c} text-[10pt] ${i > 1 && i < 6 ? 'text-right' : 'text-left'}`}>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {schedule.map((r, n) => (
                        <tr key={n} style={{ breakInside: 'avoid' }}>
                            <td className={c}>{n + 1}</td>
                            <td className={c}>{fdateLong(r.date)}</td>
                            <td className={`${c} text-right`}>{peso(r.payPrincipal)}</td>
                            <td className={`${c} text-right`}>{peso(r.payInterest)}</td>
                            <td className={`${c} text-right`}>{peso(r.amortization)}</td>
                            <td className={`${c} text-right font-bold`}>{peso(r.balance)}</td>
                            <td className={`${c} font-semibold`}>{r.status === 'paid' ? 'Paid' : r.status === 'due' ? 'Next due' : 'Upcoming'}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="border-t-2 border-black font-bold">
                        <td className={c} colSpan={2}>
                            Total
                        </td>
                        <td className={`${c} text-right`}>{peso(totals.p)}</td>
                        <td className={`${c} text-right`}>{peso(totals.i)}</td>
                        <td className={`${c} text-right`}>{peso(totals.am)}</td>
                        <td className={c} colSpan={2} />
                    </tr>
                </tfoot>
            </table>
            <div className="mt-9" style={{ breakInside: 'avoid' }}>
                <div className="mt-10 grid grid-cols-2 gap-12 text-center">
                    <div className="border-t border-black pt-1">Prepared by</div>
                    <div className="border-t border-black pt-1">Borrower&apos;s signature over printed name</div>
                </div>
                <p className="mt-5 text-center text-[9pt] text-neutral-600">Generated on {today()}.</p>
            </div>
        </div>,
        document.body,
    );
}

const csv = (loan: Loan, schedule: ScheduleRow[]) => {
    const lines = ['Payment,Due Date,Pay Principal,Pay Interest,Amortization,Balance,Status'].concat(
        schedule.map((r, n) =>
            [
                n + 1,
                r.date ?? '',
                r.payPrincipal.toFixed(2),
                r.payInterest.toFixed(2),
                r.amortization.toFixed(2),
                r.balance.toFixed(2),
                r.status,
            ].join(','),
        ),
    );
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' }));
    a.download = `${loan.lnnumber}-amortization.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
};

export default function LoanTransactionShow({
    tab: initial,
    loan,
    history,
    schedule,
}: {
    tab: Tab;
    loan: Loan;
    history: HistoryItem[];
    schedule: ScheduleRow[];
}) {
    const [tab, setTab] = useState<Tab>(initial);
    const {
        auth,
        member,
        base = '',
    } = usePage<{ auth: { user?: { name?: string; acctno?: string | null } }; member?: { name?: string; acctno?: string | null }; base?: string }>()
        .props;
    const user = member ?? auth.user;
    const loansUrl = base ? `${base}/loans` : '/loans/transactions';
    const paid = loan.balance <= 0;
    const paidAmt = loan.principal - loan.balance;
    const pct = loan.principal ? Math.min(100, Math.max(0, (paidAmt / loan.principal) * 100)) : 0;
    const totals = schedule.reduce((a, r) => ({ p: a.p + r.payPrincipal, i: a.i + r.payInterest, am: a.am + r.amortization }), { p: 0, i: 0, am: 0 });
    const dueIdx = schedule.findIndex((r) => r.status === 'due');
    const due = dueIdx >= 0 ? schedule[dueIdx] : null;
    const nextText = !paid && due ? `${fdateLong(due.date)} · ${peso(due.amortization)}` : 'Completed';
    const pick = (k: Tab) => {
        setTab(k);
        window.history.replaceState(null, '', `?tab=${k}`);
    };
    const kpis: [string, string, string][] = [
        ['Principal', peso(loan.principal), 'Original loan amount'],
        ['Paid to date', peso(paidAmt), `${loan.principal ? Math.round((paidAmt / loan.principal) * 100) : 0}% of principal`],
        ['Outstanding balance', peso(loan.balance), paid ? 'No remaining balance' : 'Remaining balance'],
        ['Next due', nextText, paid ? 'Completed loan' : 'Estimated schedule'],
    ];
    const grid = 'grid grid-cols-2 gap-6 min-[701px]:grid-cols-3';

    return (
        <AppLayout
            breadcrumbs={[
                { title: base ? 'Dashboard' : 'Loans', href: base ? `${base}/dashboard` : '/loans' },
                { title: 'Transactions', href: loansUrl },
                { title: loan.lnnumber, href: `${loansUrl}/${loan.lnnumber}` },
            ]}
        >
            <Head title={`Loan ${loan.lnnumber}`} />
            <ScheduleDocument loan={loan} schedule={schedule} totals={totals} user={user} />
            <div className="grid content-start gap-5 p-4 md:p-6 print:hidden">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <Link
                            href={loansUrl}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg pr-2.5 pl-1.5 text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            <ChevronLeft className="size-4" />
                            All transactions
                        </Link>
                        <h1 className="mt-2 flex flex-wrap items-center gap-3 text-2xl font-extrabold">
                            {loan.lnnumber}
                            <Badge tone={paid ? 'ok' : 'info'}>{paid ? 'Fully paid' : 'Active'}</Badge>
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            {loan.description} · Released {fdateLong(loan.released)} · Next due {nextText}
                        </p>
                    </div>
                    {tab === 'schedule' && schedule.length > 0 && (
                        <div className="flex flex-wrap gap-2 max-[700px]:w-full">
                            <button onClick={() => csv(loan, schedule)} className={`${btn.base} ${btn.plain} gap-2 max-[700px]:flex-1`}>
                                <Download className="size-3.5" />
                                Download CSV
                            </button>
                            <button onClick={() => window.print()} className={`${btn.base} ${btn.dark} gap-2 max-[700px]:flex-1`}>
                                <Printer className="size-3.5" />
                                Print / PDF
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-border bg-border shadow-sm min-[701px]:grid-cols-4">
                    {kpis.map(([l, v, n], i) => (
                        <div key={l} className={kpiCell}>
                            <label className="block text-xs font-medium text-muted-foreground">{l}</label>
                            <b className={`mt-1 block tabular-nums ${i === 3 ? 'text-base' : 'text-xl'}`}>{v}</b>
                            <small className="mt-1 block text-xs text-muted-foreground">{n}</small>
                        </div>
                    ))}
                </div>

                <div role="tablist" aria-label="Loan sections" className="grid grid-cols-2 border-b border-border">
                    {(
                        [
                            ['details', 'Transaction Details'],
                            ['schedule', 'Amortization Schedule'],
                        ] as const
                    ).map(([k, l]) => (
                        <button
                            key={k}
                            role="tab"
                            id={`t-${k}`}
                            aria-selected={tab === k}
                            onClick={() => pick(k)}
                            className={`-mb-px inline-flex cursor-pointer items-center justify-center overflow-hidden border-b-2 px-2 py-2.5 text-[13px] text-ellipsis whitespace-nowrap hover:rounded-t-lg hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tdfc-coral-ink ${tab === k ? 'border-tdfc-coral-ink font-bold text-foreground' : 'border-transparent font-medium text-muted-foreground'}`}
                        >
                            {l}
                        </button>
                    ))}
                </div>

                <Panel className="overflow-hidden">
                    <div role="tabpanel" aria-labelledby={`t-${tab}`}>
                        {tab === 'details' ? (
                            <>
                                <div
                                    role="status"
                                    className="m-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-[oklch(.985_.01_250)] px-4 py-3.5 min-[701px]:mx-6 min-[701px]:mt-4 min-[701px]:mb-5"
                                >
                                    <div className="min-w-0 flex-[1_1_200px]">
                                        {!paid && due ? (
                                            <>
                                                <b className="block text-sm">Next due: {fdateLong(due.date)}</b>
                                                <span className="block text-[13px] break-words text-muted-foreground">
                                                    Estimated amortization {peso(due.amortization)} · Payment {dueIdx + 1} of {schedule.length}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <b className="block text-sm">Loan completed</b>
                                                <span className="block text-[13px] text-muted-foreground">No remaining scheduled payments.</span>
                                            </>
                                        )}
                                    </div>
                                    {schedule.length > 0 && (
                                        <button
                                            onClick={() => pick('schedule')}
                                            className={`${btn.base} ${!paid && due ? btn.dark : btn.plain} ${btn.sm} shrink-0`}
                                        >
                                            View schedule
                                        </button>
                                    )}
                                </div>
                                <div className="px-4 pb-5 min-[701px]:px-6">
                                    <div className="mb-2 flex justify-between text-[13px] text-muted-foreground">
                                        <span>Repayment progress</span>
                                        <b className="text-foreground">{pct.toFixed(0)}% paid</b>
                                    </div>
                                    <div className="h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                                        <i
                                            className="block h-full rounded-full bg-[linear-gradient(90deg,var(--color-tdfc-blue),oklch(.62_.16_250))]"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-5 px-4 pb-5 min-[701px]:px-6">
                                    <div className={grid}>
                                        <Dl l="Loan Number" v={loan.lnnumber} />
                                        <Dl l="Loan Type" v={loan.description} b />
                                        <Dl l="Status" v={paid ? 'Fully paid' : 'Active'} />
                                    </div>
                                    <div className={grid}>
                                        <Dl l="Released" v={fdateLong(loan.released)} />
                                        <Dl l="Matures" v={fdateLong(loan.matures)} />
                                        <Dl l="Term" v={loan.term_months ? `${loan.term_months} months` : '—'} />
                                    </div>
                                    <div className={grid}>
                                        <Dl l="Principal" v={peso(loan.principal)} b />
                                        <Dl l="Paid to date" v={peso(paidAmt)} b />
                                        <Dl l="Outstanding balance" v={peso(loan.balance)} b />
                                    </div>
                                    <div className={grid}>
                                        <Dl l="Interest rate" v={`${loan.interest_rate}%`} />
                                        <Dl l="Installment" v={loan.installment || '—'} />
                                        <Dl l="Last updated" v={fdateLong(new Date().toISOString())} />
                                    </div>
                                </div>
                                <div className="px-4 pb-5 min-[701px]:px-6">
                                    <h3 className="mt-1 mb-3 text-[15px] font-semibold">Recent payments</h3>
                                    {history.length === 0 ? (
                                        <p className="py-4 text-center text-sm text-muted-foreground">No transactions recorded for this loan.</p>
                                    ) : (
                                        <>
                                            <div className="grid max-h-[360px] gap-2.5 overflow-auto rounded-xl border border-border p-3 min-[701px]:hidden">
                                                {history.map((h, i) => (
                                                    <div
                                                        key={`${h.controlno}-${i}`}
                                                        className="rounded-xl border border-border px-3.5 py-3 hover:bg-muted"
                                                    >
                                                        <div className="flex items-baseline justify-between gap-3">
                                                            <b className="text-sm">{h.description}</b>
                                                            <span
                                                                className={`text-sm font-semibold tabular-nums ${h.amount < 0 ? '' : 'text-tdfc-ok-ink'}`}
                                                            >
                                                                {h.amount < 0 ? '-' : '+'}
                                                                {peso(Math.abs(h.amount))}
                                                            </span>
                                                        </div>
                                                        <div className="mt-0.5 text-[13px] text-muted-foreground">
                                                            {fdateLong(h.date)}
                                                            {h.reference ? ` · ${h.reference}` : ''}
                                                        </div>
                                                        <div className="mt-2 flex items-baseline justify-between border-t border-border pt-2">
                                                            <span className="text-[11px] tracking-wide text-muted-foreground uppercase">Balance</span>
                                                            <b className="text-sm tabular-nums">{peso(h.balance)}</b>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="hidden max-h-[360px] overflow-auto rounded-xl border border-border min-[701px]:block">
                                                <table className="w-full border-separate border-spacing-0 whitespace-nowrap tabular-nums">
                                                    <thead>
                                                        <tr>
                                                            {['Date', 'Description', 'Reference', 'Amount', 'Balance'].map((h, i) => (
                                                                <th key={h} className={`${th} ${i > 2 ? 'text-right' : 'text-left'}`}>
                                                                    {h}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {history.map((h, i) => (
                                                            <tr key={`${h.controlno}-${i}`} className="hover:bg-muted">
                                                                <td className={td}>{fdateLong(h.date)}</td>
                                                                <td className={`${td} font-bold`}>{h.description}</td>
                                                                <td className={`${td} text-muted-foreground`}>{h.reference || '—'}</td>
                                                                <td
                                                                    className={`${td} text-right font-medium ${h.amount < 0 ? '' : 'text-tdfc-ok-ink'}`}
                                                                >
                                                                    {h.amount < 0 ? '-' : '+'}
                                                                    {peso(Math.abs(h.amount))}
                                                                </td>
                                                                <td className={`${td} text-right font-bold`}>{peso(h.balance)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : schedule.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <FileText className="mx-auto mb-2 size-12 text-muted-foreground/60" />
                                <p>No amortization schedule data available for this transaction.</p>
                            </div>
                        ) : (
                            <>
                                <div
                                    className="flex flex-wrap gap-3.5 px-4 pt-3 text-xs text-muted-foreground min-[701px]:px-6"
                                    aria-label="Schedule legend"
                                >
                                    {(
                                        [
                                            ['bg-tdfc-ok', 'Paid'],
                                            ['bg-[oklch(.72_.14_75)]', 'Next due'],
                                            ['bg-[oklch(.72_0_0)]', 'Upcoming'],
                                        ] as const
                                    ).map(([c, l]) => (
                                        <span key={l} className="inline-flex items-center gap-1.5">
                                            <i className={`size-2 rounded-full ${c}`} />
                                            {l}
                                        </span>
                                    ))}
                                </div>
                                <div className="p-4 min-[701px]:px-6 min-[701px]:py-5">
                                    <div className="hidden max-h-[60vh] overflow-auto rounded-xl border border-border min-[701px]:block">
                                        <table className="w-full border-separate border-spacing-0 whitespace-nowrap tabular-nums">
                                            <thead>
                                                <tr>
                                                    {['#', 'Due Date', 'Pay Principal', 'Pay Interest', 'Amortization', 'Balance', 'Status'].map(
                                                        (h, i) => (
                                                            <th key={h} className={`${th} ${i > 1 && i < 6 ? 'text-right' : 'text-left'}`}>
                                                                {h}
                                                            </th>
                                                        ),
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {schedule.map((r, n) => (
                                                    <tr key={n} className={r.status === 'due' ? 'bg-tdfc-sun-soft' : 'hover:bg-muted'}>
                                                        <td className={`${td} text-muted-foreground`}>{n + 1}</td>
                                                        <td className={td}>{fdateLong(r.date)}</td>
                                                        <td className={`${td} text-right`}>{peso(r.payPrincipal)}</td>
                                                        <td className={`${td} text-right`}>{peso(r.payInterest)}</td>
                                                        <td className={`${td} text-right`}>{peso(r.amortization)}</td>
                                                        <td className={`${td} text-right font-bold`}>{peso(r.balance)}</td>
                                                        <td className={td}>{statusBadge[r.status]}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="font-bold">
                                                    {[null, 'Total', peso(totals.p), peso(totals.i), peso(totals.am), null, null].map((v, i) => (
                                                        <td
                                                            key={i}
                                                            className={`sticky bottom-0 border-t border-border bg-[oklch(.98_0_0)] px-5 py-3 text-sm ${i > 1 && i < 6 ? 'text-right' : ''}`}
                                                        >
                                                            {v}
                                                        </td>
                                                    ))}
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                    <div className="min-[701px]:hidden">
                                        {schedule.map((r, n) => (
                                            <div
                                                key={n}
                                                className={`mt-2.5 rounded-xl border px-3.5 py-3 first:mt-0 ${r.status === 'due' ? 'border-[oklch(.85_.08_85)] bg-tdfc-sun-soft' : 'border-border'}`}
                                            >
                                                <div className="flex items-baseline justify-between gap-2">
                                                    <b className="text-sm">{fdateLong(r.date)}</b>
                                                    <span className="text-xs text-muted-foreground">
                                                        Payment {n + 1} of {schedule.length}
                                                    </span>
                                                </div>
                                                <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2">
                                                    {(
                                                        [
                                                            ['Pay Principal', r.payPrincipal],
                                                            ['Pay Interest', r.payInterest],
                                                            ['Amortization', r.amortization],
                                                            ['Balance', r.balance],
                                                        ] as const
                                                    ).map(([l, v]) => (
                                                        <div key={l}>
                                                            <dt className="text-[11px] tracking-[.04em] text-muted-foreground uppercase">{l}</dt>
                                                            <dd className="mt-0.5 text-sm font-semibold tabular-nums">{peso(v)}</dd>
                                                        </div>
                                                    ))}
                                                </dl>
                                                <div className="mt-2.5">{statusBadge[r.status]}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="mt-3 text-[13px] text-muted-foreground">Actual posting dates and amounts may vary.</p>
                                </div>
                            </>
                        )}
                    </div>
                </Panel>
            </div>
        </AppLayout>
    );
}
