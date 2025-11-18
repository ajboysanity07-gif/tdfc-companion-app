import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type RejectionReason = 'prc_id_blurry' | 'not_prc_id' | 'prc_id_expired' | 'payslip_blurry' | 'payslip_too_old' | 'documents_tampered';

export interface User {
    id: number;
    user_id?: number;
    name: string;
    email: string;
    phone_no?: string;
    accntno?: string;
    avatar?: string;
    email_verified_at: string | null;
    status?: RegistrationStatus;
    rejection_reasons?: RejectionReason[];
    prc_id_photo_front?: string;
    prc_id_photo_back?: string;
    payslip_photo_path?: string;
    created_at: string;
    updated_at: string;
    reviewed_at?: string;
    [key: string]: unknown;
}

export interface Auth {
    user: User;
}

export interface SharedData {
    name?: string;
    quote?: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen?: boolean;
    [key: string]: unknown;
}

export type PageProps<T = Record<string, unknown>> = T & SharedData;

export interface PendingUser {
    user_id: number;
    name: string;
    email: string;
    phone_no: string;
    acctno: string;
    status: string;
    class?: string;
    prc_id_photo_front?: string;
    prc_id_photo_back?: string;
    payslip_photo_path?: string;
    profile_picture_path?: string;
    created_at: string;
    reviewed_at?: string;
    reviewed_by?: number;
    salary_amount?: number; // ADDED
    notes?: string;
    rejection_reasons?: Array<{ code: string; label: string }>;
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}
