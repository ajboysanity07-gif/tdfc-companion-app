import AuthCard, { linkClass } from '@/components/auth/auth-card';
import { PayslipModal, PrcModal } from '@/components/auth/capture-wizards';
import Modal from '@/components/auth/modal';
import PasswordField from '@/components/auth/password-field';
import { useObjectUrl } from '@/components/auth/photo-slot';
import PrimaryButton, { SecondaryButton } from '@/components/auth/primary-button';
import TextField from '@/components/auth/text-field';
import UploadRow from '@/components/auth/upload-row';
import AvatarCropModal from '@/components/ui/avatar-crop-modal';
import { Head, useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

type Props = { adminMode?: boolean };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STEP1_FIELDS = ['accntno', 'phone_no', 'email', 'password', 'password_confirmation'] as const;
type Acct = { no: string; state: 'checking' | 'found' | 'missing' | 'taken'; name?: string };

const getJson = async (url: string, signal?: AbortSignal) => {
    const res = await fetch(url, { signal, headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
    return res.ok ? res.json() : {};
};

export default function Register({ adminMode = false }: Props) {
    const [step, setStep] = useState<1 | 2>(1);
    const [tried1, setTried1] = useState(false);
    const [tried2, setTried2] = useState(false);
    const [acct, setAcct] = useState<Acct | null>(null);
    const [dupEmail, setDupEmail] = useState<string | null>(null);
    const [prcOpen, setPrcOpen] = useState(false);
    const [payOpen, setPayOpen] = useState(false);
    const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
    const [avatarErr, setAvatarErr] = useState('');
    const avatarInput = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, clearErrors } = useForm<{
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
    const avatarUrl = useObjectUrl(data.profile_picture);
    const pendingUrl = useObjectUrl(pendingAvatar);

    // Account lookup (+ already-registered check) once 6 characters are entered.
    useEffect(() => {
        const no = data.accntno;
        if (no.length !== 6) return;
        setAcct({ no, state: 'checking' });
        const ctl = new AbortController();
        const t = setTimeout(async () => {
            try {
                const q = encodeURIComponent(no);
                const [wm, dup] = await Promise.all([
                    getJson(`/api/wmaster/lookup?acctno=${q}`, ctl.signal),
                    getJson(`/api/check-register-duplicate?accntno=${q}`, ctl.signal),
                ]);
                if (dup.accntnoExists) setAcct({ no, state: 'taken' });
                else if (wm.exists) {
                    setAcct({ no, state: 'found', name: wm.bname ?? '' });
                    setData('full_name', wm.bname ?? '');
                } else setAcct({ no, state: 'missing' });
            } catch {
                /* aborted or network error: stays on "checking" until the value changes */
            }
        }, 250);
        return () => {
            clearTimeout(t);
            ctl.abort();
        };
    }, [data.accntno, setData]);

    // Server rejected a step-1 field while we're on step 2: send the user back to it.
    useEffect(() => {
        if (step === 2 && STEP1_FIELDS.some((k) => errors[k])) {
            setTried1(true);
            setStep(1);
        }
    }, [errors, step]);

    const a = acct?.no === data.accntno ? acct : null;
    const clientErr = {
        accntno:
            data.accntno.length !== 6
                ? 'Enter your 6-digit account number.'
                : a?.state === 'checking'
                  ? 'Wait for the account check to finish.'
                  : a?.state === 'found'
                    ? ''
                    : ' ',
        phone_no: /^\d{11}$/.test(data.phone_no) ? '' : 'Phone must be 11 digits.',
        email: !data.email
            ? 'Enter your email address.'
            : !EMAIL_RE.test(data.email)
              ? 'Please enter a valid email address.'
              : dupEmail === data.email
                ? 'Email is already registered.'
                : '',
        password: data.password.length >= 8 ? '' : 'Minimum 8 characters.',
        password_confirmation: data.password_confirmation === data.password ? '' : 'Passwords do not match.',
    };
    // ' ' = invalid with the reason already shown as the account hint (not found / already registered).
    const msg = (k: (typeof STEP1_FIELDS)[number]) => errors[k] || clientErr[k].trim();

    const acctHint =
        a?.state === 'checking'
            ? 'Checking...'
            : a?.state === 'found'
              ? `This account no belongs to ${a.name}.`
              : a?.state === 'missing'
                ? 'Account number not found.'
                : a?.state === 'taken'
                  ? 'Account number is already registered.'
                  : '';

    const checkEmail = async () => {
        const email = data.email;
        if (!EMAIL_RE.test(email)) return;
        try {
            const j = await getJson(`/api/check-register-duplicate?email=${encodeURIComponent(email)}`);
            if (j.emailExists) setDupEmail(email);
        } catch {
            /* the server's unique rule still catches it on submit */
        }
    };

    const field = (k: (typeof STEP1_FIELDS)[number], value: string) => {
        setData(k, value);
        clearErrors(k);
    };

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (step === 1) {
            setTried1(true);
            const bad = STEP1_FIELDS.find((k) => clientErr[k]);
            if (bad) return void (e.currentTarget.elements.namedItem(bad) as HTMLElement | null)?.focus();
            setStep(2);
            return window.scrollTo(0, 0);
        }
        setTried2(true);
        if (!data.prc_id_photo_front || !data.prc_id_photo_back || !data.payslip_photo) return;
        post(adminMode ? '/admin-registration' : '/register', { forceFormData: true });
    };

    const prcErr =
        errors.prc_id_photo_front ||
        errors.prc_id_photo_back ||
        (tried2 && !(data.prc_id_photo_front && data.prc_id_photo_back) ? 'Add the front and back of your PRC ID.' : '');
    const payErr = errors.payslip_photo || (tried2 && !data.payslip_photo ? 'Add a photo of your latest payslip.' : '');

    return (
        <>
            <Head title="Register" />
            <AuthCard
                wide
                title="Register"
                lead={
                    step === 1
                        ? 'To register, use the account number provided to you and your phone number registered with us. Please enter an active email address and create a secure password.'
                        : 'Upload a CLEAR picture of your valid PRC ID for verification, a profile photo of yourself, and your latest payslip.'
                }
                footer={
                    step === 1 && (
                        <>
                            Already have an account?{' '}
                            <a href="/login" className={linkClass}>
                                Log in
                            </a>
                        </>
                    )
                }
            >
                <form onSubmit={submit} noValidate>
                    {step === 1 ? (
                        <>
                            <div className="grid items-start gap-x-4 sm:grid-cols-2">
                                <TextField
                                    label="Account Number"
                                    name="accntno"
                                    inputMode="numeric"
                                    maxLength={6}
                                    autoComplete="off"
                                    placeholder="Enter account number"
                                    value={data.accntno}
                                    onChange={(e) => {
                                        setData((d) => ({ ...d, accntno: e.target.value.replace(/\s/g, '').slice(0, 6), full_name: '' }));
                                        clearErrors('accntno');
                                    }}
                                    error={errors.accntno || clientErr.accntno.trim()}
                                    showErrors={tried1}
                                    hint={acctHint}
                                    hintTone={a?.state === 'found' ? undefined : a?.state === 'missing' || a?.state === 'taken' ? 'bad' : undefined}
                                />
                                <TextField
                                    label="Phone Number"
                                    name="phone_no"
                                    inputMode="numeric"
                                    autoComplete="tel"
                                    placeholder="09xxxxxxxxx"
                                    value={data.phone_no}
                                    onChange={(e) => field('phone_no', e.target.value.replace(/\D/g, '').slice(0, 11))}
                                    error={msg('phone_no')}
                                    showErrors={tried1}
                                />
                            </div>
                            <TextField
                                label="Email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                value={data.email}
                                onChange={(e) => field('email', e.target.value)}
                                onBlur={checkEmail}
                                error={msg('email')}
                                showErrors={tried1}
                            />
                            <div className="grid items-start gap-x-4 sm:grid-cols-2">
                                <PasswordField
                                    label="Password"
                                    name="password"
                                    autoComplete="new-password"
                                    placeholder="Minimum 8 characters"
                                    value={data.password}
                                    onChange={(e) => field('password', e.target.value)}
                                    error={msg('password')}
                                    showErrors={tried1}
                                />
                                <PasswordField
                                    label="Confirm Password"
                                    name="password_confirmation"
                                    autoComplete="new-password"
                                    placeholder="Re-enter your password"
                                    value={data.password_confirmation}
                                    onChange={(e) => field('password_confirmation', e.target.value)}
                                    error={msg('password_confirmation')}
                                    showErrors={tried1}
                                    hint={data.password_confirmation && !clientErr.password_confirmation ? 'Passwords match.' : ''}
                                    hintTone="good"
                                />
                            </div>
                            <PrimaryButton type="submit" className="mt-2 h-14 text-lg">
                                NEXT
                            </PrimaryButton>
                        </>
                    ) : (
                        <>
                            <div className="mb-7">
                                <span className="mb-2 block text-sm font-bold text-tdfc-coral-ink">Upload Profile Picture</span>
                                <div className="flex items-center gap-4">
                                    <input
                                        ref={avatarInput}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        hidden
                                        onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            e.target.value = '';
                                            if (!f) return;
                                            if (!f.type.startsWith('image/')) return setAvatarErr('Please choose an image file (JPG, PNG or WEBP).');
                                            setAvatarErr('');
                                            setPendingAvatar(f);
                                        }}
                                    />
                                    <button
                                        type="button"
                                        aria-label="Upload profile photo"
                                        aria-describedby="avatar-msg"
                                        onClick={() => avatarInput.current?.click()}
                                        className="grid size-16 flex-none place-items-center overflow-hidden rounded-full border-2 border-dashed border-tdfc-coral bg-card focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tdfc-coral-ink"
                                    >
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Profile preview" className="size-full object-cover" />
                                        ) : (
                                            <span className="grid size-11 place-items-center rounded-full bg-success-soft text-success">
                                                <Plus className="size-6" aria-hidden />
                                            </span>
                                        )}
                                    </button>
                                    <p className="text-sm leading-normal text-foreground/60">
                                        Tap the circle to upload your profile photo.
                                        <br />
                                        Crop will open before saving.
                                    </p>
                                </div>
                                <div
                                    id="avatar-msg"
                                    aria-live="polite"
                                    className="mt-1 animate-tdfc-msg text-[13px] leading-[18px] text-tdfc-error empty:mt-0"
                                >
                                    {errors.profile_picture || avatarErr}
                                </div>
                            </div>

                            <UploadRow
                                label="Upload PRC ID Photo"
                                required
                                done={!!(data.prc_id_photo_front && data.prc_id_photo_back)}
                                text={data.prc_id_photo_front && data.prc_id_photo_back ? 'Front & Back completed ✓' : undefined}
                                onClick={() => setPrcOpen(true)}
                                error={prcErr}
                            />
                            <UploadRow
                                label="Upload LATEST PAYSLIP Photo"
                                required
                                done={!!data.payslip_photo}
                                text={data.payslip_photo ? 'Payslip photo added ✓' : undefined}
                                onClick={() => setPayOpen(true)}
                                error={payErr}
                            />

                            <div className="mt-6 flex items-center justify-between gap-3">
                                <SecondaryButton onClick={() => setStep(1)}>← Back</SecondaryButton>
                                <PrimaryButton type="submit" variant="pill" loading={processing}>
                                    REGISTER
                                </PrimaryButton>
                            </div>
                        </>
                    )}
                </form>
            </AuthCard>

            <Modal bare open={!!pendingAvatar} onClose={() => setPendingAvatar(null)} label="Crop your profile photo">
                {pendingUrl && (
                    <AvatarCropModal
                        src={pendingUrl}
                        aspect={1}
                        onCancel={() => setPendingAvatar(null)}
                        onCroppedFile={(file) => {
                            setData('profile_picture', file);
                            clearErrors('profile_picture');
                            setPendingAvatar(null);
                        }}
                    />
                )}
            </Modal>
            <PrcModal
                open={prcOpen}
                initial={[data.prc_id_photo_front, data.prc_id_photo_back]}
                onClose={() => setPrcOpen(false)}
                onDone={(front, back) => {
                    setData((d) => ({ ...d, prc_id_photo_front: front, prc_id_photo_back: back }));
                    clearErrors('prc_id_photo_front', 'prc_id_photo_back');
                    setPrcOpen(false);
                }}
            />
            <PayslipModal
                open={payOpen}
                onClose={() => setPayOpen(false)}
                onDone={(file) => {
                    setData('payslip_photo', file);
                    clearErrors('payslip_photo');
                    setPayOpen(false);
                }}
            />
        </>
    );
}
