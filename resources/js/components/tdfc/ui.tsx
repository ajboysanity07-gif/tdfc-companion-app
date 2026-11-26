import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { animate, motion, useReducedMotion } from 'framer-motion';
import { CSSProperties, ImgHTMLAttributes, ReactNode, useEffect, useId, useMemo, useRef, useState } from 'react';

export const peso = (n: number) =>
    Number.isFinite(n) ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 }).format(n) : '₱0.00';

export const fdate = (iso?: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    return Number.isFinite(d.getTime()) ? d.toLocaleDateString('en-PH') : iso;
};

export const fdateLong = (iso?: string | null) => {
    if (!iso) return '';
    const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
    return Number.isFinite(d.getTime()) ? d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : iso;
};

/** Page root for mockup-matched pages: 14px text at 1.5 line height, including Tailwind's tighter named sizes. */
export const mockupText =
    'text-sm leading-normal [--text-2xl--line-height:1.5] [--text-lg--line-height:1.5] [--text-sm--line-height:1.5] [--text-xl--line-height:1.5] [--text-xs--line-height:1.5]';

export const Panel = ({ className = '', style, children }: { className?: string; style?: CSSProperties; children: ReactNode }) => (
    <section style={style} className={`rounded-[14px] border border-border bg-card shadow-sm ${className}`}>
        {children}
    </section>
);

const badgeTone = {
    neutral: 'bg-muted text-foreground',
    ok: 'bg-tdfc-ok-soft text-tdfc-ok-ink',
    warn: 'bg-tdfc-sun-soft text-tdfc-sun-ink',
    bad: 'bg-tdfc-coral-soft text-tdfc-coral-ink',
    info: 'bg-tdfc-blue-soft text-tdfc-blue-ink',
};
export const Badge = ({ tone = 'neutral', children }: { tone?: keyof typeof badgeTone; children: ReactNode }) => (
    <span className={`inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold ${badgeTone[tone]}`}>{children}</span>
);

export const Spinner = ({ className = 'border-tdfc-coral' }: { className?: string }) => (
    <span
        role="status"
        aria-label="Loading"
        className={cn('mr-2 inline-block size-5.5 animate-spin rounded-full border-2 border-t-transparent align-middle', className)}
    />
);

/** Small spinner for inside a busy button. */
export const BtnSpinner = () => <Spinner className="mr-0 size-4 border-current" />;

/** Entrance stagger: add RISE to the element and spread riseStyle(i) on it. */
export const RISE = 'animate-tdfc-rise';
export const riseStyle = (i: number) => ({ animationDelay: `${Math.min(i, 12) * 40}ms` });

/** Counts up to `value`; the final value stays in the DOM for screen readers. */
export function CountUp({ value, format = (n: number) => String(Math.round(n)) }: { value: number; format?: (n: number) => string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const reduce = useReducedMotion();
    useEffect(() => {
        if (reduce || !Number.isFinite(value)) return;
        const c = animate(0, value, {
            duration: 0.8,
            ease: 'easeOut',
            onUpdate: (v) => {
                if (ref.current) ref.current.textContent = format(v);
            },
        });
        return () => c.stop();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, reduce]);
    return (
        <>
            <span aria-hidden ref={ref}>
                {format(value)}
            </span>
            <span className="sr-only">{format(value)}</span>
        </>
    );
}

/** Skeleton placeholders sized like the real content, to avoid layout shift. */
export const SkelRows = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => (
    <>
        {Array.from({ length: rows }, (_, r) => (
            <tr key={r} aria-hidden>
                {Array.from({ length: cols }, (_, c) => (
                    <td key={c} className="px-4 py-3.5">
                        <Skeleton className={`h-4 ${c === 0 ? 'w-3/4' : 'w-1/2'}`} />
                    </td>
                ))}
            </tr>
        ))}
    </>
);

/** <img> that pulses until loaded, then fades in. */
export function LoadImg({ className = '', ...p }: ImgHTMLAttributes<HTMLImageElement>) {
    const [ok, setOk] = useState(false);
    return (
        <img
            {...p}
            onLoad={() => setOk(true)}
            onError={() => setOk(true)}
            className={`${className} transition-opacity duration-300 ${ok ? 'opacity-100' : 'animate-pulse bg-muted opacity-0'}`}
        />
    );
}

export const SkelList = ({ rows = 4 }: { rows?: number }) => (
    <ul aria-hidden className="divide-y divide-border">
        {Array.from({ length: rows }, (_, r) => (
            <li key={r} className="space-y-2 px-4 py-3.5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
            </li>
        ))}
    </ul>
);

export const SkelDl = ({ rows = 6 }: { rows?: number }) => (
    <div aria-hidden className="grid grid-cols-2 gap-3">
        {Array.from({ length: rows }, (_, r) => (
            <div key={r} className="space-y-1.5">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        ))}
    </div>
);

export const PageBanner = ({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) => (
    <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
            <h1 className="text-2xl font-extrabold">{title}</h1>
            {sub && <p className="mt-1 text-muted-foreground">{sub}</p>}
        </div>
        {children}
    </div>
);

/** Connected KPI band: 1px dividers, shared border (mockup .stats). */
export const StatBand = ({ children, label }: { children: ReactNode; label: string }) => (
    <section aria-label={label} className="grid gap-px overflow-hidden rounded-[14px] border border-border bg-border shadow-sm max-[860px]:grid-cols-1 min-[861px]:max-[1100px]:grid-cols-2 min-[1101px]:grid-cols-4">
        {children}
    </section>
);

export const StatCard = ({ label, value, hint, accent, index = 0 }: { label: string; value: ReactNode; hint?: string; accent?: boolean; index?: number }) => (
    <div style={riseStyle(index)} className={`${RISE} flex flex-col gap-1 bg-card px-[18px] py-4`}>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <b className={`text-xl leading-tight font-bold tabular-nums ${accent ? 'text-tdfc-coral-ink' : ''}`}>{typeof value === 'number' ? <CountUp value={value} /> : value}</b>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
);

export const Tabs = <T extends string>({
    tabs,
    value,
    onChange,
}: {
    tabs: { id: T; label: string; count?: number }[];
    value: T;
    onChange: (v: T) => void;
}) => {
    const id = useId();
    return (
        <div role="tablist" className="flex flex-wrap gap-2">
            {tabs.map((t) => (
                <button
                    key={t.id}
                    role="tab"
                    aria-selected={value === t.id}
                    onClick={() => onChange(t.id)}
                    className={`relative inline-flex h-[38px] items-center rounded-full border px-3.5 text-sm font-semibold transition-colors ${value === t.id ? 'border-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground hover:bg-muted'}`}
                >
                    {value === t.id && (
                        <motion.span
                            layoutId={`tab-${id}`}
                            className="absolute inset-0 rounded-full bg-primary"
                            transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
                        />
                    )}
                    <span className="relative flex items-center gap-2">
                        {t.label}
                        {t.count !== undefined && <span className="grid h-[22px] min-w-[22px] place-items-center rounded-full bg-current/15 px-[7px] text-xs">{t.count}</span>}
                    </span>
                </button>
            ))}
        </div>
    );
};

export const Switch = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-tdfc-ok-ink' : 'bg-[color-mix(in_oklch,var(--foreground)_25%,var(--card))]'}`}
    >
        <i className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
);

/** Sorting + paging state shared by every table. */
export function useTable<T>(rows: T[], init: { key: keyof T | string; asc?: boolean; per?: number }, get?: (r: T, k: string) => string | number) {
    const [key, setKey] = useState(String(init.key));
    const [asc, setAsc] = useState(init.asc ?? false);
    const [per, setPer] = useState(init.per ?? 10);
    const [page, setPage] = useState(0);
    const sorted = useMemo(() => {
        const val = (r: T) => (get ? get(r, key) : ((r as Record<string, string | number>)[key] ?? ''));
        return [...rows].sort((a, b) => (val(a) > val(b) ? 1 : val(a) < val(b) ? -1 : 0) * (asc ? 1 : -1));
    }, [rows, key, asc, get]);
    const last = Math.max(0, Math.ceil(sorted.length / per) - 1);
    const p = Math.min(page, last);
    return {
        view: sorted.slice(p * per, p * per + per),
        total: sorted.length,
        key,
        asc,
        per,
        page: p,
        sort: (k: string) => {
            setAsc(k === key ? !asc : true);
            setKey(k);
        },
        setPer: (n: number) => {
            setPer(n);
            setPage(0);
        },
        setPage,
    };
}

type Tbl = ReturnType<typeof useTable>;

export const SortTh = ({ t, k, children, right }: { t: Tbl; k: string; children: ReactNode; right?: boolean }) => (
    <th
        aria-sort={t.key === k ? (t.asc ? 'ascending' : 'descending') : 'none'}
        className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap text-muted-foreground ${right ? 'text-right' : 'text-left'}`}
    >
        <button onClick={() => t.sort(k)} className="cursor-pointer focus-visible:outline-2 focus-visible:outline-tdfc-coral-ink">
            {children} {t.key === k ? (t.asc ? '↑' : '↓') : ''}
        </button>
    </th>
);

export const pagerSelect = "h-[30px] min-w-[68px] cursor-pointer rounded-lg border border-input bg-card pr-8 pl-2.5";

export const Pager = ({ t, options = [5, 10, 15, 25, 50] }: { t: Tbl; options?: number[] }) => {
    const s = t.page * t.per;
    return (
        <div className="flex flex-wrap items-center justify-end gap-3.5 border-t border-border px-4 py-2.5 text-[13px] text-muted-foreground">
            Rows per page:
            <select
                aria-label="Rows per page"
                value={t.per}
                onChange={(e) => t.setPer(+e.target.value)}
                className={pagerSelect}
            >
                {options.map((n) => (
                    <option key={n}>{n}</option>
                ))}
            </select>
            <span>
                {t.total ? s + 1 : 0}-{Math.min(s + t.per, t.total)} of {t.total}
            </span>
            <button
                aria-label="Previous page"
                disabled={!t.page}
                onClick={() => t.setPage(t.page - 1)}
                className="h-8 rounded-lg px-3 hover:bg-muted disabled:opacity-40"
            >
                ‹
            </button>
            <button
                aria-label="Next page"
                disabled={s + t.per >= t.total}
                onClick={() => t.setPage(t.page + 1)}
                className="h-8 rounded-lg px-3 hover:bg-muted disabled:opacity-40"
            >
                ›
            </button>
        </div>
    );
};

/** Numbered pager used by the admin tables. */
export const NumPager = ({ t, noun = 'results' }: { t: Tbl; noun?: string }) => {
    const pages = Math.max(1, Math.ceil(t.total / t.per));
    const s = t.page * t.per;
    const b = 'h-8 min-w-8 rounded-lg font-medium disabled:pointer-events-none disabled:opacity-40';
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
            <div className="text-muted-foreground">
                {t.total ? `Showing ${s + 1}-${Math.min(s + t.per, t.total)} of ${t.total} ${noun}` : 'No results'}
            </div>
            <div className="flex gap-1">
                <button aria-label="Previous page" disabled={t.page < 1} onClick={() => t.setPage(t.page - 1)} className={`${b} hover:bg-muted`}>
                    ‹
                </button>
                {Array.from({ length: pages }, (_, i) => (
                    <button
                        key={i}
                        aria-current={i === t.page ? 'page' : undefined}
                        onClick={() => t.setPage(i)}
                        className={`${b} ${i === t.page ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    >
                        {i + 1}
                    </button>
                ))}
                <button aria-label="Next page" disabled={t.page >= pages - 1} onClick={() => t.setPage(t.page + 1)} className={`${b} hover:bg-muted`}>
                    ›
                </button>
            </div>
        </div>
    );
};

/** Right-hand review drawer (native dialog). */
export function Drawer({
    open,
    onClose,
    label,
    children,
    panel = 'max-w-[460px] overflow-auto',
}: {
    open: boolean;
    onClose: () => void;
    label: string;
    children: ReactNode;
    panel?: string;
}) {
    return (
        <dialog
            ref={(d) => {
                if (!d) return;
                if (open && !d.open) d.showModal();
                if (!open && d.open) d.close();
            }}
            aria-label={label}
            onClose={onClose}
            onCancel={(e) => {
                // let the owner decide (e.g. unsaved-changes confirm) instead of closing natively
                e.preventDefault();
                onClose();
            }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
            className={`m-0 ml-auto h-dvh max-h-none w-full bg-card p-0 shadow-tdfc-modal backdrop:animate-tdfc-fade backdrop:bg-black/50 open:animate-tdfc-drawer ${panel}`}
        >
            {open && children}
        </dialog>
    );
}

type ToastItem = { id: number; msg: string; variant: 'success' | 'error' };
let toasts: ToastItem[] = [];
let toastId = 0;
const toastListeners = new Set<() => void>();
const emitToasts = () => toastListeners.forEach((l) => l());

/** Global toast. Call from anywhere; <Toaster /> (mounted once in app.tsx) renders it. */
export function showToast(msg: string, variant: ToastItem['variant'] = 'success') {
    const id = ++toastId;
    toasts = [...toasts, { id, msg, variant }];
    emitToasts();
    setTimeout(
        () => {
            toasts = toasts.filter((t) => t.id !== id);
            emitToasts();
        },
        variant === 'error' ? 5000 : 3000,
    );
}

export function Toaster() {
    const [items, setItems] = useState(toasts);
    useEffect(() => {
        const l = () => setItems(toasts);
        toastListeners.add(l);
        return () => void toastListeners.delete(l);
    }, []);
    // Backend flashes (->with('success'|'error', ...)) arrive in page props on every Inertia visit.
    useEffect(
        () =>
            router.on('success', (e) => {
                const f = (e.detail.page.props as { flash?: { success?: string; error?: string } }).flash;
                if (f?.success) showToast(f.success);
                if (f?.error) showToast(f.error, 'error');
            }),
        [],
    );
    if (!items.length) return null;
    return (
        <div className="pointer-events-none fixed bottom-20 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2 md:bottom-6">
            {items.map((t) => (
                <div
                    key={t.id}
                    role={t.variant === 'error' ? 'alert' : 'status'}
                    className={cn(
                        'animate-tdfc-rise rounded-xl px-4 py-2.5 text-sm shadow-tdfc-modal',
                        t.variant === 'error' ? 'bg-destructive text-white' : 'bg-primary text-primary-foreground',
                    )}
                >
                    {t.msg}
                </div>
            ))}
        </div>
    );
}

/** Kept for existing pages: `show(msg, variant?)`; rendering is handled by the global <Toaster />. */
export function useToast() {
    return { show: showToast, toast: null };
}

export const btn = {
    base: 'inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border px-4 font-medium transition-[color,background-color,transform] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
    plain: 'border-border bg-card hover:bg-muted',
    dark: 'border-primary bg-primary text-primary-foreground hover:bg-primary/85',
    coral: 'border-tdfc-coral bg-tdfc-coral font-bold text-tdfc-on-coral hover:bg-[color-mix(in_oklch,var(--brand-surface)_88%,black)]',
    danger: 'border-destructive bg-destructive text-white hover:bg-destructive/90',
    sm: '!h-8 !px-3 text-[13px]',
};
