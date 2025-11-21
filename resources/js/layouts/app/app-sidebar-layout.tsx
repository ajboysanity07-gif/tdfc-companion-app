import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import NavMobile from '@/components/nav-mobile';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({
  children,
  breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
  return (
    <AppShell variant="sidebar">
      {/* Sidebar: visible only on desktop */}
      <div className="hidden md:flex shrink-0">
        <AppSidebar />
      </div>

      {/* Main content area, full width */}
      <div className="flex flex-col flex-1 w-full relative min-h-screen pb-[76px]">
        <AppContent
          variant="sidebar"
          className="overflow-x-hidden flex-1 w-full"
        >
          {/* Sidebar header: visible only on desktop */}
          <div className="hidden md:block">
            <AppSidebarHeader breadcrumbs={breadcrumbs} />
          </div>

          {/* Page content */}
          {children}
        </AppContent>

        {/* Mobile bottom nav */}
        <NavMobile />
      </div>
    </AppShell>
  );
}
