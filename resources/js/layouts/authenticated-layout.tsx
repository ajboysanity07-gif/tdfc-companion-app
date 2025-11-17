import React from 'react';
import AppLayout from '@/layouts/app-layout';
import type { User } from '@/types';

export default function AuthenticatedLayout({
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  // AppLayout doesn't need user prop - it gets auth from Inertia shared props internally
  // Just pass through children
  return <AppLayout>{children}</AppLayout>;
}
