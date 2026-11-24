import { Panel, RISE, StatCard, fdate, riseStyle } from '@/components/tdfc/ui';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { LogOut, Package, User, Users } from 'lucide-react';
import { ReactNode } from 'react';

type Props = {
    auth: { user: { name: string; role: string; avatar?: string | null } };
    stats: { pending: number; clients: number; products: number; today: number };
    pending: { name: string; at: string }[];
    activity: { id: string; name: string; event: 'approved' | 'rejected'; at: string }[];
};

const dot = { approved: 'bg-tdfc-ok-ink', rejected: 'bg-tdfc-coral' };
const tile = `${RISE} flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border border-border bg-card px-5 py-7 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-tdfc-modal`;

const Tile = ({ icon, title, sub, className = '' }: { icon: ReactNode; title: string; sub: string; className?: string }) => (
    <>
        <span className={`mb-2 grid size-18 place-items-center rounded-full ${className || 'bg-tdfc-coral-soft text-tdfc-coral-ink'}`}>{icon}</span>
        <b className="text-[17px]">{title}</b>
        <span className="max-w-52 text-muted-foreground">{sub}</span>
    </>
);

export default function AdminDashboard() {
    const { auth, stats, pending, activity } = usePage<Props>().props;
    const user = auth?.user ?? { name: 'Admin', role: 'admin' };

    return (
        <AppLayout breadcrumbs={[{ title: 'Admin Dashboard', href: '/admin/dashboard' }]}>
            <Head title="Admin Dashboard" />
            <div className="mx-auto grid w-full max-w-[1120px] content-start gap-5 p-4 md:p-6">
                <section className="flex items-center justify-between gap-4 rounded-[14px] bg-tdfc-coral p-6 text-tdfc-on-coral">
                    <div>
                        <h1 className="text-[clamp(24px,4vw,34px)] font-bold">Welcome back, {user.name.split(' ')[0]}</h1>
                        <p className="mt-1.5">
                            You are logged in as <b className="ml-1 rounded-md bg-tdfc-sun px-2 py-0.5 text-xs text-[oklch(.3_.07_85)] uppercase">{user.role}</b>
                        </p>
                    </div>
                    <div className="hidden size-18 place-items-center overflow-hidden rounded-full bg-card shadow-sm md:grid">
                        {user.avatar ? <img src={user.avatar} alt={`${user.name} profile photo`} className="size-full object-cover" /> : <User className="size-9 text-tdfc-coral" />}
                    </div>
                </section>

                <section aria-label="Key metrics" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard accent index={0} label="Pending approvals" value={stats.pending} />
                    <StatCard index={1} label="Total clients" value={stats.clients} />
                    <StatCard index={2} label="Products active" value={stats.products} />
                    <StatCard index={3} label="Registrations today" value={stats.today} />
                </section>

                <section className="grid items-start gap-5 xl:grid-cols-[1.4fr_1fr]">
                    <Panel className="p-5">
                        <div className="mb-3.5 flex items-center justify-between">
                            <h2 className="text-base font-semibold">Pending approvals</h2>
                            <Link href="/admin/client-management" className="text-[13px] font-semibold text-tdfc-blue-ink hover:underline">Review all</Link>
                        </div>
                        {pending.length === 0 && <p className="py-4 text-center text-muted-foreground">Nothing waiting for review.</p>}
                        <ul>
                            {pending.map((p, i) => (
                                <li key={p.name + p.at} style={riseStyle(i)} className={`${RISE} flex items-center justify-between gap-3 border-b border-border py-3 first:pt-0 last:border-0 last:pb-0`}>
                                    <div>
                                        <b className="block text-sm font-semibold">{p.name}</b>
                                        <span className="text-xs text-muted-foreground">Submitted {fdate(p.at)}</span>
                                    </div>
                                    <Link href="/admin/client-management" className="text-[13px] font-semibold whitespace-nowrap text-tdfc-coral-ink hover:underline">Review</Link>
                                </li>
                            ))}
                        </ul>
                    </Panel>
                    <Panel className="p-5">
                        <h2 className="mb-3.5 text-base font-semibold">Recent activity</h2>
                        {activity.length === 0 && <p className="py-4 text-center text-muted-foreground">No decisions yet.</p>}
                        <ul className="grid gap-3">
                            {activity.map((a, i) => (
                                <li key={a.id} style={riseStyle(i)} className={`${RISE} flex items-start gap-3`}>
                                    <span aria-hidden className={`mt-1.5 size-2 flex-none rounded-full ${dot[a.event]}`} />
                                    <div>
                                        <b className="block text-sm font-medium">{a.event === 'approved' ? 'Approved' : 'Rejected'} {a.name}</b>
                                        <span className="text-xs text-muted-foreground">{new Date(a.at).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Panel>
                </section>

                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Shortcuts</p>
                <section className="grid gap-5 md:grid-cols-3">
                    <Link href="/admin/products" className={tile} style={riseStyle(0)}>
                        <Tile icon={<Package className="size-8.5" />} title="Manage Products" sub="View, edit, and manage all product listings." />
                    </Link>
                    <Link href="/admin/client-management" className={tile} style={riseStyle(1)}>
                        <Tile icon={<Users className="size-8.5" />} title="Manage Clients" sub="Access client profiles and handle requests efficiently." />
                    </Link>
                    <button type="button" onClick={() => router.post('/logout')} style={riseStyle(2)} className={`${tile} !border-tdfc-coral !bg-tdfc-coral text-tdfc-on-coral hover:!bg-[color-mix(in_oklch,var(--brand-surface)_88%,black)] [&>span:last-child]:!text-on-brand-surface`}>
                        <Tile icon={<LogOut className="size-8.5" />} title="Log Out" sub="End your current session securely." className="bg-card/35 text-tdfc-on-coral" />
                    </button>
                </section>
            </div>
        </AppLayout>
    );
}
