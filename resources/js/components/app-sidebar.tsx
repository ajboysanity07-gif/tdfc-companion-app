import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Calculator, Briefcase, PiggyBank, Users, Package } from 'lucide-react';
import AppLogo from './app-logo';
import { useMemo } from 'react';

// Properly typed
type AuthUser = {
  id?: number;
  user_id?: number;
  acctno?: string | null;
  name?: string;
  email?: string;
  role?: string;
  avatar?: string | null;
  status?: string;
};

type SharedPageProps = {
  auth: {
    user: AuthUser | null;
  };
  admin?: string | number;
  acctno?: string | null;
  flash?: {
    success?: string;
    error?: string;
  };
};

const customerNavItems: NavItem[] = [
  { title: 'Home', href: 'customer/dashboard', icon: LayoutGrid },
  { title: 'Loan Transactions', href: 'customer/loans/transactions', icon: Briefcase },
  { title: 'Loan Calculator', href: 'customer/loans/calculator', icon: Calculator },
  { title: 'Savings', href: 'customer/savings', icon: PiggyBank },
];

const adminNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid },
  { title: 'Products', href: '/admin/products', icon: Package },
  { title: 'Clients', href: '/admin/client-management', icon: Users },
  { title: 'Registrations', href: '/admin/registrations', icon: Briefcase },
];

const footerNavItems: NavItem[] = [
  { title: 'Repository', href: 'https://github.com/laravel/react-starter-kit', icon: Folder },
  { title: 'Documentation', href: 'https://laravel.com/docs/starter-kits#react', icon: BookOpen },
];

export function AppSidebar() {
  const { props } = usePage<SharedPageProps>();
  const user = props.auth?.user;
  const userRole = user?.role || 'customer';
  const adminParam = props.admin ?? user?.acctno ?? user?.user_id ?? user?.id ?? '';
  const customerAcct = props.acctno ?? user?.acctno ?? '';

  const adminPath = (suffix: string) => (adminParam ? `/admin/${adminParam}${suffix}` : `/admin${suffix}`);
  const adminDashboardHref = adminPath('/dashboard');
  const adminClientManagementHref = adminPath('/client-management');
  const adminProductManagementHref = adminPath('/products');
  const customerDashboardHref = customerAcct ? `/client/${customerAcct}/dashboard` : '/dashboard';

  const mainNavItems = useMemo(() => {
    if (userRole !== 'admin') {
      return customerNavItems.map((item) =>
        item.title === 'Home'
          ? { ...item, href: customerDashboardHref }
          : item
      );
    }

    return adminNavItems.map((item) => {
      if (item.href === '/admin/dashboard') {
        return { ...item, href: adminDashboardHref };
      }

      if (item.href === '/admin/client-management') {
        return { ...item, href: adminClientManagementHref };
      }
      if (item.href === '/admin/products'){
        return { ...item, href: adminProductManagementHref}
      }

      return item;
    });
  }, [adminClientManagementHref, adminDashboardHref, customerDashboardHref, adminProductManagementHref, userRole]);

  const homeLink = useMemo(() => {
    return userRole === 'admin' ? adminDashboardHref : customerDashboardHref;
  }, [adminDashboardHref, customerDashboardHref, userRole]);

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={homeLink} prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={mainNavItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavFooter items={footerNavItems} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
