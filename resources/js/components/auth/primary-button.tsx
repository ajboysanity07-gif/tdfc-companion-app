import { BtnSpinner } from '@/components/tdfc/ui';
import { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'block' | 'pill'; loading?: boolean };

const focus = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tdfc-coral-ink';

export default function PrimaryButton({ variant = 'block', className = '', loading, children, ...p }: Props) {
    const shape = variant === 'block' ? 'h-[52px] w-full rounded-tdfc-btn text-base' : 'h-12 rounded-full px-8 text-sm';
    return (
        <button
            {...p}
            disabled={p.disabled || loading}
            aria-busy={loading || undefined}
            className={`${shape} bg-tdfc-coral font-extrabold tracking-wide text-tdfc-on-coral transition-[color,background-color,transform] active:scale-[0.98] hover:bg-[color-mix(in_oklch,#f57979_88%,black)] disabled:pointer-events-none disabled:opacity-40 ${focus} ${className}`}
        >
            {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                    <BtnSpinner />
                    {children}
                </span>
            ) : (
                children
            )}
        </button>
    );
}

export function SecondaryButton({ className = '', ...p }: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            type="button"
            {...p}
            className={`min-h-12 rounded-full border border-black/15 bg-white px-5 text-sm font-semibold text-black hover:bg-black/5 ${focus} ${className}`}
        />
    );
}
