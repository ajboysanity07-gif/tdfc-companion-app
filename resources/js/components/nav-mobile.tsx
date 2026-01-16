import React, { useMemo } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import {
  Home,
  UserRound,
  Users,
  Package,
  Briefcase,
  Calculator,
  LogOut,
  Settings,
} from "lucide-react";
import CloseIcon from "@mui/icons-material/Close";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useTheme } from '@mui/material/styles'; // <-- ADD THIS
import { useEffect, useState } from "react";
import { useMyTheme } from "@/hooks/use-mytheme";

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

  const { props, url } = usePage<SharedPageProps>();
  const user = props.auth?.user;
  const userRole = user?.role || 'client';
  const adminId = props.admin ?? user?.acctno ?? user?.user_id ?? user?.id ?? '';
  
  // Extract acctno from current URL as fallback
  const urlMatch = url.match(/\/client\/([^\/]+)/);
  const urlAcctno = urlMatch ? urlMatch[1] : '';
  const customerAcct = props.acctno ?? user?.acctno ?? urlAcctno ?? '';

  const adminDashboardHref = adminId ? `/admin/${adminId}/dashboard` : '/admin/dashboard';
  const adminClientsHref = adminId ? `/admin/${adminId}/client-management` : '/admin/client-management';
  const adminProductsHref = adminId ? `/admin/${adminId}/products` : '/admin/products';
  const customerDashboardHref = customerAcct ? `/client/${customerAcct}/dashboard` : '/dashboard';
  const customerLoansHref = customerAcct ? `/client/${customerAcct}/loan-calculator` : '/loan-calculator';
  // const customerSavingsHref = customerAcct ? `/client/${customerAcct}/savings` : '/savings';
  const customerAccountHref = customerAcct ? `/client/${customerAcct}/account` : route("profile.edit");

  const isDashboard =
    pathname === customerDashboardHref ||
    pathname === adminDashboardHref;

  // MUI theme hook
  const theme = useTheme();
  const navZIndex = Math.max(theme.zIndex.modal, 3000) + 50;
  const floatingZIndex = navZIndex + 20;
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [anyModalOpen, setAnyModalOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const tw = useMyTheme();
  const accent = '#F57979';
  const accentDark = '#e14e4e';
  const actionBg = tw.isDark ? 'rgba(17,24,39,0.9)' : '#ffffff';

  useEffect(() => {
    const sync = () => {
      if (typeof document === "undefined") return;
      const body = document.body;
      setProductModalOpen(body.classList.contains("product-details-open"));
      const modalClasses = ["client-details-open", "app-modal-open", "modal-open", "amort-schedule-open", "payment-ledger-open", "calculator-modal-open"];
      setAnyModalOpen(modalClasses.some((cls) => body.classList.contains(cls)));
    };
    sync();
    window.addEventListener("product-details-toggle", sync);
    const observer = typeof MutationObserver !== "undefined" ? new MutationObserver(sync) : null;
    observer?.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => {
      window.removeEventListener("product-details-toggle", sync);
      observer?.disconnect();
    };
  }, []);

  const customerCalculatorHref = customerAcct ? `/client/${customerAcct}/loan-calculator` : '/loan-calculator';
  const customerLoansPageHref = customerAcct ? `/client/${customerAcct}/loans` : '/loans';
  
  const customerNav = useMemo(() => {
    const nav = [];
    // Only show Home if we have customerAcct
    if (customerAcct) {
      nav.push({ key: 'home', href: customerDashboardHref, label: "Home", icon: Home });
    }
    nav.push(
      { key: 'loans', href: customerLoansPageHref, label: "Loans", icon: Briefcase },
      { key: 'calculator', href: customerCalculatorHref, label: "Calculator", icon: Calculator },
      { key: 'account', href: customerAccountHref, label: "Account", icon: UserRound }
    );
    return nav;
  }, [customerDashboardHref, customerLoansPageHref, customerCalculatorHref, customerAccountHref, customerAcct]);

  const adminNav = useMemo(() => [
    { key: 'admin-home', href: adminDashboardHref, label: "Home", icon: Home },
    { key: 'admin-products', href: adminProductsHref, label: "Products", icon: Package },
    { key: 'admin-clients', href: adminClientsHref, label: "Clients", icon: Users },
  ], [adminDashboardHref, adminClientsHref, adminProductsHref]);

  const items = useMemo(() => {
    if (userRole === "admin") return adminNav;
    return customerNav;
  }, [userRole, adminNav, customerNav]);

  const settingsUrl = route("profile.edit");
  const isProfilePage = pathname === settingsUrl || 
                        pathname.includes('/settings/profile') || 
                        pathname.includes('/account') ||
                        pathname === customerAccountHref;

  return (
    <>
      <style>{`
        @keyframes floating-glow {
          0%, 100% {
            box-shadow: 0 10px 24px rgba(0,0,0,0.22);
          }
          50% {
            box-shadow: 0 14px 28px rgba(0,0,0,0.32);
          }
        }
      `}</style>
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
              <li key={it.key || it.href} className="flex items-center justify-center">
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
      {!productModalOpen && !anyModalOpen && !isProfilePage && (
        <div
          className="fixed right-6 bottom-24 md:hidden flex flex-col items-end gap-2"
          style={{ zIndex: floatingZIndex }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              opacity: actionsOpen ? 1 : 0,
              transform: actionsOpen ? 'translateY(0)' : 'translateY(14px)',
              pointerEvents: actionsOpen ? 'auto' : 'none',
              transition: 'opacity 140ms ease, transform 180ms ease',
            }}
          >
            <Link
              href={settingsUrl}
              className="rounded-full shadow-lg p-4 flex items-center justify-center"
              style={{
                boxShadow: "0 3px 16px 0 rgba(80,80,80,0.10)",
                backgroundColor: accent,
              }}
              title="Account Settings"
            >
              <Settings className="w-6 h-6 text-white" />
            </Link>
            {userRole === 'client' && (
              <button
                type="button"
                onClick={() => router.post('/logout')}
                className="rounded-full shadow-lg p-4 text-white flex items-center justify-center"
                style={{
                  boxShadow: "0 3px 16px 0 rgba(225,78,78,0.2)",
                  backgroundColor: accentDark,
                }}
                title="Log out"
              >
                <LogOut className="w-6 h-6" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setActionsOpen((v) => !v)}
            className="rounded-full shadow-lg p-4 transition-transform flex items-center justify-center"
            style={{
              width: 60,
              height: 60,
              boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
              animation: actionsOpen ? 'none' : 'floating-glow 2.6s ease-in-out infinite',
              transform: actionsOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              backgroundColor: actionBg,
              border: tw.isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.08)',
              color: tw.isDark ? '#fff' : '#111827',
            }}
            aria-label={actionsOpen ? 'Close actions' : 'Open actions'}
          >
            {actionsOpen ? <CloseIcon sx={{ fontSize: 24 }} /> : <ExpandLessIcon sx={{ fontSize: 24 }} />}
          </button>
        </div>
      )}
    </>
  );
}
