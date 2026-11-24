import ThemeToggle from '@/components/theme-toggle';
import { Head, Link } from '@inertiajs/react';
import { ServerCrash } from 'lucide-react';

export default function Error500() {
    return (
        <>
            <Head title="Server Error" />
            <ThemeToggle floating />
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-page to-muted px-4">
                <div className="max-w-md text-center">
                    <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-destructive/15">
                        <ServerCrash className="h-10 w-10 text-destructive" />
                    </div>

                    <h1 className="mb-4 text-6xl font-extrabold text-foreground">500</h1>
                    <h2 className="mb-2 text-2xl font-bold text-foreground">Server Error</h2>
                    <p className="mb-8 text-muted-foreground">Something went wrong on our end. Please try again later.</p>

                    <div className="flex justify-center gap-4">
                        <Link
                            href="/"
                            className="inline-flex items-center rounded-lg bg-brand-red px-6 py-3 font-medium text-brand-ink transition hover:bg-[color-mix(in_oklch,var(--brand-red)_88%,black)]"
                        >
                            Go Home
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
