import { Link, usePage } from '@inertiajs/react';
import { Briefcase, ClipboardList, Home, Package, PiggyBank, UserRound, Users } from 'lucide-react';

type SharedPageProps = { auth: { user?: { role?: string } | null } };

// `flat` = that page's mockup shows no pill behind the active icon, only this text color.
type Item = { href: string; label: string; icon: typeof Home; flat?: string };

const client: Item[] = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/loans/transactions', label: 'Loans', icon: Briefcase, flat: 'text-tdfc-coral-ink' },
    { href: '/savings', label: 'Savings', icon: PiggyBank, flat: 'text-tdfc-coral-ink' },
    { href: '/settings/profile', label: 'Account', icon: UserRound },
];
const admin: Item[] = [
    { href: '/admin/dashboard', label: 'Home', icon: Home },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/client-management', label: 'Clients', icon: Users, flat: 'text-foreground' },
    { href: '/admin/registrations', label: 'Log', icon: ClipboardList },
    { href: '/settings/profile', label: 'Account', icon: UserRound },
];

export default function NavMobile() {
    const { props, url } = usePage<SharedPageProps>();
    const items = props.auth?.user?.role === 'admin' ? admin : client;

    return (
        <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-40 flex h-16 border-t border-border bg-background md:hidden">
            {items.map(({ href, label, icon: Icon, flat }) => {
                const on = url.startsWith(href);
                const pill = on && !flat;
                return (
                    <Link
                        key={href}
                        href={href}
                        prefetch
                        className={`grid flex-1 place-items-center content-center gap-0.5 text-[11px] transition-colors active:bg-muted ${on ? `font-semibold ${flat ?? 'text-tdfc-coral-ink'}` : 'text-muted-foreground'}`}
                    >
                        <span
                            className={`grid w-[52px] place-items-center rounded-full transition-all ${flat ? '' : 'h-[30px]'} ${pill ? 'bg-[color-mix(in_oklch,var(--brand-red)_35%,var(--card))]' : ''}`}
                        >
                            <Icon className="size-[26px]" />
                        </span>
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}
