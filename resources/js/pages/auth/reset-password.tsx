import AuthCard from '@/components/auth/auth-card';
import PasswordField from '@/components/auth/password-field';
import PrimaryButton from '@/components/auth/primary-button';
import TextField from '@/components/auth/text-field';
import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

type Props = { token: string; email?: string | null };
type Key = 'email' | 'password' | 'password_confirmation';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ResetPassword({ token, email }: Props) {
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        token,
        email: email ?? '',
        password: '',
        password_confirmation: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const client: Record<Key, string> = {
        email: !data.email ? 'Enter your email address.' : !EMAIL_RE.test(data.email) ? 'Please enter a valid email address.' : '',
        password: data.password.length < 8 ? 'The password field must be at least 8 characters.' : '',
        password_confirmation: data.password_confirmation !== data.password ? 'The password field confirmation does not match.' : '',
    };

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitted(true);
        const firstBad = (Object.keys(client) as Key[]).find((k) => client[k]);
        if (firstBad) {
            (e.currentTarget.elements.namedItem(firstBad) as HTMLElement | null)?.focus();
            return;
        }
        post('/reset-password');
    };

    const bind = (k: Key) => ({
        name: k,
        value: data[k],
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            setData(k, e.target.value);
            clearErrors(k);
        },
        error: errors[k] || client[k],
        showErrors: submitted,
    });

    return (
        <>
            <Head title="Reset password" />
            <AuthCard title="Choose a new password">
                <form onSubmit={submit} noValidate>
                    <TextField label="EMAIL" type="email" autoComplete="email" {...bind('email')} />
                    <div className="grid gap-x-3 sm:grid-cols-2">
                        <PasswordField label="PASSWORD" autoComplete="new-password" {...bind('password')} />
                        <PasswordField label="CONFIRM" autoComplete="new-password" {...bind('password_confirmation')} />
                    </div>
                    <PrimaryButton type="submit" loading={processing}>
                        Reset password
                    </PrimaryButton>
                </form>
            </AuthCard>
        </>
    );
}
