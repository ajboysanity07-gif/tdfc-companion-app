import { Metric, ReviewSummary, queueAction } from '@/components/tdfc/review-queue';
import { Panel, RISE, btn, riseStyle } from '@/components/tdfc/ui';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { LogOut, Package, Users } from 'lucide-react';

type Props = {
    auth: { user: { name: string; role: string; avatar?: string | null } };
    stats: { pending: number; approved: number; rejected: number; clients: number; products: number; productsTotal: number; month: number };
    pending: { name: string; at: string }[];
    activity: { id: string; name: string; event: 'submitted' | 'approved' | 'rejected'; at: string }[];
};

const dot = { submitted: 'bg-tdfc-blue', approved: 'bg-tdfc-ok-ink', rejected: 'bg-tdfc-coral' };
const title = {
    submitted: (n: string) => `${n} submitted a registration`,
    approved: (n: string) => `Approved ${n}`,
    rejected: (n: string) => `Rejected ${n}`,
};
const when = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString('en-US', { dateStyle: 'medium' })} · ${d.toLocaleTimeString('en-US', { timeStyle: 'short' })}`;
};
const shortcut = `${btn.base} ${btn.plain} !h-11`;

export default function AdminDashboard() {
    const { auth, stats, pending, activity } = usePage<Props>().props;
    const user = auth?.user ?? { name: 'Admin', role: 'admin' };

    const month = new Date().toLocaleDateString('en-US', { month: 'long' });

    return (
        <AppLayout breadcrumbs={[{ title: 'Admin Dashboard', href: '/admin/dashboard' }]}>
            <Head title="Admin Dashboard" />
            <div className="mx-auto grid w-full max-w-[1120px] content-start gap-5 p-4 md:p-6">
                <section>
                    <h1 className="text-2xl font-extrabold">Welcome back, {user.name.split(' ')[0]}</h1>
                    <p className="mt-1 text-muted-foreground">You are logged in as {user.role}</p>
                </section>

                <ReviewSummary
                    count={stats.pending}
                    note={stats.pending ? 'Registrations with documents to check' : 'The queue is clear'}
                    action={<Link href="/admin/client-management" className={queueAction}>Review pending queue</Link>}
                    items={pending.map((p) => ({ id: p.name + p.at, name: p.name, at: p.at, href: '/admin/client-management' }))}
                    metricsLabel="Key metrics"
                >
                    <Metric label="Total clients" value={stats.clients} hint={`${stats.pending} pending, ${stats.approved} approved, ${stats.rejected} rejected`} />
                    <Metric label="Active products" value={stats.products} hint={`Of ${stats.productsTotal} loan products`} />
                    <Metric label="Received this month" value={stats.month} hint={`Submissions in ${month}`} />
                </ReviewSummary>

                <Panel className="p-5">
                    <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        <h2 className="text-lg font-bold">Recent activity</h2>
                        <Link href="/admin/registrations" className="inline-flex min-h-8 items-center text-[13px] font-semibold text-tdfc-blue-ink hover:underline">View full log</Link>
                    </div>
                    {activity.length === 0 && <p className="py-4 text-center text-muted-foreground">No activity yet.</p>}
                    <ul className="divide-y divide-border">
                        {activity.map((a, i) => (
                            <li key={a.id} style={riseStyle(i)} className={`${RISE} grid grid-cols-[8px_minmax(0,1fr)_auto] items-center gap-3 py-3 max-[720px]:grid-cols-[8px_minmax(0,1fr)] max-[720px]:gap-y-0.5`}>
                                <span aria-hidden className={`size-2 rounded-full ${dot[a.event]}`} />
                                <b className="font-medium">{title[a.event](a.name)}</b>
                                <time dateTime={a.at} className="text-right text-xs text-muted-foreground max-[720px]:col-start-2 max-[720px]:text-left">{when(a.at)}</time>
                            </li>
                        ))}
                    </ul>
                </Panel>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <nav aria-label="Shortcuts" className="flex flex-wrap gap-2">
                        <Link href="/admin/products" className={shortcut}>
                            <Package className="size-4.5" />
                            Manage Products
                        </Link>
                        <Link href="/admin/client-management" className={shortcut}>
                            <Users className="size-4.5" />
                            Manage Clients
                        </Link>
                    </nav>
                    <button type="button" onClick={() => router.post('/logout')} className={`${btn.base} !h-11 cursor-pointer border-transparent text-muted-foreground hover:bg-muted hover:text-foreground`}>
                        <LogOut className="size-4.5" />
                        Log Out
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
