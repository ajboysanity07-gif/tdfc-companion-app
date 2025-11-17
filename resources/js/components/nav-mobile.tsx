import { Link, router, usePage } from '@inertiajs/react';
import { useTheme } from '@mui/material/styles'; // <-- ADD THIS
import { Briefcase, Home, LogOut, Package, Settings, UserRound, Users } from 'lucide-react';
import { useMemo } from 'react';

type AuthUser = { role?: string };

type SharedPageProps = {
    auth: { user?: AuthUser | null };
};

export default function NavMobile() {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

    const { props } = usePage<SharedPageProps>();
    const user = props.auth?.user;
    const userRole = user?.role || 'customer';
    const isDashboard = pathname === '/dashboard' || pathname === '/admin/dashboard';

    // MUI theme hook
    const theme = useTheme();

    const customerNav = useMemo(
        () => [
            { href: '/dashboard', label: 'Home', icon: Home },
            { href: '/loan-transactions', label: 'Loans', icon: Briefcase },
            { href: route('profile.edit'), label: 'Account', icon: UserRound },
        ],
        [],
    );

    const adminNav = useMemo(
        () => [
            { href: '/admin/dashboard', label: 'Home', icon: Home },
            { href: '/admin/products', label: 'Products', icon: Package },
            { href: '/admin/client-management', label: 'Clients', icon: Users },
        ],
        [],
    );

    const items = useMemo(() => {
        if (userRole === 'admin') return adminNav;
        return customerNav;
    }, [userRole, adminNav, customerNav]);

    const settingsUrl = route('profile.edit');

    return (
        <>
            {/* Responsive bottom nav using theme palette, no opacity */}
            <nav
                className="fixed inset-x-0 bottom-0 z-40 border-t px-6 py-3 md:hidden"
                style={{
                    background: theme.palette.background.paper, // <--- USE THEME!
                    borderColor: theme.palette.divider,
                }}
            >
                <ul className={`grid ${items.length === 4 ? 'grid-cols-4' : 'grid-cols-3'} gap-6`}>
                    {items.map((it) => {
                        const active = pathname === it.href;
                        const Icon = it.icon;
                        return (
                            <li key={it.href} className="flex items-center justify-center">
                                <Link href={it.href} className="flex flex-col items-center" prefetch>
                                    <Icon
                                        className={`size-7 ${
                                            active ? 'text-[#F57979]' : theme.palette.mode === 'dark' ? 'text-neutral-200' : 'text-gray-700'
                                        }`}
                                    />
                                    <span
                                        className={`mt-1 text-sm font-semibold ${
                                            active ? 'text-[#F57979]' : theme.palette.mode === 'dark' ? 'text-neutral-200' : 'text-gray-700'
                                        }`}
                                    >
                                        {it.label}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            {/* FLOATING SETTINGS BUTTON */}
            <Link
                href={settingsUrl}
                className="fixed right-6 bottom-36 z-50 flex items-center justify-center rounded-full bg-neutral-200 p-4 shadow-lg transition-colors hover:bg-neutral-300 md:hidden dark:bg-neutral-800 dark:hover:bg-neutral-700"
                style={{
                    boxShadow: '0 3px 16px 0 rgba(80,80,80,0.10)',
                }}
                title="Account Settings"
            >
                <Settings className="h-6 w-6 text-gray-700 dark:text-neutral-200" />
            </Link>
            {/* Floating log-out button */}
            {!isDashboard && (
                <button
                    type="button"
                    onClick={() => router.post('/logout')}
                    className="fixed right-6 bottom-20 z-50 flex items-center justify-center rounded-full bg-[#F57979] p-4 text-white shadow-lg transition-colors hover:bg-[#da4747] md:hidden"
                    style={{
                        boxShadow: '0 3px 16px 0 rgba(245,121,121,0.12)',
                    }}
                    title="Log out"
                >
                    <LogOut className="h-6 w-6" />
                </button>
            )}
        </>
    );
}
