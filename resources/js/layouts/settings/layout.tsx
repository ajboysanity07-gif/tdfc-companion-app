import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { KeyRound, Sun, UserRound } from 'lucide-react';
import { type PropsWithChildren } from 'react';

const tabs = [
    { title: 'Profile', href: '/settings/profile', icon: UserRound },
    { title: 'Password', href: '/settings/password', icon: KeyRound },
    { title: 'Appearance', href: '/settings/appearance', icon: Sun },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { url } = usePage();

    return (
        <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-4 p-4 min-[860px]:flex-row min-[860px]:items-start min-[860px]:gap-8 md:p-6">
            <h1 className="sr-only">Settings</h1>
            <nav aria-label="Settings" className="flex gap-0.5 overflow-x-auto border-b border-border pb-2 min-[860px]:sticky min-[860px]:top-6 min-[860px]:w-[200px] min-[860px]:flex-none min-[860px]:flex-col min-[860px]:overflow-visible min-[860px]:border-b-0 min-[860px]:pb-0">
                {tabs.map(({ title, href, icon: Icon }) => {
                    const on = url.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            prefetch
                            aria-current={on ? 'page' : undefined}
                            className={cn(
                                'inline-flex h-10 items-center gap-2.5 rounded-lg px-3 text-sm whitespace-nowrap',
                                on ? 'bg-primary font-semibold text-primary-foreground' : 'font-medium text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                        >
                            <Icon className="size-4" aria-hidden />
                            {title}
                        </Link>
                    );
                })}
            </nav>
            <div className="min-w-0 flex-1">{children}</div>
        </div>
    );
}
