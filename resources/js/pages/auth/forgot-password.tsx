import AuthCard, { linkClass } from '@/components/auth/auth-card';
import PrimaryButton from '@/components/auth/primary-button';
import TextField from '@/components/auth/text-field';
import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emailError = (v: string) => (!v ? 'Enter your email address.' : !EMAIL_RE.test(v) ? 'Please enter a valid email address.' : '');

export default function ForgotPassword() {
    const { data, setData, post, processing, errors, clearErrors, wasSuccessful } = useForm({ email: '' });
    const [submitted, setSubmitted] = useState(false);

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitted(true);
        if (emailError(data.email)) {
            (e.currentTarget.elements.namedItem('email') as HTMLElement | null)?.focus();
            return;
        }
        post('/forgot-password');
    };

    return (
        <>
            <Head title="Forgot password" />
            <AuthCard
                title="Reset password"
                footer={
                    <a href="/login" className={`${linkClass} inline-flex min-h-11 items-center`}>
                        ← Back to login
                    </a>
                }
            >
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
                        error={errors.email || emailError(data.email)}
                        showErrors={submitted}
                        // Laravel's `status` flash isn't shared as a prop, so wasSuccessful stands in for it.
                        hint={wasSuccessful && !errors.email ? 'We have emailed your password reset link.' : undefined}
                        hintTone="good"
                    />
                    <PrimaryButton type="submit" disabled={processing}>
                        Send reset link
                    </PrimaryButton>
                </form>
            </AuthCard>
        </>
    );
}
