import { Pager, Panel, SortTh, fdate, peso, useTable } from '@/components/tdfc/ui';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';

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

const amt = (n: number) => (n > 0 ? peso(n) : '—');

export default function SavingsTransactionPage({ transactions }: { transactions: Transaction[] }) {
    const base = usePage<{ base?: string }>().props.base ?? '';
    const t = useTable(transactions, { key: 'date', per: 15 }, (r, k) => (k === 'balance' ? r.raw_balance : (((r as unknown) as Record<string, string | number>)[k] ?? '')));

    return (
        <AppLayout
            breadcrumbs={[
                ...(base ? [{ title: 'Dashboard', href: `${base}/dashboard` }] : []),
                { title: 'Savings', href: `${base}/savings` },
            ]}
        >
            <Head title="Savings" />
            <div className="grid content-start gap-5 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-extrabold">Savings</h1>
                    <p className="mt-1 text-muted-foreground">View your savings deposits and withdrawals</p>
                </div>
                <Panel className="overflow-hidden">
                    {transactions.length === 0 ? (
                        <div className="px-4 py-12 text-center text-muted-foreground">No savings transactions found</div>
                    ) : (
                        <>
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <SortTh t={t} k="date">Date</SortTh>
                                            <SortTh t={t} k="svnumber">Savings Number</SortTh>
                                            <SortTh t={t} k="description">Description</SortTh>
                                            <SortTh t={t} k="reference">Reference</SortTh>
                                            <SortTh t={t} k="deposit" right>Deposit</SortTh>
                                            <SortTh t={t} k="withdrawal" right>Withdrawal</SortTh>
                                            <SortTh t={t} k="balance" right>Balance</SortTh>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {t.view.map((r) => (
                                            <tr key={r.key} className="border-b border-border last:border-0 even:bg-muted/40 hover:bg-muted">
                                                <td className="px-4 py-3.5 text-muted-foreground">{fdate(r.date)}</td>
                                                <td className="px-4 py-3.5 font-medium">{r.svnumber}</td>
                                                <td className="px-4 py-3.5 font-bold">{r.description}</td>
                                                <td className="px-4 py-3.5 text-muted-foreground">{r.reference}</td>
                                                <td className="px-4 py-3.5 text-right font-bold tabular-nums">{amt(r.deposit)}</td>
                                                <td className="px-4 py-3.5 text-right font-bold tabular-nums">{amt(r.withdrawal)}</td>
                                                <td className="px-4 py-3.5 text-right font-bold tabular-nums">{peso(r.raw_balance)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="md:hidden">
                                {t.view.map((r) => (
                                    <div key={r.key} className="border-b border-border px-4 py-3.5 last:border-0">
                                        <div className="flex justify-between gap-3">
                                            <div>
                                                <b>{r.description}</b>
                                                <div className="text-[13px] text-muted-foreground">
                                                    {r.svnumber} · {fdate(r.date)}
                                                </div>
                                                {r.reference && <div className="text-xs text-muted-foreground">{r.reference}</div>}
                                            </div>
                                            <div className="text-right">
                                                <b>{r.deposit > 0 ? `+${peso(r.deposit)}` : `-${peso(r.withdrawal)}`}</b>
                                                <div className="text-xs text-muted-foreground">Bal {peso(r.raw_balance)}</div>
                                            </div>
                                        </div>
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
