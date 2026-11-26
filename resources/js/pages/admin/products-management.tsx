import { BtnSpinner, Drawer, PageBanner, Panel, SkelRows, Switch, UnitSwitch, btn, peso, useToast } from '@/components/tdfc/ui';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useProductsApi } from '@/hooks/use-products-api';
import AppLayout from '@/layouts/app-layout';
import { inUnit, toDays, type TermUnit } from '@/lib/loan';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Check as CheckIcon, ChevronsUpDown, Plus, X } from 'lucide-react';
import { MutableRefObject, useEffect, useMemo, useRef, useState } from 'react';

type Fee = { label: string; type: 'percent' | 'fixed'; value: number | string | null };
type Settings = {
    ln_isActive?: boolean;
    ln_scheme?: string;
    installment_mode?: string;
    rate_isEditable?: boolean;
    max_term?: number | string | null;
    max_term_isEditable?: boolean;
    max_amortization?: number | string | null;
    max_amortization_isEditable?: boolean;
    max_amortization_mode?: string;
    max_amortization_formula?: string | null;
    allow_multiple?: boolean;
    service_fee?: number | string | null;
    lrf?: number | string | null;
    doc_stamp?: number | string | null;
    mort_notarial?: number | string | null;
    custom_fees?: Fee[] | null;
    terms_and_info?: string | null;
};
type Product = { typecode: string; lntype?: string; int_rate?: number | null; settings?: Settings; tags?: { tag_name: string }[] };
type Form = { name: string; settings: Required<Settings>; int_rate: string; tags: string[] };

const text = (n: unknown) => (n === null || n === undefined ? '' : String(n));
// ponytail: empty input saves null (not the mockup's 0) so "no limit" stays distinguishable
const num = (s: string) => {
    const v = s.replace(/[^0-9.-]/g, '');
    return v === '' || v === '-' ? null : +v;
};
const toForm = (p: Product): Form => {
    const s = p.settings ?? {};
    return {
        name: p.lntype ?? '',
        int_rate: text(p.int_rate),
        tags: (p.tags ?? []).map((t) => t.tag_name),
        settings: {
            ln_isActive: !!s.ln_isActive,
            ln_scheme: s.ln_scheme ?? 'ADD-ON',
            installment_mode: s.installment_mode ?? 'MONTHLY',
            rate_isEditable: !!s.rate_isEditable,
            max_term: s.max_term ?? null,
            max_term_isEditable: !!s.max_term_isEditable,
            max_amortization: s.max_amortization ?? null,
            max_amortization_isEditable: !!s.max_amortization_isEditable,
            max_amortization_mode: s.max_amortization_mode ?? 'FIXED',
            max_amortization_formula: s.max_amortization_formula ?? '',
            allow_multiple: !!s.allow_multiple,
            service_fee: s.service_fee ?? null,
            lrf: s.lrf ?? null,
            doc_stamp: s.doc_stamp ?? null,
            mort_notarial: s.mort_notarial ?? null,
            custom_fees: (s.custom_fees ?? []).map((c) => ({ ...c, value: text(c.value) })),
            terms_and_info: s.terms_and_info ?? '',
        },
    };
};

const field = 'h-10 w-full rounded-[10px] border border-input bg-card px-3 shadow-sm focus:border-ring focus:outline-none dark:bg-transparent';
const pill = 'inline-flex h-5.5 items-center rounded-full px-2 text-[11px] font-semibold';
const sections = ['general', 'terms', 'fees'] as const;
const NEW = '+'; // sel value for the blank "Add Loan" drawer
const TYPED = /^\d*\.?\d{0,2}$/; // numeric inputs: at most two decimals

// salary-based limits have no stored amount, so show how they are worked out
function maxAmort(s: Settings) {
    const mode = s.max_amortization_mode;
    if (mode === 'BASIC' || mode === 'CUSTOM') {
        return (
            <span className="inline-block max-w-40 text-[13px] wrap-anywhere text-muted-foreground">
                {mode === 'BASIC' ? 'Basic salary' : (s.max_amortization_formula ?? '').replace(/\*/g, '×')}
            </span>
        );
    }
    return s.max_amortization != null ? peso(Number(s.max_amortization)) : '—';
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className="flex h-10 items-center gap-1.5 text-[13px] text-muted-foreground">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            {label}
        </label>
    );
}

type FormProps = {
    product: Product;
    dirty: MutableRefObject<boolean>;
    onSave: (p: Product, body: Record<string, unknown>, tags: string[]) => Promise<void>;
    onDelete: (p: Product) => void;
    onClose: () => void;
    toast: React.ReactNode;
};

function ProductDrawerBody({ product, dirty, onSave, onDelete, onClose, toast }: FormProps) {
    // the opened draft; compared as typed text, so a refetched "12.00" doesn't count as an edit
    const [base] = useState(() => toForm(product));
    const [f, setF] = useState(base);
    const [busy, setBusy] = useState(false);
    const isNew = !product.typecode;
    const [cur, setCur] = useState<(typeof sections)[number]>('general');
    const body = useRef<HTMLDivElement>(null);
    const s = f.settings;
    // max_term is always kept in days; the unit only changes how it is shown and typed
    const [termUnit, setTermUnit] = useState<TermUnit>('day');
    const [termText, setTermText] = useState<string | null>(null);
    const set = <K extends keyof Settings>(k: K, v: Settings[K]) =>
        setF((x) => ({ ...x, settings: { ...x.settings, [k]: v } as Required<Settings> }));
    dirty.current = JSON.stringify(f) !== JSON.stringify(base);
    const fees = s.custom_fees ?? [];
    const setFees = (next: Fee[]) => set('custom_fees', next);
    const setFee = (i: number, change: Partial<Fee>) => setFees(fees.map((c, j) => (j === i ? { ...c, ...change } : c)));
    // numeric fields are kept as typed text (so "1." survives) and converted here
    const save = async () => {
        const settings = { ...f.settings } as Record<string, unknown>;
        for (const k of ['max_term', 'max_amortization', 'service_fee', 'lrf', 'doc_stamp', 'mort_notarial']) settings[k] = num(text(settings[k]));
        settings.custom_fees = fees.map((c) => ({ ...c, label: c.label.trim(), value: num(text(c.value)) }));
        setBusy(true);
        await onSave(product, { lntype: f.name.trim(), int_rate: num(f.int_rate), settings }, f.tags);
        setBusy(false);
    };
    // sits in the header for a new loan, at the top of General for an existing one
    const nameInput = (className = '') => (
        <input
            id="d-name"
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            maxLength={255}
            placeholder="Loan name"
            aria-label="Loan name"
            className={`${field} ${className}`}
        />
    );
    const toggleTag = (t: string) => setF((x) => ({ ...x, tags: x.tags.includes(t) ? x.tags.filter((n) => n !== t) : [...x.tags, t] }));
    const [types, setTypes] = useState<string[]>([]);
    const [dlg, setDlg] = useState<HTMLElement | null>(null); // popover must render inside the <dialog> or it sits behind it
    useEffect(() => {
        axios.get('/api/admin/products/types').then(
            (r) => setTypes(r.data),
            () => setTypes([]),
        );
    }, []);

    const spy = () => {
        const b = body.current;
        if (!b) return;
        let next: (typeof sections)[number] = 'general';
        sections.forEach((k) => {
            const el = document.getElementById(`p-${k}`);
            if (el && el.offsetTop - b.scrollTop <= 60) next = k;
        });
        if (b.scrollTop + b.clientHeight >= b.scrollHeight - 2) next = 'fees';
        setCur(next);
    };
    const jump = (k: string) => {
        const el = document.getElementById(`p-${k}`);
        if (el)
            body.current?.scrollTo({ top: el.offsetTop - 20, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    };

    const numField = (k: 'max_amortization' | 'service_fee' | 'lrf' | 'doc_stamp' | 'mort_notarial', id: string) => (
        <input
            id={id}
            className={`${field} tabular-nums`}
            inputMode="decimal"
            value={text(s[k])}
            onChange={(e) => TYPED.test(e.target.value) && set(k, e.target.value)}
        />
    );
    const pct = (k: 'service_fee' | 'lrf' | 'doc_stamp', id: string, label: string) => (
        <div className="grid gap-1.5">
            <label htmlFor={id} className="font-medium">
                {label}
            </label>
            <div className="relative">
                {numField(k, id)}
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
        </div>
    );
    const row = (label: string, id: string, input: React.ReactNode, ed: React.ReactNode) => (
        <div className="grid grid-cols-[1fr_auto] items-end gap-2.5">
            <div className="grid gap-1.5">
                <label htmlFor={id} className="font-medium">
                    {label}
                </label>
                {input}
            </div>
            {ed}
        </div>
    );
    const amortEditable = (label: string) => (
        <Check label={label} checked={!!s.max_amortization_isEditable} onChange={(v) => set('max_amortization_isEditable', v)} />
    );
    const h3 = 'text-base font-semibold';
    const sec = 'grid gap-4.5 border-b border-border pb-7 mb-7 last:mb-0 last:border-0 max-md:gap-3.5 max-md:pb-5 max-md:mb-5';

    return (
        <>
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                {isNew ? nameInput('min-w-0 flex-1') : <h2 className="min-w-0 flex-1 text-lg font-semibold">{product.lntype}</h2>}
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className={`${btn.base} !h-8 !w-9 border-transparent !px-0 hover:bg-muted`}
                >
                    <X className="size-5" />
                </button>
            </div>
            <nav className="flex gap-1 border-b border-border px-5" aria-label="Jump to section">
                {sections.map((k) => (
                    <button
                        key={k}
                        type="button"
                        onClick={() => jump(k)}
                        aria-current={cur === k}
                        className="-mb-px h-11 border-b-2 border-transparent px-3 font-medium text-muted-foreground capitalize hover:bg-muted hover:text-foreground aria-[current=true]:border-tdfc-coral aria-[current=true]:font-semibold aria-[current=true]:text-foreground"
                    >
                        {k}
                    </button>
                ))}
            </nav>

            <div ref={body} onScroll={spy} className="relative min-h-0 flex-1 overflow-auto overscroll-contain px-5 pt-5 pb-[45vh] max-md:pb-4">
                <section id="p-general" aria-labelledby="h-general" className={sec}>
                    <h3 id="h-general" className={h3}>
                        General
                    </h3>
                    {!isNew && (
                        <div className="grid gap-1.5">
                            <label htmlFor="d-name" className="font-medium">
                                Loan name
                            </label>
                            {nameInput()}
                        </div>
                    )}
                    <div className="flex items-center justify-between gap-3 rounded-[10px] border border-border px-3.5 py-3">
                        <div>
                            <b>Available to clients</b>
                            <small className="block text-muted-foreground">Inactive products are hidden from the loan calculator.</small>
                        </div>
                        <Switch checked={!!s.ln_isActive} onChange={(v) => set('ln_isActive', v)} label="Active" />
                    </div>
                    <div className="grid gap-1.5">
                        <label htmlFor="d-tags" className="font-medium">
                            Type relation tags
                        </label>
                        <Popover>
                            <PopoverAnchor asChild>
                                <div
                                    className={`${field} flex h-auto min-h-10.5 flex-wrap items-center gap-1.5 !px-1.5 py-1 focus-within:border-ring`}
                                >
                                    {f.tags.map((t) => (
                                        <Badge
                                            key={t}
                                            title={t}
                                            className="max-w-full gap-1.5 border-transparent bg-tdfc-blue-soft text-tdfc-blue-ink"
                                        >
                                            <span className="truncate">{t}</span>
                                            <button
                                                type="button"
                                                aria-label={`Remove ${t}`}
                                                onClick={() => toggleTag(t)}
                                                className="cursor-pointer text-[15px] leading-none"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    ))}
                                    <PopoverTrigger asChild>
                                        <button
                                            id="d-tags"
                                            type="button"
                                            ref={(el) => setDlg(el?.closest('dialog') ?? null)}
                                            className="flex h-7.5 min-w-30 flex-1 cursor-pointer items-center justify-between gap-2 px-1 text-muted-foreground"
                                        >
                                            <span className={f.tags.length ? 'sr-only' : ''}>
                                                {f.tags.length ? 'Choose loan types' : 'Select loan types'}
                                            </span>
                                            <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
                                        </button>
                                    </PopoverTrigger>
                                </div>
                            </PopoverAnchor>
                            <PopoverContent container={dlg} align="start" className="w-(--radix-popover-trigger-width) p-0">
                                <Command>
                                    <CommandInput placeholder="Search loan types..." />
                                    <CommandList>
                                        <CommandEmpty>No loan types</CommandEmpty>
                                        <CommandGroup>
                                            {types.map((t) => (
                                                <CommandItem key={t} value={t} title={t} onSelect={() => toggleTag(t)}>
                                                    <CheckIcon className={`size-4 ${f.tags.includes(t) ? 'opacity-100' : 'opacity-0'}`} />
                                                    <span className="truncate">{t}</span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid gap-1.5">
                        <label htmlFor="d-info" className="font-medium">
                            Terms / information for clients
                        </label>
                        <textarea
                            id="d-info"
                            rows={6}
                            value={s.terms_and_info ?? ''}
                            onChange={(e) => set('terms_and_info', e.target.value)}
                            className={`${field} h-auto py-2.5`}
                        />
                    </div>
                </section>

                <section id="p-terms" aria-labelledby="h-terms" className={sec}>
                    <h3 id="h-terms" className={h3}>
                        Terms
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-1.5">
                            <label htmlFor="d-scheme" className="font-medium">
                                Scheme
                            </label>
                            <select id="d-scheme" className={field} value={s.ln_scheme} onChange={(e) => set('ln_scheme', e.target.value)}>
                                {['ADD-ON', 'PREPAID'].map((o) => (
                                    <option key={o}>{o}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-1.5">
                            <label htmlFor="d-mode" className="font-medium">
                                Mode
                            </label>
                            <select
                                id="d-mode"
                                className={field}
                                value={s.installment_mode}
                                onChange={(e) => set('installment_mode', e.target.value)}
                            >
                                {/* a retired saved mode (WEEKLY) stays listed so the admin can see it and change it */}
                                {[...new Set(['MONTHLY', 'SEMI-ANNUAL', 'DUE-DATE', base.settings.installment_mode])].map((o) => (
                                    <option key={o}>{o}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {row(
                        'Rate (p.a.)',
                        'd-rate',
                        <div className="relative">
                            <input
                                id="d-rate"
                                className={`${field} tabular-nums`}
                                inputMode="decimal"
                                value={f.int_rate}
                                onChange={(e) => TYPED.test(e.target.value) && setF({ ...f, int_rate: e.target.value })}
                            />
                            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground">%</span>
                        </div>,
                        <Check label="editable by client" checked={!!s.rate_isEditable} onChange={(v) => set('rate_isEditable', v)} />,
                    )}
                    {row(
                        `Max term (${termUnit}s)`,
                        'd-term',
                        <div className="flex items-center gap-2">
                            <input
                                id="d-term"
                                className={`${field} min-w-0 tabular-nums`}
                                inputMode="decimal"
                                value={termText ?? (num(text(s.max_term)) === null ? '' : inUnit(Number(s.max_term), termUnit))}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    if (!TYPED.test(v)) return;
                                    setTermText(v);
                                    set('max_term', v === '' || v === '.' ? null : String(toDays(+v, termUnit)));
                                }}
                                onBlur={() => setTermText(null)}
                            />
                            <UnitSwitch
                                value={termUnit}
                                onChange={(u) => {
                                    setTermUnit(u);
                                    setTermText(null);
                                }}
                            />
                        </div>,
                        <Check label="editable by client" checked={!!s.max_term_isEditable} onChange={(v) => set('max_term_isEditable', v)} />,
                    )}
                    <div className="grid gap-1.5">
                        <label htmlFor="d-amode" className="font-medium">
                            Max amortization mode
                        </label>
                        <select
                            id="d-amode"
                            className={field}
                            value={s.max_amortization_mode}
                            onChange={(e) => set('max_amortization_mode', e.target.value)}
                        >
                            <option value="FIXED">FIXED amount</option>
                            <option value="BASIC">BASIC (client&apos;s basic salary)</option>
                            <option value="CUSTOM">CUSTOM formula</option>
                        </select>
                    </div>
                    {s.max_amortization_mode === 'CUSTOM' && (
                        <div className="grid gap-1.5">
                            <label htmlFor="d-formula" className="font-medium">
                                Formula
                            </label>
                            <input
                                id="d-formula"
                                className={field}
                                value={s.max_amortization_formula ?? ''}
                                onChange={(e) => set('max_amortization_formula', e.target.value)}
                                placeholder="e.g. basic * 0.4"
                            />
                            <small className="text-muted-foreground">
                                <b>basic</b> is the client&apos;s basic salary. Use numbers and + - * / ( ).
                            </small>
                        </div>
                    )}
                    {s.max_amortization_mode === 'FIXED'
                        ? row(
                              'Max amortization (per payment)',
                              'd-amort',
                              numField('max_amortization', 'd-amort'),
                              amortEditable('editable by client'),
                          )
                        : amortEditable('Max amortization editable by client')}
                    <Check label="Allow multiple active loans per client" checked={!!s.allow_multiple} onChange={(v) => set('allow_multiple', v)} />
                </section>

                <section id="p-fees" aria-labelledby="h-fees" className={sec}>
                    <h3 id="h-fees" className={h3}>
                        Fees
                    </h3>
                    <p className="text-[13px] text-muted-foreground">Percent fees are computed on the principal.</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {pct('service_fee', 'd-sf', 'Service fee')}
                        {pct('lrf', 'd-lrf', 'LRF')}
                        {pct('doc_stamp', 'd-ds', 'Doc stamp')}
                        <div className="grid gap-1.5">
                            <label htmlFor="d-mn" className="font-medium">
                                Mortuary + notarial
                            </label>
                            {numField('mort_notarial', 'd-mn')}
                        </div>
                    </div>
                    {fees.map((c, i) => (
                        <div key={i} className="grid grid-cols-[minmax(0,1fr)_4.5rem_6.5rem_auto] items-center gap-2">
                            <input
                                className={field}
                                aria-label={`Custom fee ${i + 1} name`}
                                placeholder="Fee name"
                                maxLength={60}
                                value={c.label}
                                onChange={(e) => setFee(i, { label: e.target.value })}
                            />
                            <select
                                className={`${field} !px-2`}
                                aria-label={`Custom fee ${i + 1} type`}
                                value={c.type}
                                onChange={(e) => setFee(i, { type: e.target.value as Fee['type'] })}
                            >
                                <option value="percent">%</option>
                                <option value="fixed">₱</option>
                            </select>
                            <input
                                className={`${field} tabular-nums`}
                                aria-label={`Custom fee ${i + 1} value`}
                                inputMode="decimal"
                                placeholder="0.00"
                                value={text(c.value)}
                                onChange={(e) => TYPED.test(e.target.value) && setFee(i, { value: e.target.value })}
                            />
                            <button
                                type="button"
                                aria-label={`Remove custom fee ${i + 1}`}
                                onClick={() => setFees(fees.filter((_, j) => j !== i))}
                                className={`${btn.base} !h-10 !w-9 border-transparent !px-0 hover:bg-muted`}
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    ))}
                    {fees.length < 20 && (
                        <button
                            type="button"
                            onClick={() => setFees([...fees, { label: '', type: 'fixed', value: '' }])}
                            className={`${btn.base} justify-self-start border-border hover:bg-muted`}
                        >
                            <Plus className="size-4" />
                            Add custom fee
                        </button>
                    )}
                </section>
            </div>

            <div className="flex items-center gap-2.5 border-t border-border bg-background px-5 py-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
                {!isNew && (
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => onDelete(product)}
                        className={`${btn.base} border-transparent bg-transparent text-destructive hover:bg-destructive/10`}
                    >
                        Delete
                    </button>
                )}
                <span className="flex-1" />
                <button type="button" disabled={busy || (isNew && !f.name.trim())} onClick={save} className={`${btn.base} ${btn.dark}`}>
                    {busy && <BtnSpinner />}
                    {isNew ? 'Add loan' : 'Save changes'}
                </button>
            </div>
            {toast}
        </>
    );
}

export default function ProductsManagement() {
    const { products, loading, fetchProducts, updateProduct, deleteProduct } = useProductsApi();
    const list = products as unknown as Product[];
    const [q, setQ] = useState('');
    const [flt, setFlt] = useState<'all' | 'on' | 'off'>('all');
    const [sel, setSel] = useState<string | null>(null);
    const dirty = useRef(false);
    const { show, toast } = useToast();

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        document.body.style.overflow = sel ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [sel]);

    const active = list.filter((p) => p.settings?.ln_isActive).length;
    const shown = useMemo(() => {
        const n = q.toLowerCase();
        return list
            .filter((p) => (p.lntype ?? '').toLowerCase().includes(n) && (flt === 'all' || (flt === 'on') === !!p.settings?.ln_isActive))
            .sort((a, b) => (a.lntype ?? '').localeCompare(b.lntype ?? ''));
    }, [list, q, flt]);
    const cur = sel === NEW ? { typecode: '', lntype: '' } : (list.find((p) => p.typecode === sel) ?? null);

    const open = (code: string) => {
        if (sel && sel !== code && dirty.current && !confirm('Discard unsaved changes?')) return;
        dirty.current = false;
        setSel(code);
    };
    const close = () => {
        if (!sel) return; // native close event fires after we already closed
        if (dirty.current && !confirm('Discard unsaved changes?')) return;
        dirty.current = false;
        setSel(null);
    };
    const toggle = async (p: Product, on: boolean) => {
        await updateProduct(p.typecode, { settings: { ln_isActive: on } });
        show(`${p.lntype} ${on ? 'enabled' : 'disabled'}`);
    };
    const save = async (p: Product, body: Record<string, unknown>, next: string[]) => {
        try {
            const isNew = sel === NEW;
            let code = p.typecode;
            // one atomic request: row + settings; the server assigns the code
            if (isNew) code = (await axios.post('/api/admin/products', body)).data.typecode;
            else await updateProduct(code, body);
            const old = (p.tags ?? []).map((t) => t.tag_name);
            const base = `/api/admin/products/${code}/tags`;
            await Promise.all([
                ...next.filter((t) => !old.includes(t)).map((t) => axios.post(base, { tag_name: t })),
                ...old.filter((t) => !next.includes(t)).map((t) => axios.delete(`${base}/${encodeURIComponent(t)}`)),
            ]);
            await fetchProducts();
            // close only the drawer that was saved, not one opened while the request was in flight
            setSel((s) => (s === sel ? null : s));
            show(`${body.lntype ?? p.lntype} ${isNew ? 'added' : 'updated'}`);
        } catch (e) {
            const errs = axios.isAxiosError(e) ? (Object.values(e.response?.data?.errors ?? {})[0] as string[] | undefined) : undefined;
            show(errs?.[0] ?? (axios.isAxiosError(e) ? (e.response?.data?.message ?? 'Save failed') : 'Save failed'), 'error');
        }
    };
    const remove = async (p: Product) => {
        if (!confirm(`Delete "${p.lntype}"? This cannot be undone.`)) return;
        await deleteProduct(p.typecode);
        dirty.current = false;
        setSel(null);
        show(`${p.lntype} deleted`);
    };

    const chips = [
        ['all', 'All', list.length],
        ['on', 'Active', active],
        ['off', 'Inactive', list.length - active],
    ] as const;
    const th = 'px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground';

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Admin', href: '/admin/dashboard' },
                { title: 'Products Management', href: '/admin/products' },
            ]}
        >
            <Head title="Products Management" />
            <div className="grid content-start gap-5 p-4 pb-24 md:p-6">
                <PageBanner title="Products" sub={`${list.length} loan products · ${active} active`}>
                    <button type="button" onClick={() => open(NEW)} className={`${btn.base} ${btn.dark}`}>
                        <Plus className="size-4" />
                        Add Loan
                    </button>
                </PageBanner>

                <Panel className="overflow-hidden">
                    <div className="grid gap-3.5 p-5 pb-0">
                        <div className="flex flex-wrap items-center justify-between gap-3 max-[860px]:flex-col max-[860px]:items-stretch">
                            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
                                {chips.map(([v, l, n]) => (
                                    <button
                                        key={v}
                                        type="button"
                                        aria-pressed={flt === v}
                                        onClick={() => setFlt(v)}
                                        className={`inline-flex h-9.5 items-center gap-2 rounded-full border px-3.5 font-semibold max-[720px]:px-3 ${flt === v ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:bg-muted'}`}
                                    >
                                        {l}
                                        <span className="grid h-5.5 min-w-5.5 place-items-center rounded-full bg-current/15 px-1.5 text-xs">{n}</span>
                                    </button>
                                ))}
                            </div>
                            <input
                                type="search"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search loan type..."
                                aria-label="Search loan type"
                                className={`${field} min-w-0 flex-1 basis-50 max-[860px]:max-w-none max-[860px]:flex-none md:max-w-80`}
                            />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse max-[720px]:block">
                                <thead className="max-[720px]:hidden">
                                    <tr className="border-b border-border">
                                        <th className={th}>Product</th>
                                        <th className={`${th} max-[860px]:hidden`}>Scheme</th>
                                        <th className={`${th} max-[1100px]:hidden`}>Mode</th>
                                        <th className={`${th} text-right`}>Rate p.a.</th>
                                        <th className={`${th} text-right max-[860px]:hidden`}>Max term</th>
                                        <th className={`${th} text-right max-[860px]:hidden`}>Max amort.</th>
                                        <th className={`${th} max-[1100px]:hidden`}>Tags</th>
                                        <th className={`${th} w-21 text-center`}>Active</th>
                                    </tr>
                                </thead>
                                <tbody className="max-[720px]:block">
                                    {loading && !products.length && <SkelRows rows={6} cols={8} />}
                                    {shown.map((p) => {
                                        const s = p.settings ?? {};
                                        return (
                                            <tr
                                                key={p.typecode}
                                                tabIndex={0}
                                                onClick={() => open(p.typecode)}
                                                onKeyDown={(e) => e.key === 'Enter' && e.target === e.currentTarget && open(p.typecode)}
                                                className={`cursor-pointer border-b border-border last:border-0 hover:bg-muted max-[720px]:mb-2.5 max-[720px]:grid max-[720px]:grid-cols-[minmax(0,1fr)_auto] max-[720px]:items-center max-[720px]:gap-x-3 max-[720px]:gap-y-1.5 max-[720px]:rounded-xl max-[720px]:border max-[720px]:p-3.5 max-[720px]:shadow-sm max-[720px]:hover:bg-white max-[720px]:active:bg-muted ${sel === p.typecode ? 'bg-tdfc-coral-soft' : ''}`}
                                            >
                                                <td className="px-4 py-3.5 max-[720px]:col-start-1 max-[720px]:row-start-1 max-[720px]:block max-[720px]:self-start max-[720px]:p-0">
                                                    <b>{p.lntype}</b>
                                                </td>
                                                <td className="px-4 py-3.5 max-[860px]:hidden max-[720px]:p-0">
                                                    <span className={`${pill} bg-muted text-muted-foreground`}>{s.ln_scheme ?? '—'}</span>
                                                </td>
                                                <td className="px-4 py-3.5 max-[1100px]:hidden max-[720px]:col-start-1 max-[720px]:row-start-2 max-[720px]:block max-[720px]:p-0">
                                                    {s.installment_mode ?? '—'}
                                                </td>
                                                <td className="px-4 py-3.5 text-right tabular-nums max-[720px]:col-start-2 max-[720px]:row-start-2 max-[720px]:block max-[720px]:p-0">
                                                    {p.int_rate != null ? `${p.int_rate}%` : '—'}
                                                </td>
                                                <td className="px-4 py-3.5 text-right tabular-nums max-[860px]:hidden max-[720px]:p-0">
                                                    {s.max_term != null ? `${Number(s.max_term).toLocaleString()} d` : '—'}
                                                </td>
                                                <td className="px-4 py-3.5 text-right tabular-nums max-[860px]:hidden max-[720px]:p-0">
                                                    {maxAmort(s)}
                                                </td>
                                                <td className="px-4 py-3.5 max-[1100px]:hidden max-[720px]:p-0">
                                                    <span className="flex flex-wrap gap-1">
                                                        {p.tags?.length ? (
                                                            p.tags.map(({ tag_name }) => (
                                                                <span key={tag_name} className={`${pill} bg-tdfc-blue-soft text-tdfc-blue-ink`}>
                                                                    {tag_name}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-muted-foreground">—</span>
                                                        )}
                                                    </span>
                                                </td>
                                                <td
                                                    className="px-4 py-3.5 max-[720px]:col-start-2 max-[720px]:row-start-1 max-[720px]:block max-[720px]:justify-self-end max-[720px]:p-0"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="flex justify-center">
                                                        <Switch
                                                            checked={!!s.ln_isActive}
                                                            onChange={(v) => toggle(p, v)}
                                                            label={`Toggle ${p.lntype} active`}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {shown.length === 0 && !loading && (
                                        <tr className="max-[720px]:block">
                                            <td colSpan={8} className="px-4 py-7 text-center text-muted-foreground max-[720px]:block">
                                                No products found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="border-t border-border px-4 py-3 text-[13px] text-muted-foreground">
                        Showing {shown.length} of {list.length} products
                    </div>
                </Panel>
            </div>

            <Drawer open={!!cur} onClose={close} label={cur?.lntype ?? 'Product'} panel="max-w-[520px] overflow-hidden open:flex open:flex-col">
                {cur && (
                    <ProductDrawerBody key={cur.typecode} product={cur} dirty={dirty} onSave={save} onDelete={remove} onClose={close} toast={toast} />
                )}
            </Drawer>

            {!cur && toast}
        </AppLayout>
    );
}
