import React, { useMemo } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import {
  Home,
  UserRound,
  Users,
  Package,
  Briefcase,
  LogOut,
  Settings,
} from "lucide-react";
import { useTheme } from '@mui/material/styles'; // <-- ADD THIS
import { useEffect, useState } from "react";

type AuthUser = { 
  role?: string,
  acctno?: string | null;
  user_id?: number;
  id?: number;
};

type SharedPageProps = {
  auth: { user?: AuthUser | null; };
  admin?: string | number;
  acctno?: string | null;
};

export default function NavMobile() {
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";

  const { props } = usePage<SharedPageProps>();
  const user = props.auth?.user;
  const userRole = user?.role || 'customer';
  const adminId = props.admin ?? user?.acctno ?? user?.user_id ?? user?.id ?? '';
  const customerAcct = props.acctno ?? user?.acctno ?? '';

  const adminDashboardHref = adminId ? `/admin/${adminId}/dashboard` : '/admin/dashboard';
  const adminClientsHref = adminId ? `/admin/${adminId}/client-management` : '/admin/client-management';
  const adminProductsHref = adminId ? `/admin/${adminId}/products` : '/admin/products';
  const customerDashboardHref = customerAcct ? `/client/${customerAcct}/dashboard` : '/dashboard';
  const customerLoansHref = customerAcct ? `/client/${customerAcct}/loan-transactions` : '/loan-transactions';

  const isDashboard =
    pathname === customerDashboardHref ||
    pathname === adminDashboardHref;

  // MUI theme hook
  const theme = useTheme();
  const navZIndex = Math.max(theme.zIndex.modal, 3000) + 50;
  const floatingZIndex = navZIndex + 20;
  const [productModalOpen, setProductModalOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      if (typeof document === "undefined") return;
      setProductModalOpen(document.body.classList.contains("product-details-open"));
    };
    sync();
    window.addEventListener("product-details-toggle", sync);
    return () => window.removeEventListener("product-details-toggle", sync);
  }, []);

  const customerNav = useMemo(() => [
    { href: customerDashboardHref, label: "Home", icon: Home },
    { href: customerLoansHref, label: "Loans", icon: Briefcase },
    { href: route("profile.edit"), label: "Account", icon: UserRound },
  ], [customerDashboardHref, customerLoansHref]);

  const adminNav = useMemo(() => [
    { href: adminDashboardHref, label: "Home", icon: Home },
    { href: adminProductsHref, label: "Products", icon: Package },
    { href: adminClientsHref, label: "Clients", icon: Users },
  ], [adminDashboardHref, adminClientsHref, adminProductsHref]);

  const items = useMemo(() => {
    if (userRole === "admin") return adminNav;
    return customerNav;
  }, [userRole, adminNav, customerNav]);

  const settingsUrl = route("profile.edit");

  return (
    <>
      {/* Responsive bottom nav using theme palette, no opacity */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t px-6 py-3 md:hidden"
        style={{
          background: theme.palette.background.paper, // <--- USE THEME!
          borderColor: theme.palette.divider,
          zIndex: navZIndex,
        }}
      >
        <ul
          className={`grid ${
            items.length === 4 ? "grid-cols-4" : "grid-cols-3"
          } gap-6`}
        >
          {items.map((it) => {
            const active = pathname === it.href;
            const Icon = it.icon;
            return (
              <li key={it.href} className="flex items-center justify-center">
                <Link
                  href={it.href}
                  className="flex flex-col items-center"
                  prefetch
                >
                  <Icon
                    className={`size-7 ${
                      active
                        ? "text-[#F57979]"
                        : theme.palette.mode === "dark"
                          ? "text-neutral-200"
                          : "text-gray-700"
                    }`}
                  />
                  <span
                    className={`mt-1 text-sm font-semibold ${
                      active
                        ? "text-[#F57979]"
                        : theme.palette.mode === "dark"
                          ? "text-neutral-200"
                          : "text-gray-700"
                    }`}
                  >
                    {it.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* FLOATING SETTINGS BUTTON */}
      {!productModalOpen && (
        <Link
          href={settingsUrl}
          className="fixed z-50 bottom-36 right-6 rounded-full bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 shadow-lg p-4 transition-colors flex items-center justify-center md:hidden"
          style={{
            boxShadow: "0 3px 16px 0 rgba(80,80,80,0.10)",
            zIndex: floatingZIndex,
          }}
          title="Account Settings"
        >
          <Settings className="w-6 h-6 text-gray-700 dark:text-neutral-200" />
        </Link>
      )}
      {/* Floating log-out button */}
      {!isDashboard && !productModalOpen && (
        <button
          type="button"
          onClick={() => router.post('/logout')}
          className="fixed z-50 bottom-20 right-6 rounded-full bg-[#F57979] hover:bg-[#da4747] shadow-lg p-4 text-white transition-colors flex items-center justify-center md:hidden"
          style={{
            boxShadow: "0 3px 16px 0 rgba(245,121,121,0.12)",
            zIndex: floatingZIndex,
          }}
          title="Log out"
        >
          <LogOut className="w-6 h-6" />
        </button>
      )}
    </>
  );
}
