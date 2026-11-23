import { Pager, Panel, SortTh, btn, fdate, peso, useTable } from '@/components/tdfc/ui';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';

interface Transaction {
    lnnumber: string;
    description: string;
    date: string | null;
    principal: number;
    raw_balance: number;
}

const OpenLink = ({ ln }: { ln: string }) => (
    <Link
        href={`/loans/transactions/${encodeURIComponent(ln)}`}
        aria-label={`Open loan ${ln}`}
        className={`${btn.base} ${btn.plain} ${btn.sm} gap-1.5 hover:!bg-tdfc-blue-soft hover:!text-tdfc-blue-ink`}
    >
        Open
        <ArrowUpRight className="size-3" />
    </Link>
);

export default function LoansTransactionPage({ transactions }: { transactions: Transaction[] }) {
    const t = useTable(transactions, { key: 'date', per: 15 }, (r, k) => (k === 'balance' ? r.raw_balance : (((r as unknown) as Record<string, string | number>)[k] ?? '')));

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
                    <h1 className="text-2xl font-extrabold">Loan Transactions</h1>
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
                                                <td className="px-4 py-3.5"><OpenLink ln={r.lnnumber} /></td>
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
                                            </div>
                                        </div>
                                        <div className="mt-2.5"><OpenLink ln={r.lnnumber} /></div>
                                    </div>
                                ))}
                            </div>
                            <Pager t={t} options={[10, 15, 25, 50]} />
                        </>
                    )}
                </Panel>
            </div>
        </AppLayout>
    );
}
