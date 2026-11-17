import { crop, rotate } from '@/lib/image-edit';
import { useRef, useState } from 'react';
import { useObjectUrl, wizBtn, wizSecondary } from './photo-slot';

type R = { x: number; y: number; w: number; h: number };
const cl = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);

/** Move ('m') or resize (compass handle) a normalized rect by a normalized delta. */
function resize(r: R, k: string, dx: number, dy: number): R {
    const m = 0.08;
    let l = r.x,
        t = r.y,
        rt = r.x + r.w,
        b = r.y + r.h;
    if (k === 'm') {
        l = cl(r.x + dx, 0, 1 - r.w);
        t = cl(r.y + dy, 0, 1 - r.h);
        rt = l + r.w;
        b = t + r.h;
    } else {
        if (k.includes('w')) l = cl(r.x + dx, 0, rt - m);
        if (k.includes('e')) rt = cl(rt + dx, l + m, 1);
        if (k.includes('n')) t = cl(r.y + dy, 0, b - m);
        if (k.includes('s')) b = cl(b + dy, t + m, 1);
    }
    return { x: l, y: t, w: rt - l, h: b - t };
}

const HANDLES: Record<string, string> = {
    nw: 'left-0 top-0 cursor-nwse-resize',
    n: 'left-1/2 top-0 cursor-ns-resize',
    ne: 'left-full top-0 cursor-nesw-resize',
    e: 'left-full top-1/2 cursor-ew-resize',
    se: 'left-full top-full cursor-nwse-resize',
    s: 'left-1/2 top-full cursor-ns-resize',
    sw: 'left-0 top-full cursor-nesw-resize',
    w: 'left-0 top-1/2 cursor-ew-resize',
};
const ARROWS: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

const tool =
    'min-h-11 rounded-full border border-black/25 bg-white px-4 font-semibold text-black hover:bg-black/5 disabled:opacity-40 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tdfc-coral-ink';

type Props = { file: File; name: string; alt: string; doneLabel?: string; onDone: (f: File) => void };

/**
 * Shared rotate + free-form crop step (PRC ID and payslip).
 * Edits are baked into a canvas; `current` is always the final image handed to onDone.
 * ponytail: free-form crop only (no locked card ratio); add an aspect arg to resize() if IDs must be 1.585:1.
 */
export default function PhotoEditor({ file, name, alt, doneLabel = 'Use This Photo', onDone }: Props) {
    const original = useRef(file);
    const [current, setCurrent] = useState(file);
    const [cr, setCr] = useState<R | null>(null); // non-null = crop mode
    const [busy, setBusy] = useState(false);
    const [tip, setTip] = useState('');
    const url = useObjectUrl(current);
    const wrap = useRef<HTMLDivElement>(null);
    const drag = useRef<{ k: string; x: number; y: number; r: R } | null>(null);

    const edit = async (fn: (f: File) => Promise<File>) => {
        if (busy) return;
        setBusy(true);
        setTip('');
        try {
            setCurrent(await fn(current));
            setCr(null);
        } catch {
            setTip('That edit failed. Try again.');
        } finally {
            setBusy(false);
        }
    };

    const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!cr) return;
        drag.current = { k: (e.target as HTMLElement).dataset.h ?? 'm', x: e.clientX, y: e.clientY, r: cr };
        e.currentTarget.setPointerCapture(e.pointerId);
        e.preventDefault();
    };
    const onMove = (e: React.PointerEvent) => {
        const d = drag.current,
            b = wrap.current?.getBoundingClientRect();
        if (d && b) setCr(resize(d.r, d.k, (e.clientX - d.x) / b.width, (e.clientY - d.y) / b.height));
    };
    const onKey = (e: React.KeyboardEvent<HTMLElement>) => {
        const a = ARROWS[e.key];
        if (!a || !cr) return;
        e.preventDefault();
        e.stopPropagation();
        setCr(resize(cr, (e.target as HTMLElement).dataset.h ?? 'm', a[0] * 0.02, a[1] * 0.02));
    };

    if (!url) return null;
    return (
        <>
            <div className="mb-3 flex justify-center overflow-hidden rounded-xl bg-neutral-900 p-2">
                <div ref={wrap} className="relative inline-block leading-none">
                    <img src={url} alt={alt} className="block max-h-[55dvh] max-w-full" />
                    {cr && (
                        <div
                            tabIndex={0}
                            aria-label="Crop area. Use arrow keys to move it."
                            onPointerDown={onDown}
                            onPointerMove={onMove}
                            onPointerUp={() => (drag.current = null)}
                            onPointerCancel={() => (drag.current = null)}
                            onKeyDown={onKey}
                            className="absolute cursor-move touch-none border-2 border-white shadow-[0_0_0_9999px_rgb(0_0_0/0.5)] focus-visible:outline-3 focus-visible:outline-tdfc-coral"
                            style={{ left: `${cr.x * 100}%`, top: `${cr.y * 100}%`, width: `${cr.w * 100}%`, height: `${cr.h * 100}%` }}
                        >
                            {Object.entries(HANDLES).map(([k, pos]) => (
                                <span
                                    key={k}
                                    data-h={k}
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`Resize crop, ${k} edge`}
                                    className={`group absolute -mt-[22px] -ml-[22px] size-11 touch-none ${pos}`}
                                >
                                    <span className="pointer-events-none absolute top-4 left-4 size-3 rounded-[3px] border-2 border-tdfc-coral-ink bg-white group-focus-visible:ring-2 group-focus-visible:ring-tdfc-coral" />
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="mb-3 flex flex-wrap justify-center gap-2">
                <button type="button" className={tool} disabled={busy} onClick={() => edit((f) => rotate(f, -1, name))}>
                    Rotate left
                </button>
                <button type="button" className={tool} disabled={busy} onClick={() => edit((f) => rotate(f, 1, name))}>
                    Rotate right
                </button>
                <button
                    type="button"
                    className={`${tool} aria-pressed:border-tdfc-coral-ink aria-pressed:bg-tdfc-coral-soft`}
                    aria-pressed={!!cr}
                    disabled={busy}
                    onClick={() => setCr(cr ? null : { x: 0.05, y: 0.05, w: 0.9, h: 0.9 })}
                >
                    Crop
                </button>
                <button
                    type="button"
                    className={tool}
                    disabled={busy}
                    onClick={() => {
                        setCurrent(original.current);
                        setCr(null);
                        setTip('');
                    }}
                >
                    Reset
                </button>
            </div>
            <p role="status" className="mb-2 text-xs text-tdfc-error empty:hidden">
                {tip}
            </p>
            <div className="mx-auto grid max-w-[300px] gap-3">
                {cr && (
                    <button type="button" className={wizSecondary} disabled={busy} onClick={() => edit((f) => crop(f, cr, name))}>
                        Apply crop
                    </button>
                )}
                <button type="button" className={wizBtn} disabled={busy} onClick={() => onDone(current)}>
                    {doneLabel}
                </button>
            </div>
        </>
    );
}
