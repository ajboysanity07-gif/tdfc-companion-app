import { useState } from 'react';
import Modal from './modal';
import PhotoEditor from './photo-editor';
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

type PrcStep = 'choose' | 'front' | 'editFront' | 'back' | 'editBack' | 'review';

function PrcBody({ initial, onDone, onClose }: { initial: [File | null, File | null]; onDone: (f: File, b: File) => void; onClose: () => void }) {
    const [step, setStep] = useState<PrcStep>('choose');
    const [mode, setMode] = useState<PhotoMode>('upload');
    const [front, setFront] = useState<File | null>(initial[0]);
    const [back, setBack] = useState<File | null>(initial[1]);
    const frontUrl = useObjectUrl(front);
    const backUrl = useObjectUrl(back);
    const prev: Record<PrcStep, PrcStep | null> = { choose: null, front: 'choose', editFront: 'front', back: 'front', editBack: 'back', review: 'back' };

    const isFront = step === 'front' || step === 'editFront';
    const side = isFront ? 'Front' : 'Back';
    const file = isFront ? front : back;
    const setFile = isFront ? setFront : setBack;
    // Picking a file in upload mode goes straight to rotate/crop; camera shots use Next.
    const pick = (f: File | null) => {
        setFile(f);
        if (f && mode === 'upload') setStep(isFront ? 'editFront' : 'editBack');
    };

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
                    <PhotoSlot mode={mode} alt={`${side} PRC ID photo`} file={file} onChange={pick} />
                    <button
                        type="button"
                        disabled={!file}
                        className={`${wizBtn} mx-auto mt-4 max-w-[300px]`}
                        onClick={() => setStep(step === 'front' ? 'editFront' : 'editBack')}
                    >
                        Next
                    </button>
                </>
            )}
            {(step === 'editFront' || step === 'editBack') && file && (
                <>
                    <StepHeading>Adjust {side} PRC ID</StepHeading>
                    <PhotoEditor
                        file={file}
                        name={`prc-${side.toLowerCase()}.jpg`}
                        alt={`${side} PRC ID preview`}
                        doneLabel={isFront ? 'Use This Photo' : 'Done'}
                        onDone={(f) => {
                            setFile(f);
                            setStep(isFront ? 'back' : 'review');
                        }}
                    />
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

type PayStep = 'choose' | 'capture' | 'review';

function PayslipBody({ onDone, onClose }: { onDone: (f: File) => void; onClose: () => void }) {
    const [step, setStep] = useState<PayStep>('choose');
    const [mode, setMode] = useState<PhotoMode>('upload');
    const [current, setCurrent] = useState<File | null>(null);

    const setPhoto = (f: File | null) => {
        setCurrent(f);
        if (f && mode === 'upload') setStep('review');
    };

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
            {step === 'review' && current && (
                <>
                    <StepHeading>Review Your Payslip</StepHeading>
                    <PhotoEditor file={current} name="payslip.jpg" alt="Payslip preview" onDone={onDone} />
                </>
            )}
            <Footer
                onBack={() => {
                    if (step === 'choose') return onClose();
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
