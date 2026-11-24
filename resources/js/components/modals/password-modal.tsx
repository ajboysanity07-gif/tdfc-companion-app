import { showToast } from '@/components/tdfc/ui';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

interface PasswordModalProps {
    onClose: () => void;
}

export default function PasswordModal({ onClose }: PasswordModalProps) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, put, processing, errors, recentlySuccessful, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Password validation states (same as in register.tsx)
    const [pwValid, setPwValid] = useState<boolean | null>(null);
    const [pwMatch, setPwMatch] = useState<boolean | null>(null);

    // Close modal when form submission is successful
    useEffect(() => {
        if (recentlySuccessful) {
            showToast('Password updated');
            const timer = setTimeout(() => {
                onClose();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [recentlySuccessful, onClose]);

    // Password validation logic (same as register.tsx)
    useEffect(() => {
        setPwValid(data.password.length === 0 ? null : data.password.length >= 8);
        setPwMatch(data.password_confirmation.length === 0 ? null : data.password_confirmation === data.password);
    }, [data.password, data.password_confirmation]);

    // Handle errors by focusing appropriate inputs
    useEffect(() => {
        if (errors.password) {
            passwordInput.current?.focus();
        }
        if (errors.current_password) {
            currentPasswordInput.current?.focus();
        }
    }, [errors]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onError: () => {
                reset('password', 'password_confirmation', 'current_password');
            },
            onSuccess: () => {
                reset();
            },
        });
    };

    // Check if form can be submitted (same logic as register.tsx)
    const canSubmit = pwValid === true && pwMatch === true && !processing;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="current_password" className="font-medium text-foreground">
                    Current Password
                </Label>
                <Input
                    id="current_password"
                    ref={currentPasswordInput}
                    type="password"
                    value={data.current_password}
                    onChange={(e) => setData('current_password', e.target.value)}
                    className="border-border bg-card text-foreground focus:border-brand-blue focus:ring-ring"
                    autoComplete="current-password"
                    placeholder="Enter current password"
                />
                <InputError message={errors.current_password} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="password" className="font-medium text-foreground">
                    New Password
                </Label>
                <Input
                    id="password"
                    ref={passwordInput}
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    className={`border-border bg-card text-foreground focus:border-brand-blue focus:ring-ring ${
                        pwValid === false ? 'border-destructive/40 focus:border-destructive focus:ring-destructive/30' : ''
                    }`}
                    autoComplete="new-password"
                    placeholder="Enter new password"
                />
                <InputError message={errors.password ? errors.password : pwValid === false ? 'Minimum 8 characters.' : ''} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="password_confirmation" className="font-medium text-foreground">
                    Confirm New Password
                </Label>
                <Input
                    id="password_confirmation"
                    type="password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    className={`border-border bg-card text-foreground focus:border-brand-blue focus:ring-ring ${
                        pwMatch === false ? 'border-destructive/40 focus:border-destructive focus:ring-destructive/30' : ''
                    }`}
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                />

                {/* Unified status line (same as register.tsx) */}
                <div className="mt-1 min-h-[1.25rem] text-xs" role="status" aria-live="polite">
                    {errors.password_confirmation ? (
                        <span className="text-destructive">{errors.password_confirmation}</span>
                    ) : pwMatch === false ? (
                        <span className="text-destructive">Passwords do not match.</span>
                    ) : pwMatch === true ? (
                        <span className="text-success">Passwords match.</span>
                    ) : (
                        <span className="invisible">.</span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
                <Button disabled={!canSubmit} className="flex-1" type="submit">
                    Update Password
                </Button>
                <Button variant="outline" onClick={onClose} type="button" className="border-border text-foreground hover:bg-muted">
                    Cancel
                </Button>
            </div>

            <Transition
                show={recentlySuccessful}
                enter="transition ease-in-out"
                enterFrom="opacity-0"
                leave="transition ease-in-out"
                leaveTo="opacity-0"
            >
                <p className="text-sm text-success">Password updated successfully!</p>
            </Transition>
        </form>
    );
}
