import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Briefcase, Users, Package } from 'lucide-react';
import AppLogo from './app-logo';
import { useMemo } from 'react';

// ✅ Properly typed (no 'any')
type AuthUser = {
  id?: number;
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
  flash?: {
    success?: string;
    error?: string;
  };
};

const clientNavItems: NavItem[] = [
  {
    title: 'Home',
    href: '/dashboard',
    icon: LayoutGrid,
  },
  {
    title: 'Loan Transactions',
    href: '/loans/transactions',
    icon: Briefcase,
  },
];

const adminNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutGrid,
  },
  {
    title: 'Products Management',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'Clients',
    href: '/admin/client-management',
    icon: Users,
  },
  {
    title: 'Registrations',
    href: '/admin/registrations',
    icon: Briefcase,
  },
];

const footerNavItems: NavItem[] = [
  {
    title: 'Repository',
    href: 'https://github.com/laravel/react-starter-kit',
    icon: Folder,
  },
  {
    title: 'Documentation',
    href: 'https://laravel.com/docs/starter-kits#react',
    icon: BookOpen,
  },
];

export function AppSidebar() {
  const { props } = usePage<SharedPageProps>();
  const user = props.auth?.user;
  const userRole = user?.role || 'client';

  // ✅ Enhanced: Memoized navigation items with role-based filtering
  const mainNavItems = useMemo(() => {
    if (userRole === 'admin') {
      return adminNavItems;
    }
    return clientNavItems;
  }, [userRole]);

  // ✅ Enhanced: Dynamic home link based on role
  const homeLink = useMemo(() => {
    return userRole === 'admin' ? '/admin/dashboard' : '/dashboard';
  }, [userRole]);

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
