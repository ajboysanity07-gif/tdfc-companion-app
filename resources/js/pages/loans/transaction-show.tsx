import { DueBadge, RowState, hero, heroBig, pageFrame, paidPct, payAmount, payCard, rowState, today } from '@/components/tdfc/loan';
import { Badge, Panel, btn, fdateLong, peso } from '@/components/tdfc/ui';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Download, FileText, Printer } from 'lucide-react';
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

const STATE: Record<RowState, { label: string; tone: 'ok' | 'bad' | 'warn' | 'neutral' }> = {
    paid: { label: 'Paid', tone: 'ok' },
    late: { label: 'Past due', tone: 'bad' },
    due: { label: 'Next due', tone: 'warn' },
    upcoming: { label: 'Upcoming', tone: 'neutral' },
};

const StateBadge = ({ r }: { r: ScheduleRow }) => {
    const { label, tone } = STATE[rowState(r)];
    return <Badge tone={tone}>{label}</Badge>;
};

const Dl = ({ l, v }: { l: string; v: string }) => (
    <div>
        <dt className="text-[13px] font-medium text-muted-foreground">{l}</dt>
        <dd className="mt-0.5 text-sm font-semibold">{v}</dd>
    </div>
);

const th = 'sticky top-0 z-1 border-b border-border bg-muted px-5 py-3 text-[11px] tracking-[.04em] text-muted-foreground uppercase';
const td = 'border-b border-border px-5 py-3 text-sm';
// Recent payments stay a table on phones, tightened to fit three columns.
const hist = 'max-[701px]:!px-2 max-[701px]:!py-2.5 max-[701px]:!text-[13px]';
const pad = 'px-6 py-5 max-[701px]:p-4';
const h2 = 'text-base font-bold';
const smBtn = `${btn.base} ${btn.sm} gap-2 border-border bg-background hover:bg-muted max-[861px]:!h-11 max-[701px]:w-full`;

const PRINT_CSS = `@media print{
  @page{size:A4;margin:14mm 14mm 16mm}
  body>*:not(#print-doc){display:none!important}
  #print-doc{display:block!important;color:#000;background:#fff;font-size:10.5pt}
}`;

const printDate = () => new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });

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
                            <td className={`${c} font-semibold`}>{STATE[rowState(r)].label}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="border-t-2 border-black font-bold">
                        <td className={c} colSpan={2}>
                            Total, all {schedule.length}
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
                <p className="mt-5 text-center text-[9pt] text-neutral-600">Generated on {printDate()}.</p>
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
                STATE[rowState(r)].label,
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
    const [showPaid, setShowPaid] = useState(false);
    const {
        auth,
        member,
        base = '',
    } = usePage<{ auth: { user?: { name?: string; acctno?: string | null } }; member?: { name?: string; acctno?: string | null }; base?: string }>()
        .props;
    const user = member ?? auth.user;
    const loansUrl = base ? `${base}/loans` : '/loans/transactions';
    const now = today();
    const paid = loan.balance <= 0;
    const paidAmt = loan.principal - loan.balance;
    const pct = paidPct(loan.balance, loan.principal);
    const totals = schedule.reduce((a, r) => ({ p: a.p + r.payPrincipal, i: a.i + r.payInterest, am: a.am + r.amortization }), { p: 0, i: 0, am: 0 });
    const dueIdx = paid ? -1 : schedule.findIndex((r) => r.status === 'due');
    const due = dueIdx >= 0 ? schedule[dueIdx] : null;
    const late = schedule.filter((r) => rowState(r, now) === 'late').length;
    const paidN = schedule.filter((r) => r.status === 'paid').length;
    const hidePaid = !showPaid && paidN < schedule.length;
    // Keep each row's payment number when paid rows are hidden.
    const shown = schedule.map((r, n) => ({ r, n })).filter(({ r }) => !(hidePaid && r.status === 'paid'));
    const payments = history.filter((h) => h.amount < 0);
    const pick = (k: Tab) => {
        setTab(k);
        setShowPaid(false);
        window.history.replaceState(null, '', `?tab=${k}`);
    };

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
            <div className={`${pageFrame} print:hidden`}>
                <div>
                    <Link
                        href={loansUrl}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg pr-2.5 pl-1.5 text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tdfc-coral-ink"
                    >
                        ‹ All transactions
                    </Link>
                    <h1 className="mt-2 flex flex-wrap items-center gap-3 text-2xl font-extrabold">
                        {loan.description}
                        <Badge tone={paid ? 'ok' : 'info'}>{paid ? 'Fully paid' : 'Active'}</Badge>
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        {loan.lnnumber} · Released {fdateLong(loan.released)}
                    </p>
                </div>

                <section aria-label="Loan balance and next payment" className={hero}>
                    <div className="min-w-0 flex-[1_1_280px]">
                        <h2 className="text-sm font-semibold">Balance left</h2>
                        <b className={heroBig}>{peso(loan.balance)}</b>
                        <div
                            className="mt-3 mb-2 h-2.5 max-w-[460px] overflow-hidden rounded-full bg-[color-mix(in_oklch,var(--on-brand-surface)_30%,transparent)]"
                            aria-hidden="true"
                        >
                            <i className="block h-full rounded-full bg-tdfc-on-coral" style={{ width: `${pct}%` }} />
                        </div>
                        <p>
                            {peso(paidAmt)} paid of {peso(loan.principal)} borrowed ({pct}%)
                        </p>
                    </div>
                    <div className={payCard}>
                        {due ? (
                            <>
                                <h2 className="text-sm font-semibold">{due.date && due.date < now ? 'Unpaid payment' : 'Next payment'}</h2>
                                <span className={payAmount}>{peso(due.amortization)}</span>
                                {due.date && (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <DueBadge date={due.date} />
                                        <span>{fdateLong(due.date)}</span>
                                    </div>
                                )}
                                <p className="text-muted-foreground">
                                    Estimated amount · payment {dueIdx + 1} of {schedule.length}
                                    {late > 1 ? ` · ${late} payments are past their date` : ''}
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-sm font-semibold">{paid ? 'Loan completed' : 'No scheduled payment'}</h2>
                                <p className="text-muted-foreground">
                                    {paid ? 'There is nothing left to pay on this loan.' : 'This loan has no upcoming payment on its schedule.'}
                                </p>
                            </>
                        )}
                    </div>
                </section>

                <div>
                    <div role="tablist" aria-label="Loan sections" className="mb-3 flex gap-1 border-b border-border">
                        {(
                            [
                                ['details', 'Transaction Details'],
                                ['schedule', 'Amortization Schedule'],
                            ] as const
                        ).map(([k, l]) => (
                            <button
                                key={k}
                                type="button"
                                role="tab"
                                id={`t-${k}`}
                                aria-selected={tab === k}
                                onClick={() => pick(k)}
                                className={`-mb-px inline-flex min-h-11 cursor-pointer items-center justify-center rounded-t-lg border-b-2 px-4 text-sm hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tdfc-coral-ink max-[701px]:flex-1 max-[701px]:px-2 max-[701px]:text-[13px] ${tab === k ? 'border-tdfc-coral-ink font-bold text-foreground' : 'border-transparent font-medium text-muted-foreground'}`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>

                    <Panel className="overflow-hidden">
                        <div role="tabpanel" aria-labelledby={`t-${tab}`}>
                            {tab === 'details' ? (
                                <>
                                    <div className={pad}>
                                        <h2 className={`${h2} mb-3`}>Recent payments</h2>
                                        {payments.length === 0 ? (
                                            <p className="text-muted-foreground">No payments posted yet.</p>
                                        ) : (
                                            <div className="max-h-[360px] overflow-auto rounded-xl border border-border">
                                                <table className="w-full border-separate border-spacing-0 whitespace-nowrap tabular-nums max-[701px]:whitespace-normal [&_tbody_tr:last-child_td]:border-b-0">
                                                    <thead>
                                                        <tr>
                                                            <th className={`${th} ${hist} text-left`}>Date</th>
                                                            <th className={`${th} text-left max-[701px]:hidden`}>Description</th>
                                                            <th className={`${th} text-left max-[701px]:hidden`}>Reference</th>
                                                            <th className={`${th} ${hist} text-right`}>Amount paid</th>
                                                            <th className={`${th} ${hist} text-right`}>Balance after</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {payments.map((h, i) => (
                                                            <tr key={`${h.controlno}-${i}`} className="hover:bg-muted">
                                                                <td className={`${td} ${hist}`}>{fdateLong(h.date)}</td>
                                                                <td className={`${td} max-[701px]:hidden`}>Loan payment</td>
                                                                <td className={`${td} text-muted-foreground max-[701px]:hidden`}>{h.reference || '—'}</td>
                                                                <td className={`${td} ${hist} text-right font-bold`}>{peso(-h.amount)}</td>
                                                                <td className={`${td} ${hist} text-right`}>{peso(h.balance)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                    <div className={`${pad} border-t border-border`}>
                                        <h2 className={`${h2} mb-3`}>Loan information</h2>
                                        <dl className="grid grid-cols-3 gap-4 max-[701px]:grid-cols-2">
                                            <Dl l="Loan number" v={loan.lnnumber} />
                                            <Dl l="Loan type" v={loan.description} />
                                            <Dl l="Amount borrowed" v={peso(loan.principal)} />
                                            <Dl l="Released" v={fdateLong(loan.released) || '—'} />
                                            <Dl l="Matures" v={fdateLong(loan.matures) || '—'} />
                                            <Dl l="Term" v={loan.term_months ? `${loan.term_months} months` : '—'} />
                                            <Dl l="Interest rate" v={`${loan.interest_rate}%`} />
                                            <Dl l="Installment" v={loan.installment || '—'} />
                                            <Dl l="Last updated" v={fdateLong(now)} />
                                        </dl>
                                    </div>
                                </>
                            ) : schedule.length === 0 ? (
                                <div className="py-12 text-center text-muted-foreground">
                                    <FileText className="mx-auto mb-2 size-12 text-muted-foreground/60" />
                                    <p>No amortization schedule data available for this transaction.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-border px-6 py-4 max-[701px]:p-4">
                                        <div>
                                            <h2 className={h2}>Payment schedule</h2>
                                            <p className="text-[13px] text-muted-foreground">
                                                {paidN} of {schedule.length} payments paid
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2 max-[701px]:w-full">
                                            {paidN > 0 && paidN < schedule.length && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPaid(!showPaid)}
                                                    aria-expanded={showPaid}
                                                    className={smBtn}
                                                >
                                                    {showPaid ? 'Hide' : 'Show'} {paidN} paid payment{paidN === 1 ? '' : 's'}
                                                </button>
                                            )}
                                            <button type="button" onClick={() => csv(loan, schedule)} className={smBtn}>
                                                <Download className="size-3.5" />
                                                Download CSV
                                            </button>
                                            <button type="button" onClick={() => window.print()} className={smBtn}>
                                                <Printer className="size-3.5" />
                                                Print / PDF
                                            </button>
                                        </div>
                                    </div>
                                    <div className={pad}>
                                        <p className="mb-3 text-[13px] text-muted-foreground">
                                            This schedule is an estimate. Posted dates and amounts may differ
                                            {!paid && (
                                                <>
                                                    , so its balances may not match your actual balance of{' '}
                                                    <b className="text-foreground">{peso(loan.balance)}</b>
                                                </>
                                            )}
                                            .
                                        </p>
                                        <div className="max-h-[60vh] overflow-auto rounded-xl border border-border max-[701px]:hidden">
                                            <table className="w-full border-separate border-spacing-0 whitespace-nowrap tabular-nums [&_tbody_tr:last-child_td]:border-b-0">
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
                                                    {shown.map(({ r, n }) => {
                                                        const cur = r.status === 'due';
                                                        const sub = `${td} text-right ${cur ? '' : 'text-muted-foreground group-hover:text-foreground'}`;
                                                        return (
                                                            <tr key={n} className={`group ${cur ? 'bg-tdfc-sun-soft' : 'hover:bg-muted'}`}>
                                                                <td className={`${td} text-muted-foreground`}>{n + 1}</td>
                                                                <td className={td}>{fdateLong(r.date)}</td>
                                                                <td className={sub}>{peso(r.payPrincipal)}</td>
                                                                <td className={sub}>{peso(r.payInterest)}</td>
                                                                <td className={`${td} text-right font-bold`}>{peso(r.amortization)}</td>
                                                                <td className={sub}>{peso(r.balance)}</td>
                                                                <td className={td}>
                                                                    <StateBadge r={r} />
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                                <tfoot>
                                                    <tr className="font-bold">
                                                        {[
                                                            null,
                                                            `Total, all ${schedule.length}`,
                                                            peso(totals.p),
                                                            peso(totals.i),
                                                            peso(totals.am),
                                                            null,
                                                            null,
                                                        ].map((v, i) => (
                                                            <td
                                                                key={i}
                                                                className={`sticky bottom-0 border-t border-border bg-muted px-5 py-3 text-sm ${i > 1 && i < 6 ? 'text-right' : ''}`}
                                                            >
                                                                {v}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                        <div className="min-[701px]:hidden">
                                            {shown.map(({ r, n }) => (
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
                                                    <b className="mt-1.5 block text-xl tabular-nums">{peso(r.amortization)}</b>
                                                    <dl className="mt-2.5 mb-2.5 grid grid-cols-2 gap-x-4 gap-y-2">
                                                        {(
                                                            [
                                                                ['Principal', r.payPrincipal],
                                                                ['Interest', r.payInterest],
                                                                ['Balance after', r.balance],
                                                            ] as const
                                                        ).map(([l, v]) => (
                                                            <div key={l}>
                                                                <dt className="text-[11px] tracking-[.04em] text-muted-foreground uppercase">{l}</dt>
                                                                <dd className="mt-0.5 text-sm font-semibold tabular-nums">{peso(v)}</dd>
                                                            </div>
                                                        ))}
                                                    </dl>
                                                    <StateBadge r={r} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </Panel>
                </div>
            </div>
        </AppLayout>
    );
}
