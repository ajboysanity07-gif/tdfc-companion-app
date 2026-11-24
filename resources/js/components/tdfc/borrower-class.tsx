import Modal from '@/components/auth/modal';
import { btn } from '@/components/tdfc/ui';
import { Info } from 'lucide-react';
import { useState } from 'react';

// Mirrors App\Services\BorrowerClass (wlnmaster): worst loan still owed wins; no loan owed = A.
const CLASSES: Record<string, [string, string]> = {
    A: ['Not past maturity', 'No loan owed, or every loan owed is not yet past its maturity date.'],
    B: ['Under 60 days past maturity', 'A loan you still owe is past maturity by less than 60 days.'],
    C: ['60-89 days past maturity', 'A loan you still owe is past maturity by 60 to 89 days.'],
    D: ['90+ days past maturity', 'A loan you still owe is past maturity by 90 days or more.'],
};

export const classTone: Record<string, string> = {
    A: 'bg-[oklch(.42_.12_155)]',
    B: 'bg-[oklch(.42_.13_262)]',
    C: 'bg-[oklch(.45_.12_55)]',
    D: 'bg-[oklch(.45_.17_25)]',
};

/** Always-visible "Class X (i)" pill that opens the explanation modal. */
export function ClassInfoButton({ cls, className = '' }: { cls?: string | null; className?: string }) {
    const [open, setOpen] = useState(false);
    const known = cls && CLASSES[cls] ? cls : null;
    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-haspopup="dialog"
                aria-label="Borrower class: why this class?"
                className={`inline-flex min-h-9 items-center gap-2 rounded-full pr-3 pl-3.5 text-[13px] font-bold text-white max-md:min-h-11 ${known ? classTone[known] : 'bg-[oklch(.4_.02_250)]'} ${className}`}
            >
                Class {known ?? '–'}
                <Info className="size-4.5" aria-hidden />
            </button>
            <ClassInfoModal open={open} onClose={() => setOpen(false)} cls={known} />
        </>
    );
}

export function ClassInfoModal({ open, onClose, cls }: { open: boolean; onClose: () => void; cls: string | null }) {
    return (
        <Modal open={open} onClose={onClose} label="Borrower class">
            <div className="text-center">
                <h3 className="text-lg font-semibold">{cls ? `Class ${cls} · ${CLASSES[cls][0]}` : 'Class not available'}</h3>
                <p className="mt-1.5 text-muted-foreground">
                    {cls
                        ? CLASSES[cls][1]
                        : 'A loan you still owe is past maturity but has no end date on record, so a class cannot be assigned yet.'}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">Your class follows your most overdue loan that still has a balance.</p>
                <div className="mt-4 grid grid-cols-2 gap-1.5 text-left text-xs sm:grid-cols-4">
                    {Object.entries(CLASSES).map(([k, [label]]) => (
                        <div
                            key={k}
                            className={`rounded-[10px] border p-2 ${k === cls ? `${classTone[k]} border-transparent text-white` : 'border-border text-muted-foreground'}`}
                        >
                            <b>Class {k}</b>
                            <br />
                            {label}
                        </div>
                    ))}
                </div>
                <button onClick={onClose} className={`${btn.base} ${btn.dark} mt-5`}>
                    Got it
                </button>
            </div>
        </Modal>
    );
}
