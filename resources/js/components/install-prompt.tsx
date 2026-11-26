import { Button } from '@/components/ui/button';
import { Check, Download, Share, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<unknown> };

const KEY = 'tdfc-install-dismissed';
const WEEK = 7 * 864e5;
const PERKS = ['Opens in its own window, like a native app', 'One tap from your home screen', 'Check loans and savings faster'];

/** "Add to home screen" prompt: floating card on desktop, bottom sheet on mobile. */
export default function InstallPrompt() {
    const [open, setOpen] = useState(false);
    const [how, setHow] = useState(false);
    const deferred = useRef<InstallEvent | null>(null);
    const opener = useRef<HTMLElement | null>(null);
    const installBtn = useRef<HTMLButtonElement>(null);

    const close = () => {
        setOpen(false);
        localStorage.setItem(KEY, String(Date.now()));
        opener.current?.focus();
    };

    useEffect(() => {
        if (/[?&]install/.test(location.search)) localStorage.removeItem(KEY);
        const standalone = matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone;
        const t = Number(localStorage.getItem(KEY));
        if (standalone || (t && Date.now() - t < WEEK)) return;

        const onPrompt = (e: Event) => {
            e.preventDefault();
            deferred.current = e as InstallEvent;
        };
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
        addEventListener('beforeinstallprompt', onPrompt);
        addEventListener('appinstalled', close);
        addEventListener('keydown', onKey);
        const timer = setTimeout(() => {
            opener.current = document.activeElement as HTMLElement;
            setOpen(true);
            installBtn.current?.focus({ preventScroll: true });
        }, 1500);
        return () => {
            clearTimeout(timer);
            removeEventListener('beforeinstallprompt', onPrompt);
            removeEventListener('appinstalled', close);
            removeEventListener('keydown', onKey);
        };
    }, []);

    const install = async () => {
        if (deferred.current) {
            await deferred.current.prompt();
            await deferred.current.userChoice;
            return close();
        }
        if (how) return close();
        setHow(true);
    };

    return (
        <>
            <div
                onClick={close}
                aria-hidden
                className={`fixed inset-0 z-70 bg-black/45 transition-opacity duration-250 motion-reduce:transition-none min-[561px]:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            />
            <aside
                role="dialog"
                aria-labelledby="ia-title"
                aria-describedby="ia-desc"
                inert={!open}
                className={`fixed z-71 border bg-card p-5 text-foreground shadow-tdfc-modal transition duration-350 ease-[cubic-bezier(.2,.9,.3,1)] motion-reduce:transition-none max-[560px]:inset-x-0 max-[560px]:bottom-0 max-[560px]:rounded-t-3xl max-[560px]:border-x-0 max-[560px]:border-b-0 max-[560px]:px-5 max-[560px]:pt-3 max-[560px]:pb-[calc(20px+env(safe-area-inset-bottom))] min-[561px]:right-6 min-[561px]:bottom-6 min-[561px]:w-[380px] min-[561px]:max-w-[calc(100vw-32px)] min-[561px]:rounded-[20px] ${open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0 max-[560px]:translate-y-full'}`}
            >
                <div aria-hidden className="mx-auto mb-4 h-1 w-9 rounded-full bg-border min-[561px]:hidden" />
                <button
                    type="button"
                    onClick={close}
                    aria-label="Dismiss install prompt"
                    className="absolute top-2.5 right-2.5 grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground max-[560px]:top-5"
                >
                    <X className="size-4" />
                </button>
                <div className="flex items-center gap-3.5 pr-7">
                    <div className="grid size-14 flex-none place-items-center overflow-hidden rounded-[14px] border bg-background shadow-sm">
                        <img src="/apple-touch-icon.png" alt="" className="size-12 object-contain" />
                    </div>
                    <div>
                        <h2 id="ia-title" className="text-base leading-tight font-bold">
                            Install TDFC Companion App
                        </h2>
                        <p id="ia-desc" className="mt-0.5 text-xs text-muted-foreground">
                            Add it to your home screen for quick access.
                        </p>
                    </div>
                </div>

                {how ? (
                    <div className="mt-4 grid gap-2.5 rounded-xl bg-muted p-3.5 text-[13px]">
                        <b>To install on this device</b>
                        <ol className="grid list-decimal gap-2 pl-4.5">
                            <li>
                                Tap <b>Share</b> <Share className="inline size-4 align-text-bottom" /> in your browser toolbar.
                            </li>
                            <li>
                                Choose <b>Add to Home Screen</b>.
                            </li>
                            <li>
                                Tap <b>Add</b> to confirm.
                            </li>
                        </ol>
                    </div>
                ) : (
                    <ul className="mt-4 grid gap-2 text-[13px] text-muted-foreground">
                        {PERKS.map((p) => (
                            <li key={p} className="flex items-center gap-2.5">
                                <Check className="size-4 text-tdfc-ok-ink" />
                                {p}
                            </li>
                        ))}
                    </ul>
                )}

                <div className="mt-4.5 flex justify-end gap-2 max-[560px]:flex-col-reverse max-[560px]:[&>button]:w-full [&>button]:h-11">
                    <Button variant="ghost" onClick={close}>
                        Not now
                    </Button>
                    <Button ref={installBtn} onClick={install}>
                        <Download className="size-4" />
                        {how ? 'Got it' : 'Install'}
                    </Button>
                </div>
            </aside>
        </>
    );
}
