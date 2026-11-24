import AuthCard, { linkClass } from '@/components/auth/auth-card';
import PasswordField from '@/components/auth/password-field';
import PrimaryButton from '@/components/auth/primary-button';
import TextField from '@/components/auth/text-field';
import { Head, useForm, usePage } from '@inertiajs/react';
import React, { useState } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emailError = (v: string) => (!v ? 'Enter your email address.' : !EMAIL_RE.test(v) ? 'Please enter a valid email address.' : '');
const passwordError = (v: string) => (v ? '' : 'Enter your password.');

export default function Login() {
    const flashStatus = (usePage().props as { flash?: { status?: string } }).flash?.status;
    const { data, setData, post, processing, errors, clearErrors } = useForm({ email: '', password: '', remember: false as boolean });
    const [submitted, setSubmitted] = useState(false);

    // Laravel's credential failure arrives on `email`; it wins over the client check.
    const emailMsg = errors.email || emailError(data.email);
    const passwordMsg = errors.password || passwordError(data.password);

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitted(true);
        const firstBad = emailError(data.email) ? 'email' : passwordError(data.password) ? 'password' : null;
        if (firstBad) {
            (e.currentTarget.elements.namedItem(firstBad) as HTMLElement | null)?.focus();
            return;
        }
        post('/login');
    };

    return (
        <>
            <Head title="Login" />
            <AuthCard
                title="Login"
                lead="Welcome back. Enter your credentials to continue."
                footer={
                    <>
                        Don’t have an account?{' '}
                        <a href="/register" className={linkClass}>
                            Register
                        </a>
                    </>
                }
            >
                {flashStatus && (
                    <p role="status" className="mb-4 text-center text-sm font-semibold text-success">
                        {flashStatus}
                    </p>
                )}
                <form onSubmit={submit} noValidate>
                    <TextField
                        label="EMAIL"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={data.email}
                        onChange={(e) => {
                            setData('email', e.target.value);
                            clearErrors('email');
                        }}
                        error={emailMsg}
                        showErrors={submitted}
                    />
                    <PasswordField
                        label="PASSWORD"
                        name="password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={data.password}
                        onChange={(e) => {
                            setData('password', e.target.value);
                            clearErrors('password');
                        }}
                        error={passwordMsg}
                        showErrors={submitted}
                    />
                    <div className="mb-4 flex items-center justify-between gap-3 text-sm">
                        <label className="flex min-h-11 items-center gap-2 text-foreground/70">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="h-[18px] w-[18px] rounded border-foreground/40 text-tdfc-coral-ink focus:ring-tdfc-coral-ink"
                            />
                            Remember me
                        </label>
                        <a href="/forgot-password" className={`${linkClass} inline-flex min-h-11 items-center`}>
                            Forgot password?
                        </a>
                    </div>
                    <PrimaryButton type="submit" loading={processing}>
                        Sign In
                    </PrimaryButton>
                </form>
            </AuthCard>
        </>
    );
}
