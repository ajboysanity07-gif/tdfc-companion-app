import { Badge, Panel, btn, fdate, peso } from '@/components/tdfc/ui';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ChevronLeft, FileText, Printer } from 'lucide-react';
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

const th = 'sticky top-0 border-b border-border bg-muted px-5 py-3 text-[11px] tracking-wide text-muted-foreground uppercase';
const td = 'border-b border-border px-5 py-3 text-sm';


const PRINT_CSS = `@media print{
  @page{size:A4;margin:12mm}
  body>*:not(#print-doc){display:none!important}
  #print-doc{display:block!important;color:#000;background:#fff;font-size:11px}
}`;

function ScheduleDocument({ loan, schedule, totals, user }: { loan: Loan; schedule: ScheduleRow[]; totals: { p: number; i: number; am: number }; user?: { name?: string; acctno?: string | null } }) {
    const c = 'border border-neutral-400 px-2 py-1';
    const info: [string, string][] = [
        ['Borrower', user?.name ?? '—'],
        ['Account No.', user?.acctno ?? '—'],
        ['Loan No.', loan.lnnumber],
        ['Loan Type', loan.description],
        ['Released', fdate(loan.released)],
        ['Maturity', fdate(loan.matures)],
        ['Principal', peso(loan.principal)],
        ['Outstanding Balance', peso(loan.balance)],
        ['Interest Rate', `${loan.interest_rate}%`],
        ['Installment', loan.installment || '—'],
    ];
    if (typeof document === 'undefined') return null;
    return createPortal(
        <div id="print-doc" className="hidden">
            <style>{PRINT_CSS}</style>
            <img src="/images/Header.png" alt="Triple Diamond Finance Corp." className="mb-3 w-[55%]" />
            <h2 className="mb-3 text-center text-base font-bold tracking-wide uppercase">Amortization Schedule</h2>
            <table className="mb-3 w-full border-collapse">
                <tbody>
                    {[0, 2, 4, 6, 8].map((i) => (
                        <tr key={i}>
                            {info.slice(i, i + 2).map(([l, v]) => (
                                <td key={l} className="w-1/2 px-1 py-0.5">
                                    <span className="inline-block w-36 font-semibold">{l}:</span>
                                    {v}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <table className="w-full border-collapse tabular-nums">
                <thead>
                    <tr className="bg-neutral-200">
                        {['#', 'Due Date', 'Principal', 'Interest', 'Amortization', 'Balance', 'Status'].map((h, i) => (
                            <th key={h} className={`${c} ${i > 1 && i < 6 ? 'text-right' : 'text-left'}`}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {schedule.map((r, n) => (
                        <tr key={n} style={{ breakInside: 'avoid' }}>
                            <td className={c}>{n + 1}</td>
                            <td className={c}>{fdate(r.date)}</td>
                            <td className={`${c} text-right`}>{peso(r.payPrincipal)}</td>
                            <td className={`${c} text-right`}>{peso(r.payInterest)}</td>
                            <td className={`${c} text-right`}>{peso(r.amortization)}</td>
                            <td className={`${c} text-right`}>{peso(r.balance)}</td>
                            <td className={c}>{r.status === 'paid' ? 'Paid' : r.status === 'due' ? 'Next due' : 'Upcoming'}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="bg-neutral-200 font-bold">
                        <td className={c} colSpan={2}>Total</td>
                        <td className={`${c} text-right`}>{peso(totals.p)}</td>
                        <td className={`${c} text-right`}>{peso(totals.i)}</td>
                        <td className={`${c} text-right`}>{peso(totals.am)}</td>
                        <td className={c} colSpan={2} />
                    </tr>
                </tfoot>
            </table>
            <p className="mt-6 text-[10px] text-neutral-600">
                Generated on {new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}. This is a system-generated document of Triple Diamond Finance Corp. and does not require a signature.
            </p>
        </div>,
        document.body,
    );
}

export default function LoanTransactionShow({ tab: initial, loan, history, schedule }: { tab: Tab; loan: Loan; history: HistoryItem[]; schedule: ScheduleRow[] }) {
    const [tab, setTab] = useState<Tab>(initial);
    const user = usePage<{ auth: { user?: { name?: string; acctno?: string | null } } }>().props.auth.user;
    const paid = loan.balance <= 0;
    const totals = schedule.reduce(
        (a, r) => ({ p: a.p + r.payPrincipal, i: a.i + r.payInterest, am: a.am + r.amortization }),
        { p: 0, i: 0, am: 0 },
    );
    const pick = (k: Tab) => {
        setTab(k);
        window.history.replaceState(null, '', `?tab=${k}`);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Loans', href: '/loans' },
                { title: 'Transactions', href: '/loans/transactions' },
                { title: loan.lnnumber, href: `/loans/transactions/${loan.lnnumber}` },
            ]}
        >
            <Head title={`Loan ${loan.lnnumber}`} />
            <ScheduleDocument loan={loan} schedule={schedule} totals={totals} user={user} />
            <div className="grid content-start gap-5 p-4 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
                    <div>
                        <Link href="/loans/transactions" className="inline-flex h-8 items-center gap-1.5 rounded-lg pr-2.5 pl-1.5 text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
                            <ChevronLeft className="size-4" />
                            All transactions
                        </Link>
                        <h1 className="mt-2 flex flex-wrap items-center gap-3 text-2xl font-extrabold">
                            {loan.lnnumber}
                            <Badge tone={paid ? 'ok' : 'info'}>{paid ? 'Fully paid' : 'Active'}</Badge>
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            {loan.description} · Released {fdate(loan.released)}
                        </p>
                    </div>
                    {tab === 'schedule' && schedule.length > 0 && (
                        <button onClick={() => window.print()} className={`${btn.base} ${btn.plain} gap-2 max-sm:w-full`}>
                            <Printer className="size-3.5" />
                            Print / PDF
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-border bg-border shadow-sm md:grid-cols-4 print:hidden">
                    {(
                        [
                            ['Principal', peso(loan.principal)],
                            ['Paid', peso(loan.principal - loan.balance)],
                            ['Balance', peso(loan.balance)],
                            ['Released', fdate(loan.released)],
                        ] as const
                    ).map(([l, v]) => (
                        <div key={l} className="bg-card px-[18px] py-3.5">
                            <label className="block text-xs font-medium text-muted-foreground">{l}</label>
                            <b className="mt-1 block text-lg tabular-nums">{v}</b>
                        </div>
                    ))}
                </div>

                <div role="tablist" aria-label="Loan sections" className="flex gap-1 border-b border-border print:hidden">
                    {(
                        [
                            ['details', 'Transaction Details'],
                            ['schedule', 'Amortization Schedule'],
                        ] as const
                    ).map(([k, l]) => (
                        <button
                            key={k}
                            role="tab"
                            aria-selected={tab === k}
                            onClick={() => pick(k)}
                            className={`-mb-px border-b-2 px-4 py-2.5 text-sm hover:bg-muted ${tab === k ? 'border-tdfc-coral-ink font-bold text-foreground' : 'border-transparent font-medium text-muted-foreground hover:text-foreground'}`}
                        >
                            {l}
                        </button>
                    ))}
                </div>

                <Panel className="overflow-hidden">
                    {tab === 'details' ? (
                        <>
                            <div className="grid gap-4 px-6 py-5">
                                <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                                    <Dl l="Loan Number" v={loan.lnnumber} />
                                    <Dl l="Loan Type" v={loan.description.toUpperCase()} b />
                                    <Dl l="Installment" v={loan.installment || '—'} />
                                </div>
                                <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                                    <Dl l="Released" v={fdate(loan.released)} />
                                    <Dl l="Matures" v={fdate(loan.matures)} />
                                    <Dl l="Term" v={loan.term_months ? `${loan.term_months} months` : '—'} />
                                </div>
                                <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                                    <Dl l="Principal" v={peso(loan.principal)} b />
                                    <Dl l="Interest Rate" v={`${loan.interest_rate}%`} />
                                    <Dl l="Balance" v={peso(loan.balance)} b />
                                </div>
                            </div>
                            <div className="px-6 pb-5">
                                <h3 className="mb-3 text-[15px] font-semibold">Transaction History</h3>
                                {history.length === 0 ? (
                                    <p className="py-4 text-center text-sm text-muted-foreground">No transactions recorded for this loan.</p>
                                ) : (
                                    <div className="grid max-h-[420px] gap-2.5 overflow-auto rounded-xl border border-border p-3 sm:grid-cols-2">
                                        {history.map((h, i) => (
                                            <div key={`${h.controlno}-${i}`} className="rounded-xl border border-border px-3.5 py-3 hover:bg-muted">
                                                <div className="flex items-baseline justify-between gap-3">
                                                    <b className="text-sm">{h.description}</b>
                                                    <span className={`text-sm font-semibold tabular-nums ${h.amount < 0 ? '' : 'text-tdfc-ok-ink'}`}>
                                                        {h.amount < 0 ? '-' : '+'}{peso(Math.abs(h.amount))}
                                                    </span>
                                                </div>
                                                <div className="mt-0.5 text-[13px] text-muted-foreground">
                                                    {fdate(h.date)}{h.reference ? ` · ${h.reference}` : ''}
                                                </div>
                                                <div className="mt-2 flex items-baseline justify-between border-t border-border pt-2">
                                                    <span className="text-[11px] tracking-wide text-muted-foreground uppercase">Balance</span>
                                                    <b className="text-sm tabular-nums">{peso(h.balance)}</b>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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
                            <div className="hidden max-h-[70vh] overflow-auto sm:block print:block print:max-h-none">
                                <table className="w-full border-separate border-spacing-0 whitespace-nowrap tabular-nums print:whitespace-normal">
                                    <thead>
                                        <tr>
                                            {['#', 'Due Date', 'Pay Principal', 'Pay Interest', 'Amortization', 'Balance', 'Status'].map((h, i) => (
                                                <th key={h} className={`${th} ${i > 1 && i < 6 ? 'text-right' : 'text-left'}`}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schedule.map((r, n) => (
                                            <tr key={n} className={r.status === 'due' ? 'bg-tdfc-sun-soft' : 'hover:bg-muted'}>
                                                <td className={`${td} text-muted-foreground`}>{n + 1}</td>
                                                <td className={td}>{fdate(r.date)}</td>
                                                <td className={`${td} text-right font-medium`}>{peso(r.payPrincipal)}</td>
                                                <td className={`${td} text-right font-medium`}>{peso(r.payInterest)}</td>
                                                <td className={`${td} text-right font-medium`}>{peso(r.amortization)}</td>
                                                <td className={`${td} text-right font-bold`}>{peso(r.balance)}</td>
                                                <td className={td}>{statusBadge[r.status]}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="font-bold">
                                            <td className="sticky bottom-0 border-t border-border bg-muted px-5 py-3 text-sm" />
                                            <td className="sticky bottom-0 border-t border-border bg-muted px-5 py-3 text-sm">Total</td>
                                            <td className="sticky bottom-0 border-t border-border bg-muted px-5 py-3 text-right text-sm">{peso(totals.p)}</td>
                                            <td className="sticky bottom-0 border-t border-border bg-muted px-5 py-3 text-right text-sm">{peso(totals.i)}</td>
                                            <td className="sticky bottom-0 border-t border-border bg-muted px-5 py-3 text-right text-sm">{peso(totals.am)}</td>
                                            <td className="sticky bottom-0 border-t border-border bg-muted px-5 py-3 text-sm" />
                                            <td className="sticky bottom-0 border-t border-border bg-muted px-5 py-3 text-sm" />
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            <div className="grid gap-2.5 p-3 sm:hidden print:hidden">
                                {schedule.map((r, n) => (
                                    <div key={n} className="rounded-xl border border-border px-3.5 py-3">
                                        <div className="flex items-baseline justify-between">
                                            <b className="text-sm">{fdate(r.date)}</b>
                                            <span className="text-xs text-muted-foreground">Payment {n + 1} of {schedule.length}</span>
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
                                                    <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">{l}</dt>
                                                    <dd className="mt-0.5 text-sm font-semibold tabular-nums">{peso(v)}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                        <div className="mt-2.5">{statusBadge[r.status]}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </Panel>
            </div>
        </AppLayout>
    );
}
