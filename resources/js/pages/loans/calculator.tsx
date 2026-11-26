import { Panel, peso, UnitSwitch } from '@/components/tdfc/ui';
import AppLayout from '@/layouts/app-layout';
import { computeLoan, firstDeduction, inUnit, type LoanMode, type LoanProduct, PERIOD_DAYS, snapTerm, type TermUnit, toDays } from '@/lib/loan';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, TriangleAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Product = LoanProduct & {
    id: string;
    name: string;
    tags: string[];
    max_term_days: number;
    term_editable: boolean;
    max_amortization: number; // the admin's cap on the payment per period; 0 means none is set
    amortization_editable: boolean;
    terms: string | null;
};

// Each mode's starting unit and its term shortcuts (in days).
const TERM: Record<LoanMode, { unit: TermUnit; chips: number[]; every: string }> = {
    MONTHLY: { unit: 'month', chips: [180, 360, 540, 720, 1080], every: 'monthly' },
    'SEMI-ANNUAL': { unit: 'month', chips: [180, 360, 540, 720, 1080], every: 'semi-annual' },
    'DUE-DATE': { unit: 'day', chips: [30, 60, 90, 180, 360], every: 'due date' },
};
/** The longest term in days, with whole periods inside the product's maximum. */
const maxTerm = (p: Product) => snapTerm(p.max_term_days, p.mode);
const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`;

const pesoS = (n: number) => peso(n).replace('₱', '₱ ');
const pct = (n: number) => `${n.toFixed(n % 1 ? 1 : 0)}%`;
const nf0 = new Intl.NumberFormat('en-PH', { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtAm = (v: number) => (v ? (v % 1 ? nf2 : nf0).format(v) : '');

const inputCls =
    'h-11 w-full rounded-[10px] border border-input bg-background px-3 text-base text-foreground shadow-xs focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-red-text disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-100 disabled:[-webkit-text-fill-color:var(--foreground)]';
const rangeCls =
    'mt-0.5 h-5 w-full cursor-pointer rounded-full accent-red-text focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-red-text disabled:cursor-not-allowed disabled:opacity-45';
const lock = (
    <span className="ml-1.5 inline-block rounded-full bg-muted px-2 py-0.5 align-[1px] text-[11px] font-bold tracking-wide uppercase max-[560px]:mt-0.5 max-[560px]:ml-0 max-[560px]:block max-[560px]:w-max">
        Set by admin
    </span>
);
const pill = (on: boolean) =>
    `rounded-full border transition-colors ${
        on
            ? 'border-[oklch(.2_.05_24)] bg-[oklch(.2_.05_24)] text-white hover:bg-[oklch(.28_.05_24)] dark:border-[oklch(.24_.07_24)] dark:bg-[oklch(.24_.07_24)] dark:hover:bg-[oklch(.3_.08_24)]'
            : 'border-border bg-transparent hover:bg-muted'
    }`;
// Cards that sit on the red panel are always white (the guide's one intentional fixed-color exception).
const wcard = 'rounded-[14px] bg-white text-[oklch(.2_0_0)]';
const wsub = 'text-[oklch(.45_0_0)]';

export default function LoanCalculator({ products }: { products: Product[] }) {
    const initial = (() => {
        const q = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('product');
        return products.find((p) => p.id === q) ?? products[0];
    })();
    const [p, setP] = useState<Product | undefined>(initial);
    const [typedDays, setTypedDays] = useState(initial ? maxTerm(initial) : 0);
    const [termText, setTermText] = useState<string | null>(null); // what is being typed, so "1." survives
    const [pickedUnit, setPickedUnit] = useState<TermUnit | null>(null); // null follows the mode
    const [today] = useState(() => new Date());
    const [amount, setAmount] = useState(initial?.max_amortization ?? 0);
    const [amountText, setAmountText] = useState(fmtAm(initial?.max_amortization ?? 0));
    const [hint, setHint] = useState<{ term?: string; amount?: string }>({});
    const [dirty, setDirty] = useState(false);
    const [reset, setReset] = useState<string | null>(null);
    const [owed, setOwed] = useState<Record<string, number>>({});
    const [stuck, setStuck] = useState(false);
    const resultsRef = useRef<HTMLElement>(null);

    // Existing balances per product (same source as the dashboard).
    useEffect(() => {
        fetch('/api/transactions/recent', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then((r) => (r.ok ? r.json() : { items: [] }))
            .then((d) => {
                const m: Record<string, number> = {};
                for (const r of d.items ?? [])
                    if (String(r.lnnumber).toUpperCase().startsWith('LN') && r.raw_balance > 0) {
                        const k = String(r.description).trim().toUpperCase();
                        m[k] = (m[k] ?? 0) + r.raw_balance;
                    }
                setOwed(m);
            })
            .catch(() => undefined);
    }, []);

    // Mobile summary bar: show once the results panel has scrolled above the viewport.
    useEffect(() => {
        const el = resultsRef.current;
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
        setReset(dirty && n !== p ? `Term and amortization were reset to the ${n.name} defaults.` : null);
        setDirty(false);
        setP(n);
        setTypedDays(maxTerm(n));
        setTermText(null);
        setAmount(n.max_amortization);
        setAmountText(fmtAm(n.max_amortization));
        setHint({});
    };
    const touch = () => {
        setDirty(true);
        setReset(null);
    };
    const setTerm = (v: number) => {
        setTypedDays(v);
        setTermText(null);
        touch();
    };

    const oldLoans = [...new Set(p.tags.map((t) => t.trim().toUpperCase()))]
        .map((name) => ({ name, balance: owed[name] ?? 0 }))
        .filter((l) => l.balance > 0);
    const cfg = TERM[p.mode];
    const longest = maxTerm(p);
    const days = snapTerm(typedDays, p.mode);
    const unit = pickedUnit ?? cfg.unit;
    const shown = (d: number) => plural(inUnit(d, unit), unit);
    const step = PERIOD_DAYS[p.mode];
    // only a due-date term can be part of a month
    const decimals = unit === 'month' && p.mode === 'DUE-DATE';
    const old = oldLoans.reduce((s, l) => s + l.balance, 0);
    const e = computeLoan(p, amount, days, today.getDate(), old);
    const dedAll = e.deductions + e.old;
    const prepaid = p.scheme === 'PREPAID';
    // Blocked: even the product's maximum can't pay off the old balances plus fees. A max of 0 means none is set.
    const best = computeLoan(p, p.max_amortization, days, today.getDate(), old);
    const blocked = old > 0 && days > 0 && p.max_amortization > 0 && best.net === 0;
    const payFirst = Math.round((best.old + best.deductions - best.principal) * 100) / 100 + 0.01;
    const owedOn = oldLoans.map((l) => l.name).join(' and ');
    const netText = blocked ? 'Not available' : pesoS(e.net);
    const netNote = blocked
        ? 'Settle your old balance first'
        : !days
          ? 'Enter a term'
          : !amount
            ? p.max_amortization
                ? 'Enter an amount'
                : 'No maximum amortization is set for this loan'
            : dedAll >= e.principal
              ? 'Deductions are as large as the loan amount'
              : `After ${pesoS(dedAll)} in deductions`;
    const termLocked = !p.term_editable;
    // The member may only lower the amount, and only when the admin allows it.
    const canEdit = p.amortization_editable && p.max_amortization > 0;
    const termChips = [...new Set([...cfg.chips.filter((d) => d <= longest), longest])].filter(Boolean).sort((a, b) => a - b);
    const asOf = today.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });
    const startsIn = firstDeduction(today, p.cutoff_day).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });
    const schedule = !days
        ? 'a year'
        : p.mode === 'DUE-DATE'
          ? `a year · due in ${shown(days)}`
          : `a year · ${plural(e.periods, `${cfg.every} payment`)} of ${pesoS(amount)}`;
    const maxLabel = !p.max_amortization
        ? 'No maximum amortization is set for this loan.'
        : canEdit
          ? `Maximum ${pesoS(p.max_amortization)}.`
          : 'Fixed amount for this product.';
    const all = Math.max(1, e.net + e.charges + e.old + e.interest);
    const seg = (n: number) => ({ width: `${(n / all) * 100}%` });
    const less = (label: string, v: number): [string, string] => [label, `− ${pesoS(v)}`];
    const rows: [string, string][] = [
        ['Loan amount (principal)', pesoS(e.principal)],
        ...(prepaid ? [less('Interest (deducted in advance)', e.interest)] : []),
        less('Service fee', e.sf),
        less('LRF', e.lrf),
        less('Document stamp', e.ds),
        ...(e.mn ? [less('Mortuary + notarial', e.mn)] : []),
        ...e.custom.map((c) => less(c.label, c.fee)),
        ...(e.cutoffInterest ? [less('Cut-off interest', e.cutoffInterest)] : []),
        ...(e.cutoffLrf ? [less('Cut-off LRF', e.cutoffLrf)] : []),
        ...oldLoans.map((l) => less(`Balance: ${l.name}`, l.balance)),
    ];
    const recv = 'bg-white dark:bg-brand-ink';
    const fees = 'bg-[oklch(.2_.05_24)] dark:bg-white';
    const segCls = 'block h-full transition-[width] duration-300 motion-reduce:transition-none';

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Loan Calculator', href: '/loans/calculator' },
            ]}
        >
            <Head title="Loan Calculator" />
            <div id="main-content" className="grid min-w-0 content-start gap-3.5 p-4 max-[900px]:pb-[88px] min-[901px]:gap-5 min-[901px]:p-6">
                <Link
                    href="/dashboard"
                    className="inline-flex min-h-10 items-center gap-1.5 justify-self-start text-sm font-semibold text-red-text hover:underline min-[901px]:min-h-11"
                >
                    <ChevronLeft className="size-4" />
                    Back to dashboard
                </Link>
                <div>
                    <h1 className="text-[22px] font-extrabold min-[901px]:text-2xl">Loan Calculator</h1>
                    <p className="mt-1 text-[13px] text-muted-foreground min-[901px]:text-sm">
                        Estimate a loan before you apply. Pick a product, then adjust the term and amortization.
                    </p>
                </div>

                <div
                    role="radiogroup"
                    aria-label="Loan product"
                    className="-mx-4 flex gap-2 overflow-x-auto px-4 pt-0.5 pb-1.5 [scrollbar-width:none] min-[901px]:mx-0 min-[901px]:flex-wrap min-[901px]:overflow-visible min-[901px]:px-0 [&::-webkit-scrollbar]:hidden"
                >
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
                            className={`min-h-11 flex-none px-4 text-sm font-semibold ${pill(n === p)}`}
                        >
                            {n.name}
                        </button>
                    ))}
                </div>

                <div className="grid items-start gap-3.5 min-[901px]:grid-cols-[5fr_6fr] min-[901px]:gap-5">
                    <div className="grid min-w-0 content-start gap-3.5 min-[901px]:gap-5">
                        <Panel className="grid gap-3 p-4 min-[901px]:gap-3.5 min-[901px]:p-5">
                            <h2 className="text-base font-semibold">{p.name}</h2>
                            {reset && (
                                <p role="status" className="animate-tdfc-msg rounded-lg bg-red-soft px-3 py-2.5 text-[13px]">
                                    {reset}
                                </p>
                            )}
                            <div className="grid gap-3.5 min-[901px]:gap-4 [&>*]:min-w-0">
                                <div className="grid gap-1.5">
                                    <div className="flex items-center justify-between gap-3">
                                        <label htmlFor="cTerm" className="flex items-center text-sm font-medium max-[560px]:block">
                                            Term in {unit}s{termLocked && lock}
                                        </label>
                                        <UnitSwitch
                                            value={unit}
                                            onChange={(u) => {
                                                setPickedUnit(u);
                                                setTermText(null);
                                                setHint({ ...hint, term: undefined });
                                            }}
                                        />
                                    </div>
                                    {!termLocked && (
                                        <div role="group" aria-label="Term shortcuts" className="flex flex-wrap gap-1.5">
                                            {termChips.map((v) => (
                                                <button
                                                    key={v}
                                                    type="button"
                                                    aria-pressed={v === days}
                                                    onClick={() => {
                                                        setHint({ ...hint, term: undefined });
                                                        setTerm(v);
                                                    }}
                                                    className={`min-h-9 px-3.5 text-[13px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-text ${pill(v === days)}`}
                                                >
                                                    {inUnit(v, unit)} {unit === 'day' ? 'days' : 'mo'}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <input
                                        id="cTerm"
                                        inputMode={decimals ? 'decimal' : 'numeric'}
                                        autoComplete="off"
                                        placeholder="0"
                                        disabled={termLocked}
                                        value={termText ?? (typedDays ? inUnit(typedDays, unit) : '')}
                                        onChange={(ev) => {
                                            const t = ev.target.value.replace(decimals ? /[^\d.]/g : /\D/g, '');
                                            if (t.indexOf('.') !== t.lastIndexOf('.')) return;
                                            const v = toDays(parseFloat(t) || 0, unit);
                                            setHint({
                                                ...hint,
                                                term: v > longest ? `Capped at the maximum of ${shown(longest)}.` : undefined,
                                            });
                                            setTerm(Math.min(v, longest));
                                            if (v <= longest) setTermText(t);
                                        }}
                                        onBlur={() => {
                                            setTypedDays(days);
                                            setTermText(null);
                                        }}
                                        className={inputCls}
                                    />
                                    <input
                                        type="range"
                                        aria-label={`Term in ${unit}s slider`}
                                        aria-valuetext={shown(days)}
                                        min={step}
                                        max={longest}
                                        step={step}
                                        value={days}
                                        disabled={termLocked}
                                        onChange={(ev) => {
                                            setHint({ ...hint, term: undefined });
                                            setTerm(+ev.target.value);
                                        }}
                                        className={rangeCls}
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                                        <span>{shown(step)}</span>
                                        <span>{shown(longest)}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {hint.term ??
                                            (!longest
                                                ? 'No term is set for this product.'
                                                : !p.term_editable
                                                  ? `Fixed at ${shown(longest)} for this product.`
                                                  : `Up to ${shown(longest)}${inUnit(step, unit) > 1 ? `, in steps of ${inUnit(step, unit)}` : ''}.`)}
                                    </p>
                                </div>
                                <div className="grid gap-1.5">
                                    <label htmlFor="cAmort" className="flex items-center text-sm font-medium max-[560px]:block">
                                        Max amortization
                                        {!p.amortization_editable && lock}
                                    </label>
                                    <div className="relative">
                                        <span
                                            aria-hidden
                                            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-2xl font-extrabold text-muted-foreground"
                                        >
                                            ₱
                                        </span>
                                        <input
                                            id="cAmort"
                                            inputMode="decimal"
                                            autoComplete="off"
                                            placeholder="0.00"
                                            disabled={!canEdit}
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
                                                const [ip, dp] = t.split('.');
                                                setAmount(v);
                                                setAmountText((ip ? nf0.format(+ip) : '') + (dp !== undefined ? `.${dp}` : ''));
                                                touch();
                                            }}
                                            onBlur={() => {
                                                setAmountText(amount ? nf2.format(amount) : '');
                                                setHint({ ...hint, amount: undefined });
                                            }}
                                            className={`${inputCls} h-14 pl-10 text-[22px] font-extrabold tabular-nums min-[561px]:text-[26px]`}
                                        />
                                    </div>
                                    <input
                                        type="range"
                                        aria-label="Max amortization slider"
                                        min={0}
                                        max={p.max_amortization}
                                        step={100}
                                        value={amount}
                                        disabled={!canEdit}
                                        onChange={(ev) => {
                                            const v = +ev.target.value;
                                            setHint({ ...hint, amount: undefined });
                                            setAmount(v);
                                            setAmountText(fmtAm(v));
                                            touch();
                                        }}
                                        className={rangeCls}
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                                        <span>₱ 0</span>
                                        <span>₱ {nf0.format(p.max_amortization)}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{hint.amount ?? maxLabel}</p>
                                </div>
                            </div>
                        </Panel>

                        {e.old > 0 && (
                            <p
                                role="status"
                                className={`flex animate-tdfc-rise items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] leading-normal ${
                                    blocked
                                        ? 'border-red-text bg-red-soft text-red-text'
                                        : 'border-[oklch(.85_.1_85)] bg-[oklch(.95_.08_90)] text-[oklch(.3_.07_70)]'
                                }`}
                            >
                                <TriangleAlert className="mt-px size-[18px] flex-none" aria-hidden />
                                {blocked ? (
                                    <span>
                                        <b>You can't avail this loan yet.</b> You still owe <b className="tabular-nums">{pesoS(e.old)}</b> on {owedOn}
                                        , more than this loan can cover. Pay at least <b className="tabular-nums">{pesoS(payFirst)}</b>, or close the
                                        balance, to qualify.
                                    </span>
                                ) : days > 0 && e.net === 0 ? (
                                    <span>
                                        This amount doesn't cover your <b className="tabular-nums">{pesoS(e.old)}</b> balance on {owedOn} plus fees.
                                        Enter a higher amount.
                                    </span>
                                ) : (
                                    <span>
                                        You still owe <b className="tabular-nums">{pesoS(e.old)}</b> on {owedOn}. This balance is deducted from your
                                        net proceeds.
                                    </span>
                                )}
                            </p>
                        )}

                        <Panel className="grid gap-3 p-4 min-[901px]:p-5">
                            <h2 className="text-base font-semibold">Terms and conditions</h2>
                            <ol className="list-decimal pl-5 text-[13px] leading-[1.7] text-muted-foreground">
                                {(p.terms || 'No terms and conditions available.').split('\n').map((l) => (
                                    <li key={l}>{l.replace(/^\d+\.\s*/, '')}</li>
                                ))}
                            </ol>
                        </Panel>
                    </div>

                    <div className="min-w-0 min-[901px]:sticky min-[901px]:top-6">
                        <section
                            ref={resultsRef}
                            aria-label="Estimate"
                            className="grid gap-3.5 rounded-2xl bg-brand-surface p-5 text-on-brand-surface shadow-sm min-[901px]:rounded-[14px] min-[901px]:p-6 [&_:focus-visible]:outline-on-brand-surface"
                        >
                            <p className="text-xs font-bold tracking-widest uppercase">*Estimated net proceeds</p>
                            <div className="flex flex-wrap items-baseline gap-x-2.5 font-extrabold tabular-nums">
                                <span className="text-[clamp(32px,11vw,40px)] leading-[1.05] min-[901px]:text-[52px]">{netText}</span>
                                <small className="text-[15px] font-semibold">{netNote}</small>
                            </div>
                            <div className="flex flex-wrap items-baseline justify-between gap-3 border-y border-current/20 py-3">
                                <div>
                                    <small className="block text-[11px] font-bold tracking-wider uppercase">*Loan amount (principal)</small>
                                    <b className="text-[28px] font-extrabold tabular-nums">{pesoS(e.principal)}</b>
                                </div>
                                <span className="text-[13px] font-medium">
                                    Computed as of {asOf}
                                    {p.mode === 'MONTHLY' && <span className="block">First deduction: {startsIn}</span>}
                                </span>
                            </div>
                            <div className="grid gap-2">
                                <div
                                    role="img"
                                    aria-label="Breakdown of the loan and its interest"
                                    className="flex h-3.5 overflow-hidden rounded-full bg-white/30"
                                >
                                    <i className={`${segCls} ${recv}`} style={seg(e.net)} />
                                    <i className={`${segCls} ${fees}`} style={seg(e.charges)} />
                                    <i className={`${segCls} bg-[oklch(.55_.06_24)]`} style={seg(e.old)} />
                                    <i className={`${segCls} bg-brand-yellow`} style={seg(e.interest)} />
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium">
                                    {(
                                        [
                                            [recv, 'You receive', e.net],
                                            [fees, 'Fees', e.charges],
                                            ['bg-[oklch(.55_.06_24)]', 'Old loans', e.old],
                                            ['bg-brand-yellow', 'Interest', e.interest],
                                        ] as const
                                    )
                                        .filter(([, l, v]) => l !== 'Old loans' || v > 0)
                                        .map(([c, l, v]) => (
                                            <span key={l} className="inline-flex items-center gap-1.5">
                                                <i className={`size-2.5 flex-none rounded-full shadow-[0_0_0_1px_oklch(.2_.05_24/.35)] ${c}`} />
                                                {l} <b className="tabular-nums">{pesoS(v)}</b>
                                            </span>
                                        ))}
                                </div>
                            </div>
                            <details className={`group px-3.5 ${wcard}`}>
                                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
                                    <span className="inline-flex items-center">
                                        See deductions
                                        <i className="mb-1 ml-2.5 inline-block size-[7px] rotate-45 border-r-2 border-b-2 border-current transition-transform group-open:mb-0 group-open:-rotate-[135deg] motion-reduce:transition-none" />
                                    </span>
                                    <b className="tabular-nums">− {pesoS(dedAll)}</b>
                                </summary>
                                <dl aria-label="Deductions" className="border-t border-[oklch(.9_0_0)] pb-1">
                                    {rows.map(([l, v], i) => (
                                        <div
                                            key={i} // custom fee names can repeat
                                            className="flex justify-between gap-3 border-b border-[oklch(.9_0_0)] py-2.25 text-sm last:border-0"
                                        >
                                            <dt className={wsub}>{l}</dt>
                                            <dd className="min-w-0 font-semibold tabular-nums">{v}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </details>
                            <div className="grid gap-3 min-[561px]:grid-cols-2">
                                <div className={`grid content-start gap-1 p-4 ${wcard}`}>
                                    <small className={`text-[11px] font-bold tracking-wider uppercase ${wsub}`}>Total repayable</small>
                                    <b className="text-[26px] font-extrabold [overflow-wrap:anywhere] tabular-nums">{pesoS(e.repayable)}</b>
                                    <span className={`min-h-4.5 text-xs ${wsub}`}>
                                        {e.repayable ? `${pesoS(e.interest)} ${prepaid ? 'interest, deducted in advance' : 'total interest'}` : ''}
                                    </span>
                                </div>
                                <div className={`grid content-start gap-1 p-4 ${wcard}`}>
                                    <small className={`text-[11px] font-bold tracking-wider uppercase ${wsub}`}>Interest rate</small>
                                    <b className="text-[26px] font-extrabold tabular-nums">{pct(p.interest_rate)}</b>
                                    <span className={`min-h-4.5 text-xs ${wsub}`}>{schedule}</span>
                                </div>
                            </div>
                            <Link
                                href="/loans/transactions"
                                className="inline-flex min-h-11 items-center justify-self-start rounded-md text-sm font-bold underline underline-offset-3 hover:bg-white/25"
                            >
                                View my loan schedules and payments
                            </Link>
                            <p className="text-xs leading-[1.7] font-medium italic">
                                * Subject to further delinquent balances deduction.
                                <br />
                                Estimated values may vary based on actual processing.
                            </p>
                        </section>
                    </div>
                </div>
                <p className="sr-only" role="status" aria-live="polite">
                    Net proceeds {netText}. Loan amount {pesoS(e.principal)}.
                </p>
            </div>

            <div
                aria-hidden
                className={`fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-3 bg-brand-surface px-4 py-2 text-on-brand-surface shadow-[0_2px_10px_rgb(0_0_0/.15)] transition-transform duration-200 motion-reduce:transition-none min-[901px]:hidden ${stuck ? 'translate-y-0' : '-translate-y-[110%]'}`}
            >
                <div>
                    <small className="block text-[10px] font-bold tracking-wider uppercase">Net proceeds*</small>
                    <b className="text-[clamp(16px,5vw,20px)] tabular-nums">{netText}</b>
                </div>
                <div className="text-right">
                    <small className="block text-[10px] font-bold tracking-wider uppercase">Loan amount*</small>
                    <b className="text-[clamp(14px,4.2vw,16px)] tabular-nums">{pesoS(e.principal)}</b>
                </div>
            </div>
        </AppLayout>
    );
}
