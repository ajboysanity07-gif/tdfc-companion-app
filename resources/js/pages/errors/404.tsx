import ThemeToggle from '@/components/theme-toggle';
import { Head, Link } from '@inertiajs/react';
import { FileQuestion } from 'lucide-react';

export default function Error404() {
    return (
        <>
            <Head title="Page Not Found" />
            <ThemeToggle floating />
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-page to-muted px-4">
                <div className="max-w-md text-center">
                    <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-yellow-soft">
                        <FileQuestion className="h-10 w-10 text-yellow-text" />
                    </div>

                    <h1 className="mb-4 text-6xl font-extrabold text-foreground">404</h1>
                    <h2 className="mb-2 text-2xl font-bold text-foreground">Page Not Found</h2>
                    <p className="mb-8 text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>

                    <div className="flex justify-center gap-4">
                        <Link
                            href="/"
                            className="inline-flex items-center rounded-lg bg-brand-red px-6 py-3 font-medium text-brand-ink transition hover:bg-[color-mix(in_oklch,var(--brand-red)_88%,black)]"
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
