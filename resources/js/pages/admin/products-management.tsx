import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import DesktopView from '@/components/product-management/desktop/desktop-view';
import DisplayProductsModal from '@/components/product-management/display-products-modal';
import { useProductsApi } from '@/hooks/use-products-api';

const breadcrumbs = [{ title: 'Product Management', href: '/admin/products' }];

export default function ProductsManagementPage() {
  const { products, loading, error, fetchProducts, toggleDisplay } = useProductsApi();
  const [showDisplayModal, setShowDisplayModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleToggleDisplay = async (typecode: string, next: boolean) => {
    await toggleDisplay(typecode, next);
  };

  const handleActivateMany = async (typecodes: string[]) => {
    for (const tc of typecodes) {
      await toggleDisplay(tc, true);
    }
    await fetchProducts();
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-2xl bg-[#FAFAFA] p-4 transition-colors duration-300 dark:bg-neutral-900">
        <div className="relative mb-6 h-[180px] overflow-hidden rounded-xl bg-[#F57979] shadow-lg">
          <div className="relative z-10 p-6">
            <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-[#FFF172]">Product Management</h1>
            <div className="text-[1.08rem] font-medium text-white opacity-90">
              Activate and manage product listings
            </div>
          </div>
        </div>

        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}

        <DesktopView
          products={products}
          onToggleDisplay={handleToggleDisplay}
          onAdd={() => setShowDisplayModal(true)}
        />
      </div>

      <DisplayProductsModal
        open={showDisplayModal}
        onClose={() => setShowDisplayModal(false)}
        onActivateMany={handleActivateMany}
        loading={loading}
      />
    </AppLayout>
  );
}
