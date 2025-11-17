import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Package, Users, LogOut, User } from 'lucide-react';

// 🔸 Type definition for page props
type UserProps = {
  auth: {
    user: {
      name: string;
      email: string;
      role: string;
      avatar?: string | null;
    };
  };
};

export default function AdminDashboard() {
  // Get user data from Inertia page props
  const { props } = usePage<UserProps>();
  const user = props.auth?.user ?? { name: 'Admin', role: 'admin' };

  return (
    <AppLayout breadcrumbs={[{ title: 'Admin Dashboard', href: '/admin/dashboard' }]}>
      <Head title="Admin Dashboard" />
      
      <div className="min-h-screen px-6 py-10 bg-gray-50 dark:bg-neutral-900">
        <div className="max-w-6xl mx-auto">
          
          {/* Welcome Section */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-800 dark:text-neutral-100 tracking-tight">
                Welcome Back, {user.name.split(' ')[0] ?? 'Admin'} 👋
              </h1>
              <p className="mt-2 text-gray-600 dark:text-neutral-400">
                You are logged in as <span className="font-semibold text-[#F57979] uppercase">{user.role}</span>
              </p>
            </div>
            {/* User Avatar Circle */}
            <div className="h-20 w-20 rounded-full bg-[#F57979] flex items-center justify-center shadow-lg">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <User className="text-white w-10 h-10" />
              )}
            </div>
          </div>

          {/* Card Grid - Contains all admin management cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            
            {/* Manage Products Card */}
            <button
              onClick={() => router.visit('/admin/products')}
              className="flex flex-col items-center justify-center rounded-2xl bg-white dark:bg-neutral-800 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-neutral-700 p-10 group"
            >
              <div className="rounded-full bg-[#F57979]/10 p-5 mb-4 group-hover:bg-[#F57979]/20 transition-colors">
                <Package className="w-12 h-12 text-[#F57979]" />
              </div>
              <p className="text-lg font-semibold text-gray-800 dark:text-neutral-100">Manage Products</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-neutral-400 text-center max-w-[200px]">
                View, edit, and manage all product listings.
              </p>
            </button>

            {/* Manage Clients Card - UPDATED: Now routes to /admin/client-management */}
            <button
              onClick={() => router.visit('/admin/client-management')}
              className="flex flex-col items-center justify-center rounded-2xl bg-white dark:bg-neutral-800 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-neutral-700 p-10 group"
            >
              <div className="rounded-full bg-[#F57979]/10 p-5 mb-4 group-hover:bg-[#F57979]/20 transition-colors">
                <Users className="w-12 h-12 text-[#F57979]" />
              </div>
              <p className="text-lg font-semibold text-gray-800 dark:text-neutral-100">Manage Clients</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-neutral-400 text-center max-w-[200px]">
                Access client profiles and handle requests efficiently.
              </p>
            </button>

            {/* Logout Card */}
            <button
              onClick={() => router.post('/logout')}
              className="flex flex-col items-center justify-center rounded-2xl bg-[#F57979] text-white hover:bg-[#f46868] dark:bg-[#F57979] transition-all duration-300 shadow-md hover:shadow-lg p-10"
            >
              <div className="rounded-full bg-white/20 p-5 mb-4 transition group-hover:bg-white/30">
                <LogOut className="w-12 h-12 text-white" />
              </div>
              <p className="text-lg font-semibold">Log Out</p>
              <p className="mt-2 text-sm text-white/80 text-center max-w-[200px]">
                End your current session securely.
              </p>
            </button>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
