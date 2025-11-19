import { useState, useEffect } from 'react';
import { useProductsApi } from '@/hooks/use-products-api';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import AddProductListModal from '@/components/product-management/add-product-list-modal';
import ProductDetails from '@/components/product-management/product-details';
import ProductDetailsModal from '@/components/product-management/product-details-modal';
import type { CSSProperties } from 'react';

interface ProductLntype {
  typecode: string;
  wlntype: string;
  isDisplayed: boolean;
  [key: string]: unknown; // Allow extra attributes if your API adds more
}

const breadcrumbs = [{ title: 'Products Management', href: '/admin/products-management' }];

export default function ProductsManagement() {
  const {
    products,
    fetchProducts,
    updateProduct,
    deleteProduct,
  } = useProductsApi();

  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  useEffect(() => {
    fetchProducts();
    const handleResize = () => setIsMobileOrTablet(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fetchProducts]);

  // Specify array item type
  const displayLntypes = products.filter((item: ProductLntype) => item.isDisplayed);
  const hiddenLntypes = products.filter((item: ProductLntype) => !item.isDisplayed);

  // Specify correct state types
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCart, setSelectedCart] = useState<ProductLntype[]>([]);
  const [activeProduct, setActiveProduct] = useState<ProductLntype | null>(null);
  const [showProductDetailsModal, setShowProductDetailsModal] = useState(false);

  // Add hidden types to display
  const handleAddLntypes = async () => {
    for (const item of selectedCart) {
      await updateProduct(item.typecode, { ...item, isDisplayed: true });
    }
    setSelectedCart([]);
    fetchProducts();
  };

  const handleSaveProduct = async (product: ProductLntype) => {
    await updateProduct(product.typecode, product);
    fetchProducts();
  };

  const handleDeleteProduct = async (product: ProductLntype) => {
    await deleteProduct(product.typecode);
    setActiveProduct(null);
    setShowProductDetailsModal(false);
    fetchProducts();
  };

  function appleSeparator(): CSSProperties {
    return {
      margin: 0,
      padding: 0,
      width: '92%',
      height: '1.5px',
      background: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'rgba(84,84,88,0.24)' : 'rgba(60,60,67,0.14)',
      borderRadius: '2px',
      alignSelf: 'center',
      marginTop: '0.5rem',
    };
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Products Management" />
      <div className="rounded- flex flex-1 flex-col gap-4 overflow-x-auto bg-[#FAFAFA] p-4 transition-colors duration-300 dark:bg-neutral-900" style={{ minHeight: '100vh' }}>
        <div className="relative mb-6 h-[180px] overflow-hidden rounded-xl bg-[#F57979] shadow-lg">
          <div className="relative z-10 p-6">
            <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-[#FFF172]">Products Management</h1>
            <div className="text-[1.08rem] font-medium text-white opacity-90">Create and manage products, customize lntype display</div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-lg mb-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-lg">Product List</h2>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={() => setShowAddModal(true)}
                >
                  Add Product Type
                </button>
              </div>
              {displayLntypes.length > 0 ? (
                <ul className="space-y-2">
                  {displayLntypes.map((lntype: ProductLntype) => (
                    <li
                      className="bg-gray-100 dark:bg-neutral-700 rounded p-3 flex justify-between items-center cursor-pointer transition hover:bg-blue-100"
                      key={lntype.typecode}
                      onClick={() => {
                        setActiveProduct(lntype);
                        if (isMobileOrTablet) setShowProductDetailsModal(true);
                      }}
                    >
                      <span className="font-medium">{lntype.wlntype}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500 text-sm text-center py-6">No product types displayed. Please add some.</div>
              )}
            </div>
          </div>
          <div style={appleSeparator()} />
          {!isMobileOrTablet && (
            <div className="flex-1">
              <ProductDetails
                product={activeProduct}
                onSave={handleSaveProduct}
                onDelete={handleDeleteProduct}
                onCancel={() => setActiveProduct(null)}
              />
            </div>
          )}
        </div>
      </div>
      <AddProductListModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        hiddenLntypes={hiddenLntypes}
        selectedCart={selectedCart}
        setSelectedCart={setSelectedCart}
        onAdd={handleAddLntypes}
      />
      {isMobileOrTablet && (
        <ProductDetailsModal
          open={showProductDetailsModal}
          product={activeProduct}
          onClose={() => setShowProductDetailsModal(false)}
          onSave={handleSaveProduct}
          onDelete={handleDeleteProduct}
        />
      )}
    </AppLayout>
  );
}
