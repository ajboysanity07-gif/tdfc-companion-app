import { ReactNode, useEffect, useRef } from 'react';

type Props = { open: boolean; onClose: () => void; label: string; bare?: boolean; children: ReactNode };

/**
 * Native <dialog>: showModal() gives the focus trap, inert background, Escape-to-close
 * and focus return to the opener. Children only mount while open (stops cameras etc).
 * `bare` = no chrome, for content that brings its own overlay.
 */
export default function Modal({ open, onClose, label, bare, children }: Props) {
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
                    : 'm-auto max-h-[90dvh] w-[calc(100%-32px)] max-w-[480px] overflow-auto rounded-2xl bg-white p-5 shadow-tdfc-modal backdrop:bg-black/50'
            }
        >
            {open && children}
        </dialog>
    );
}
