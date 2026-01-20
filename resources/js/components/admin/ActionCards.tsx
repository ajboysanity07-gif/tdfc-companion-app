import { LogOut, Package, Users } from 'lucide-react';
import { router } from '@inertiajs/react';

type ActionCardsProps = {
  productsManagementHref: string;
  clientManagementHref: string;
  cardClass: string;
};

export default function ActionCards({
  productsManagementHref,
  clientManagementHref,
  cardClass,
}: ActionCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
      <button
        onClick={() => router.visit(productsManagementHref)}
        className={`group flex w-full aspect-square sm:min-h-[200px] lg:min-h-0 lg:max-h-[180px] transform flex-col items-center justify-center p-3 sm:p-6 lg:p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${cardClass}`}
      >
        <div className="mb-2 sm:mb-4 lg:mb-2 flex items-center justify-center rounded-full bg-[#F57979]/10 p-3 sm:p-5 lg:p-3 transition-colors group-hover:bg-[#F57979]/20">
          <Package className="h-8 w-8 sm:h-12 sm:w-12 lg:h-10 lg:w-10 text-[#F57979]" />
        </div>
        <p className="text-sm sm:text-lg lg:text-sm font-semibold text-gray-800 dark:text-neutral-100">Manage Products</p>
        <p className="mt-2 hidden max-w-[220px] text-center text-xs sm:text-sm text-gray-500 dark:text-neutral-400 sm:block">
          View, edit, and manage all product listings.
        </p>
      </button>

      <button
        onClick={() => router.visit(clientManagementHref)}
        className={`group flex w-full aspect-square sm:min-h-[200px] lg:min-h-0 lg:max-h-[180px] transform flex-col items-center justify-center p-3 sm:p-6 lg:p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${cardClass}`}
      >
        <div className="mb-2 sm:mb-4 lg:mb-2 flex items-center justify-center rounded-full bg-[#F57979]/10 p-3 sm:p-5 lg:p-3 transition-colors group-hover:bg-[#F57979]/20">
          <Users className="h-8 w-8 sm:h-12 sm:w-12 lg:h-10 lg:w-10 text-[#F57979]" />
        </div>
        <p className="text-sm sm:text-lg lg:text-sm font-semibold text-gray-800 dark:text-neutral-100">Manage Clients</p>
        <p className="mt-2 hidden max-w-[220px] text-center text-xs sm:text-sm text-gray-500 dark:text-neutral-400 sm:block">
          Access client profiles and handle requests efficiently.
        </p>
      </button>

      <button
        onClick={() => router.post('/logout')}
        className={`group hidden lg:flex w-full max-h-[180px] transform flex-col items-center justify-center p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg rounded-2xl bg-[#F57979] text-white shadow-md hover:bg-[#f46868]`}
      >
        <div className="mb-2 flex items-center justify-center rounded-full bg-white/20 p-3 transition group-hover:bg-white/30">
          <LogOut className="h-10 w-10 text-white" />
        </div>
        <p className="text-sm font-semibold">Log Out</p>
        <p className="mt-1 max-w-[220px] text-center text-xs text-white/80">End your current session securely.</p>
      </button>
    </div>
  );
}
