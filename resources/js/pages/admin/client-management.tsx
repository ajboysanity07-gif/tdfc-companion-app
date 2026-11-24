import Modal from '@/components/auth/modal';
import { Badge, BtnSpinner, Drawer, LoadImg, NumPager, PageBanner, Panel, Tabs, btn, useTable, useToast } from '@/components/tdfc/ui';
import AppLayout from '@/layouts/app-layout';
import { PendingUser } from '@/types';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { useMemo, useState } from 'react';

interface Props {
    pendingUsers: PendingUser[];
    rejectionReasons: { code: string; label: string }[];
}

type Status = 'pending' | 'approved' | 'rejected';
const TABS: { id: Status | 'all'; label: string }[] = [
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'all', label: 'All' },
];
const STATUS = {
    approved: <Badge tone="ok">Approved</Badge>,
    rejected: <Badge tone="bad">Rejected</Badge>,
    pending: <Badge tone="warn">Pending</Badge>,
};
const php = (n: number) => `Php ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const ini = (n: string) => n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
const date = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const stat = (s: string) => STATUS[s as Status] ?? <Badge>{s}</Badge>;
const input = 'h-10 w-full rounded-[10px] border border-input bg-card px-3 shadow-sm focus:border-ring focus:outline-none';

const docsOf = (u: PendingUser) =>
    [
        [u.prc_id_photo_front, 'PRC ID (front)'],
        [u.prc_id_photo_back, 'PRC ID (back)'],
        [u.payslip_photo_path, 'Payslip'],
    ]
        .filter(([p]) => p)
        .map(([p, label]) => ({ src: `/storage/${p}`, label: label as string }));

export default function ClientManagement({ pendingUsers, rejectionReasons }: Props) {
    const [tab, setTab] = useState<Status | 'all'>('pending');
    const [q, setQ] = useState('');
    const [cls, setCls] = useState('all');
    const [selId, setSelId] = useState<number | null>(null);
    const [rejecting, setRejecting] = useState(false);
    const [picked, setPicked] = useState<string[]>([]);
    const [salaryFor, setSalaryFor] = useState<PendingUser | null>(null);
    const [sal, setSal] = useState('');
    const [salNote, setSalNote] = useState('');
    const [salaries, setSalaries] = useState<Record<string, number>>({});
    const [viewer, setViewer] = useState<{ i: number; zoom: boolean } | null>(null);
    const [busy, setBusy] = useState(false);
    const { show, toast } = useToast();

    const sel = pendingUsers.find((u) => u.user_id === selId) ?? null;
    const list = useMemo(() => {
        const n = q.trim().toLowerCase();
        return pendingUsers.filter(
            (u) => (tab === 'all' || u.status === tab) && (cls === 'all' || u.class === cls) && (!n || [u.name, u.email, u.acctno].some((v) => (v ?? '').toLowerCase().includes(n))),
        );
    }, [pendingUsers, tab, q, cls]);
    const t = useTable(list, { key: 'at', per: 8 }, (u, k) => ({ name: u.name, ph: u.phone_no, acct: u.acctno, at: u.created_at, cls: u.class ?? '', st: u.status })[k]?.toLowerCase() ?? '');
    const tabs = TABS.map((x) => ({ ...x, count: pendingUsers.filter((u) => x.id === 'all' || u.status === x.id).length }));
    const th = (k: string, label: string, hide?: boolean) => (
        <th key={k} aria-sort={t.key === k ? (t.asc ? 'ascending' : 'descending') : 'none'} className={`px-4 py-2.5 text-left text-xs font-semibold whitespace-nowrap text-muted-foreground ${hide ? 'max-md:hidden' : ''}`}>
            <button type="button" onClick={() => t.sort(k)} className="inline-flex cursor-pointer items-center gap-1.5 hover:text-foreground">
                {label}
                <span className="inline-block min-w-2.5 text-[11px] opacity-70">{t.key === k ? (t.asc ? '▲' : '▼') : ''}</span>
            </button>
        </th>
    );

    const go = (url: string, data: Record<string, string[]>, then?: () => void) => {
        setBusy(true);
        router.post(url, data, {
            preserveScroll: true,
            // success/error text comes from the backend flash (global <Toaster />)
            onSuccess: () => then?.(),
            onFinish: () => setBusy(false),
        });
    };
    const approve = (u: PendingUser) => go(route('admin.client-management.approve', u.user_id), {}, () => setTab('approved'));
    const reject = (u: PendingUser) =>
        go(route('admin.client-management.reject', u.user_id), { reasons: picked }, () => {
            setRejecting(false);
            setTab('rejected');
        });

    const saveSalary = async () => {
        if (!salaryFor) return;
        setBusy(true);
        try {
            await axios.post(`/admin/clients/${salaryFor.acctno}/salary`, { salary_amount: +sal, notes: salNote });
            setSalaries((s) => ({ ...s, [salaryFor.acctno]: +sal }));
            show(`Salary updated for ${salaryFor.name}`);
            setSalaryFor(null);
        } catch {
            show('Failed to save salary', 'error');
        } finally {
            setBusy(false);
        }
    };

    const docs = sel ? docsOf(sel) : [];
    const salary = sel ? (salaries[sel.acctno] ?? sel.salary_amount) : undefined;

    return (
        <AppLayout breadcrumbs={[{ title: 'Admin', href: '/admin/dashboard' }, { title: 'Client Management', href: '/admin/client-management' }]}>
            <Head title="Client Management" />
            <div className="grid content-start gap-5 p-4 md:p-6">
                <PageBanner title="Client Management" sub="Review registrations in a pending-first queue and open each client for details and documents." />

                <Panel className="overflow-hidden">
                    <div className="grid gap-3.5 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 max-md:flex-col max-md:items-stretch">
                        <Tabs tabs={tabs} value={tab} onChange={(v) => { setTab(v); setSelId(null); t.setPage(0); }} />
                        <div className="flex flex-1 items-center justify-end gap-2">
                            <input value={q} onChange={(e) => { setQ(e.target.value); t.setPage(0); }} placeholder="Search name, email, or account no." aria-label="Search clients" autoComplete="off" className={`${input} max-w-80 min-w-0 flex-1 max-md:max-w-none`} />
                            <select aria-label="Filter by class" value={cls} onChange={(e) => { setCls(e.target.value); t.setPage(0); }} className="h-10 flex-none cursor-pointer rounded-[10px] border border-input bg-card px-3 shadow-sm">
                                <option value="all">All classes</option>
                                {['A', 'B', 'C', 'D'].map((c) => (
                                    <option key={c} value={c}>Class {c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table aria-label="Clients table" className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-border">
                                    {th('name', 'Client')}
                                    {th('ph', 'Contact', true)}
                                    {th('acct', 'Account no.', true)}
                                    {th('at', 'Submitted', true)}
                                    {th('cls', 'Class')}
                                    {th('st', 'Status')}
                                    <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {t.view.map((u) => (
                                    <tr key={u.user_id} tabIndex={0} aria-label={`Open review for ${u.name}`} onClick={() => setSelId(u.user_id)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setSelId(u.user_id))} className={`cursor-pointer border-b border-border last:border-0 hover:bg-muted ${u.user_id === selId ? 'bg-tdfc-blue/15' : ''}`}>
                                        <td className="px-4 py-3.5">
                                            <div className="flex min-w-0 items-center gap-2.5">
                                                <span aria-hidden className="grid size-9 flex-none place-items-center rounded-full bg-tdfc-blue-soft text-[13px] font-bold text-tdfc-blue-ink">{ini(u.name)}</span>
                                                <div className="min-w-0">
                                                    <span className="font-semibold">{u.name}</span>
                                                    <span className="block text-xs text-muted-foreground">{u.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 max-md:hidden">{u.phone_no}</td>
                                        <td className="px-4 py-3.5 tabular-nums max-md:hidden">{u.acctno}</td>
                                        <td className="px-4 py-3.5 max-md:hidden">{date(u.created_at)}</td>
                                        <td className="px-4 py-3.5">{u.class ? <Badge>Class {u.class}</Badge> : <span className="text-muted-foreground">—</span>}</td>
                                        <td className="px-4 py-3.5">{stat(u.status)}</td>
                                        <td className="px-4 py-3.5 text-right">
                                            {u.status === 'approved' && (
                                                <button type="button" onClick={(e) => { e.stopPropagation(); router.get(`/admin/clients/${u.user_id}/dashboard`); }} onKeyDown={(e) => e.stopPropagation()} className={`${btn.base} ${btn.plain} ${btn.sm}`}>Open profile</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {t.view.length === 0 && <div className="p-8 text-center text-muted-foreground">No clients match this view.</div>}
                    </div>
                    </div>
                    <NumPager t={t} noun="clients" />
                </Panel>
            </div>

            <Drawer open={!!sel} onClose={() => setSelId(null)} label="Client review">
                {sel && (
                    <div className="flex min-h-dvh flex-col">
                        <div className="flex items-start gap-3 border-b border-border px-5 py-4.5">
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                <span aria-hidden className="grid size-9 flex-none place-items-center rounded-full bg-tdfc-blue-soft text-[13px] font-bold text-tdfc-blue-ink">{ini(sel.name)}</span>
                                <div>
                                    <b className="block">{sel.name}</b>
                                    <small className="text-muted-foreground">{sel.acctno} · {sel.status.charAt(0).toUpperCase() + sel.status.slice(1)}</small>
                                </div>
                            </div>
                            <button type="button" onClick={() => setSelId(null)} aria-label="Close review drawer" className={`${btn.base} ${btn.plain} ${btn.sm}`}>Close</button>
                        </div>
                        <div className="grid flex-1 content-start gap-4.5 overflow-auto p-5">
                            <section>
                                <h3 className="mb-2.5 text-[13px] tracking-wider text-muted-foreground">CLIENT DETAILS</h3>
                                <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-2 text-sm [&_dd]:m-0 [&_dd]:break-words [&_dt]:font-semibold [&_dt]:text-tdfc-coral-ink">
                                    <dt>Email</dt><dd>{sel.email}</dd>
                                    <dt>Phone</dt><dd>{sel.phone_no}</dd>
                                    <dt>Account no.</dt><dd className="tabular-nums">{sel.acctno}</dd>
                                    <dt>Registered</dt><dd>{date(sel.created_at)}</dd>
                                    <dt>Class</dt><dd>{sel.class ? <Badge>Class {sel.class}</Badge> : '—'}</dd>
                                    <dt>Status</dt><dd>{stat(sel.status)}</dd>
                                </dl>
                            </section>
                            <section>
                                <h3 className="mb-2.5 text-[13px] tracking-wider text-muted-foreground">SUBMITTED DOCUMENTS</h3>
                                <div className="grid grid-cols-3 gap-2.5">
                                    {docs.map((d, i) => (
                                        <button key={d.src} type="button" onClick={() => setViewer({ i, zoom: false })} aria-label={`View ${d.label} for ${sel.name}`} className="cursor-zoom-in overflow-hidden rounded-[10px] border border-border bg-muted text-center hover:border-ring">
                                            <LoadImg src={d.src} alt={`${d.label} of ${sel.name}`} className="aspect-4/3 w-full object-cover" />
                                            <span className="block p-1.5 text-[11px] text-muted-foreground">{d.label}</span>
                                        </button>
                                    ))}
                                </div>
                                {docs.length === 0 && <p className="text-muted-foreground">No documents submitted.</p>}
                            </section>
                            {sel.status === 'approved' && (
                                <section>
                                    <h3 className="mb-2.5 text-[13px] tracking-wider text-muted-foreground">BASIC SALARY</h3>
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <button type="button" onClick={() => { setSalaryFor(sel); setSal(salary ? String(salary) : ''); setSalNote(''); }} className="rounded-lg border border-dashed border-ring bg-card px-2.5 py-1.75 text-[13px] font-semibold hover:bg-muted">Set Basic Salary</button>
                                        <b className="tabular-nums">{salary ? php(salary) : 'Not set'}</b>
                                    </div>
                                </section>
                            )}
                            {sel.status === 'rejected' && (
                                <section>
                                    <h3 className="mb-2.5 text-[13px] tracking-wider text-muted-foreground">REJECTION REASONS</h3>
                                    <ul className="grid list-disc gap-1 pl-4.5 text-sm text-tdfc-coral-ink">
                                        {(sel.rejection_reasons?.length ? sel.rejection_reasons.map((r) => r.label) : ['No reasons recorded']).map((w) => (
                                            <li key={w}>{w}</li>
                                        ))}
                                    </ul>
                                </section>
                            )}
                        </div>
                        {sel.status === 'pending' && (
                            <div className="flex gap-2.5 border-t border-border bg-card px-5 py-4">
                                <button type="button" disabled={busy} onClick={() => { setPicked([]); setRejecting(true); }} className={`${btn.base} ${btn.danger} flex-1`}>Reject</button>
                                <button type="button" disabled={busy} onClick={() => approve(sel)} className={`${btn.base} ${btn.dark} flex-1`}>{busy && <BtnSpinner />}Approve</button>
                            </div>
                        )}
                    </div>
                )}
            </Drawer>

            <Modal open={rejecting && !!sel} onClose={() => setRejecting(false)} label="Reject registration">
                <h3 className="text-lg font-semibold">Reject registration</h3>
                <p className="text-muted-foreground">Select every reason for rejecting <b>{sel?.name}</b>.</p>
                <div className="mt-3.5 grid gap-2">
                    {rejectionReasons.map((r) => (
                        <label key={r.code} className="flex cursor-pointer items-center gap-2.5 rounded-[10px] border border-border px-3 py-2.5 hover:bg-muted">
                            <input type="checkbox" checked={picked.includes(r.code)} onChange={() => setPicked((p) => (p.includes(r.code) ? p.filter((x) => x !== r.code) : [...p, r.code]))} className="size-4.5 accent-tdfc-coral" />
                            {r.label}
                        </label>
                    ))}
                </div>
                <div aria-live="polite" className={`mt-3 rounded-[10px] px-3 py-2.5 text-[13px] ${picked.length ? 'bg-tdfc-ok-soft text-tdfc-ok-ink' : 'bg-tdfc-coral-soft text-tdfc-coral-ink'}`}>
                    {picked.length ? `${picked.length} reason${picked.length > 1 ? 's' : ''} selected` : 'Select at least one reason to continue'}
                </div>
                <div className="mt-5 flex justify-end gap-2">
                    <button type="button" onClick={() => setRejecting(false)} className={`${btn.base} ${btn.plain}`}>Cancel</button>
                    <button type="button" disabled={!picked.length || busy} onClick={() => sel && reject(sel)} className={`${btn.base} ${btn.danger}`}>{busy && <BtnSpinner />}Reject</button>
                </div>
            </Modal>

            <Modal open={!!salaryFor} onClose={() => setSalaryFor(null)} label="Set Basic Salary">
                <h3 className="text-lg font-semibold">Set Basic Salary</h3>
                <p className="text-muted-foreground">Update basic salary for <b>{salaryFor?.name}</b>.</p>
                <div className="mt-3.5 grid gap-1.5">
                    <label htmlFor="slAmt" className="font-medium">Salary amount (Php)</label>
                    <input id="slAmt" type="number" min="0" step="0.01" inputMode="decimal" value={sal} onChange={(e) => setSal(e.target.value)} className={`${input} tabular-nums`} />
                </div>
                <div className="mt-2.5 grid gap-1.5">
                    <label htmlFor="slNote" className="font-medium">Note</label>
                    <input id="slNote" value={salNote} onChange={(e) => setSalNote(e.target.value)} placeholder="e.g. Updated per latest payslip" className={input} />
                </div>
                <div className="mt-5 flex justify-end gap-2">
                    <button type="button" onClick={() => setSalaryFor(null)} className={`${btn.base} ${btn.plain}`}>Cancel</button>
                    <button type="button" disabled={!(+sal > 0) || busy} onClick={saveSalary} className={`${btn.base} ${btn.dark}`}>{busy && <BtnSpinner />}Save</button>
                </div>
            </Modal>

            <Modal open={!!viewer && docs.length > 0} onClose={() => setViewer(null)} label="Document viewer" bare>
                {viewer && docs[viewer.i] && (
                    <div className="flex h-dvh flex-col bg-[oklch(.1_0_0/.92)] text-white">
                        <header className="flex items-center gap-3 px-5 py-3">
                            <h3 className="flex-1 text-base">{sel?.name} — {docs[viewer.i].label}</h3>
                            <button type="button" onClick={() => setViewer(null)} aria-label="Close viewer" className={`${btn.base} ${btn.sm} border-white/20 bg-white/15 hover:bg-white/25`}>Close</button>
                        </header>
                        <div className="grid min-h-0 flex-1 place-items-center overflow-auto p-3">
                            <LoadImg key={docs[viewer.i].src} src={docs[viewer.i].src} alt={`${docs[viewer.i].label} of ${sel?.name}`} className={`max-h-full max-w-full object-contain transition-transform ${viewer.zoom ? 'scale-[1.8]' : ''}`} />
                        </div>
                        <footer className="flex justify-center gap-2 p-3">
                            <button type="button" onClick={() => setViewer({ i: (viewer.i + docs.length - 1) % docs.length, zoom: false })} aria-label="Previous document" className={`${btn.base} ${btn.sm} border-white/20 bg-white/15 hover:bg-white/25`}>‹ Previous</button>
                            <button type="button" onClick={() => setViewer({ ...viewer, zoom: !viewer.zoom })} aria-label="Toggle zoom" className={`${btn.base} ${btn.sm} border-white/20 bg-white/15 hover:bg-white/25`}>Zoom</button>
                            <button type="button" onClick={() => setViewer({ i: (viewer.i + 1) % docs.length, zoom: false })} aria-label="Next document" className={`${btn.base} ${btn.sm} border-white/20 bg-white/15 hover:bg-white/25`}>Next ›</button>
                        </footer>
                    </div>
                )}
            </Modal>
            {toast}
        </AppLayout>
    );
}
