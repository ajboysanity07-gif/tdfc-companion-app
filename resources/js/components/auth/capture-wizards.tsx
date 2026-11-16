import { crop, rotate } from '@/lib/image-edit';
import { useRef, useState } from 'react';
import Modal from './modal';
import PhotoSlot, { PhotoMode, StepHeading, useObjectUrl, wizBtn, wizSecondary } from './photo-slot';
import { SecondaryButton } from './primary-button';

const note = 'mx-auto mb-4 max-w-[300px] rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700';

function ModeChoice({ what, onPick }: { what: string; onPick: (m: PhotoMode) => void }) {
    return (
        <>
            <p className="mb-3 text-sm text-black/70">Choose how you’d like to provide your {what}</p>
            <div className="mx-auto grid max-w-[300px] gap-3">
                <button type="button" className={wizBtn} onClick={() => onPick('upload')}>
                    Upload a Photo
                </button>
                <button type="button" className={wizBtn} onClick={() => onPick('camera')}>
                    Use a Camera
                </button>
            </div>
        </>
    );
}

const Footer = ({ onBack, onCancel }: { onBack: () => void; onCancel: () => void }) => (
    <div className="mt-5 flex justify-between gap-3">
        <SecondaryButton className="w-28" onClick={onBack}>
            Back
        </SecondaryButton>
        <SecondaryButton className="w-28" onClick={onCancel}>
            Cancel
        </SecondaryButton>
    </div>
);

/* ---------------------------------------------------------------- PRC ID */

type PrcStep = 'choose' | 'front' | 'back' | 'review';

function PrcBody({ initial, onDone, onClose }: { initial: [File | null, File | null]; onDone: (f: File, b: File) => void; onClose: () => void }) {
    const [step, setStep] = useState<PrcStep>('choose');
    const [mode, setMode] = useState<PhotoMode>('upload');
    const [front, setFront] = useState<File | null>(initial[0]);
    const [back, setBack] = useState<File | null>(initial[1]);
    const frontUrl = useObjectUrl(front);
    const backUrl = useObjectUrl(back);
    const prev: Record<PrcStep, PrcStep | null> = { choose: null, front: 'choose', back: 'front', review: 'back' };

    const side = step === 'front' ? 'Front' : 'Back';
    const file = step === 'front' ? front : back;

    return (
        <div className="text-center">
            {step === 'choose' && (
                <>
                    <StepHeading>Upload your PRC ID</StepHeading>
                    <div className="mb-3 grid justify-items-center gap-3">
                        <img src="/images/prc-sample-front.png" alt="Sample of the front of a PRC ID" className="h-auto w-[70%] max-w-[260px]" />
                    </div>
                    <p className={note}>*Your PRC ID photos (front and back) should be clear and all details legible.</p>
                    <ModeChoice
                        what="PRC ID photos"
                        onPick={(m) => {
                            setMode(m);
                            setStep('front');
                        }}
                    />
                </>
            )}
            {(step === 'front' || step === 'back') && (
                <>
                    <StepHeading>
                        {mode === 'camera' ? 'Take' : 'Upload'} {side} PRC ID{mode === 'camera' ? ' Photo' : ''}
                    </StepHeading>
                    <img
                        src={`/images/prc-sample-${step}.png`}
                        alt={`Sample of the ${step} of a PRC ID`}
                        className="mx-auto mb-3 h-auto w-[60%] max-w-[220px]"
                    />
                    <PhotoSlot mode={mode} alt={`${side} PRC ID photo`} file={file} onChange={step === 'front' ? setFront : setBack} />
                    <button
                        type="button"
                        disabled={!file}
                        className={`${wizBtn} mx-auto mt-4 max-w-[300px]`}
                        onClick={() => setStep(step === 'front' ? 'back' : 'review')}
                    >
                        {step === 'front' ? 'Next' : 'Done'}
                    </button>
                </>
            )}
            {step === 'review' && (
                <>
                    <StepHeading>Review Your PRC IDs</StepHeading>
                    <p className={note}>Compare your photos to the samples. Only proceed if they are clear and aligned.</p>
                    {(
                        [
                            ['Front PRC ID', frontUrl],
                            ['Back PRC ID', backUrl],
                        ] as const
                    ).map(([t, u]) => (
                        <figure key={t} className="mb-3 grid justify-items-center gap-2">
                            <figcaption className="font-bold">{t}</figcaption>
                            {u && <img src={u} alt={t} className="h-auto w-[200px] rounded-xl border-2 border-black/15" />}
                        </figure>
                    ))}
                    <div className="mx-auto grid max-w-[300px] gap-3">
                        <button type="button" className={wizSecondary} onClick={() => setStep('front')}>
                            Retake Photos
                        </button>
                        <button type="button" className={wizBtn} onClick={() => front && back && onDone(front, back)}>
                            Use Both Photos
                        </button>
                    </div>
                </>
            )}
            <Footer onBack={() => (prev[step] ? setStep(prev[step]) : onClose())} onCancel={onClose} />
        </div>
    );
}

export function PrcModal({
    open,
    initial,
    onClose,
    onDone,
}: {
    open: boolean;
    initial: [File | null, File | null];
    onClose: () => void;
    onDone: (front: File, back: File) => void;
}) {
    return (
        <Modal open={open} onClose={onClose} label="Upload your PRC ID">
            <PrcBody initial={initial} onDone={onDone} onClose={onClose} />
        </Modal>
    );
}

/* --------------------------------------------------------------- Payslip */

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

type PayStep = 'choose' | 'capture' | 'review';

function PayslipBody({ onDone, onClose }: { onDone: (f: File) => void; onClose: () => void }) {
    const [step, setStep] = useState<PayStep>('choose');
    const [mode, setMode] = useState<PhotoMode>('upload');
    const [original, setOriginal] = useState<File | null>(null);
    const [current, setCurrent] = useState<File | null>(null);
    const [cr, setCr] = useState<R | null>(null); // non-null = crop mode
    const [busy, setBusy] = useState(false);
    const [tip, setTip] = useState('');
    const url = useObjectUrl(current);
    const wrap = useRef<HTMLDivElement>(null);
    const drag = useRef<{ k: string; x: number; y: number; r: R } | null>(null);

    const setPhoto = (f: File | null) => {
        setOriginal(f);
        setCurrent(f);
        if (f && mode === 'upload') setStep('review');
    };

    // Edits are baked into a canvas; `current` is always the final image that gets submitted.
    const edit = async (fn: (f: File) => Promise<File>) => {
        if (!current || busy) return;
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

    const tool =
        'min-h-11 rounded-full border border-black/25 bg-white px-4 font-semibold text-black hover:bg-black/5 disabled:opacity-40 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tdfc-coral-ink';

    return (
        <div className="text-center">
            {step === 'choose' && (
                <>
                    <StepHeading>Upload your Payslip</StepHeading>
                    <img src="/images/sample-payslip.png" alt="Sample payslip" className="mx-auto mb-3 h-auto w-[70%] max-w-[260px]" />
                    <ModeChoice
                        what="payslip photo"
                        onPick={(m) => {
                            setMode(m);
                            setStep('capture');
                        }}
                    />
                </>
            )}
            {step === 'capture' && (
                <>
                    <StepHeading>{mode === 'camera' ? 'Take Payslip Photo' : 'Upload Payslip Photo'}</StepHeading>
                    <PhotoSlot mode={mode} alt="Payslip photo" file={current} onChange={setPhoto} />
                    <button type="button" disabled={!current} className={`${wizBtn} mx-auto mt-4 max-w-[300px]`} onClick={() => setStep('review')}>
                        Next
                    </button>
                </>
            )}
            {step === 'review' && url && (
                <>
                    <StepHeading>Review Your Payslip</StepHeading>
                    <div className="mb-3 flex justify-center overflow-hidden rounded-xl bg-neutral-900 p-2">
                        <div ref={wrap} className="relative inline-block leading-none">
                            <img src={url} alt="Payslip preview" className="block max-h-[55dvh] max-w-full" />
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
                        <button type="button" className={tool} disabled={busy} onClick={() => edit((f) => rotate(f, -1, 'payslip.jpg'))}>
                            Rotate left
                        </button>
                        <button type="button" className={tool} disabled={busy} onClick={() => edit((f) => rotate(f, 1, 'payslip.jpg'))}>
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
                                setCurrent(original);
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
                            <button type="button" className={wizSecondary} disabled={busy} onClick={() => edit((f) => crop(f, cr, 'payslip.jpg'))}>
                                Apply crop
                            </button>
                        )}
                        <button type="button" className={wizBtn} disabled={busy || !current} onClick={() => current && onDone(current)}>
                            Use This Photo
                        </button>
                    </div>
                </>
            )}
            <Footer
                onBack={() => {
                    if (step === 'choose') return onClose();
                    setCr(null);
                    setStep(step === 'review' && mode === 'camera' ? 'capture' : 'choose');
                    if (step === 'review' && mode === 'upload') setPhoto(null);
                }}
                onCancel={onClose}
            />
        </div>
    );
}

export function PayslipModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: (f: File) => void }) {
    return (
        <Modal open={open} onClose={onClose} label="Upload your payslip">
            <PayslipBody onDone={onDone} onClose={onClose} />
        </Modal>
    );
}
