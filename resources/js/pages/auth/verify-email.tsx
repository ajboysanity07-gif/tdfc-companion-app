import AuthCard, { linkClass } from '@/components/auth/auth-card';
import { SecondaryButton } from '@/components/auth/primary-button';
import { Head, router, useForm } from '@inertiajs/react';
import React from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const resend = (e: React.FormEvent) => {
        e.preventDefault();
        post('/email/verification-notification');
    };

    return (
        <>
            <Head title="Email verification" />
            <AuthCard title="Verify email" lead="Please verify your email address by clicking on the link we just emailed to you.">
                {status === 'verification-link-sent' && (
                    <p role="status" className="mb-4 text-center text-sm font-medium text-tdfc-ok">
                        A new verification link has been sent to the email address you provided during registration.
                    </p>
                )}
                <form onSubmit={resend} className="grid justify-items-center gap-4">
                    <SecondaryButton type="submit" disabled={processing}>
                        Resend verification email
                    </SecondaryButton>
                    <button type="button" onClick={() => router.post('/logout')} className={`${linkClass} min-h-11 text-sm`}>
                        Log out
                    </button>
                </form>
            </AuthCard>
        </>
    );
}
