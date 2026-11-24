import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

interface EmailModalProps {
    currentEmail: string;
    onClose: () => void;
}

export default function EmailModal({ currentEmail, onClose }: EmailModalProps) {
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        email: '',
    });

    useEffect(() => {
        if (recentlySuccessful) {
            const timer = setTimeout(() => {
                onClose();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [recentlySuccessful, onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="current_email" className="font-medium text-foreground">
                    Current Email
                </Label>
                <Input id="current_email" type="email" value={currentEmail} disabled className="border-border bg-muted text-muted-foreground" />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="email" className="font-medium text-foreground">
                    New Email
                </Label>
                <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className="border-border bg-card text-foreground focus:border-brand-blue focus:ring-ring"
                    placeholder="Enter new email address"
                    autoComplete="email"
                />
                <InputError message={errors.email} />
            </div>

            <div className="flex items-center gap-4 pt-4">
                <Button disabled={processing} className="flex-1" type="submit">
                    Update Email
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
                <p className="text-sm text-success">Email updated successfully!</p>
            </Transition>
        </form>
    );
}
