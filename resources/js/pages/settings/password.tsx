import InputError from '@/components/input-error';
import { BtnSpinner, showToast } from '@/components/tdfc/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Password settings', href: '/settings/password' }];

function PwField({ label, name, error, autoComplete, inputRef, onChange, note }: { label: string; name: string; error?: string; autoComplete: string; inputRef?: React.Ref<HTMLInputElement>; onChange?: (v: string) => void; note?: React.ReactNode }) {
    const [show, setShow] = useState(false);
    return (
        <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <div className="relative">
                <Input id={name} ref={inputRef} name={name} type={show ? 'text' : 'password'} className="pr-16" autoComplete={autoComplete} placeholder={label} aria-invalid={!!error} onChange={(e) => onChange?.(e.target.value)} />
                <button
                    type="button"
                    aria-label={`${show ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
                    aria-pressed={show}
                    onClick={() => setShow((s) => !s)}
                    className="absolute top-0 right-1 h-9 px-2.5 text-[13px] font-medium text-muted-foreground hover:text-foreground"
                >
                    {show ? 'Hide' : 'Show'}
                </button>
            </div>
            <InputError message={error} />
            {note}
        </div>
    );
}

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const [pw, setPw] = useState('');
    const [cf, setCf] = useState('');
    const short = pw.length > 0 && pw.length < 8;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Password settings" />

            <SettingsLayout>
                <div className="grid max-w-[640px] gap-5">
                    <div>
                        <h2 className="text-lg font-semibold">Update password</h2>
                        <p className="text-sm text-muted-foreground">Ensure your account is using a long, random password to stay secure</p>
                    </div>

                    <Form
                        method="put"
                        action={route('password.update')}
                        options={{ preserveScroll: true }}
                        resetOnError={['password', 'password_confirmation', 'current_password']}
                        resetOnSuccess
                        onSuccess={() => {
                            setPw('');
                            setCf('');
                            showToast('Password updated');
                        }}
                        onError={(errors) => {
                            if (errors.password) passwordInput.current?.focus();
                            if (errors.current_password) currentPasswordInput.current?.focus();
                        }}
                        className="grid gap-5"
                    >
                        {({ errors, processing, recentlySuccessful }) => (
                            <>
                                <PwField label="Current password" name="current_password" error={errors.current_password} autoComplete="current-password" inputRef={currentPasswordInput} />
                                <PwField label="New password" name="password" onChange={setPw} error={short ? 'Minimum 8 characters.' : errors.password} autoComplete="new-password" inputRef={passwordInput} />
                                <PwField
                                    label="Confirm password"
                                    name="password_confirmation"
                                    onChange={setCf}
                                    error={errors.password_confirmation}
                                    autoComplete="new-password"
                                    note={cf && <p role="status" className={`text-[13px] ${cf === pw ? 'text-tdfc-ok' : 'text-destructive'}`}>{cf === pw ? 'Passwords match.' : 'Passwords do not match.'}</p>}
                                />

                                <div className="flex items-center gap-4">
                                    <Button disabled={processing} className="bg-tdfc-coral font-bold text-tdfc-on-coral hover:bg-tdfc-coral/85">
                                        {processing && <BtnSpinner />}
                                        Save password
                                    </Button>
                                    <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                                        <p role="status" className="text-sm text-tdfc-ok">Saved</p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
