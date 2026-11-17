import { Badge, NumPager, PageBanner, Panel, RISE, StatCard, Tabs, btn, riseStyle, useTable, useToast } from '@/components/tdfc/ui';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type Ev = { id: string; at: string; name: string; email: string; acctno: string | null; event: 'submitted' | 'approved' | 'rejected'; by: string | null; note: string };
type Props = { events: Ev[]; stats: { month: number; pending: number; approved: number; decided: number; avg_days: number | null } };

const TABS = [
    { id: 'all', label: 'All events' },
    { id: 'submitted', label: 'Submitted' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
] as const;
type Tab = (typeof TABS)[number]['id'];

const BADGE = { submitted: <Badge>Submitted</Badge>, approved: <Badge tone="ok">Approved</Badge>, rejected: <Badge tone="bad">Rejected</Badge> };
const ini = (n: string) => n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
const csv = (v: string | null) => `"${(v ?? '').replace(/"/g, '""')}"`;

export default function Registrations() {
    const { events, stats } = usePage<Props>().props;
    const [tab, setTab] = useState<Tab>('all');
    const [q, setQ] = useState('');
    const { show, toast } = useToast();

    const tabs = TABS.map((x) => ({ ...x, count: events.filter((e) => x.id === 'all' || e.event === x.id).length }));
    const list = useMemo(() => {
        const n = q.trim().toLowerCase();
        return events.filter((e) => (tab === 'all' || e.event === tab) && (!n || [e.name, e.email, e.acctno ?? '', e.note].some((v) => v.toLowerCase().includes(n))));
    }, [events, tab, q]);
    const t = useTable(list, { key: 'at', per: 8 });
    const rate = stats.decided ? Math.round((stats.approved / stats.decided) * 100) : null;

    const exportCsv = () => {
        const head = 'Date,Client,Email,Account no.,Event,Details,By';
        const body = list.map((e) => [e.at, e.name, e.email, e.acctno, e.event, e.note, e.by].map(csv).join(','));
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([[head, ...body].join('\n')], { type: 'text/csv' }));
        a.download = 'registrations.csv';
        a.click();
        URL.revokeObjectURL(a.href);
        show('Exported registrations.csv');
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Admin', href: '/admin/dashboard' }, { title: 'Registrations', href: '/admin/registrations' }]}>
            <Head title="Registrations" />
            <div className="grid content-start gap-5 p-4 md:p-6">
                <PageBanner title="Registrations" sub="Every registration event in one log — submissions and decisions.">
                    <Link href="/admin/client-management" className={`${btn.base} ${btn.plain}`}>Review pending queue</Link>
                </PageBanner>

                <section aria-label="Registration metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard index={0} label="Received this month" value={stats.month} />
                    <StatCard accent index={1} label="Pending review" value={stats.pending} />
                    <StatCard index={2} label="Approval rate" value={rate === null ? '—' : `${rate}%`} />
                    <StatCard index={3} label="Avg. review time" value={stats.avg_days === null ? '—' : `${stats.avg_days} days`} />
                </section>

                <Panel className="grid gap-3.5 overflow-hidden pt-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 px-5">
                        <Tabs tabs={tabs} value={tab} onChange={(v) => { setTab(v); t.setPage(0); }} />
                        <div className="flex flex-1 items-center justify-end gap-2">
                            <input value={q} onChange={(e) => { setQ(e.target.value); t.setPage(0); }} placeholder="Search client, account no., or note" aria-label="Search events" autoComplete="off" className="h-10 max-w-80 min-w-0 flex-1 rounded-[10px] border border-input bg-white px-3 shadow-sm" />
                            <button type="button" onClick={exportCsv} className={`${btn.base} ${btn.plain}`}>Export CSV</button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table aria-label="Registration events" className="w-full border-collapse max-sm:block [&_tbody]:max-sm:block [&_thead]:max-sm:hidden">
                            <thead>
                                <tr className="border-b border-border">
                                    {['Date', 'Client', 'Account no.', 'Event', 'Details'].map((h) => (
                                        <th key={h} className={`px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground ${h === 'Account no.' ? 'max-md:hidden' : ''}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {t.view.map((e, i) => (
                                    <tr key={e.id} style={riseStyle(i)} className="animate-tdfc-rise border-b border-border align-top last:border-0 hover:bg-muted max-sm:mx-4 max-sm:mb-2.5 max-sm:block max-sm:rounded-xl max-sm:border max-sm:p-3.5">
                                        <td className="px-4 py-3.5 max-sm:block max-sm:p-0">
                                            <span className="font-medium">{new Date(e.at).toLocaleDateString('en-PH', { dateStyle: 'medium' })}</span>
                                            <span className="block text-xs text-muted-foreground">{new Date(e.at).toLocaleTimeString('en-PH', { timeStyle: 'short' })}</span>
                                        </td>
                                        <td className="px-4 py-3.5 max-sm:block max-sm:p-0 max-sm:pt-1.5">
                                            <div className="flex min-w-0 items-center gap-2.5">
                                                <span aria-hidden className="grid size-9 flex-none place-items-center rounded-full bg-tdfc-blue-soft text-[13px] font-bold text-tdfc-blue-ink">{ini(e.name)}</span>
                                                <div className="min-w-0">
                                                    <span className="font-semibold">{e.name}</span>
                                                    <span className="block text-xs text-muted-foreground">{e.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 tabular-nums max-md:hidden">{e.acctno}</td>
                                        <td className="px-4 py-3.5 max-sm:block max-sm:p-0 max-sm:pt-1.5">{BADGE[e.event]}</td>
                                        <td className="px-4 py-3.5 max-sm:block max-sm:p-0 max-sm:pt-1.5">
                                            {e.note}
                                            {e.by && <span className="block text-xs text-muted-foreground">by {e.by}</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {t.view.length === 0 && <div className="p-8 text-center text-muted-foreground">No events match this view.</div>}
                    </div>

                    <NumPager t={t} noun="events" />
                </Panel>
            </div>
            {toast}
        </AppLayout>
    );
}
