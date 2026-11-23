import Modal from '@/components/auth/modal';
import { Badge, Pager, Panel, SkelList, SkelRows, SortTh, btn, fdate, peso, useTable } from '@/components/tdfc/ui';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Banknote, CreditCard, Info, PiggyBank, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Tx = { kind: 'loan' | 'savings'; ref: string; description: string; date: string | null; amount: number; balance: number };
type Due = { lnnumber: string; description: string; date: string; amount: number };
type RecentRow = { lnnumber: string; description: string; date: string | null; principal: number; raw_balance: number };
type PageProps = { auth?: { user?: { name?: string; avatar?: string | null; role?: string | null } | null }; [key: string]: unknown };

const firstName = (n: string) => (n.includes(',') ? (n.split(',')[1]?.trim().split(' ')[0] ?? n) : (n.split(' ')[0] ?? n));
const cap = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

// ponytail: sample rule set from the mockup (repaid %); swap for the lender's real classification.
const CLASSES: [string, string, number][] = [['A', 'Prime', 75], ['B', 'Standard', 40], ['C', 'Watch', 0]];
const classTone: Record<string, string> = { A: 'bg-[oklch(.42_.12_155)]', B: 'bg-[oklch(.42_.13_262)]', C: 'bg-[oklch(.45_.12_55)]' };

const QUICK = [
    { label: 'Loan Apply', icon: Banknote, href: '/loans/calculator' },
    { label: 'Savings', icon: PiggyBank, soon: 'Savings goals' },
    { label: 'Cards', icon: CreditCard, soon: 'Card management' },
    { label: 'Beneficiaries', icon: UsersRound, soon: 'Beneficiary management' },
];

function Status({ loading, error, retry, empty, table }: { loading: boolean; error: string | null; retry: () => void; empty: string; table?: boolean }) {
    if (loading)
        return (
            <div role="status" aria-busy="true" aria-label="Loading transactions">
                {table ? (
                    <table className="w-full">
                        <tbody>
                            <SkelRows rows={5} cols={5} />
                        </tbody>
                    </table>
                ) : (
                    <SkelList />
                )}
            </div>
        );
    if (error)
        return (
            <div role="alert" className="px-4 py-10 text-center text-tdfc-error">
                <p className="mb-3 font-semibold">{error}</p>
                <button onClick={retry} className={`${btn.base} ${btn.coral}`}>Try Again</button>
            </div>
        );
    return <div className="px-4 py-10 text-center text-muted-foreground">{empty}</div>;
}

export default function Dashboard() {
    const user = usePage<PageProps>().props.auth?.user ?? null;
    const fullName = user?.name ?? 'Client';
    const role = (user?.role ?? 'client').toLowerCase();

    const [rows, setRows] = useState<RecentRow[]>([]);
    const [txs, setTxs] = useState<Tx[]>([]);
    const [dues, setDues] = useState<Due[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);
    const [soon, setSoon] = useState<string | null>(null);
    const [showClass, setShowClass] = useState(false);

    useEffect(() => {
        let alive = true;
        setLoading(true);
        setError(null);
        fetch('/api/transactions/recent', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
                return r.json();
            })
            .then((d) => alive && (setRows(Array.isArray(d?.items) ? d.items : []), setTxs(Array.isArray(d?.transactions) ? d.transactions : []), setDues(Array.isArray(d?.dues) ? d.dues : [])))
            .catch((e) => alive && (setError(e instanceof Error ? e.message : 'Failed to load transactions'), setRows([]), setTxs([]), setDues([])))
            .finally(() => alive && setLoading(false));
        return () => {
            alive = false;
        };
    }, [tick]);
    const retry = () => setTick((t) => t + 1);

    const s = useMemo(() => {
        const up = (r: RecentRow) => (r.lnnumber ?? '').toUpperCase();
        const loans = rows.filter((r) => up(r).startsWith('LN'));
        const active = loans.filter((r) => r.raw_balance > 0);
        const savings = rows.filter((r) => up(r).startsWith('SV')).reduce((a, r) => a + Number(r.principal ?? 0), 0);
        const out = active.reduce((a, r) => a + r.raw_balance, 0);
        const paid = loans.reduce((a, r) => a + r.principal - r.raw_balance, 0);
        const pct = paid + out ? (paid / (paid + out)) * 100 : 0;
        // next payment: first unpaid Amortsched installment across active loans (earliest first, from the API)
        const first = dues[0];
        const next = first && { desc: first.description, due: new Date(`${first.date}T00:00:00`), amt: first.amount };
        return { loans, active, savings, out, paid, pct, next, fullyPaid: loans.length - active.length };
    }, [rows, dues]);

    const cls = CLASSES.find((c) => s.pct >= c[2]) ?? CLASSES[2];
    const t = useTable(txs, { key: 'date' }, (r, k) => (k === 'amount' ? r.amount : k === 'balance' ? r.balance : String((r as never)[k] ?? '')));
    const savingsText = s.savings.toLocaleString('en-PH', { minimumFractionDigits: 2 });

    const ClassBtn = () =>
        s.loans.length ? (
            <button type="button" onClick={() => setShowClass(true)} aria-haspopup="dialog" aria-label="Borrower class: why this class?" className={`mt-2.5 inline-flex min-h-9 items-center gap-2 rounded-full pr-3 pl-3.5 text-[13px] font-bold text-white ${classTone[cls[0]]}`}>
                Class {cls[0]}
                <Info className="size-4.5" aria-hidden />
            </button>
        ) : null;

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <Head title="Dashboard" />
            <div id="main-content" className="p-4 md:p-6">
                {/* Mobile */}
                <section className="grid gap-4 md:hidden">
                    <div className="-mx-4 -mt-4 rounded-b-[32px] bg-tdfc-coral p-6 text-tdfc-on-coral">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-lg font-extrabold">Welcome,</p>
                                <h1 className="text-4xl leading-tight font-extrabold tracking-tight">{cap(firstName(fullName))}</h1>
                                <p className="mt-2.5 inline-block rounded-full bg-black/10 px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase">{role}</p>
                                <div><ClassBtn /></div>
                            </div>
                            <div className="grid size-14 place-items-center overflow-hidden rounded-full bg-white/55 text-[22px] font-extrabold ring-2 ring-white/70" role="img" aria-label={fullName}>
                                {user?.avatar ? <img src={user.avatar} alt="" className="size-full object-cover" /> : fullName.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <p className="mt-5 text-center text-xs font-bold tracking-widest uppercase opacity-80">Personal savings</p>
                        <p className="mt-1 text-center text-[42px] leading-tight">{loading ? <Skeleton className="mx-auto h-10 w-48 bg-black/10" /> : <>₱<b className="font-extrabold">{savingsText}</b></>}</p>
                        <hr className="my-4 h-px border-0 bg-black/20" />
                        <div className="grid grid-cols-2 gap-2 rounded-3xl bg-tdfc-sun p-3 text-center">
                            {QUICK.slice(0, 2).map((q) => {
                                const inner = (
                                    <>
                                        <span className="grid size-16 place-items-center rounded-2xl bg-tdfc-on-coral text-white"><q.icon className="size-8" /></span>
                                        {q.label}
                                    </>
                                );
                                const c = 'grid min-h-11 justify-items-center gap-2 rounded-2xl p-3.5 text-base font-bold hover:bg-white/35';
                                return q.href ? <Link key={q.label} href={q.href} className={c}>{inner}</Link> : <button key={q.label} type="button" onClick={() => setSoon(q.soon!)} className={c}>{inner}</button>;
                            })}
                        </div>
                    </div>
                    {s.next && (
                        <Panel className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5">
                            <div>
                                <small className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Next payment due</small>
                                <div className="text-[15px] font-bold">{fdate(s.next.due.toISOString().slice(0, 10))}</div>
                            </div>
                            <div className="text-right">
                                <b className="text-lg tabular-nums">{peso(s.next.amt)}</b>
                                <div className="text-xs text-muted-foreground">{s.next.desc}</div>
                            </div>
                        </Panel>
                    )}
                    <Panel className="rounded-2xl p-3">
                        <div className="mb-1 flex items-center justify-between">
                            <h2 className="text-[22px] font-semibold">Recent Transactions</h2>
                            <Link href="/loans/transactions" className="font-semibold text-tdfc-coral-ink hover:underline">View All</Link>
                        </div>
                        {txs.length ? (
                            <ul>
                                {txs.slice(0, 10).map((r, i) => (
                                    <li key={`${r.ref}-${r.date}-${i}`} className="flex items-start justify-between gap-4 border-b border-border px-3 py-3.5 last:border-0">
                                        <div>
                                            <div className="font-semibold">{r.description}</div>
                                            <time className="text-[13px] text-muted-foreground">{fdate(r.date)}</time>
                                        </div>
                                        <div className="text-right font-semibold">
                                            {r.amount < 0 ? '-' : '+'}{peso(Math.abs(r.amount))}
                                            <small className="block text-xs font-normal text-muted-foreground">Bal {peso(r.balance)}</small>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <Status loading={loading} error={error} retry={retry} empty="No transactions found." />
                        )}
                    </Panel>
                </section>

                {/* Desktop */}
                <section className="hidden gap-5 md:grid xl:grid-cols-12">
                    <div className="flex flex-wrap justify-between gap-8 rounded-[14px] bg-tdfc-coral p-7 text-tdfc-on-coral xl:col-span-8">
                        <div>
                            <p className="text-sm opacity-90">Welcome,</p>
                            <h4 className="mt-0.5 text-[22px] font-extrabold tracking-wide">{fullName.toUpperCase()}</h4>
                            <p className="text-sm opacity-90">{role}</p>
                            <ClassBtn />
                            <div className="mt-6 text-[42px] leading-none font-extrabold tabular-nums">{loading ? <Skeleton className="h-10 w-56 bg-black/10" /> : `₱${savingsText}`}</div>
                            <p className="mt-2 text-[13px] font-semibold uppercase">Personal Savings</p>
                        </div>
                        <div className="grid min-w-75 flex-1 content-center gap-6 border-l border-black/25 pl-8 sm:grid-cols-2">
                            {[
                                ['Loan repayment', s.paid, s.pct, `${s.pct.toFixed(0)}% of ${peso(s.paid + s.out)} borrowed`],
                                ['Outstanding balance', s.out, 100 - s.pct, `${(100 - s.pct).toFixed(0)}% left · ${s.active.length} active loans`],
                            ].map(([l, v, p, note]) => (
                                <div key={l as string}>
                                    <small className="font-bold opacity-85">{l}</small>
                                    <b className="mt-1 block text-2xl font-extrabold tabular-nums">{loading ? <Skeleton className="h-7 w-32 bg-black/10" /> : peso(v as number)}</b>
                                    <div className="mt-2.5 h-2 rounded-full bg-black/20"><i className="block h-full rounded-full bg-black/75" style={{ width: `${p}%` }} /></div>
                                    <div className="mt-1 text-xs font-bold">{note}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Panel className="p-5 xl:col-span-4">
                        <h2 className="mb-3.5 text-base font-semibold">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {QUICK.map((q) => {
                                const inner = (
                                    <>
                                        <span className="grid size-9 place-items-center rounded-lg bg-[color-mix(in_oklch,#3b82f6_18%,white)] text-[oklch(.35_.13_262)]"><q.icon className="size-4" /></span>
                                        {q.label}
                                    </>
                                );
                                const c = 'flex items-center gap-3 rounded-[10px] border border-border p-3 text-sm font-semibold hover:bg-muted';
                                return q.href ? <Link key={q.label} href={q.href} className={c}>{inner}</Link> : <button key={q.label} type="button" onClick={() => setSoon(q.soon!)} className={c}>{inner}</button>;
                            })}
                        </div>
                    </Panel>

                    <Panel className="p-5 xl:col-span-8">
                        <div className="mb-3.5 flex items-center justify-between">
                            <h2 className="text-base font-semibold">Recent Transactions</h2>
                            <Link href="/loans/transactions" className="text-sm font-semibold text-tdfc-coral-ink hover:underline">View All</Link>
                        </div>
                        <div className="overflow-hidden rounded-xl border border-border">
                            {txs.length ? (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="border-b border-border">
                                                    <SortTh t={t} k="date">Date</SortTh>
                                                    <SortTh t={t} k="description">Description</SortTh>
                                                    <SortTh t={t} k="ref">Account</SortTh>
                                                    <SortTh t={t} k="amount" right>Amount</SortTh>
                                                    <SortTh t={t} k="balance" right>Balance</SortTh>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {t.view.map((r, i) => (
                                                    <tr key={`${r.ref}-${r.date}-${i}`} className="border-b border-border last:border-0 even:bg-muted/40 hover:bg-muted">
                                                        <td className="px-4 py-3.5 text-muted-foreground">{fdate(r.date)}</td>
                                                        <td className="px-4 py-3.5 font-bold">{r.description}</td>
                                                        <td className="px-4 py-3.5 text-muted-foreground">{r.ref}</td>
                                                        <td className={`px-4 py-3.5 text-right font-bold tabular-nums ${r.amount < 0 ? '' : 'text-tdfc-ok-ink'}`}>{r.amount < 0 ? '-' : '+'}{peso(Math.abs(r.amount))}</td>
                                                        <td className="px-4 py-3.5 text-right font-bold tabular-nums">{peso(r.balance)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Pager t={t} options={[5, 10, 15, 20]} />
                                </>
                            ) : (
                                <Status loading={loading} error={error} retry={retry} empty="No transactions found" table />
                            )}
                        </div>
                    </Panel>

                    <Panel className="p-5 xl:col-span-4">
                        <h2 className="mb-3.5 text-base font-semibold">Payments</h2>
                        {s.next ? (
                            <div>
                                <small className="font-semibold text-muted-foreground">Next payment due</small>
                                <div className="mt-1 flex items-center justify-between gap-3">
                                    <b className="text-[28px] font-extrabold tabular-nums">{peso(s.next.amt)}</b>
                                    <Badge tone="info">{s.next.desc}</Badge>
                                </div>
                                <p className="mt-1 text-[13px] text-muted-foreground">Due <b>{fdate(s.next.due.toISOString().slice(0, 10))}</b>{s.next.due < new Date() ? ' · overdue' : ''}</p>
                                <Link href="/loans/transactions" className="mt-2.5 inline-block text-[13px] font-semibold text-tdfc-coral-ink hover:underline">View schedule</Link>
                            </div>
                        ) : (
                            <div className="py-6 text-center text-muted-foreground">No upcoming payments</div>
                        )}
                        <div className="mt-4">
                            <h4 className="mb-1.5 text-xs font-semibold text-muted-foreground uppercase">Active loans</h4>
                            {s.active.length ? (
                                s.active.map((l) => (
                                    <div key={l.lnnumber} className="border-b border-border py-2.5 last:border-0">
                                        <div className="flex justify-between gap-3 text-[13px]"><b className="font-semibold">{l.description}</b><span className="tabular-nums">{peso(l.raw_balance)}</span></div>
                                        <div className="mt-1.5 h-1.5 rounded-full bg-muted"><i className="block h-full rounded-full bg-tdfc-blue" style={{ width: `${Math.min(100, Math.round(((l.principal - l.raw_balance) / l.principal) * 100))}%` }} /></div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-3 text-center text-[13px] text-muted-foreground">No active loans</div>
                            )}
                        </div>
                    </Panel>
                </section>
            </div>

            <Modal open={showClass} onClose={() => setShowClass(false)} label="Borrower class">
                <div className="text-center">
                    <h3 className="text-lg font-semibold">Class {cls[0]} · {cls[1]} borrower</h3>
                    <p className="mt-1.5 text-muted-foreground">Your class is based on how much of your borrowed amount you have repaid.</p>
                    <ul className="mt-4 grid gap-2.5 text-left text-sm">
                        {[
                            `You have repaid ${s.pct.toFixed(0)}% of ${peso(s.paid + s.out)} borrowed across all loans.`,
                            `${s.fullyPaid} of ${s.loans.length} loans are fully paid; ${s.active.length} remain active.`,
                            `Class ${cls[0]} applies at ${cls[2] ? `${cls[2]}% repaid or more.` : `under ${CLASSES[1][2]}% repaid.`}`,
                        ].map((x) => (
                            <li key={x} className="flex gap-2.5"><i className="mt-2 size-2 flex-none rounded-full bg-tdfc-coral-ink" />{x}</li>
                        ))}
                    </ul>
                    <div className="mt-4 flex gap-1.5 text-left text-xs">
                        {CLASSES.map((c) => (
                            <div key={c[0]} className={`flex-1 rounded-[10px] border p-2 ${c === cls ? `${classTone[c[0]]} border-transparent text-white` : 'border-border text-muted-foreground'}`}>
                                <b>Class {c[0]}</b><br />{c[2] ? `${c[2]}%+ repaid` : `Below ${CLASSES[1][2]}%`}
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setShowClass(false)} className={`${btn.base} ${btn.dark} mt-5`}>Got it</button>
                </div>
            </Modal>
            <Modal open={!!soon} onClose={() => setSoon(null)} label="Coming soon">
                <div className="text-center">
                    <h3 className="text-lg font-semibold">Coming soon</h3>
                    <p className="mt-2 text-muted-foreground">{soon} will be available in a future release of the TDFC Companion App.</p>
                    <button onClick={() => setSoon(null)} className={`${btn.base} ${btn.dark} mt-5`}>OK</button>
                </div>
            </Modal>
        </AppLayout>
    );
}
