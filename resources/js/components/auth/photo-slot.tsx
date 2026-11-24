import { normalize } from '@/lib/image-edit';
import { useEffect, useRef, useState } from 'react';

export type PhotoMode = 'upload' | 'camera';

const ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];

export function useObjectUrl(f: File | null) {
    const [url, setUrl] = useState<string | null>(null);
    useEffect(() => {
        if (!f) return setUrl(null);
        const u = URL.createObjectURL(f);
        setUrl(u);
        return () => URL.revokeObjectURL(u);
    }, [f]);
    return url;
}

/** Heading that takes focus when a wizard step appears, so keyboard users don't lose their place. */
export function StepHeading({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLHeadingElement>(null);
    useEffect(() => ref.current?.focus(), []);
    return (
        <h3 ref={ref} tabIndex={-1} className="mb-3 text-xl font-bold text-tdfc-coral-ink outline-none">
            {children}
        </h3>
    );
}

export const wizBtn =
    'flex min-h-[52px] w-full items-center justify-center rounded-tdfc-btn bg-tdfc-coral px-4 font-bold text-tdfc-on-coral hover:bg-[color-mix(in_oklch,var(--brand-red)_88%,black)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tdfc-coral-ink disabled:opacity-40';
export const wizSecondary =
    'min-h-11 w-full rounded-full border border-brand-blue bg-blue-soft px-4 font-semibold text-blue-text hover:bg-blue-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tdfc-coral-ink';

const box =
    'grid min-h-[150px] w-full place-items-center overflow-hidden rounded-tdfc-btn border-2 border-dashed border-foreground/20 bg-card text-sm text-foreground/60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tdfc-coral-ink';

type Props = { mode: PhotoMode; alt: string; file: File | null; onChange: (f: File | null) => void };

/**
 * One photo, two sources.
 * upload: real file picker (images only). camera: live preview, tap to capture, tap the photo to retake.
 * Output is always a normalized JPEG (see lib/image-edit).
 */
export default function PhotoSlot({ mode, alt, file, onChange }: Props) {
    const [err, setErr] = useState('');
    const [tries, setTries] = useState(0);
    const url = useObjectUrl(file);
    const input = useRef<HTMLInputElement>(null);
    const video = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (mode !== 'camera' || file) return;
        if (!navigator.mediaDevices?.getUserMedia) return setErr('Camera is not available in this browser or on this page (HTTPS is required).');
        let stream: MediaStream | undefined;
        let dead = false;
        setErr('');
        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 } }, audio: false })
            .then((s) => {
                if (dead) return s.getTracks().forEach((t) => t.stop());
                stream = s;
                if (video.current) video.current.srcObject = s;
            })
            .catch(() => !dead && setErr('Camera unavailable or permission denied. Allow camera access, then tap here to try again.'));
        return () => {
            dead = true;
            stream?.getTracks().forEach((t) => t.stop());
        };
    }, [mode, file, tries]);

    const pick = async (f?: File) => {
        if (!f) return;
        if (!ACCEPT.includes(f.type)) return setErr('Please choose an image file (JPG, PNG or WEBP).');
        setErr('');
        try {
            onChange(await normalize(f, 'photo.jpg'));
        } catch {
            setErr('That image could not be read. Try another photo.');
        }
    };

    const capture = async () => {
        if (err) return setTries((t) => t + 1);
        const v = video.current;
        if (!v?.videoWidth) return;
        try {
            onChange(await normalize(v, 'photo.jpg'));
        } catch {
            setErr('Could not capture the photo. Tap to try again.');
        }
    };

    if (mode === 'upload') {
        return (
            <>
                <input
                    ref={input}
                    type="file"
                    accept={ACCEPT.join(',')}
                    hidden
                    onChange={(e) => {
                        pick(e.target.files?.[0]);
                        e.target.value = '';
                    }}
                />
                <button type="button" className={box} onClick={() => input.current?.click()}>
                    {url ? <img src={url} alt={alt} className="h-auto w-full" /> : 'Tap to choose a photo'}
                </button>
                {url && <p className="mt-2 text-xs text-foreground/60">Tap the photo to choose a different one.</p>}
                <p role="alert" className="mt-2 text-[13px] text-tdfc-error empty:hidden">
                    {err}
                </p>
            </>
        );
    }

    return (
        <>
            {url ? (
                <button type="button" className={box} onClick={() => onChange(null)} aria-label="Retake photo">
                    <img src={url} alt={alt} className="h-auto w-full" />
                </button>
            ) : (
                <button type="button" className={`${box} bg-neutral-900 text-white`} onClick={capture} aria-label="Capture photo">
                    {err ? (
                        <span className="p-3">{err}</span>
                    ) : (
                        <video ref={video} autoPlay muted playsInline className="max-h-[60dvh] w-full object-contain" />
                    )}
                </button>
            )}
            <p className="mt-2 text-xs text-foreground/60">
                {url ? 'Tap the photo to retake.' : 'Fit the whole document in view, then tap the preview to capture.'}
            </p>
        </>
    );
}
