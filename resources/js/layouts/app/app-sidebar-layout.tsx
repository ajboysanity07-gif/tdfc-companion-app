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
      {/* Sidebar: visible only on desktop - removed fixed width to allow sidebar to manage its own width */}
      <div className="hidden md:flex md:shrink-0 transition-all duration-300">
        <AppSidebar />
      </div>

      {/* Main content area, expands to fill available space */}
      <div className="flex flex-col flex-1 w-full relative min-h-screen pb-[76px] transition-all duration-300">
        <AppContent
          variant="sidebar"
          className="overflow-x-hidden flex-1 w-full transition-all duration-300"
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
