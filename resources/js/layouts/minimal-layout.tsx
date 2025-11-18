import React from 'react';
import { router } from '@inertiajs/react';
export default function MinimalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-900 flex flex-col">
      <header className="flex items-center justify-between px-6 py-5 bg-white dark:bg-neutral-950 border-b border-gray-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="TDFC logo" className="h-8 w-8"/>
          <span className="text-xl font-extrabold tracking-widest text-[#F57979]">TDFC Companion</span>
        </div>
<button
  type="button"
  onClick={() => router.post('/logout')}
  className="text-sm font-medium text-gray-600 dark:text-neutral-300 hover:text-[#F57979] transition"
>
  Logout
</button>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center">
        {children}
      </main>
    </div>
  );
}
