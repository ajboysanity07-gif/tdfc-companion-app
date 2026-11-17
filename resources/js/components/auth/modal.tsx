import { ReactNode, useEffect, useRef } from 'react';

type Props = { open: boolean; onClose: () => void; label: string; bare?: boolean; className?: string; children: ReactNode };

/**
 * Native <dialog>: showModal() gives the focus trap, inert background, Escape-to-close
 * and focus return to the opener. Children only mount while open (stops cameras etc).
 * `bare` = no chrome, for content that brings its own overlay.
 */
export default function Modal({ open, onClose, label, bare, className = 'max-w-[480px]', children }: Props) {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        const d = ref.current;
        if (!d) return;
        if (open && !d.open) d.showModal();
        if (!open && d.open) d.close();
    }, [open]);

    return (
        <dialog
            ref={ref}
            aria-label={label}
            onClose={onClose}
            className={
                bare
                    ? 'm-0 h-dvh max-h-none w-dvw max-w-none bg-transparent p-0 backdrop:bg-transparent'
                    : `m-auto max-h-[90dvh] w-[calc(100%-32px)] ${className} overflow-auto rounded-2xl bg-white p-5 text-black shadow-tdfc-modal dark:bg-card dark:text-foreground backdrop:animate-tdfc-fade backdrop:bg-black/50 open:animate-tdfc-pop max-sm:open:animate-tdfc-sheet`
            }
        >
            {open && children}
        </dialog>
    );
}
