import ThemeToggle from '@/components/theme-toggle';
import { Head, Link } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';

export default function Error403() {
    return (
        <>
            <Head title="Access Denied" />
            <ThemeToggle floating />
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-page to-muted px-4">
                <div className="max-w-md text-center">
                    <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-destructive/15">
                        <ShieldAlert className="h-10 w-10 text-destructive" />
                    </div>

                    <h1 className="mb-4 text-6xl font-extrabold text-foreground">403</h1>
                    <h2 className="mb-2 text-2xl font-bold text-foreground">Access Denied</h2>
                    <p className="mb-8 text-muted-foreground">
                        You don't have permission to access this resource. If you believe this is an error, please contact support.
                    </p>

                    <div className="flex justify-center gap-4">
                        <Link
                            href="/"
                            className="inline-flex items-center rounded-lg bg-brand-surface px-6 py-3 font-medium text-on-brand-surface transition hover:bg-[color-mix(in_oklch,var(--brand-surface)_88%,black)]"
                        >
                            Go Home
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center rounded-lg border border-border px-6 py-3 font-medium text-foreground transition hover:bg-muted"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
