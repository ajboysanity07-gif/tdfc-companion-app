import DesktopView from '@/components/product-management/desktop/desktop-view';
import MobileView from '@/components/product-management/mobile/mobile-view';
import { useProductManagement } from '@/hooks/use-product-management';
import AppLayout from '@/layouts/app-layout';
import { ProductLntype, ProductPayload } from '@/types/product-lntype';
import { LinearProgress, Slide, useMediaQuery } from '@mui/material';
import { CircleCheckBig, CircleX } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs = [{ title: 'Product Management', href: '/admin/products' }];

export default function ProductsManagementPage() {
    const { products, types, loading, error, success, fetchTypes, fetchProducts, createProduct, updateProduct, deleteProduct } = useProductManagement();
    const [selected, setSelected] = useState<ProductLntype | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchTypes();
    }, [fetchProducts, fetchTypes]);

    const isMobile = useMediaQuery('(max-width:900px)');

    const handleSave = async (payload: ProductPayload, productId?: number | null) => {
        try {
            const id = productId ?? selected?.product_id;
            if (id) {
                await updateProduct(id, payload);
            } else {
                await createProduct(payload);
            }
            setSelected(null);
            setIsAdding(false);
        } catch {
            // mutation hook already set the banner; keep selection so user can fix and retry
        }
    };

    const handleDelete = async (productId?: number | null) => {
        try {
            const id = productId ?? selected?.product_id;
            if (!id) return;
            await deleteProduct(id);
            setSelected(null);
            setIsAdding(false);
        } catch {
            // keep the product selected so user can retry
        }
    };

    const handleToggleActive = async (productId: number, value: boolean) => {
        try {
            await updateProduct(productId, { is_active: value });
            setSelected((prev) => (prev && prev.product_id === productId ? { ...prev, is_active: value } : prev));
        } catch {
            await fetchProducts();
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {loading ? <LinearProgress color="primary" sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 60 }} /> : null}
            <div className="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
                <Slide in={!!success} direction="down" mountOnEnter unmountOnExit>
                    <div className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30">
                        <CircleCheckBig className="h-4 w-4" />
                        <span>{success}</span>
                    </div>
                </Slide>
                <Slide in={!!loading} direction="down" mountOnEnter unmountOnExit>
                    <div className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-900/30">
                        Loading...
                    </div>
                </Slide>
                <Slide in={!!error} direction="down" mountOnEnter unmountOnExit>
                    <div className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-900/30">
                        <CircleX className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                </Slide>
            </div>
            <div className="flex flex-col gap-5 overflow-x-auto bg-[#FAFAFA] p-4 transition-colors duration-300 dark:bg-neutral-900">
                <div className="relative h-[180px] overflow-hidden rounded-xl bg-[#F57979] shadow-lg">
                    <div className="relative z-10 p-6">
                        <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-[#FFF172]">Product Management</h1>
                        <div className="text-[1.08rem] font-medium text-white opacity-90">Activate and manage product listings</div>
                    </div>
                </div>

                {isMobile ? (
                    <MobileView
                        products={products}
                        availableTypes={types}
                        onSave={(payload, id) => handleSave(payload, id)}
                        onDelete={(id) => handleDelete(id)}
                        onToggleActive={handleToggleActive}
                    />
                ) : (
                    <DesktopView
                        products={products}
                        availableTypes={types}
                        selected={selected}
                        isAdding={isAdding}
                        onSelect={(product_id) => {
                            setSelected(products.find((p) => p.product_id === product_id) ?? null);
                            setIsAdding(false);
                        }}
                        onSave={handleSave}
                        onDelete={handleDelete}
                        onToggleActive={handleToggleActive}
                        onAdd={() => {
                            setSelected(null);
                            setIsAdding(true);
                        }}
                    />
                )}
            </div>
        </AppLayout>
    );
}
