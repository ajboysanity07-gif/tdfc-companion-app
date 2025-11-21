import { getAdminRecentUsers, getAdminSummary } from '@/api/auth-api';
import AppLayout from '@/layouts/app-layout';
import { useMyTheme } from '@/hooks/use-mytheme';
import { Head, router, usePage } from '@inertiajs/react';
import { LogOut, Package, User, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

type UserProps = {
    auth: {
        user: {
            name: string;
            email: string;
            role: string;
            avatar?: string | null;
        };
    };
};

type Summary = { totalUsers: number; admins: number; customers: number };
type RecentUser = { user_id: number; email: string; role: string; status: string; created_at: string };

export default function AdminDashboard() {
    const { props } = usePage<UserProps>();
    const user = props.auth?.user ?? { name: 'Admin', role: 'admin' };
    const theme = useMyTheme();
    const [summary, setSummary] = useState<Summary | null>(null);
    const [recent, setRecent] = useState<RecentUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [s, r] = await Promise.all([getAdminSummary(), getAdminRecentUsers()]);
                setSummary(s.data);
                setRecent(r.data);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <AppLayout breadcrumbs={[{ title: 'Admin Dashboard', href: '/admin/dashboard' }]}>
            <Head title="Admin Dashboard" />
            <div className={`w-full px-4 pb-10 pt-6 sm:px-6 lg:px-8 ${theme.bgClass}`}> 
                <div className="flex w-full flex-col gap-6 sm:gap-8">
                    {/* Welcome Section */}
                    <div className="flex flex-col gap-4 rounded-2xl bg-white px-6 py-5 shadow-sm dark:bg-neutral-900 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-extrabold tracking-tight text-gray-800 dark:text-neutral-100 sm:text-4xl">
                                Welcome Back, {user.name.split(' ')[0] ?? 'Admin'} 👋
                            </h1>
                            <p className="text-gray-600 dark:text-neutral-400">
                                You are logged in as <span className="font-semibold text-[#F57979] uppercase">{user.role}</span>
                            </p>
                        </div>
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F57979] shadow-lg sm:h-20 sm:w-20">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
                            ) : (
                                <User className="h-8 w-8 text-white sm:h-10 sm:w-10" />
                            )}
                        </div>
                    </div>

                    {/* Action cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <button
                            onClick={() => router.visit('/admin/products')}
                            className="group flex w-full transform flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-800 sm:p-10"
                        >
                            <div className="mb-4 rounded-full bg-[#F57979]/10 p-5 transition-colors group-hover:bg-[#F57979]/20">
                                <Package className="h-12 w-12 text-[#F57979]" />
                            </div>
                            <p className="text-lg font-semibold text-gray-800 dark:text-neutral-100">Manage Products</p>
                            <p className="mt-2 max-w-[220px] text-center text-sm text-gray-500 dark:text-neutral-400">
                                View, edit, and manage all product listings.
                            </p>
                        </button>

                        <button
                            onClick={() => router.visit('/admin/client-management')}
                            className="group flex w-full transform flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-800 sm:p-10"
                        >
                            <div className="mb-4 rounded-full bg-[#F57979]/10 p-5 transition-colors group-hover:bg-[#F57979]/20">
                                <Users className="h-12 w-12 text-[#F57979]" />
                            </div>
                            <p className="text-lg font-semibold text-gray-800 dark:text-neutral-100">Manage Clients</p>
                            <p className="mt-2 max-w-[220px] text-center text-sm text-gray-500 dark:text-neutral-400">
                                Access client profiles and handle requests efficiently.
                            </p>
                        </button>

                        <button
                            onClick={() => router.post('/logout')}
                            className="flex w-full flex-col items-center justify-center rounded-2xl bg-[#F57979] p-8 text-white shadow-md transition-all duration-300 hover:bg-[#f46868] hover:shadow-lg dark:bg-[#F57979] sm:p-10"
                        >
                            <div className="mb-4 rounded-full bg-white/20 p-5 transition group-hover:bg-white/30">
                                <LogOut className="h-12 w-12 text-white" />
                            </div>
                            <p className="text-lg font-semibold">Log Out</p>
                            <p className="mt-2 max-w-[220px] text-center text-sm text-white/80">End your current session securely.</p>
                        </button>
                    </div>

                    {/* Summary cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {loading ? (
                            [1, 2, 3].map((i) => (
                                <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/60 shadow-sm dark:bg-neutral-800" />
                            ))
                        ) : (
                            summary && (
                                <>
                                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
                                        <p className="text-sm text-gray-500 dark:text-neutral-400">Total Users</p>
                                        <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{summary.totalUsers}</p>
                                    </div>
                                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
                                        <p className="text-sm text-gray-500 dark:text-neutral-400">Admins</p>
                                        <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{summary.admins}</p>
                                    </div>
                                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
                                        <p className="text-sm text-gray-500 dark:text-neutral-400">Customers</p>
                                        <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{summary.customers}</p>
                                    </div>
                                </>
                            )
                        )}
                    </div>

                    {/* Recent users list */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Users</h2>
                        </div>
                        <div className="divide-y divide-gray-200 dark:divide-neutral-700">
                            {loading && (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="h-6 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
                                    ))}
                                </div>
                            )}
                            {!loading && recent.length === 0 && (
                                <p className="py-4 text-sm text-gray-500 dark:text-neutral-400">No users found.</p>
                            )}
                            {!loading &&
                                recent.map((u) => (
                                    <div key={u.user_id} className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{u.email}</p>
                                            <p className="text-xs text-gray-500 dark:text-neutral-400">
                                                {u.role} • {u.status} • {new Date(u.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
