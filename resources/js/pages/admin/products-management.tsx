import DesktopViewLayout from '@/components/desktop-view-layout';
import MobileViewLayout from '@/components/mobile-view-layout';
import ProductCrud from '@/components/admin/product-management/product-crud';
import { PRODUCT_LIST_PAGE_SIZE } from '@/components/admin/product-management/skeletons';
import ProductManagementSkeleton from '@/components/admin/product-management/product-management-skeleton';
import FullScreenModalMobile from '@/components/ui/full-screen-modal-mobile';
import ProductList from '@/components/admin/product-management/product-list';
import { useProductManagement } from '@/hooks/use-product-management';
import AppLayout from '@/layouts/app-layout';
import { ProductLntype, ProductPayload, WlnType } from '@/types/product-lntype';
import { Button, LinearProgress, Slide, useMediaQuery } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleCheckBig, CircleX } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import HeaderBlock from '@/components/management/header-block';

const breadcrumbs = [{ title: 'Product Management', href: '/admin/products' }];

type ProductDesktopProps = {
    products: ProductLntype[];
    selected: ProductLntype | null;
    availableTypes?: WlnType[];
    isAdding?: boolean;
    onSelect?: (product_id: number) => void;
    onAdd: () => void;
    onSave: (payload: ProductPayload) => Promise<void> | void;
    onDelete: () => Promise<void> | void;
    onToggleActive?: (productId: number, value: boolean) => void;
};

function ProductDesktopLayoutView({
    products,
    selected,
    availableTypes = [],
    isAdding = false,
    onSelect,
    onAdd,
    onSave,
    onDelete,
    onToggleActive,
}: ProductDesktopProps) {
    const [search, setSearch] = useState('');
    const [localSelected, setLocalSelected] = useState<ProductLntype | null>(selected);

    useEffect(() => setLocalSelected(selected), [selected]);

    const activeProduct = useMemo(() => {
        return isAdding ? null : localSelected;
    }, [isAdding, localSelected]);

    const syncedProducts = useMemo(
        () =>
            products.map((p) =>
                activeProduct && p.product_id === activeProduct.product_id
                    ? { ...p, is_active: activeProduct.is_active }
                    : p,
            ),
        [products, activeProduct],
    );

    const filtered = useMemo(() => {
        const term = search.toLowerCase();
        if (!term) return syncedProducts;
        return syncedProducts.filter(
            (p) =>
                p.product_name.toLowerCase().includes(term) ||
                p.types?.some((t) => t.typecode.toLowerCase().includes(term) || t.lntype.toLowerCase().includes(term)),
        );
    }, [syncedProducts, search]);

    const handleSelect = (product_id: number) => {
        const found = products.find((p) => p.product_id === product_id) ?? null;
        setLocalSelected(found);
        onSelect?.(product_id);
    };

    const handleToggleActive = (productId: number, value: boolean) => {
        setLocalSelected((prev) => (prev && prev.product_id === productId ? { ...prev, is_active: value } : prev));
        onToggleActive?.(productId, value);
    };

    return (
        <DesktopViewLayout
            left={
                <ProductList
                    products={filtered}
                    onSelect={handleSelect}
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchOptions={products.map((p) => p.product_name)}
                    onToggleActive={handleToggleActive}
                    fullHeight
                />
            }
            right={
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeProduct?.product_id ?? 'new'}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        transition={{ type: 'spring', stiffness: 240, damping: 22, mass: 0.7 }}
                    >
                        <ProductCrud
                            key={activeProduct?.product_id ?? 'new'}
                            product={activeProduct}
                            availableTypes={availableTypes}
                            onCancel={() => {
                                setLocalSelected(null);
                                onAdd();
                            }}
                            onSave={onSave}
                            onDelete={() => onDelete()}
                            onToggleActive={handleToggleActive}
                        />
                    </motion.div>
                </AnimatePresence>
            }
            leftSx={{ p: 5, minHeight: 1100 }}
            rightSx={{ p: 5, minHeight: 1100 }}
        />
    );
}

type ProductMobileProps = {
    products: ProductLntype[];
    availableTypes?: WlnType[];
    onSave: (payload: ProductPayload, productId?: number | null) => Promise<void> | void;
    onDelete: (productId?: number | null) => Promise<void> | void;
    onToggleActive?: (productId: number, value: boolean) => void;
};

function ProductMobileLayoutView({ products, availableTypes = [], onSave, onDelete, onToggleActive }: ProductMobileProps) {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<ProductLntype | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const filtered = useMemo(() => {
        const term = search.toLowerCase();
        if (!term) return products;
        return products.filter(
            (p) =>
                p.product_name.toLowerCase().includes(term) ||
                p.types?.some((t) => t.typecode.toLowerCase().includes(term) || t.lntype.toLowerCase().includes(term)),
        );
    }, [products, search]);

    const closeModal = () => {
        setModalOpen(false);
        setSelected(null);
    };

    return (
        <MobileViewLayout
            footer={
                <>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            setSelected(null);
                            setModalOpen(true);
                        }}
                        startIcon={<AddCircleIcon />}
                        sx={{
                            position: 'fixed',
                            bottom: 84,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            borderRadius: 999,
                            px: 2.5,
                            py: 1,
                            boxShadow: '0 10px 30px rgba(0,0,0,0.22)',
                        }}
                    >
                        Add New
                    </Button>

                    <FullScreenModalMobile
                        open={modalOpen}
                        title={selected ? selected.product_name : 'Add Product'}
                        onClose={closeModal}
                        headerBg="#f57979"
                        headerColor="#fff"
                        bodySx={{ pb: { xs: 4, sm: 4 } }}
                    >
                        <ProductCrud
                            key={selected?.product_id ?? 'new-mobile'}
                            product={selected}
                            availableTypes={availableTypes}
                            onCancel={closeModal}
                            onSave={async (payload) => {
                                await onSave(payload, selected?.product_id);
                                closeModal();
                            }}
                            onDelete={async () => {
                                await onDelete(selected?.product_id);
                                closeModal();
                            }}
                            onToggleActive={onToggleActive}
                            hideActionsOnMobile
                        />
                    </FullScreenModalMobile>
                </>
            }
        >
            <ProductList
                products={filtered}
                onSelect={(id) => {
                    const found = products.find((p) => p.product_id === id) ?? null;
                    setSelected(found);
                    setModalOpen(true);
                }}
                searchValue={search}
                onSearchChange={setSearch}
                searchOptions={products.map((p) => p.product_name)}
                onToggleActive={onToggleActive}
                fullHeight
            />
        </MobileViewLayout>
    );
}

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
            <div className="flex flex-col  overflow-x-auto bg-[#FAFAFA] transition-colors duration-300 dark:bg-neutral-900">
                <HeaderBlock title="Product Management" subtitle="Activate and manage product listings" />

                {loading ? (
                    <ProductManagementSkeleton itemCount={Math.max(products.length, PRODUCT_LIST_PAGE_SIZE)} />
                ) : isMobile ? (
                    <ProductMobileLayoutView
                        products={products}
                        availableTypes={types}
                        onSave={(payload, id) => handleSave(payload, id)}
                        onDelete={(id) => handleDelete(id)}
                        onToggleActive={handleToggleActive}
                    />
                ) : (
                    <ProductDesktopLayoutView
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
