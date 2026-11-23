import Modal from '@/components/auth/modal';
import { Badge, Pager, Panel, SkelDl, SkelRows, SortTh, btn, fdate, peso, useTable } from '@/components/tdfc/ui';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Eye, FileText, Printer, X } from 'lucide-react';
import { ReactNode, useState } from 'react';

interface Transaction {
    lnnumber: string;
    description: string;
    date: string | null;
    principal: number;
    raw_balance: number;
}

interface LoanSummary {
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

interface AmortizationItem {
    date: string;
    payPrincipal: number;
    payInterest: number;
    amortization: number;
    balance: number;
}

const api = async <T,>(url: string, msg: string): Promise<T> => {
    const r = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    if (!r.ok) throw new Error(msg);
    return r.json();
};

const useTransactionDetails = (ln: string | null) =>
    useQuery({
        queryKey: ['transaction-details', ln],
        queryFn: () => api<{ loan: LoanSummary; history: HistoryItem[] }>(`/api/transactions/loan/${ln}/details`, 'Failed to fetch transaction details'),
        enabled: !!ln,
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });

const useAmortizationSchedule = (ln: string | null) =>
    useQuery({
        queryKey: ['amortization-schedule', ln],
        queryFn: () => api<{ schedule: AmortizationItem[] }>(`/api/transactions/loan/${ln}/schedule`, 'Failed to fetch amortization schedule'),
        enabled: !!ln,
        staleTime: 10 * 60 * 1000,
        retry: 2,
    });

const Dl = ({ l, v, b }: { l: string; v: string; b?: boolean }) => (
    <div>
        <label className="block text-[13px] font-medium text-neutral-600">{l}</label>
        <p className={`mt-0.5 text-sm ${b ? 'font-bold' : ''}`}>{v}</p>
    </div>
);

const ModalHead = ({ title, onClose, children }: { title: string; onClose: () => void; children?: ReactNode }) => (
    <div className="mb-6 flex items-center justify-between print:hidden">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="flex items-center gap-2">
            {children}
            <button onClick={onClose} aria-label="Close" className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="size-4" />
            </button>
        </span>
    </div>
);

const Failed = ({ msg }: { msg: string }) => (
    <div role="alert" className="py-8 text-center text-[oklch(.5_.2_25)]">
        <AlertCircle className="mx-auto mb-2 size-8" />
        <p>{msg}</p>
    </div>
);

export default function LoansTransactionPage({ transactions }: { transactions: Transaction[] }) {
    const [ln, setLn] = useState<string | null>(null);
    const [type, setType] = useState<'details' | 'schedule' | null>(null);
    const details = useTransactionDetails(type === 'details' ? ln : null);
    const schedule = useAmortizationSchedule(type === 'schedule' ? ln : null);
    const t = useTable(transactions, { key: 'date', per: 15 }, (r, k) => (k === 'balance' ? r.raw_balance : (((r as unknown) as Record<string, string | number>)[k] ?? '')));
    const open = (l: string, ty: 'details' | 'schedule') => {
        setLn(l);
        setType(ty);
    };
    const close = () => {
        setLn(null);
        setType(null);
    };

    const actions = (l: string) => (
        <div className="flex gap-2">
            <button onClick={() => open(l, 'details')} className={`${btn.base} ${btn.plain} ${btn.sm} gap-1.5 hover:!bg-tdfc-blue-soft hover:!text-tdfc-blue-ink`}>
                <Eye className="size-3" />
                Details
            </button>
            <button onClick={() => open(l, 'schedule')} className={`${btn.base} ${btn.plain} ${btn.sm} gap-1.5 hover:!bg-tdfc-ok-soft hover:!text-tdfc-ok-ink`}>
                <FileText className="size-3" />
                Schedule
            </button>
        </div>
    );

    const rows = schedule.data?.schedule ?? [];
    const loan = details.data?.loan;
    const history = details.data?.history ?? [];
    const cell = 'border-b border-border px-3.5 py-2.5';

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Loans', href: '/loans' },
                { title: 'Transactions', href: '/loans/transactions' },
            ]}
        >
            <Head title="Loan Transactions" />
            <div className="grid content-start gap-5 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold">Loan Transactions</h1>
                    <p className="mt-1 text-muted-foreground">View your loan transaction history and amortization schedules</p>
                </div>
                <Panel className="overflow-hidden">
                    {transactions.length === 0 ? (
                        <div className="px-4 py-12 text-center text-muted-foreground">No loan transactions found</div>
                    ) : (
                        <>
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <SortTh t={t} k="date">Date</SortTh>
                                            <SortTh t={t} k="lnnumber">Loan Number</SortTh>
                                            <SortTh t={t} k="description">Description</SortTh>
                                            <SortTh t={t} k="principal" right>Principal</SortTh>
                                            <SortTh t={t} k="balance" right>Balance</SortTh>
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Status</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {t.view.map((r) => (
                                            <tr key={r.lnnumber} className="border-b border-border last:border-0 even:bg-muted/40 hover:bg-muted">
                                                <td className="px-4 py-3.5 text-muted-foreground">{fdate(r.date)}</td>
                                                <td className="px-4 py-3.5 font-medium">{r.lnnumber}</td>
                                                <td className="px-4 py-3.5 font-bold">{r.description}</td>
                                                <td className="px-4 py-3.5 text-right font-bold tabular-nums">{peso(r.principal)}</td>
                                                <td className="px-4 py-3.5 text-right font-bold tabular-nums">{peso(r.raw_balance)}</td>
                                                <td className="px-4 py-3.5"><Badge tone={r.raw_balance > 0 ? 'info' : 'ok'}>{r.raw_balance > 0 ? 'Active' : 'Fully Paid'}</Badge></td>
                                                <td className="px-4 py-3.5">{actions(r.lnnumber)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="md:hidden">
                                {t.view.map((r) => (
                                    <div key={r.lnnumber} className="border-b border-border px-4 py-3.5 last:border-0">
                                        <div className="flex justify-between gap-3">
                                            <div>
                                                <b>{r.description}</b>
                                                <div className="text-[13px] text-muted-foreground">
                                                    {r.lnnumber} · {fdate(r.date)}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <b>{peso(r.principal)}</b>
                                                <div className="text-xs text-muted-foreground">Bal {peso(r.raw_balance)}</div>
                                                <div className="mt-1"><Badge tone={r.raw_balance > 0 ? 'info' : 'ok'}>{r.raw_balance > 0 ? 'Active' : 'Fully Paid'}</Badge></div>
                                            </div>
                                        </div>
                                        <div className="mt-2.5">{actions(r.lnnumber)}</div>
                                    </div>
                                ))}
                            </div>
                            <Pager t={t} options={[10, 15, 25, 50]} />
                        </>
                    )}
                </Panel>
            </div>

            <Modal open={type === 'details'} onClose={close} label="Transaction Details" className="max-w-[720px]">
                <ModalHead title="Transaction Details" onClose={close} />
                {details.isLoading && (
                    <div role="status" aria-busy="true" aria-label="Loading transaction details" className="py-4">
                        <SkelDl />
                    </div>
                )}
                {details.error && (
                    <>
                        <Failed msg="Failed to load transaction details" />
                        <div className="text-center">
                            <button onClick={() => details.refetch()} className={`${btn.base} ${btn.plain} ${btn.sm}`}>Try again</button>
                        </div>
                    </>
                )}
                {loan && (
                    <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4"><Dl l="Loan Number" v={loan.lnnumber} /><Dl l="Loan Type" v={loan.description} b /></div>
                        <div className="grid grid-cols-2 gap-4"><Dl l="Released" v={fdate(loan.released)} /><Dl l="Matures" v={fdate(loan.matures)} /></div>
                        <div className="grid grid-cols-2 gap-4"><Dl l="Principal" v={peso(loan.principal)} b /><Dl l="Balance" v={peso(loan.balance)} b /></div>
                        <div className="grid grid-cols-2 gap-4"><Dl l="Interest Rate" v={`${loan.interest_rate}%`} /><Dl l="Installment" v={loan.installment || '—'} /></div>
                        <div>
                            <h4 className="mb-2 text-sm font-semibold">Transaction History</h4>
                            {history.length === 0 ? (
                                <p className="py-4 text-center text-sm text-muted-foreground">No transactions recorded for this loan.</p>
                            ) : (
                                <div className="max-h-[40vh] overflow-auto rounded-xl border border-border">
                                    <table className="w-full border-separate border-spacing-0 text-[13px] whitespace-nowrap tabular-nums">
                                        <thead>
                                            <tr>
                                                {['Date', 'Description', 'Reference', 'Amount', 'Balance'].map((h, i) => (
                                                    <th key={h} className={`sticky top-0 border-b border-border bg-muted px-3.5 py-2.5 text-[11px] tracking-wide text-muted-foreground uppercase ${i > 2 ? 'text-right' : 'text-left'}`}>
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.map((h, i) => (
                                                <tr key={`${h.controlno}-${i}`} className="hover:bg-muted">
                                                    <td className="border-b border-border px-3.5 py-2.5">{fdate(h.date)}</td>
                                                    <td className="border-b border-border px-3.5 py-2.5 font-medium">{h.description}</td>
                                                    <td className="border-b border-border px-3.5 py-2.5 text-muted-foreground">{h.reference}</td>
                                                    <td className={`border-b border-border px-3.5 py-2.5 text-right font-medium ${h.amount < 0 ? '' : 'text-tdfc-ok-ink'}`}>{h.amount < 0 ? '-' : '+'}{peso(Math.abs(h.amount))}</td>
                                                    <td className="border-b border-border px-3.5 py-2.5 text-right font-bold">{peso(h.balance)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            <Modal open={type === 'schedule'} onClose={close} label="Amortization Schedule" className="max-w-[720px] print:max-w-none print:shadow-none">
                <ModalHead title="Amortization Schedule" onClose={close}>
                    {rows.length > 0 && (
                        <button onClick={() => window.print()} className={`${btn.base} ${btn.plain} ${btn.sm} gap-1.5`}>
                            <Printer className="size-3" />
                            Print / PDF
                        </button>
                    )}
                </ModalHead>
                {schedule.isLoading && (
                    <table role="status" aria-busy="true" aria-label="Loading amortization schedule" className="w-full">
                        <tbody>
                            <SkelRows rows={6} cols={5} />
                        </tbody>
                    </table>
                )}
                {schedule.error && <Failed msg="Failed to load amortization schedule" />}
                {!schedule.isLoading && !schedule.error && rows.length === 0 && (
                    <div className="py-8 text-center text-neutral-600">
                        <FileText className="mx-auto mb-2 size-12 text-neutral-400" />
                        <p>No amortization schedule data available for this transaction.</p>
                    </div>
                )}
                {rows.length > 0 && (
                    <>
                        <div className="hidden max-h-[60vh] overflow-auto rounded-xl border border-border sm:block print:max-h-none">
                            <table className="w-full border-separate border-spacing-0 text-[13px] whitespace-nowrap tabular-nums">
                                <thead>
                                    <tr>
                                        {['Date', 'Pay Principal', 'Pay Interest', 'Amortization', 'Balance'].map((h, i) => (
                                            <th key={h} className={`sticky top-0 border-b border-border bg-muted px-3.5 py-2.5 text-[11px] tracking-wide text-muted-foreground uppercase ${i ? 'text-right' : 'text-left'}`}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((i, n) => (
                                        <tr key={n} className="hover:bg-muted">
                                            <td className={cell}>{fdate(i.date)}</td>
                                            <td className={`${cell} text-right font-medium`}>{peso(i.payPrincipal)}</td>
                                            <td className={`${cell} text-right font-medium`}>{peso(i.payInterest)}</td>
                                            <td className={`${cell} text-right font-medium`}>{peso(i.amortization)}</td>
                                            <td className={`${cell} text-right font-bold`}>{peso(i.balance)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="grid gap-2.5 sm:hidden">
                            {rows.map((i, n) => (
                                <div key={n} className="rounded-xl border border-border px-3.5 py-3">
                                    <div className="flex items-baseline justify-between">
                                        <b className="text-sm">{fdate(i.date)}</b>
                                        <span className="text-xs text-muted-foreground">Payment {n + 1} of {rows.length}</span>
                                    </div>
                                    <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2">
                                        {(
                                            [
                                                ['Pay Principal', i.payPrincipal],
                                                ['Pay Interest', i.payInterest],
                                                ['Amortization', i.amortization],
                                                ['Balance', i.balance],
                                            ] as const
                                        ).map(([l, v]) => (
                                            <div key={l}>
                                                <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">{l}</dt>
                                                <dd className="mt-0.5 text-sm font-semibold tabular-nums">{peso(v)}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </Modal>
        </AppLayout>
    );
}
