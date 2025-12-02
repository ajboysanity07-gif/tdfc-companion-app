import type { ProductLntype, ProductPayload, WlnType } from '@/types/product-lntype';
import { Box, Stack, Typography, Button } from '@mui/material';
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

    const syncedProducts = useMemo(
        () =>
            products.map((p) =>
                localSelected && p.product_id === localSelected.product_id
                    ? { ...p, is_active: localSelected.is_active }
                    : p,
            ),
        [products, localSelected],
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
                    {localSelected || isAdding ? (
                        <motion.div
                            key={localSelected ? localSelected.product_id : 'create'}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 12 }}
                            transition={{ type: 'spring', stiffness: 240, damping: 22, mass: 0.7 }}
                        >
                            <ProductCrud
                                product={localSelected}
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
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Box
                                sx={{
                                    border: `1px dashed ${tw.isDark ? '#3a3a3a' : '#d0d7de'}`,
                                    borderRadius: 2,
                                    p: 4,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    color: 'text.secondary',
                                    minHeight: 1000,
                                    flexDirection: 'column',
                                    gap: 1,
                                }}
                            >
                                <Typography variant="h6" fontWeight={800}>
                                    Product details will appear here.
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Add a product below or select one from the list to view, update, or delete.
                                </Typography>
                                <Button
                                  variant="contained"
                                  onClick={onAdd}
                                  sx={{ mt: 1, borderRadius: 2 }}
                                >
                                  Add Product
                                </Button>
                                
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>
        </Stack>
        </Box>

    );
};

export default DesktopView;
