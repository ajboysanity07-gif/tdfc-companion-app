import { Panel, peso } from '@/components/tdfc/ui';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Product = {
    id: string;
    name: string;
    max_term_months: number;
    term_editable: boolean;
    max_amortization: number;
    amortization_editable: boolean;
    interest_rate: number;
    service_fee: number;
    lrf: number;
    document_stamp: number;
    mort_plus_notarial: number;
    terms: string | null;
};

const pesoS = (n: number) => peso(n).replace('₱', '₱ ');
const pct = (n: number) => `${n.toFixed(n % 1 ? 1 : 0)}%`;

/** Deductions, monthly payment and total repayable for one product, amount and term (months). */
export function estimate(p: Product, amount: number, months: number) {
    const term = Math.min(months, p.max_term_months);
    const sf = (p.service_fee / 100) * amount;
    const lrf = (p.lrf / 100) * amount;
    // ponytail: mockup convention — a document stamp above 100 is a flat peso amount, otherwise a % of the amount.
    const ds = p.document_stamp > 100 ? p.document_stamp : (p.document_stamp / 100) * amount;
    const ded = sf + lrf + ds + p.mort_plus_notarial;
    const i = p.interest_rate / 12 / 100;
    const monthly = term && amount ? (i === 0 ? amount / term : (amount * (i * (1 + i) ** term)) / ((1 + i) ** term - 1)) : 0;
    return { term, sf, lrf, ds, mn: p.mort_plus_notarial, ded, net: Math.max(0, amount - ded), monthly, total: monthly * term };
}

const inputCls = 'min-h-12 w-full rounded-lg border border-input bg-white px-3 py-2 text-center text-[22px] font-bold focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-tdfc-coral-ink disabled:cursor-not-allowed disabled:bg-muted max-sm:text-xl';
const lock = <span className="ml-1.5 inline-block rounded-full bg-muted px-2 py-0.5 align-[1px] text-[11px] font-bold tracking-wide uppercase">Set by admin</span>;

export default function LoanCalculator({ products }: { products: Product[] }) {
    const initial = (() => {
        const q = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('product');
        return products.find((p) => p.id === q) ?? products[0];
    })();
    const [p, setP] = useState<Product | undefined>(initial);
    const [months, setMonths] = useState(initial?.max_term_months ?? 0);
    const [amount, setAmount] = useState(initial?.max_amortization ?? 0);
    const [amountText, setAmountText] = useState(initial?.max_amortization ? pesoS(initial.max_amortization) : '');
    const [hint, setHint] = useState<{ term?: string; amount?: string }>({});
    const [dirty, setDirty] = useState(false);
    const [reset, setReset] = useState<string | null>(null);
    const [owed, setOwed] = useState<Record<string, number>>({});
    const [stuck, setStuck] = useState(false);
    const hero = useRef<HTMLElement>(null);

    // Existing balances per product (same source as the dashboard).
    useEffect(() => {
        fetch('/api/transactions/recent', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then((r) => (r.ok ? r.json() : { items: [] }))
            .then((d) => {
                const m: Record<string, number> = {};
                for (const r of d.items ?? []) if (String(r.lnnumber).toUpperCase().startsWith('LN') && r.raw_balance > 0) m[r.description] = (m[r.description] ?? 0) + r.raw_balance;
                setOwed(m);
            })
            .catch(() => undefined);
    }, []);

    // Sticky summary bar on small screens once the hero scrolls away.
    useEffect(() => {
        const el = hero.current;
        if (!el || !('IntersectionObserver' in window)) return;
        const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting && e.boundingClientRect.bottom < 0));
        io.observe(el);
        return () => io.disconnect();
    }, [p]);

    if (!p)
        return (
            <AppLayout breadcrumbs={[{ title: 'Loan Calculator', href: '/loans/calculator' }]}>
                <Head title="Loan Calculator" />
                <p className="p-6 text-muted-foreground">No loan products are available right now.</p>
            </AppLayout>
        );

    const choose = (n: Product) => {
        setReset(dirty && n !== p ? `Term and amount were reset to the ${n.name} defaults.` : null);
        setDirty(false);
        setP(n);
        setMonths(n.max_term_months);
        setAmount(n.max_amortization);
        setAmountText(n.max_amortization ? pesoS(n.max_amortization) : '');
        setHint({});
    };
    const e = estimate(p, amount, months);
    const owe = owed[p.name];
    const maxLabel = p.amortization_editable ? `Maximum ${pesoS(p.max_amortization)}.` : 'Fixed amount for this product.';
    const Kpi = ({ label, value, sub }: { label: string; value: string; sub: string }) => (
        <div className="grid min-w-0 content-center rounded-xl bg-white px-4 py-3.5 max-md:p-3">
            <small className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">{label}</small>
            <b className="mt-0.5 text-[clamp(17px,5.2vw,22px)] tabular-nums [overflow-wrap:anywhere]">{value}</b>
            <span className="mt-0.5 min-h-4.5 text-xs text-muted-foreground">{sub}</span>
        </div>
    );
    const rows: [string, string, boolean?][] = [
        ['Amortization amount', pesoS(amount)],
        ['Service fee', `− ${pesoS(e.sf)}`],
        ['LRF', `− ${pesoS(e.lrf)}`],
        ['Document stamp', `− ${pesoS(e.ds)}`],
        ['Mortgage + notarial', `− ${pesoS(e.mn)}`],
        ['Total deductions', `− ${pesoS(e.ded)}`, true],
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Loan Calculator', href: '/loans/calculator' }]}>
            <Head title="Loan Calculator" />
            <div id="main-content" className="grid min-w-0 content-start gap-3.5 p-4 md:gap-5 md:p-6">
                <Link href="/dashboard" className="inline-flex min-h-10 items-center gap-1.5 justify-self-start text-sm font-semibold text-tdfc-coral-ink hover:underline">
                    <ChevronLeft className="size-4" />
                    Back to dashboard
                </Link>
                <div>
                    <h1 className="text-[22px] font-extrabold md:text-2xl">Loan Calculator</h1>
                    <p className="mt-1 text-[13px] text-muted-foreground md:text-sm">Estimate a loan before you apply. Pick a product, then adjust the term and amount.</p>
                </div>

                <Panel className="border-transparent bg-tdfc-coral p-5 text-tdfc-on-coral md:p-6">
                    <section ref={hero} aria-label="Estimate" className="grid gap-2.5 md:grid-cols-[1.5fr_1fr_1fr] md:gap-4 max-md:grid-cols-2 max-[400px]:grid-cols-1">
                        <div className="grid content-center gap-1.5 max-md:col-span-full">
                            <h2 className="text-xs font-bold tracking-widest uppercase">*Estimated net proceeds</h2>
                            <div className="text-[clamp(32px,11vw,44px)] leading-[1.05] font-extrabold tracking-tight tabular-nums md:text-5xl">
                                {pesoS(e.net)}
                                <small className="mt-1.5 block text-xs font-semibold tracking-normal opacity-85 md:text-[13px]">
                                    {amount ? `After ${pesoS(e.ded)} in deductions from ${pesoS(amount)}` : 'Enter an amortization to see your estimate'}
                                </small>
                            </div>
                        </div>
                        <Kpi label="*Monthly payment" value={pesoS(e.monthly)} sub={e.term ? `${pct(p.interest_rate)} a year over ${e.term} months` : 'Enter a term'} />
                        <Kpi label="Total repayable" value={pesoS(e.total)} sub={e.total ? `${pesoS(Math.max(0, e.total - amount))} total interest` : ''} />
                    </section>
                </Panel>

                <Panel className="grid gap-x-5 gap-y-4 p-5 max-md:p-4 md:grid-cols-2">
                    <div className="col-span-full">
                        <span id="chipsL" className="mb-2 block text-[11px] font-semibold tracking-widest uppercase">Loan product</span>
                        <div role="radiogroup" aria-labelledby="chipsL" className="flex flex-wrap gap-2 max-md:-mx-4 max-md:flex-nowrap max-md:overflow-x-auto max-md:px-4 max-md:pb-1.5 [&::-webkit-scrollbar]:hidden">
                            {products.map((n) => (
                                <button
                                    key={n.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={n === p}
                                    tabIndex={n === p ? 0 : -1}
                                    onClick={() => choose(n)}
                                    onKeyDown={(ev) => {
                                        if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
                                        ev.preventDefault();
                                        const i = products.indexOf(p) + (ev.key === 'ArrowRight' ? 1 : products.length - 1);
                                        choose(products[i % products.length]);
                                    }}
                                    className={`min-h-11 flex-none rounded-full border px-4 text-sm font-semibold transition-colors ${n === p ? 'border-tdfc-on-coral bg-tdfc-on-coral text-white hover:bg-[oklch(.28_.05_24)]' : 'border-border bg-card hover:bg-muted'}`}
                                >
                                    {n.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    {reset && <p role="status" className="animate-tdfc-msg col-span-full rounded-lg bg-[color-mix(in_oklch,#f57979_14%,white)] px-3 py-2.5 text-[13px]">{reset}</p>}

                    <div>
                        <label htmlFor="cTerm" className="mb-2 block text-[11px] font-semibold tracking-widest uppercase">Term in months{!p.term_editable && lock}</label>
                        <input
                            id="cTerm"
                            inputMode="numeric"
                            autoComplete="off"
                            placeholder="0"
                            disabled={!p.term_editable}
                            value={months || ''}
                            onChange={(ev) => {
                                let v = parseInt(ev.target.value.replace(/\D/g, '')) || 0;
                                setHint({ ...hint, term: v > p.max_term_months ? `Capped at the maximum of ${p.max_term_months} months.` : undefined });
                                v = Math.min(v, p.max_term_months);
                                setMonths(v);
                                setDirty(true);
                                setReset(null);
                            }}
                            className={inputCls}
                        />
                        <p className="mt-1.5 text-center text-xs text-muted-foreground">{hint.term ?? (p.term_editable ? `Up to ${p.max_term_months} months.` : `Fixed at ${p.max_term_months} months for this product.`)}</p>
                    </div>
                    <div>
                        <label htmlFor="cAmort" className="mb-2 block text-[11px] font-semibold tracking-widest uppercase">Amortization{!p.amortization_editable && lock}</label>
                        <input
                            id="cAmort"
                            inputMode="decimal"
                            autoComplete="off"
                            placeholder="₱ 0.00"
                            disabled={!p.amortization_editable}
                            value={amountText}
                            onChange={(ev) => {
                                let t = ev.target.value.replace(/[^\d.]/g, '');
                                const [int, ...dec] = t.split('.');
                                t = dec.length ? `${int}.${dec.join('').slice(0, 2)}` : int;
                                let v = parseFloat(t) || 0;
                                const max = p.max_amortization;
                                if (max && v > max) {
                                    v = max;
                                    t = String(max);
                                    setHint({ ...hint, amount: `Capped at the maximum of ${pesoS(max)}.` });
                                } else setHint({ ...hint, amount: undefined });
                                setAmount(v);
                                setAmountText(t ? `₱ ${t}` : '');
                                setDirty(true);
                                setReset(null);
                            }}
                            onBlur={() => {
                                setAmountText(amount ? pesoS(amount) : '');
                                setHint({ ...hint, amount: undefined });
                            }}
                            className={inputCls}
                        />
                        <p className="mt-1.5 text-center text-xs text-muted-foreground">{hint.amount ?? maxLabel}</p>
                    </div>
                </Panel>

                <div className="grid items-stretch gap-3.5 md:grid-cols-2 md:gap-5">
                    <Panel className="grid content-start gap-3 p-5 max-md:p-4">
                        <h2 className="text-base font-semibold">{p.name}</h2>
                        <dl>
                            {rows.map(([l, v, tot]) => (
                                <div key={l} className="flex justify-between gap-3 border-b border-border py-2.25 text-sm last:border-0">
                                    <dt className={tot ? 'font-extrabold' : 'text-muted-foreground'}>{l}</dt>
                                    <dd className={`min-w-0 tabular-nums ${tot ? 'font-extrabold' : 'font-semibold'}`}>{v}</dd>
                                </div>
                            ))}
                        </dl>
                    </Panel>
                    <Panel className="grid content-start gap-3 p-5 max-md:p-4">
                        <h2 className="text-base font-semibold">Good to know</h2>
                        {owe && (
                            <p className="animate-tdfc-rise rounded-[10px] bg-muted px-3.5 py-3 text-sm">
                                You still owe <b className="tabular-nums">{pesoS(owe)}</b> on your current {p.name}. Shown for reference; it is not deducted in this estimate.
                            </p>
                        )}
                        <p className="text-xs leading-[1.7] text-muted-foreground italic">* Subject to further delinquent balances deduction. Estimated values may vary based on actual processing.</p>
                        <Link href="/loans/transactions" className="inline-flex min-h-11 items-center justify-self-start text-sm font-bold text-tdfc-coral-ink underline underline-offset-3 hover:rounded-md hover:bg-tdfc-coral-soft">
                            View my loan schedules and payments
                        </Link>
                    </Panel>
                </div>

                <Panel className="px-5 max-md:px-4">
                    <details>
                        <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-tdfc-coral-ink">Terms and conditions</summary>
                        <ol className="mb-4 list-decimal pl-5 text-[13px] leading-[1.7] text-muted-foreground">
                            {(p.terms || 'No terms and conditions available.').split('\n').map((l) => (
                                <li key={l}>{l.replace(/^\d+\.\s*/, '')}</li>
                            ))}
                        </ol>
                    </details>
                </Panel>
                <p className="sr-only" role="status" aria-live="polite">Net proceeds {pesoS(e.net)}. Monthly payment {pesoS(e.monthly)}.</p>
            </div>

            <div aria-hidden className={`fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-3 bg-tdfc-coral px-4 pt-[calc(8px+env(safe-area-inset-top))] pb-2 text-tdfc-on-coral shadow-md transition-transform md:hidden ${stuck ? '' : '-translate-y-[110%]'}`}>
                <div><small className="block text-[10px] font-bold tracking-wider uppercase">Net proceeds*</small><b className="text-[clamp(16px,5vw,20px)] tabular-nums">{pesoS(e.net)}</b></div>
                <div className="text-right"><small className="block text-[10px] font-bold tracking-wider uppercase">Monthly*</small><b className="text-[clamp(14px,4.2vw,16px)] tabular-nums">{pesoS(e.monthly)}</b></div>
            </div>
        </AppLayout>
    );
}
