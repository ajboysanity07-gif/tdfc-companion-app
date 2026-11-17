import { Link, usePage } from '@inertiajs/react';
import { Briefcase, ClipboardList, Home, Package, UserRound, Users } from 'lucide-react';

type SharedPageProps = { auth: { user?: { role?: string } | null } };

const client = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/loans/transactions', label: 'Loans', icon: Briefcase },
    { href: '/settings/profile', label: 'Account', icon: UserRound },
];
const admin = [
    { href: '/admin/dashboard', label: 'Home', icon: Home },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/client-management', label: 'Clients', icon: Users },
    { href: '/admin/registrations', label: 'Log', icon: ClipboardList },
    { href: '/settings/profile', label: 'Account', icon: UserRound },
];

export default function NavMobile() {
    const { props, url } = usePage<SharedPageProps>();
    const items = props.auth?.user?.role === 'admin' ? admin : client;

    return (
        <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-40 flex h-16 border-t border-border bg-background md:hidden">
            {items.map(({ href, label, icon: Icon }) => {
                const on = url.startsWith(href);
                return (
                    <Link key={href} href={href} prefetch className={`grid flex-1 place-items-center content-center gap-0.5 text-[11px] transition-colors active:bg-muted ${on ? 'font-semibold text-tdfc-coral-ink' : 'text-muted-foreground'}`}>
                        <Icon className={`size-6 transition-transform ${on ? 'scale-110' : ''}`} />
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}
