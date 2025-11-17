import { useEffect, useMemo, useState } from 'react';
import ProductDataTable from '@/components/products/product-data-table';
import ProductDetailsInfo from '@/components/products/product-details-info';
import ProductDetailsModal from '@/components/products/product-details-modal';
import ProductLoanList from '@/components/products/product-loan-list';
import { useProductsApi } from '@/hooks/use-products-api';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import AddIcon from '@mui/icons-material/Add';

type ProductSettings = {
  ln_isActive?: boolean;
  ln_scheme?: string;
  max_term?: number;
  max_term_isEditable?: boolean;
  max_amortization?: number;
  max_amortization_isEditable?: boolean;
  service_fee?: number;
  lrf?: number;
  doc_stamp?: number;
  mort_notarial?: number;
  terms_and_info?: string;
  rate_isEditable?: boolean;
  installment_mode?: string;
  [key: string]: unknown;
};
type ProductDisplay = { isDisplayed?: boolean; [key: string]: unknown; };
type ProductTag = { tag_name: string; [key: string]: unknown; };
type Product = {
  typecode: string;
  lntype?: string;
  settings?: ProductSettings;
  display?: ProductDisplay;
  tags?: ProductTag[];
  [key: string]: unknown;
};

const breadcrumbs = [{ title: 'Products Management', href: '/admin/products' }];

export default function ProductsManagement() {
  const { products, loading, fetchProducts } = useProductsApi();
  const [selected, setSelected] = useState<Product | null>(null);
  const [loanListOpen, setLoanListOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => {
    setIsMobile(window.innerWidth < 1024);
    const listener = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, []);

  const filteredProducts = useMemo(
    () =>
      products?.filter(
        (row: Product) =>
          row.lntype?.toLowerCase().includes(search.toLowerCase()) ||
          row.typecode?.toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Products Management" />
      <div className="flex flex-col min-h-screen bg-[#fafafb] dark:bg-[#171717] p-4 transition-colors duration-300 gap-4">
        {/* HEADER */}
                <div className="relative mb-6 h-[180px] overflow-hidden rounded-xl bg-[#F57979] shadow-lg">
                    <div className="relative z-10 p-6">
                        <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-[#FFF172]">Product Management</h1>
                        <div className="text-[1.08rem] font-medium text-white opacity-90">Manage and update all loan products</div>
                    </div>
                </div>
        <div className={`flex w-full gap-6 ${isMobile ? 'flex-col' : 'flex-row'}`}>
          {/* PRODUCTS CARD */}
          <div className="flex-1 min-h-[520px] flex flex-col bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="px-6 pt-6 pb-2 font-bold text-[1.08rem] tracking-wider text-[#f57373] uppercase">Active Products</div>
            <div className="flex-1 flex flex-col px-6 pb-6 pt-2">
              <ProductDataTable
                data={filteredProducts}
                loading={loading}
                onRowSelect={(row: Product) => { setSelected(row); if (isMobile) setDetailsModalOpen(true); }}
                onAddClick={() => setLoanListOpen(true)}
                selectedTypecode={selected?.typecode}
                search={search}
                setSearch={setSearch}
              />
            </div>
          </div>
          {/* DETAILS CARD */}
          {!isMobile && (
            <div className="flex-1 min-h-[520px] flex flex-col bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="flex-1 flex items-center justify-center px-5 py-5">
                {selected
                  ? <ProductDetailsInfo product={selected} onChange={fetchProducts} />
                  : (
                    <span className="text-gray-400 text-[1.07rem]">
                      No products selected
                    </span>
                  )
                }
              </div>
            </div>
          )}
        </div>
        {/* Modals */}
        {isMobile && selected && (
          <ProductDetailsModal
            open={detailsModalOpen}
            product={selected}
            onClose={() => setDetailsModalOpen(false)}
            onSaved={fetchProducts}
          />
        )}
        <ProductLoanList
          open={loanListOpen}
          onClose={() => setLoanListOpen(false)}
          onAdded={fetchProducts}
        />
        {/* Floating Add (mobile) */}
        {isMobile && (
          <button
            className="fixed bottom-6 right-6 z-50 rounded-full bg-[#f57373] shadow-lg hover:bg-[#da4747] p-4 transition"
            aria-label="add"
            onClick={() => setLoanListOpen(true)}
          >
            <AddIcon className="text-white" />
          </button>
        )}
      </div>
    </AppLayout>
  );
}
