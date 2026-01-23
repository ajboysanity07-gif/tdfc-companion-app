import { useMyTheme } from '@/hooks/use-mytheme';
import type { ProductLntype } from '@/types/product-lntype';
import { Box, Chip, List, ListItem, Paper, Stack, Typography, useMediaQuery } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductListSkeleton } from './skeletons';

type Props = {
    products: ProductLntype[];
    loading: boolean;
    error: string | null;
    selectedProduct: ProductLntype | null;
    onSelectProduct: (product: ProductLntype) => void;
};

export default function ProductList({ products, loading, error, selectedProduct, onSelectProduct }: Props) {
    const isMobile = useMediaQuery('(max-width:900px)');
    const tw = useMyTheme();
    const cardBg = tw.isDark ? '#2f2f2f' : '#f5f5f5';
    const cardBorder = tw.isDark ? '#3a3a3a' : '#d4d4d4';

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {loading && <ProductListSkeleton />}
            
            {error && !loading && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="error" sx={{ mb: 1, fontWeight: 600 }}>
                        {error}
                    </Typography>
                </Box>
            )}

            {!loading && !error && products.length === 0 && (
                <Box
                    sx={{
                        border: `1px dashed ${cardBorder}`,
                        borderRadius: 2,
                        p: isMobile ? 2.5 : 4,
                        minHeight: isMobile ? 200 : 360,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        color: 'text.secondary',
                        gap: isMobile ? 0.5 : 0.75,
                    }}
                >
                    <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight={800}>
                        No loan products available.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Please check back later.
                    </Typography>
                </Box>
            )}

            {!loading && !error && products.length > 0 && (
                <List disablePadding sx={{ width: '100%' }}>
                    <AnimatePresence initial={false}>
                        {products.map((product) => {
                            const typeLabels = product.types?.map((t) => t.lntags || t.typecode) ?? [];
                            return (
                                <motion.div
                                    key={product.product_id}
                                    initial={{ opacity: 0, y: -16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -16 }}
                                    transition={{ type: 'spring', stiffness: 220, damping: 20, mass: 0.6 }}
                                >
                                    <Paper
                                        elevation={0}
                                        onClick={() => onSelectProduct(product)}
                                        sx={{
                                            mb: isMobile ? 1 : 1.25,
                                            borderRadius: isMobile ? 2 : 2.5,
                                            overflow: 'hidden',
                                            bgcolor: selectedProduct?.product_id === product.product_id 
                                                ? (tw.isDark ? '#3a3a3a' : '#e3f2fd')
                                                : cardBg,
                                            border: `2px solid ${selectedProduct?.product_id === product.product_id 
                                                ? '#F57979' 
                                                : (tw.isDark ? '#3a3a3a' : '#d4d4d4')}`,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                borderColor: selectedProduct?.product_id === product.product_id 
                                                    ? '#F57979' 
                                                    : (tw.isDark ? 'rgba(255,255,255,0.3)' : '#a3a3a3'),
                                            },
                                        }}
                                    >
                                        <ListItem disableGutters sx={{ px: isMobile ? 1.5 : 2, py: isMobile ? 1 : 1.5 }}>
                                            <Stack sx={{ width: '100%', alignItems: 'center', textAlign: 'center' }}>
                                                <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight={800}>
                                                    {product.product_name}
                                                </Typography>
                                                <Stack direction="row" spacing={isMobile ? 0.4 : 0.5} justifyContent="center" alignItems="center" flexWrap="wrap" rowGap={isMobile ? 0.3 : 0.5} mt={0.5}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mr: 0.5 }}>
                                                        Tags:
                                                    </Typography>
                                                    {typeLabels.length ? (
                                                        typeLabels.map((label) => (
                                                            <Chip
                                                                key={label}
                                                                label={label}
                                                                size="small"
                                                                sx={{
                                                                    height: isMobile ? 20 : 22,
                                                                    borderRadius: '999px',
                                                                    bgcolor: tw.isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                                                                    color: tw.isDark ? 'text.secondary' : '#1e293b',
                                                                    fontWeight: 600,
                                                                    '& .MuiChip-label': { px: isMobile ? 1 : 1.25, fontSize: isMobile ? 11 : 12 },
                                                                }}
                                                            />
                                                        ))
                                                    ) : (
                                                        <Chip
                                                            label="No tags"
                                                            size="small"
                                                            sx={{
                                                                height: isMobile ? 20 : 22,
                                                                borderRadius: '999px',
                                                                bgcolor: tw.isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                                                                color: tw.isDark ? 'text.secondary' : '#1e293b',
                                                                '& .MuiChip-label': { px: isMobile ? 1 : 1.25, fontSize: isMobile ? 11 : 12 },
                                                            }}
                                                        />
                                                    )}
                                                </Stack>
                                            </Stack>
                                        </ListItem>
                                    </Paper>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </List>
            )}
        </Box>
    );
}
