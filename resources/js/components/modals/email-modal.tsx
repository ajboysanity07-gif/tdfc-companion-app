import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Transition } from '@headlessui/react';
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
                <Label htmlFor="current_email" className="text-gray-700 dark:text-gray-300 font-medium">
                    Current Email
                </Label>
                <Input
                    id="current_email"
                    type="email"
                    value={currentEmail}
                    disabled
                    className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600"
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
                    New Email
                </Label>
                <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter new email address"
                    autoComplete="email"
                />
                <InputError message={errors.email} />
            </div>

            <div className="flex items-center gap-4 pt-4">
                <Button disabled={processing} className="flex-1" type="submit">
                    Update Email
                </Button>
                <Button variant="outline" onClick={onClose} type="button" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
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
                <p className="text-sm text-green-600 dark:text-green-400">Email updated successfully!</p>
            </Transition>
        </form>
    );
}
