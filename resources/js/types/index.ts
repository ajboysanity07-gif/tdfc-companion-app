import type { LucideIcon } from 'lucide-react';

// Shared/central type definitions used across the app
export type BreadcrumbItem = {
    title: string;
    href: string;
};

export type NavItem = {
    title: string;
    href: string;
    icon?: LucideIcon;
};

export type User = {
    id?: number;
    user_id?: number;
    acctno?: string | null;
    name?: string;
    email?: string;
    role?: string;
    avatar?: string | null;
    status?: string;
    salary_amount?: number | null;
    class?: string | null;
};

export type SharedData = {
    auth: {
        user: User;
    };
    sidebarOpen?: boolean;
    name?: string;
    quote?: string;
};
