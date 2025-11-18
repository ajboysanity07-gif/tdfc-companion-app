import PayslipFileRow from '@/components/payslip-filerow';
import PRCFileRow from '@/components/prc-filerow';
import AvatarCropModal from '@/components/ui/avatar-crop-modal';
import InputError from '@/components/ui/input-error';
import PayslipWizard from '@/components/ui/payslip-wizard';
import PrcWizard from '@/components/ui/prc-wizard';
import { Head, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, Plus } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

type Props = { adminMode?: boolean };

const Step = ({ children }: { children: React.ReactNode }) => (
    <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
    >
        {children}
    </motion.div>
);

type LookupStatus = 'idle' | 'searching' | 'found' | 'not_found';

export default function Register({ adminMode = false }: Props) {
    const [step, setStep] = useState<1 | 2>(1);
    const [lookupStatus, setLookupStatus] = useState<LookupStatus>('idle');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [pendingAvatarSrc, setPendingAvatarSrc] = useState<string | null>(null);
    const [avatarCropOpen, setAvatarCropOpen] = useState(false);
    const [prcWizardOpen, setPrcWizardOpen] = useState(false);
    const [prcFront, setPrcFront] = useState<File | null>(null);
    const [prcBack, setPrcBack] = useState<File | null>(null);
    const [payName, setPayName] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [pwValid, setPwValid] = useState<boolean | null>(null);
    const [pwMatch, setPwMatch] = useState<boolean | null>(null);
    const [payslipWizardOpen, setPayslipWizardOpen] = useState(false);

    // Duplicate checks - ADDED
    const [duplicateAccount, setDuplicateAccount] = useState(false);
    const [duplicateEmail, setDuplicateEmail] = useState(false);

    const { data, setData, post, processing, errors } = useForm<{
        accntno: string;
        full_name: string;
        phone_no: string;
        email: string;
        password: string;
        password_confirmation: string;
        profile_picture: File | null;
        prc_id_photo_front: File | null;
        prc_id_photo_back: File | null;
        payslip_photo: File | null;
        admin_registration?: boolean;
    }>({
        accntno: '',
        full_name: '',
        phone_no: '',
        email: '',
        password: '',
        password_confirmation: '',
        profile_picture: null,
        prc_id_photo_front: null,
        prc_id_photo_back: null,
        payslip_photo: null,
        admin_registration: adminMode,
    });

    const controller = useRef<AbortController | null>(null);
    const reqIdRef = useRef(0);

    useEffect(() => {
        const q = (data.accntno ?? '').trim();
        if (q.length !== 6) {
            setLookupStatus('idle');
            setData('full_name', '');
            controller.current?.abort();
            return;
        }
        setLookupStatus('searching');
        const thisReqId = ++reqIdRef.current;
        const timer = setTimeout(async () => {
            controller.current?.abort();
            controller.current = new AbortController();
            try {
                const res = await fetch(`/api/wmaster/lookup?acctno=${encodeURIComponent(q)}`, {
                    signal: controller.current.signal,
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                });
                const j = await res.json();
                if (thisReqId !== reqIdRef.current) return;
                if (j?.exists) {
                    setLookupStatus('found');
                    setData('full_name', j.bname ?? '');
                } else {
                    setLookupStatus('not_found');
                    setData('full_name', '');
                }
            } catch {
                /* ignore */
            }
        }, 250);
        return () => clearTimeout(timer);
    }, [data.accntno, setData]);

    useEffect(() => {
        setPwValid(data.password.length === 0 ? null : data.password.length >= 8);
        setPwMatch(data.password_confirmation.length === 0 ? null : data.password_confirmation === data.password);
    }, [data.password, data.password_confirmation]);

    // reset to step 1 on backend validation errors
    useEffect(() => {
        if (step === 2 && Object.keys(errors).length > 0) {
            setStep(1);
        }
    }, [errors, step]);

    // DUPLICATE REG CHECKS
    useEffect(() => {
        if (data.accntno.length === 6) {
            fetch(`/api/check-register-duplicate?accntno=${encodeURIComponent(data.accntno)}`)
                .then((res) => res.json())
                .then((json) => setDuplicateAccount(Boolean(json.accntnoExists)))
                .catch(() => setDuplicateAccount(false));
        } else {
            setDuplicateAccount(false);
        }
    }, [data.accntno]);
    useEffect(() => {
        if (data.email.length > 3) {
            fetch(`/api/check-register-duplicate?email=${encodeURIComponent(data.email)}`)
                .then((res) => res.json())
                .then((json) => setDuplicateEmail(Boolean(json.emailExists)))
                .catch(() => setDuplicateEmail(false));
        } else {
            setDuplicateEmail(false);
        }
    }, [data.email]);

    // ---- ADDED: Helper to clear errors and duplicate flags on step change ----
    const clearStep1State = () => {
        (Object.keys(errors) as Array<keyof typeof errors>).forEach((key) => {
            (errors as Record<string, string>)[key] = '';
        });
        setDuplicateEmail(false);
        setDuplicateAccount(false);
    };

    // ---- ADDED: NEXT Step1 handler ----
    const handleStep1Next = () => {
        clearStep1State();
        setStep(2);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = adminMode ? '/admin-registration' : '/register';
        post(url, { forceFormData: true });
    };

    const inputBase =
        'mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-black placeholder:text-gray-400 outline-none focus:border-[#F57979] focus:ring-2 focus:ring-[#F57979]/50';

    const canProceed = lookupStatus === 'found' && pwValid === true && pwMatch === true && !processing && !duplicateAccount && !duplicateEmail;

    const canRegister = canProceed && data.prc_id_photo_front && data.prc_id_photo_back && data.payslip_photo;

    const getPrcStatusDisplay = () => {
        if (prcFront && prcBack) return 'Front & Back completed ✓';
        if (prcFront) return 'Front completed, back pending';
        if (prcBack) return 'Back completed, front pending';
        return 'Click to upload...';
    };

    return (
        <>
            <Head title="Register" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-gray-100 via-white to-gray-200 p-6 sm:p-10">
                <form onSubmit={submit} className="flex w-full max-w-full flex-col items-center">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <Step key="s1">
                                {Object.keys(errors).length > 0 && (
                                    <div className="mx-auto mb-4 w-full max-w-[400px]">
                                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
                                            {Object.values(errors).map((msg, i) => (
                                                <div key={i}>{msg}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="mx-auto mb-6 max-w-[430px] text-center">
                                    <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-[#F57979]">Register</h1>
                                    <p className="mx-auto max-w-[44ch] text-base leading-6 text-black/70">
                                        To register, use the account number provided to you and your phone number registered with us. Please enter an
                                        active email address and create a secure password.
                                    </p>
                                </div>
                                <div className="mx-auto mt-4 mb-4 w-full max-w-[400px] rounded-2xl bg-[#ededed] px-5 py-8 shadow">
                                    <div className="mb-5">
                                        <label className="text-[14px] font-bold text-[#F57979]">Account Number</label>
                                        <input
                                            value={data.accntno}
                                            onChange={(e) => {
                                                setData('accntno', e.target.value.replace(/\s/g, '').slice(0, 6));
                                                if (errors.accntno) errors.accntno = '';
                                                setDuplicateAccount(false); // <-- clear flag on change
                                            }}
                                            maxLength={6}
                                            placeholder="Enter account number"
                                            aria-invalid={!!(errors.accntno || lookupStatus === 'not_found') || duplicateAccount}
                                            className={inputBase}
                                        />
                                        <div className="mt-1 min-h-5 text-xs" role="status" aria-live="polite">
                                            {duplicateAccount ? (
                                                <span className="text-[#DC2626]">Account number is already registered.</span>
                                            ) : errors.accntno ? (
                                                <span className="text-[#DC2626]">{errors.accntno}</span>
                                            ) : (
                                                <span className="text-black/70">
                                                    {lookupStatus === 'searching' && 'Checking...'}
                                                    {lookupStatus === 'not_found' && 'Account number not found.'}
                                                    {lookupStatus === 'found' && data.full_name && `This account no belongs to ${data.full_name}.`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <input type="hidden" value={data.full_name} readOnly />
                                    <div className="mb-5">
                                        <label className="text-[14px] font-bold text-[#F57979]">Phone Number</label>
                                        <input
                                            value={data.phone_no}
                                            inputMode="numeric"
                                            onChange={(e) => {
                                                setData('phone_no', e.target.value.replace(/\D/g, '').slice(0, 11));
                                                if (errors.phone_no) errors.phone_no = '';
                                            }}
                                            placeholder="09xxxxxxxxx"
                                            aria-invalid={!!errors.phone_no}
                                            className={inputBase}
                                        />
                                        <InputError key={data.phone_no} message={errors.phone_no} />
                                    </div>
                                    <div className="mb-5">
                                        <label className="text-[14px] font-bold text-[#F57979]">Email</label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => {
                                                setData('email', e.target.value);
                                                if (errors.email) errors.email = '';
                                                setDuplicateEmail(false); // <-- clear flag on change
                                            }}
                                            placeholder="you@example.com"
                                            aria-invalid={!!errors.email || duplicateEmail}
                                            className={inputBase}
                                        />
                                        <InputError key={data.email} message={duplicateEmail ? 'Email is already registered.' : errors.email} />
                                    </div>
                                    <div className="mb-5">
                                        <label className="text-[14px] font-bold text-[#F57979]">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="Minimum 8 characters"
                                                aria-invalid={pwValid === false || !!errors.password}
                                                className={`${inputBase} pr-10 ${
                                                    pwValid === false ? 'border-red-300 focus:border-red-400 focus:ring-red-300' : ''
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((v) => !v)}
                                                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        <InputError
                                            key={data.password}
                                            message={errors.password ? errors.password : pwValid === false ? 'Minimum 8 characters.' : ''}
                                        />
                                    </div>
                                    <div className="mb-6">
                                        <label className="text-[14px] font-bold text-[#F57979]">Confirm Password</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                placeholder="Re-enter your password"
                                                aria-invalid={pwMatch === false || !!errors.password_confirmation}
                                                className={`${inputBase} pr-10 ${
                                                    pwMatch === false ? 'border-red-300 focus:border-red-400 focus:ring-red-300' : ''
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword((v) => !v)}
                                                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        <div className="mt-1 min-h-5 text-xs" role="status" aria-live="polite">
                                            {errors.password_confirmation ? (
                                                <span className="text-[#DC2626]">{errors.password_confirmation}</span>
                                            ) : pwMatch === false ? (
                                                <span className="text-[#DC2626]">Passwords do not match.</span>
                                            ) : pwMatch === true ? (
                                                <span className="text-emerald-600">Passwords match.</span>
                                            ) : (
                                                <span className="invisible">.</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleStep1Next}
                                        disabled={!canProceed}
                                        className="mt-2 w-full rounded-lg bg-[#F57979] py-4 text-lg font-extrabold text-white shadow hover:scale-[1.01] disabled:opacity-40"
                                    >
                                        NEXT
                                    </button>
                                </div>
                                <p className="mt-4 text-center text-sm text-black/70">
                                    Already have an account?{' '}
                                    <a href="/login" className="font-semibold text-[#F57979] hover:underline">
                                        Log in
                                    </a>
                                </p>
                            </Step>
                        ) : (
                            <Step key="s2">
                                <div className="mx-auto mb-6 max-w-[430px] text-center">
                                    <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-[#F57979]">Register</h1>
                                    <p className="mx-auto max-w-[44ch] text-base leading-6 text-black/70">
                                        Upload a CLEAR picture of your valid PRC ID for verification, a profile photo of yourself, and your latest
                                        payslip.
                                    </p>
                                </div>
                                <div className="mx-auto mt-4 mb-4 w-full max-w-[400px] rounded-2xl bg-[#ededed] px-5 py-8 shadow">
                                    {/* Profile Picture Upload */}
                                    <div className="mb-8">
                                        <label className="mb-2 block text-[14px] font-bold text-[#F57979]">Upload Profile Picture</label>
                                        <div className="flex items-center gap-4">
                                            <button
                                                type="button"
                                                className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#F57979] bg-white active:border-[#F57979]/60"
                                                onClick={() => {
                                                    const input = document.createElement('input');
                                                    input.type = 'file';
                                                    input.accept = 'image/*';
                                                    input.onchange = (e: Event) => {
                                                        const target = e.target as HTMLInputElement;
                                                        const f = target.files?.[0];
                                                        if (!f) return;
                                                        const url = URL.createObjectURL(f);
                                                        setPendingAvatarSrc(url);
                                                        setAvatarCropOpen(true);
                                                    };
                                                    input.click();
                                                }}
                                            >
                                                {avatarUrl ? (
                                                    <img src={avatarUrl} alt="Profile preview" className="h-full w-full rounded-full object-cover" />
                                                ) : (
                                                    <span className="flex h-full w-full items-center justify-center">
                                                        <span className="rounded-full bg-green-100 p-3 text-green-600">
                                                            <Plus className="h-7 w-7" />
                                                        </span>
                                                    </span>
                                                )}
                                            </button>
                                            <p className="text-sm leading-6 text-black/60">
                                                Tap the circle to upload your profile photo.
                                                <br />
                                                Crop will open before saving.
                                            </p>
                                        </div>
                                    </div>

                                    {/* PRC File Row */}
                                    <PRCFileRow
                                        valueFront={prcFront}
                                        valueBack={prcBack}
                                        onClick={() => setPrcWizardOpen(true)}
                                        display={getPrcStatusDisplay()}
                                    />

                                    {/* Payslip File Row */}
                                    <PayslipFileRow
                                        value={data.payslip_photo}
                                        onClick={() => setPayslipWizardOpen(true)}
                                        display={payName ?? undefined}
                                    />

                                    <div className="mt-6 flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-black/80 hover:bg-black/5"
                                        >
                                            ← Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!canRegister}
                                            className="rounded-full bg-[#F57979] px-8 py-3 text-sm font-extrabold tracking-wide text-white hover:opacity-95 disabled:opacity-40"
                                        >
                                            REGISTER
                                        </button>
                                    </div>
                                </div>
                            </Step>
                        )}
                    </AnimatePresence>
                </form>
            </div>
            {avatarCropOpen && pendingAvatarSrc && (
                <AvatarCropModal
                    src={pendingAvatarSrc}
                    aspect={1}
                    onCancel={() => {
                        setAvatarCropOpen(false);
                        URL.revokeObjectURL(pendingAvatarSrc);
                        setPendingAvatarSrc(null);
                    }}
                    onCroppedFile={(file) => {
                        const url = URL.createObjectURL(file);
                        setData('profile_picture', file);
                        setAvatarUrl(url);
                        setAvatarCropOpen(false);
                    }}
                />
            )}
            <PrcWizard
                open={prcWizardOpen}
                onCancel={() => setPrcWizardOpen(false)}
                onComplete={(front, back) => {
                    setPrcFront(front);
                    setPrcBack(back);
                    setData('prc_id_photo_front', front);
                    setData('prc_id_photo_back', back);
                    setPrcWizardOpen(false);
                }}
            />
            <PayslipWizard
                open={payslipWizardOpen}
                onCancel={() => setPayslipWizardOpen(false)}
                onComplete={(file) => {
                    setData('payslip_photo', file);
                    setPayName(file?.name || null);
                    setPayslipWizardOpen(false);
                }}
            />
        </>
    );
}
