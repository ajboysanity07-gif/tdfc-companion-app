import ThemeToggle from '@/components/theme-toggle';
import { Head } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />
            <ThemeToggle floating />

            {/* MOBILE (unchanged, smaller image) */}
            <div className="welcome-v2 mx-auto grid min-h-screen place-items-center bg-card px-4 py-8 md:hidden">
                <div className="w-full max-w-[720px]">
                    <div className="mb-6 grid place-items-center">
                        <img src="/images/tdfc-icon.png" alt="TDFC Logo" className="w-full max-w-[220px] select-none" />
                    </div>

                    <div className="rounded-[2rem] bg-brand-yellow p-6 shadow">
                        <div className="grid gap-6">
                            <a
                                href="/register"
                                className="grid place-items-center rounded-[1.25rem] bg-brand-surface min-h-16 py-4 text-2xl font-extrabold text-on-brand-surface shadow"
                            >
                                REGISTER
                            </a>
                            <a
                                href="/login"
                                className="grid place-items-center rounded-[1.25rem] border-2 border-foreground/10 bg-card min-h-16 py-4 text-2xl font-extrabold text-blue-text shadow"
                            >
                                LOGIN
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* DESKTOP/TABLET: card with colored top bar */}
            <div className="welcome-v2 hidden min-h-screen place-items-center bg-page md:grid">
                <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-card shadow-xl">
                    {/* Colored top strip */}
                    <div className="h-3 w-full bg-gradient-to-r from-brand-red via-brand-yellow to-brand-blue" />

                    {/* Card body */}
                    <div className="p-10">
                        <div className="mb-6 grid place-items-center">
                            <img src="/images/tdfc-icon.png" alt="TDFC Logo" className="w-full max-w-[260px] select-none" />
                        </div>

                        <div className="rounded-[2rem] bg-brand-yellow p-6 shadow-inner">
                            <div className="grid gap-6">
                                <a
                                    href="/register"
                                    className="grid place-items-center rounded-[1.25rem] bg-brand-surface min-h-16 py-4 text-xl font-extrabold text-on-brand-surface shadow transition-transform hover:scale-[1.01] hover:shadow-lg"
                                >
                                    REGISTER
                                </a>
                                <a
                                    href="/login"
                                    className="grid place-items-center rounded-[1.25rem] border-2 border-foreground/10 bg-card min-h-16 py-4 text-xl font-extrabold text-blue-text shadow transition-transform hover:scale-[1.01] hover:shadow-lg"
                                >
                                    LOGIN
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
