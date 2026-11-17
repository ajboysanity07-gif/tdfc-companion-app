import AuthCard from '@/components/auth/auth-card';
import PasswordField from '@/components/auth/password-field';
import PrimaryButton from '@/components/auth/primary-button';
import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, clearErrors, reset } = useForm({ password: '' });
    const [submitted, setSubmitted] = useState(false);

    const clientError = data.password ? '' : 'Enter your password.';

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitted(true);
        if (clientError) {
            (e.currentTarget.elements.namedItem('password') as HTMLElement | null)?.focus();
            return;
        }
        post('/confirm-password', { onFinish: () => reset('password') });
    };

    return (
        <>
            <Head title="Confirm password" />
            <AuthCard title="Confirm your password" lead="This is a secure area of the application. Please confirm your password before continuing.">
                <form onSubmit={submit} noValidate>
                    <PasswordField
                        label="Password"
                        name="password"
                        autoComplete="current-password"
                        placeholder="Password"
                        autoFocus
                        value={data.password}
                        onChange={(e) => {
                            setData('password', e.target.value);
                            clearErrors('password');
                        }}
                        error={errors.password || clientError}
                        showErrors={submitted}
                    />
                    <PrimaryButton type="submit" loading={processing}>
                        Confirm password
                    </PrimaryButton>
                </form>
            </AuthCard>
        </>
    );
}
