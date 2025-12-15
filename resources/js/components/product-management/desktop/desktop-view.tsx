import type { ProductLntype, ProductPayload, WlnType } from '@/types/product-lntype';
import { Box, Stack } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';
import ProductList from '../product-list';
import ProductCrud from '../product-crud'; 
import { useMyTheme } from '@/hooks/use-mytheme';

type Props = {
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

const DesktopView: React.FC<Props> = ({ products, selected, isAdding = false,  availableTypes= [], onSelect, onAdd, onSave, onDelete, onToggleActive }) => {
    const [search, setSearch] = useState('');
    const [localSelected, setLocalSelected] = useState<ProductLntype | null>(selected);
    const tw = useMyTheme();

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
        return syncedProducts.filter((p) => p.product_name.toLowerCase().includes(term) || p.types?.some((t) =>t.typecode.toLowerCase().includes(term) || t.lntype.toLowerCase().includes(term)));
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

       <Box
            sx={{ 
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                gap: 4,
                p: 2,
                bgcolor: tw.isDark ? '#171717' : '#FAFAFA',
                transition: 'color 300ms, background-color 300ms',
             }}
            >

       <Stack direction="row" spacing={3} alignItems="stretch">
            <Box
                sx={{
                    flex: 1,
                    borderRadius: 3,
                    boxShadow: '0 12px 30px rgba(15,23,42,0.12)',
                    backgroundColor: tw.isDark ? '#2f2f2f' : 'background.paper',
                    p: 5,
                    minHeight: 1100,
                }}
            >
                <ProductList
                    products={filtered}
                    onSelect={handleSelect}
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchOptions={products.map((p) => p.product_name)}
                    onToggleActive={handleToggleActive}
                    fullHeight
                />
            </Box>

            <Box
                sx={{
                    flex: 1,
                    borderRadius: 3,
                    boxShadow: '0 12px 30px rgba(15,23,42,0.12)',
                    backgroundColor: tw.isDark ? '#2f2f2f' : 'background.paper',
                    p: 5,
                    minHeight: 1100,
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeProduct ? activeProduct.product_id : 'create'}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        transition={{ type: 'spring', stiffness: 240, damping: 22, mass: 0.7 }}
                    >
                        <ProductCrud
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
            </Box>
        </Stack>
        </Box>

    );
};

export default DesktopView;
