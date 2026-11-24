import { InputHTMLAttributes, ReactNode, useId, useState } from 'react';

export const fieldClass =
    'h-12 w-full rounded-tdfc-field border border-tdfc-line bg-card px-3.5 text-[15px] text-foreground placeholder:text-foreground/55 focus:border-tdfc-coral-ink focus:ring-3 focus:ring-tdfc-coral/40 focus:outline-none aria-invalid:border-tdfc-error-line aria-invalid:focus:ring-tdfc-error-line/25';

export type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'> & {
    label: string;
    /** Validation error. Only shown after the field was blurred or `showErrors` is set (submit). */
    error?: string;
    showErrors?: boolean;
    /** Status text that is always shown when there is no visible error (e.g. lookup result). */
    hint?: string;
    hintTone?: 'good' | 'bad';
    trailing?: ReactNode;
    className?: string;
};

export default function TextField({ label, error, showErrors, hint, hintTone, trailing, className = '', onBlur, ...input }: FieldProps) {
    const id = useId();
    const msgId = `${id}-msg`;
    const [touched, setTouched] = useState(false);
    const shownError = touched || showErrors ? error : undefined;
    const text = shownError || hint || '';
    const bad = !!shownError || hintTone === 'bad';

    return (
        <div className={`mb-4 ${className}`}>
            <label htmlFor={id} className="block text-sm font-bold text-tdfc-coral-ink">
                {label}
            </label>
            <div className="relative mt-2">
                <input
                    {...input}
                    id={id}
                    aria-invalid={bad}
                    aria-describedby={msgId}
                    onBlur={(e) => {
                        setTouched(true);
                        onBlur?.(e);
                    }}
                    className={`${fieldClass} ${trailing ? 'pr-12' : ''}`}
                />
                {trailing}
            </div>
            {/* Empty => zero height (no margin, no content). */}
            <div
                id={msgId}
                aria-live="polite"
                className={`mt-1 animate-tdfc-msg text-[13px] leading-[18px] empty:mt-0 ${bad ? 'text-tdfc-error' : hintTone === 'good' ? 'text-tdfc-ok' : 'text-foreground/70'}`}
            >
                {text}
            </div>
        </div>
    );
}
