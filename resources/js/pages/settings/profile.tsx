import Modal from '@/components/auth/modal';
import DeleteUser from '@/components/delete-user';
import EmailModal from '@/components/modals/email-modal';
import { classReason } from '@/components/tdfc/borrower-class';
import { btn, peso, Panel } from '@/components/tdfc/ui';
import AvatarCropModal from '@/components/ui/avatar-crop-modal';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Camera, KeyRound, Mail, UserRound } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Profile settings', href: '/settings/profile' }];

const formatName = (name: string): string => {
    if (!name) return '';
    const normalized = name.includes(',') ? name.split(',').map((p) => p.trim()).reverse().join(' ') : name;
    return normalized
        .split(' ')
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
};

const hb = 'inline-flex h-10 items-center gap-1.5 rounded-[10px] bg-white px-3.5 font-semibold text-[#1f4a6b] hover:bg-[#dbe9f3] hover:text-[#143a57] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-white';

function PayslipModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    // ponytail: UI only, there is no payslip upload endpoint yet. Add a route + controller storing the file for admin review.
    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const file = new FormData(e.currentTarget).get('payslip');
        if (!(file instanceof File) || !file.size) {
            setDone(false);
            return setError('Please choose a payslip photo or PDF.');
        }
        setError('');
        setDone(true);
    };
    const close = () => {
        setError('');
        setDone(false);
        onClose();
    };

    return (
        <Modal open={open} onClose={close} label="Send updated payslip">
            <h3 className="text-lg font-bold">Send updated payslip</h3>
            <p className="mt-1 mb-4 text-sm text-muted-foreground">We use your latest payslip to update the basic salary shown for the Loan Calculator.</p>
            <form onSubmit={submit} noValidate className="grid gap-4">
                <div className="grid gap-2">
                    <label htmlFor="slip_file" className="text-sm font-medium">Payslip photo or PDF</label>
                    <input id="slip_file" name="payslip" type="file" accept="image/*,application/pdf" aria-invalid={!!error} className="rounded-[10px] border border-border bg-background p-2 text-sm" />
                    {error && <span className="text-[13px] text-destructive">{error}</span>}
                </div>
                {done && (
                    <p role="status" className="text-sm text-tdfc-blue-ink">
                        Payslip uploads are not available yet, so nothing was sent. Please contact TDFC to update your salary.
                    </p>
                )}
                <div className="flex gap-3">
                    <button type="submit" className={`${btn.base} ${btn.coral} flex-1`}>Send payslip</button>
                    <button type="button" onClick={close} className={`${btn.base} ${btn.plain} dark:bg-card`}>Cancel</button>
                </div>
            </form>
        </Modal>
    );
}

export default function Profile() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    const [cropSrc, setCropSrc] = useState('');
    const [avatarPreview, setAvatarPreview] = useState('');
    const [emailOpen, setEmailOpen] = useState(false);
    const [slipOpen, setSlipOpen] = useState(false);

    const fullName = formatName(user.name);
    const loanClass = typeof user.class === 'string' && user.class ? user.class : null;
    const salary = typeof user.salary_amount === 'number' ? user.salary_amount : null;
    const avatar = avatarPreview || user.avatar;

    const pick = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setCropSrc(URL.createObjectURL(file));
        e.target.value = '';
    };
    const closeCrop = () => {
        URL.revokeObjectURL(cropSrc);
        setCropSrc('');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="grid content-start gap-5">
                    <section aria-label="My account" className="flex flex-wrap items-center gap-x-6 gap-y-4 rounded-2xl bg-gradient-to-r from-[#35729a] to-[#2b6190] p-5 text-white max-[720px]:p-5 min-[721px]:px-6">
                        <label
                            tabIndex={0}
                            aria-label="Change profile photo"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    e.currentTarget.querySelector('input')?.click();
                                }
                            }}
                            className="relative size-20 shrink-0 cursor-pointer rounded-full focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-white"
                        >
                            <span className="grid size-full place-items-center overflow-hidden rounded-full border-[3px] border-white/55 bg-white/20">
                                {avatar ? <img src={avatar} alt="Profile photo" className="size-full object-cover" /> : <UserRound className="size-9" aria-hidden />}
                            </span>
                            <span className="absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full bg-white text-[#1f4a6b] shadow">
                                <Camera className="size-4" aria-hidden />
                            </span>
                            <input type="file" accept="image/*" onChange={pick} className="sr-only" tabIndex={-1} />
                        </label>

                        <div className="min-w-[220px] flex-1">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h2 className="text-[26px] font-bold">{fullName}</h2>
                            </div>
                            <p className="mt-0.5 text-sm break-all">{user.email}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => setEmailOpen(true)} className={hb}>
                                <Mail className="size-4" aria-hidden />
                                Change email
                            </button>
                            <Link href="/settings/password" className={hb}>
                                <KeyRound className="size-4" aria-hidden />
                                Change password
                            </Link>
                        </div>
                    </section>

                    <section className="grid gap-4 min-[721px]:grid-cols-2">
                        <Panel className="px-5 py-4">
                            <small className="text-xs font-semibold tracking-[.06em] text-muted-foreground uppercase">Class</small>
                            <b className="mt-1 block text-2xl break-all">{loanClass ?? '—'}</b>
                            <span className="block text-[13px] text-muted-foreground">Your borrower classification.</span>
                            <span className="mt-1.5 block text-xs text-muted-foreground">
                                {classReason(loanClass)} Your class follows your most overdue loan that still has a balance.
                            </span>
                        </Panel>
                        <Panel className="px-5 py-4">
                            <small className="text-xs font-semibold tracking-[.06em] text-muted-foreground uppercase">Basic salary</small>
                            <b className="mt-1 block text-2xl break-all tabular-nums">{salary === null ? 'Not set' : peso(salary)}</b>
                            <span className="text-[13px] text-muted-foreground">
                                Monthly. Used for Loan Calculator reference only.{' '}
                                <button type="button" onClick={() => setSlipOpen(true)} className="font-medium text-tdfc-blue-ink underline underline-offset-2">
                                    Send updated payslip
                                </button>
                            </span>
                        </Panel>
                    </section>

                    <Panel className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                        <div>
                            <b>Session</b>
                            <p className="text-sm text-muted-foreground">Sign out of this device.</p>
                        </div>
                        <button type="button" onClick={() => router.post('/logout')} className={`${btn.base} ${btn.plain} dark:bg-card`}>
                            Sign out
                        </button>
                    </Panel>

                    <DeleteUser />
                </div>
            </SettingsLayout>

            <Modal open={emailOpen} onClose={() => setEmailOpen(false)} label="Update Email Address">
                <h3 className="mb-4 text-lg font-bold">Update Email Address</h3>
                <EmailModal currentEmail={user.email} onClose={() => setEmailOpen(false)} />
            </Modal>

            <PayslipModal open={slipOpen} onClose={() => setSlipOpen(false)} />

            {cropSrc && (
                <AvatarCropModal
                    src={cropSrc}
                    onCancel={closeCrop}
                    onCroppedFile={(file) => {
                        setAvatarPreview(URL.createObjectURL(file));
                        closeCrop();
                    }}
                    isAuthenticated
                    userId={user.id}
                />
            )}
        </AppLayout>
    );
}
