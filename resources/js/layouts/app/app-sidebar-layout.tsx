import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import NavMobile from '@/components/nav-mobile';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell variant="sidebar">
            {/* Sidebar: visible only on desktop */}
            <div className="hidden shrink-0 md:flex">
                <AppSidebar />
            </div>

            {/* Main content area, full width */}
            <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden">
                <AppContent variant="sidebar" className="min-h-0 flex-1 overflow-hidden pb-[88px] md:pb-0">
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
