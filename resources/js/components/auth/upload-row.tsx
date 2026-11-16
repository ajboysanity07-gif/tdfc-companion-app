import { Plus } from 'lucide-react';
import { useId } from 'react';

type Props = {
    label: string;
    required?: boolean;
    /** Status text; shows `placeholder` until something is chosen. */
    text?: string;
    placeholder?: string;
    done?: boolean;
    onClick: () => void;
    error?: string;
};

export default function UploadRow({ label, required, text, placeholder = 'Click to upload...', done, onClick, error }: Props) {
    const id = useId();
    return (
        <div className="mb-7">
            <span id={`${id}-l`} className="mb-2 block text-sm font-bold text-tdfc-coral-ink">
                {label} {required && <span aria-hidden>*</span>}
            </span>
            <button
                type="button"
                onClick={onClick}
                aria-haspopup="dialog"
                aria-labelledby={`${id}-l ${id}-t`}
                aria-describedby={`${id}-m`}
                className="flex min-h-[52px] w-full items-center gap-3 rounded-tdfc-field border border-black/15 bg-white px-4 py-2 text-left hover:border-tdfc-coral/60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tdfc-coral-ink"
            >
                <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-green-100 text-green-600">
                    <Plus className="h-5 w-5" aria-hidden />
                </span>
                <span id={`${id}-t`} className={`min-w-0 flex-1 truncate ${done ? 'font-semibold text-emerald-600' : 'text-black/55'}`}>
                    {text || placeholder}
                </span>
                <small className="text-xs text-black/55">JPEG/PNG/WEBP</small>
            </button>
            <div id={`${id}-m`} aria-live="polite" className="mt-1 animate-tdfc-msg text-[13px] leading-[18px] text-tdfc-error empty:mt-0">
                {error}
            </div>
        </div>
    );
}
