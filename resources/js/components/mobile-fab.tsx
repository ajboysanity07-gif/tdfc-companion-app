import { useAppearance } from '@/hooks/use-appearance';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { router } from '@inertiajs/react';
import { LogOut, Moon, SlidersHorizontal, Sun, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const mini =
    'grid size-12 place-items-center rounded-full border border-border bg-card text-foreground shadow-[0_4px_14px_rgb(0_0_0/.25)] transition-[transform,opacity,background-color] hover:bg-muted active:bg-muted focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ring motion-reduce:transition-none';

/** Mobile-only speed-dial: theme toggle (+ log out inside the app shell). Ported from design/customer-dashboard.html. */
export default function MobileFab({ inApp = false, hasNav = false }: { inApp?: boolean; hasNav?: boolean }) {
    const { isDark, updateAppearance } = useAppearance();
    const cleanup = useMobileNavigation();
    const [open, setOpen] = useState(false);
    const [away, setAway] = useState(false);
    const [spin, setSpin] = useState(0);
    const btn = useRef<HTMLButtonElement>(null);
    const first = useRef<HTMLButtonElement>(null);
    const wasOpen = useRef(false);

    useEffect(() => {
        if (open) setTimeout(() => first.current?.focus(), 60);
        else if (wasOpen.current) btn.current?.focus();
        wasOpen.current = open;
    }, [open]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    // hide while scrolling down, reveal on scroll up / near top
    useEffect(() => {
        let last = window.scrollY;
        let tick = false;
        const onScroll = () => {
            if (tick) return;
            tick = true;
            requestAnimationFrame(() => {
                const y = window.scrollY;
                const dy = y - last;
                if (y < 48 || dy < -6) setAway(false);
                else if (dy > 6) setAway(true);
                last = y;
                tick = false;
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const target = isDark ? 'light' : 'dark';
    const pop = open ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-5 scale-40 opacity-0';

    return (
        <div
            className={`fixed right-4 z-60 size-14 md:hidden ${hasNav ? 'bottom-[calc(80px+env(safe-area-inset-bottom))]' : 'bottom-[calc(16px+env(safe-area-inset-bottom))]'}`}
        >
            {open && <div className="fixed inset-0 -z-10" onClick={() => setOpen(false)} aria-hidden />}
            <div
                id="fabDial"
                role="group"
                aria-label="Quick actions"
                className={`absolute right-1 bottom-[68px] flex flex-col-reverse items-center gap-3 ${open ? 'visible' : 'invisible'}`}
            >
                <button
                    ref={first}
                    type="button"
                    tabIndex={open ? 0 : -1}
                    aria-label={`Switch to ${target} mode`}
                    title="Theme"
                    onClick={() => {
                        updateAppearance(target);
                        setSpin((n) => n + 1);
                    }}
                    className={`${mini} ${pop} delay-[30ms]`}
                >
                    <span key={spin} className={spin ? 'animate-fab-spin motion-reduce:animate-none' : ''}>
                        {isDark ? <Sun className="size-[22px]" aria-hidden /> : <Moon className="size-[22px]" aria-hidden />}
                    </span>
                </button>
                {inApp && (
                    <button
                        type="button"
                        tabIndex={open ? 0 : -1}
                        aria-label="Log out"
                        title="Log out"
                        onClick={() => {
                            cleanup();
                            router.flushAll();
                            router.post(route('logout'));
                        }}
                        className={`${mini} ${pop} text-destructive delay-100`}
                    >
                        <LogOut className="size-[22px]" aria-hidden />
                    </button>
                )}
            </div>
            <button
                ref={btn}
                type="button"
                aria-label="Quick actions"
                aria-haspopup="true"
                aria-expanded={open}
                aria-controls="fabDial"
                onClick={() => setOpen((o) => !o)}
                className={`relative grid size-14 place-items-center rounded-full bg-brand-surface text-on-brand-surface shadow-[0_6px_18px_rgb(0_0_0/.3)] transition-[transform,opacity] duration-200 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-foreground active:scale-92 motion-reduce:transition-none ${away && !open ? 'pointer-events-none translate-y-7 scale-80 opacity-0' : ''}`}
            >
                <SlidersHorizontal
                    aria-hidden
                    className={`col-start-1 row-start-1 size-6 transition duration-300 motion-reduce:transition-none ${open ? 'scale-50 rotate-90 opacity-0' : ''}`}
                />
                <X
                    aria-hidden
                    className={`col-start-1 row-start-1 size-6 transition duration-300 motion-reduce:transition-none ${open ? '' : 'scale-50 -rotate-90 opacity-0'}`}
                />
            </button>
        </div>
    );
}
