import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Calculator, Briefcase, PiggyBank, Users, Package } from 'lucide-react';
import AppLogo from './app-logo';
import { useMemo, useCallback } from 'react';

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
  { title: 'Home', href: '/client/dashboard', icon: LayoutGrid },
  { title: 'Loan Transactions', href: '/client/loans', icon: Briefcase },
  { title: 'Loan Calculator', href: '/client/loans/calculator', icon: Calculator },
  { title: 'Savings', href: '/client/savings', icon: PiggyBank },
];

const adminNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid },
  { title: 'Products', href: '/admin/products', icon: Package },
  { title: 'Clients', href: '/admin/client-management', icon: Users },
];

const footerNavItems: NavItem[] = [
  { title: 'Repository', href: 'https://github.com/laravel/react-starter-kit', icon: Folder },
  { title: 'Documentation', href: 'https://laravel.com/docs/starter-kits#react', icon: BookOpen },
];

export function AppSidebar() {
  const { props, url } = usePage<SharedPageProps>();
  const user = props.auth?.user;
  const userRole = user?.role || 'customer';
  const adminParam = props.admin ?? user?.acctno ?? user?.user_id ?? user?.id ?? '';
  
  // Extract acctno from current URL as fallback (e.g., from /client/{acctno}/... routes)
  const urlMatch = url.match(/\/client\/([^/]+)/);
  const urlAcctno = urlMatch ? urlMatch[1] : '';
  const customerAcct = props.acctno ?? user?.acctno ?? urlAcctno ?? '';

  const adminPath = (suffix: string) => (adminParam ? `/admin/${adminParam}${suffix}` : `/admin${suffix}`);
  const customerPath = useCallback((suffix: string) => (customerAcct ? `/client/${customerAcct}${suffix}` : `/client${suffix}`), [customerAcct]);
  const adminDashboardHref = adminPath('/dashboard');
  const adminClientManagementHref = adminPath('/client-management');
  const adminProductManagementHref = adminPath('/products');
  const customerDashboardHref = customerPath('/dashboard');
  const customerLoansHref = customerPath('/loans');
  const customerSavingsHref = customerPath('/savings');

  const mainNavItems = useMemo(() => {
    if (userRole !== 'admin') {
      return customerNavItems.map((item) => {
        if (item.href === '/client/dashboard') {
          return { ...item, href: customerDashboardHref };
        }
        if (item.href === '/client/loans') {
          return { ...item, href: customerLoansHref };
        }
        if (item.href === '/client/loans/calculator') {
          return { ...item, href: customerPath('/loans/calculator') };
        }
        if (item.href === '/client/savings') {
          return { ...item, href: customerSavingsHref };
        }
        return item;
      });
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
  }, [adminClientManagementHref, adminDashboardHref, customerDashboardHref, customerLoansHref, customerSavingsHref, adminProductManagementHref, userRole, customerPath]);

  const homeLink = useMemo(() => {
    return userRole === 'admin' ? adminDashboardHref : customerDashboardHref;
  }, [adminDashboardHref, customerDashboardHref, userRole]);

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={homeLink}>
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
