import PayslipFileRow from '@/components/auth/register/payslip-filerow';
import PayslipWizard from '@/components/auth/register/payslip-wizard';
import PRCFileRow from '@/components/auth/register/prc-filerow';
import PrcWizard from '@/components/auth/register/prc-wizard';
import AvatarCropModal from '@/components/ui/avatar-crop-modal';
import PWAInstallPrompt from '@/components/pwa-install-prompt';
import AuthCardLayout from '@/layouts/auth/auth-card-layout';
import { Head } from '@inertiajs/react';
import { AxiosError } from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, CircleCheckBig, CircleX, Eye, EyeOff, Plus } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { register as apiRegister } from '../../api/auth-api';

type Props = { adminMode?: boolean };

const Step = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

type LookupStatus = 'idle' | 'searching' | 'found' | 'not_found';

type RegisterFormState = {
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
};

const initialFormState: RegisterFormState = {
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
    admin_registration: false,
};

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
    const [payslipWizardOpen, setPayslipWizardOpen] = useState(false);
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const phoneReqIdRef = useRef(0);
    const [phoneStatus, setPhoneStatus] = useState<'idle' | 'checking' | 'duplicate' | 'ok' | 'error'>('idle');
    const emailReqIdRef = useRef(0);
    const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'duplicate' | 'invalid' | 'ok' | 'error'>('idle');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [pwValid, setPwValid] = useState<boolean | null>(null);
    const [pwMatch, setPwMatch] = useState<boolean | null>(null);

    // Field errors direct from Laravel backend!
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);

    // Duplicate checks
    const [duplicateAccount, setDuplicateAccount] = useState(false);
    const [form, setForm] = useState<RegisterFormState>({
        ...initialFormState,
        admin_registration: adminMode,
    });

    const controller = useRef<AbortController | null>(null);
    const reqIdRef = useRef(0);

    useEffect(() => {
        const q = (form.accntno ?? '').trim();
        if (q.length !== 6) {
            setLookupStatus('idle');
            setForm((prev) => ({ ...prev, full_name: '' }));
            controller.current?.abort();
            return;
        }
        setLookupStatus('searching');
        const thisReqId = ++reqIdRef.current;
        const timer = setTimeout(async () => {
            controller.current?.abort();
            controller.current = new AbortController();
            try {
                const res = await fetch(`/api/wmaster-lookup?acctno=${encodeURIComponent(q)}`, {
                    signal: controller.current.signal,
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                });
                const j = await res.json();
                if (thisReqId !== reqIdRef.current) return;
                if (j?.exists) {
                    setLookupStatus('found');
                    setForm((prev) => ({
                        ...prev,
                        full_name: j.bname ?? '',
                    }));
                } else {
                    setLookupStatus('not_found');
                    setForm((prev) => ({ ...prev, full_name: '' }));
                }
            } catch {
                if (thisReqId === reqIdRef.current) {
                    setLookupStatus('not_found');
                    setForm((prev) => ({ ...prev, full_name: '' }));
                }
            }
        }, 250);
        return () => clearTimeout(timer);
    }, [form.accntno]);

    useEffect(() => {
        setPwValid(form.password.length === 0 ? null : form.password.length >= 8);
        setPwMatch(form.password_confirmation.length === 0 ? null : form.password_confirmation === form.password);
    }, [form.password, form.password_confirmation]);

    // duplicate checks (same as your useEffect logic)
    useEffect(() => {
        if (form.accntno.length === 6) {
            fetch(`/api/check-register-duplicate?accntno=${encodeURIComponent(form.accntno)}`)
                .then((res) => res.json())
                .then((json) => setDuplicateAccount(json.accntnoExists === true))
                .catch(() => setDuplicateAccount(false));
        } else {
            setDuplicateAccount(false);
        }
    }, [form.accntno]);

    useEffect(() => {
        const value = form.email.trim().toLowerCase();
        const thisReqId = ++emailReqIdRef.current;

        if (value.length < 4) {
            setEmailStatus('idle');
            return;
        }

        const emailFormatOk = /\S+@\S+\.\S+/.test(value);
        if (!emailFormatOk) {
            setEmailStatus('invalid');
            return;
        }

        setEmailStatus('checking');
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/check-register-duplicate?email=${encodeURIComponent(value)}`, {
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                });
                if (thisReqId !== emailReqIdRef.current) return;
                if (!res.ok) throw new Error('dup-check-failed');

                const json = await res.json();
                const emailExists = json.emailExists === true;
                setEmailStatus(emailExists ? 'duplicate' : 'ok');
            } catch {
                if (thisReqId !== emailReqIdRef.current) return;
                setEmailStatus('error'); // block if we can't verify
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [form.email]);
    const clearStep1State = () => {
        setFieldErrors({});
        setDuplicateAccount(false);
    };

    const handleStep1Next = () => {
        clearStep1State();
        setStep(2);
    };
    useEffect(() => {
        const value = form.phone_no.trim();

        if (!value) {
            setPhoneError(null);
            setPhoneStatus('idle');
            return;
        }
        if (!/^\d+$/.test(value)) {
            setPhoneError('Phone must be numbers only.');
            setPhoneStatus('idle');
            return;
        }
        if (!value.startsWith('09')) {
            setPhoneError('Phone must start with 09.');
            setPhoneStatus('idle');
            return;
        }
        if (value.length !== 11) {
            setPhoneError('Phone must be exactly 11 digits.');
            setPhoneStatus('idle');
            return;
        }
        setPhoneError(null);

        const thisReqId = ++phoneReqIdRef.current;
        setPhoneStatus('checking');
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/check-register-duplicate?phone_no=${encodeURIComponent(value)}`, {
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                });
                if (thisReqId !== phoneReqIdRef.current) return;
                if (!res.ok) throw new Error('dup-check-failed');
                const json = await res.json();
                const exists = json.phoneExists === true;
                setPhoneStatus(exists ? 'duplicate' : 'ok');
            } catch {
                if (thisReqId !== phoneReqIdRef.current) return;
                setPhoneStatus('error');
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [form.phone_no]);

    // Handle field change (for all inputs)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, files } = e.target;
        if (files) {
            setForm((prev) => ({ ...prev, [name]: files[0] }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
        if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: [] }));
    };
    // Submit form! -- use your API, and grab errors from backend
    const normalizeErrors = (errors: Record<string, string[]>) => ({
        ...errors,
        phone_no: errors.phone_no ?? errors.phoneno,
    });

    // Submit form! -- use your API, and grab errors from backend
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});
        setGlobalError(null);
        setSuccess(false);
        setLoading(true);

        // Fill formData object for files + text
        const buildFormData = (form: RegisterFormState) => {
            const fd = new FormData();
            fd.append('accntno', form.accntno);
            fd.append('fullname', form.full_name ?? '');
            fd.append('phoneno', form.phone_no);
            fd.append('email', form.email);
            fd.append('password', form.password);
            fd.append('password_confirmation', form.password_confirmation);
            if (form.profile_picture) fd.append('profilepicture', form.profile_picture);
            if (form.prc_id_photo_front) fd.append('prcidphotofront', form.prc_id_photo_front);
            if (form.prc_id_photo_back) fd.append('prcidphotoback', form.prc_id_photo_back);
            if (form.payslip_photo) fd.append('payslipphoto', form.payslip_photo);
            return fd;
        };
        const fd = buildFormData(form);

        Object.entries(form).forEach(([k, v]) => {
            if (v !== undefined && v !== null) {
                fd.append(k, v as string | Blob);
            }
        });

        try {
            await apiRegister(fd);
            setSuccess(true);
            setForm({
                ...initialFormState,
                admin_registration: adminMode,
            });
            setAvatarUrl(null);
            setPayName(null);
            setPrcFront(null);
            setPrcBack(null);
            // Redirect to login after successful registration
            window.location.href = '/login';
        } catch (err) {
            const error = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
            setSuccess(false);
            if (error.response && error.response.data) {
                setFieldErrors(normalizeErrors(error.response.data.errors || {}));
                setGlobalError(error.response.data.message ?? null);
            } else {
                setGlobalError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const inputBase =
        'mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-black placeholder:text-gray-400 outline-none focus:border-[#F57979] focus:ring-2 focus:ring-[#F57979]/50';
    const phoneValid = phoneError === null && form.phone_no.trim().length === 11;
    const emailValid = emailStatus === 'ok';

    const canProceed =
        lookupStatus === 'found' &&
        pwValid === true &&
        pwMatch === true &&
        phoneValid &&
        phoneStatus === 'ok' &&
        emailValid &&
        !loading &&
        !duplicateAccount;

    const canRegister = canProceed && form.prc_id_photo_front && form.prc_id_photo_back && form.payslip_photo;

    const stepDescription =
        step === 1
            ? 'To register, use the account number provided to you and your phone number registered with us. Please enter an active email address and create a secure password.'
            : 'Upload a CLEAR picture of your valid PRC ID for verification, and a photo of yourself to use as your profile picture.';

        const getPrcStatusDisplay = () => {
        if (prcFront && prcBack)
            return (
                <span className="flex items-center gap-2 text-emerald-600">
                    <Check className="h-4 w-4" />
                    Front & Back completed.
                </span>
            );
        if (prcFront) return 'Front completed, back pending';
        if (prcBack) return 'Back completed, front pending';
        return 'Click to upload...';
    };

    return (
        <>
            <Head title="Register" />
            <AnimatePresence>
                {(success || globalError) && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2"
                    >
                        {success ? (
                            <div className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 flex items-center gap-2">
                                <CircleCheckBig className="h-4 w-4" />
                                <span>Registration successful!</span>
                            </div>
                        ) : null}
                        {globalError ? (
                            <div className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-900/30 flex items-center gap-2">
                                <CircleX className="h-4 w-4" />
                                <span>{globalError}</span>
                            </div>
                        ) : null}
                    </motion.div>
                )}
            </AnimatePresence>

            <AuthCardLayout
                title="Register"
                description={stepDescription}
                descriptionClassName="min-h-[7.5rem] sm:min-h-[5.25rem]"
                align="start"
                cardMotionKey={step}
                cardMotionProps={{
                    initial: { y: 32 },
                    animate: { y: 0 },
                    exit: { y: -32 },
                    transition: { duration: 0.25, ease: 'easeOut' },
                }}
                footer={
                    <>
                        Already have an account?{' '}
                        <a href="/login" className="font-semibold text-[#F57979] hover:underline">
                            Log in
                        </a>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="flex w-full flex-col items-stretch">
                    <div className="relative w-full overflow-hidden">
                        <AnimatePresence mode="wait" initial={false}>
                            {step === 1 ? (
                                <Step key="s1">
                                <div className="mt-0 mb-0 w-full space-y-4">
                                    {/* Account No */}
                                    <div>
                                        <label className="text-[14px] font-bold text-[#F57979]">Account Number</label>
                                    <input
                                        name="accntno"
                                        type="text"
                                        value={form.accntno}
                                        onChange={handleChange}
                                        maxLength={6}
                                        placeholder="Enter account number"
                                        className={inputBase}
                                    />
                                    <div className="mt-1 min-h-5 text-xs" role="status" aria-live="polite">
                                        {fieldErrors.accntno ? (
                                            <span className="text-red-500">{fieldErrors.accntno.join(', ')}</span>
                                        ) : duplicateAccount ? (
                                            <span className="text-[#DC2626]">Account number is already registered.</span>
                                        ) : (
                                            <span className="text-black/70">
                                                {lookupStatus === 'searching' && 'Checking...'}
                                                {lookupStatus === 'not_found' && 'Account number not found.'}
                                                {lookupStatus === 'found' && form.full_name && (
                                                    <>
                                                        This account no belongs to{' '}
                                                        <span className="font-semibold text-black">
                                                            {form.full_name}
                                                        </span>
                                                        .
                                                    </>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    </div>
                                    {/* Phone Number */}
                                    <div>
                                        <label className="text-[14px] font-bold text-[#F57979]">Phone Number</label>
                                        <input
                                            name="phone_no"
                                            type="text"
                                            maxLength={11}
                                            value={form.phone_no}
                                            onChange={handleChange}
                                            inputMode="numeric"
                                            placeholder="09xxxxxxxxx"
                                            className={inputBase}
                                        />
                                        <div className="mt-1 min-h-[18px] text-xs" role="status" aria-live="polite">
                                            {phoneError ? (
                                                <span className="text-red-500">{phoneError}</span>
                                            ) : fieldErrors.phone_no ? (
                                                <span className="text-red-500">{fieldErrors.phone_no.join(', ')}</span>
                                            ) : phoneStatus === 'checking' ? (
                                                <span className="text-black/70">Checking phone...</span>
                                            ) : phoneStatus === 'duplicate' ? (
                                                <span className="text-red-500">Phone number is already registered.</span>
                                            ) : phoneStatus === 'error' ? (
                                                <span className="text-red-500">Could not verify phone. Please try again.</span>
                                            ) : phoneStatus === 'ok' ? (
                                                <span className="text-emerald-600">Phone number looks good.</span>
                                            ) : null}
                                        </div>
                                    </div>
                                    {/* Email */}
                                    <div>
                                        <label className="text-[14px] font-bold text-[#F57979]">Email</label>
                                        <input
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="you@example.com"
                                            className={inputBase}
                                        />
                                        <div className="mt-1 min-h-[18px] text-xs" role="status" aria-live="polite">
                                            {fieldErrors.email ? (
                                                <span className="text-red-500">{fieldErrors.email.join(', ')}</span>
                                            ) : emailStatus === 'checking' ? (
                                                <span className="text-black/70">Checking...</span>
                                            ) : emailStatus === 'duplicate' ? (
                                                <span className="text-red-500">Email is already registered.</span>
                                            ) : emailStatus === 'invalid' ? (
                                                <span className="text-red-500">Enter a valid email (e.g. user@mail.com).</span>
                                            ) : emailStatus === 'error' ? (
                                                <span className="text-red-500">Could not verify email. Please try again.</span>
                                            ) : emailStatus === 'ok' ? (
                                                <span className="text-emerald-600">Email looks good.</span>
                                            ) : null}
                                        </div>
                                    </div>
                                    {/* Password */}
                                    <div>
                                        <label className="text-[14px] font-bold text-[#F57979]">Password</label>
                                        <div className="relative">
                                            <input
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={form.password}
                                                onChange={handleChange}
                                                placeholder="Minimum 8 characters"
                                                className={`${inputBase} pr-10 ${pwValid === false ? 'border-red-300 focus:border-red-400 focus:ring-red-300' : ''}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((v) => !v)}
                                                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                                tabIndex={-1}
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        <div className="mt-1 min-h-[18px] text-xs text-red-500">
                                            {fieldErrors.password && fieldErrors.password.join(', ')}
                                            {!fieldErrors.password && pwValid === false ? 'Minimum 8 characters.' : ''}
                                        </div>
                                    </div>
                                    {/* Password Confirmation */}
                                    <div>
                                        <label className="text-[14px] font-bold text-[#F57979]">Confirm Password</label>
                                        <div className="relative">
                                            <input
                                                name="password_confirmation"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={form.password_confirmation}
                                                onChange={handleChange}
                                                placeholder="Re-enter your password"
                                                className={`${inputBase} pr-10 ${pwMatch === false ? 'border-red-300 focus:border-red-400 focus:ring-red-300' : ''}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword((v) => !v)}
                                                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                                tabIndex={-1}
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        <div className="mt-1 min-h-[18px] text-xs" role="status" aria-live="polite">
                                            {fieldErrors.password_confirmation ? (
                                                <span className="text-red-500">{fieldErrors.password_confirmation.join(', ')}</span>
                                            ) : pwMatch === false ? (
                                                <span className="text-red-500">Passwords do not match.</span>
                                            ) : pwMatch === true ? (
                                                <span className="text-emerald-600">Passwords match.</span>
                                            ) : null}
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
                            </Step>
                        ) : (
                                <Step key="s2">
                                <div className="mt-0 mb-0 w-full space-y-4">
                                    {/* Profile Picture Upload */}
                                    <div>
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
                                        {fieldErrors.profile_picture && (
                                            <div className="mt-1 min-h-[18px] text-xs text-red-500">
                                                {fieldErrors.profile_picture.join(', ')}
                                            </div>
                                        )}
                                    </div>

                                    {/* PRC File Row */}
                                    <PRCFileRow
                                        valueFront={prcFront}
                                        valueBack={prcBack}
                                        onClick={() => setPrcWizardOpen(true)}
                                        display={getPrcStatusDisplay()}
                                    />
                                    {fieldErrors.prc_id_photo_front && (
                                        <div className="mt-1 text-xs text-red-500">
                                            {fieldErrors.prc_id_photo_front.join(', ')}
                                        </div>
                                    )}
                                    {fieldErrors.prc_id_photo_back && (
                                        <div className="text-xs text-red-500">
                                            {fieldErrors.prc_id_photo_back.join(', ')}
                                        </div>
                                    )}

                                    {/* Payslip File Row */}
                                    <PayslipFileRow
                                        value={form.payslip_photo}
                                        onClick={() => setPayslipWizardOpen(true)}
                                        display={
                                            form.payslip_photo ? (
                                                <span className="flex items-center gap-2 text-emerald-600">
                                                    <Check className="h-4 w-4" />
                                                    Payslip uploaded.
                                                </span>
                                            ) : (
                                                payName ?? undefined
                                            )
                                        }
                                    />
                                    {fieldErrors.payslip_photo && (
                                        <div className="mt-1 text-xs text-red-500">
                                            {fieldErrors.payslip_photo.join(', ')}
                                        </div>
                                    )}

                                    <div className="mt-4 flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-black/80 hover:bg-black/5"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                            Back
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
                    </div>
                </form>
            </AuthCardLayout>
       

            {/* Modal overlays: Avatar crop, PRC and Payslip wizard */}
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
                        setForm((prev) => ({ ...prev, profile_picture: file }));
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
                    setForm((prev) => ({
                        ...prev,
                        prc_id_photo_front: front,
                        prc_id_photo_back: back,
                    }));
                    setPrcWizardOpen(false);
                }}
            />
            <PayslipWizard
                open={payslipWizardOpen}
                onCancel={() => setPayslipWizardOpen(false)}
                onComplete={(file) => {
                    setForm((prev) => ({ ...prev, payslip_photo: file }));
                    setPayName(typeof file?.name === 'string' ? file.name : null);
                    setPayslipWizardOpen(false);
                }}
            />
            
            {/* PWA Install Prompt */}
            <PWAInstallPrompt />
        </>
    );
}







