import { getAdminRecentUsers, getAdminSummary } from '@/api/auth-api';
import ActionCards from '@/components/admin/ActionCards';
import MobileSummaryCards from '@/components/admin/MobileSummaryCards';
import RecentUsersList from '@/components/admin/RecentUsersList';
import SummaryCards from '@/components/admin/SummaryCards';
import WelcomeSection from '@/components/admin/WelcomeSection';
import { useMyTheme } from '@/hooks/use-mytheme';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

type UserProps = {
    auth: {
        user: {
            user_id?: number;
            acctno?: string | null;
            name: string;
            email: string;
            role: string;
            avatar?: string | null;
        };
    };
    admin?: string | number;
};

type Summary = { totalUsers: number; admins: number; customers: number };
type RecentUser = { user_id: number; email: string; role: string; status: string; created_at: string };

export default function AdminDashboard() {
    const { props } = usePage<UserProps>();
    const user = props.auth?.user ?? { name: 'Admin', role: 'admin' };
    const adminId = props.admin ?? user.acctno ?? user.user_id;
    const adminDashboardHref = adminId ? `/admin/${adminId}/dashboard` : '/admin/dashboard';
    const productsManagementHref = adminId ? `/admin/${adminId}/products` : '/admin/products';
    const clientManagementHref = adminId ? `/admin/${adminId}/client-management` : '/admin/client-management';
    const theme = useMyTheme();
    const [summary, setSummary] = useState<Summary | null>(null);
    const [recent, setRecent] = useState<RecentUser[]>([]);
    const [loading, setLoading] = useState(true);

    const cardClass = useMemo(() => `rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-sm ${theme.card}`, [theme.card]);

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
        <AppLayout breadcrumbs={[{ title: 'Admin Dashboard', href: adminDashboardHref }]}>
            <Head title="Admin Dashboard" />
            <div className={`w-full px-4 pt-4 *: sm:pb-9 sm:px-6 sm:pt-6 lg:px-8 lg:flex lg:flex-col lg:h-full ${theme.bgClass}`}>
                <div className="flex w-full flex-col gap-4 sm:gap-6 lg:gap-4">
                    <WelcomeSection name={user.name} role={user.role} avatar={user.avatar} />

                    <SummaryCards summary={summary} loading={loading} cardClass={cardClass} />
                    <MobileSummaryCards summary={summary} loading={loading} cardClass={cardClass} />
                    <ActionCards productsManagementHref={productsManagementHref} clientManagementHref={clientManagementHref} cardClass={cardClass} />

                    <RecentUsersList recent={recent} loading={loading} cardClass={cardClass} />
                </div>
            </div>
        </AppLayout>
    );
}
