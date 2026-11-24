import ThemeToggle from '@/components/theme-toggle';
import { router } from '@inertiajs/react';
import React from 'react';

export default function MinimalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-page">
            <header className="flex items-center justify-between gap-3 border-b border-border bg-card px-6 py-5">
                <div className="flex items-center gap-2">
                    <img src="/logo.svg" alt="TDFC logo" className="h-8 w-8" />
                    <span className="text-xl font-extrabold tracking-widest text-red-text">TDFC Companion</span>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <button
                        type="button"
                        onClick={() => router.post('/logout')}
                        className="text-sm font-medium text-muted-foreground transition hover:text-red-text"
                    >
                        Logout
                    </button>
                </div>
            </header>
            <main className="flex flex-1 flex-col items-center justify-center">{children}</main>
        </div>
    );
}
