import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Panel } from '@/components/tdfc/ui';
import { Form } from '@inertiajs/react';
import { useRef } from 'react';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <Panel className="flex flex-wrap items-center justify-between gap-4 border-destructive/30 px-5 py-4">
            <div>
                <b>Delete account</b>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all of its data. This cannot be undone.</p>
            </div>

            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="border-destructive/45 bg-transparent text-tdfc-coral-ink hover:bg-destructive/10 hover:text-tdfc-coral-ink">
                        Delete account
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogTitle>Are you sure you want to delete your account?</DialogTitle>
                    <DialogDescription>
                        Once your account is deleted, all of its resources and data will also be permanently deleted. Please enter your password to
                        confirm you would like to permanently delete your account.
                    </DialogDescription>

                    <Form
                        method="delete"
                        action={route('profile.destroy')}
                        options={{ preserveScroll: true }}
                        onError={() => passwordInput.current?.focus()}
                        resetOnSuccess
                        className="space-y-6"
                    >
                        {({ resetAndClearErrors, processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="password" className="sr-only">
                                        Password
                                    </Label>
                                    <Input id="password" type="password" name="password" ref={passwordInput} placeholder="Password" autoComplete="current-password" />
                                    <InputError message={errors.password} />
                                </div>

                                <DialogFooter className="gap-2">
                                    <DialogClose asChild>
                                        <Button variant="secondary" onClick={() => resetAndClearErrors()}>
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button variant="destructive" disabled={processing} type="submit">
                                        Delete account
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>
        </Panel>
    );
}
