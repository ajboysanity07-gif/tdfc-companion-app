import IOSSwitch from '@/components/ui/ios-switch';
import { useMyTheme } from '@/hooks/use-mytheme';
import type { ProductLntype } from '@/types/product-lntype';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, Box, Chip, IconButton, List, ListItem, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRODUCT_LIST_PAGE_SIZE } from './skeletons';
import BoxHeader from '@/components/box-header';

type Props = {
    products: ProductLntype[];
    onSelect?: (product_id: number) => void;
    onToggleActive?: (productId: number, value: boolean) => void;
    onAdd?: () => void;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchOptions?: string[]; // e.g., lntype or typecode list for autocomplete
    fullHeight?: boolean;
};

const ProductList: React.FC<Props> = ({
    products,
    onSelect,
    onToggleActive,
    searchValue = '',
    onSearchChange,
    searchOptions = [],
    fullHeight = false,
}) => {
    const tw = useMyTheme();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const pageSize = PRODUCT_LIST_PAGE_SIZE;

    const list = products;
    const [page, setPage] = useState(1);
    const totalPages = Math.max(Math.ceil(list.length / pageSize), 1);
    const clampedPage = Math.min(page, totalPages);
    const start = (clampedPage - 1) * pageSize;
    const paginated = useMemo(() => list.slice(start, start + pageSize), [list, start, pageSize]);

    useEffect(() => {
        if (page !== clampedPage) {
            setPage(clampedPage);
        }
    }, [clampedPage, page]);

    useEffect(() => {
        setPage(1);
    }, [searchValue]);

    return (
        <Stack
            spacing={isMobile ? 1.1 : 1.6}
            sx={fullHeight ? { flex: 1, minHeight: '100%', alignItems: 'stretch', justifyContent: 'flex-start', pb: 3 } : { pb: 3 }}
        >
            <Box
                sx={{
                    borderRadius: 6,
                    bgcolor: tw.isDark ? '#171717' : '#FAFAFA',
                    p: 0,
                    flex: fullHeight ? 1 : 'unset',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isMobile ? 1.5 : 2,
                }}
            >
                <BoxHeader title="Available Products" />
                {/* Search bar */}
                <Autocomplete
                    freeSolo
                    options={searchOptions}
                    value={searchValue}
                    onInputChange={(_, value) => onSearchChange?.(value)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <SearchIcon fontSize="small" />
                                    Search products
                                </Box>
                            }
                            size="small"
                        />
                    )}
                    sx={{ width: '100%' }}
                />

            {/* Product list */}
            {paginated.length === 0 ? (
                <Box
                    sx={{
                        border: `1px dashed ${tw.isDark ? '#3a3a3a' : '#e5e5e5'}`,
                        borderRadius: 2,
                        p: isMobile ? 2.5 : 4,
                        minHeight: fullHeight ? '100%' : isMobile ? '75%' : 360,
                        height: fullHeight ? '100%' : 'auto',
                        flexGrow: fullHeight ? 1 : 0,
                        width: '100%',
                        alignSelf: 'stretch',
                        maxWidth: '100%',
                        mx: 'auto',
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
                        No product available.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        You can always add a new product.
                    </Typography>
                </Box>
            ) : (
                <List sx={{ flex: fullHeight ? 1 : 'auto', display: 'flex', flexDirection: 'column', gap: 1, p: 0 }}>
                    <AnimatePresence initial={false}>
                        {paginated.map((product) => {
                            const isOn = product.is_active ?? false;
                            // Expand lntags from comma-separated strings into individual tag labels
                            const typeLabels = product.types
                                ?.flatMap((t) => {
                                    if (t.lntags && t.lntags.trim()) {
                                        return t.lntags.split(',').map((tag) => tag.trim()).filter(Boolean);
                                    }
                                    return t.typecode ? [t.typecode] : [];
                                })
                                .filter(Boolean) ?? [];
                            return (
                                <motion.div
                                    key={product.product_id}
                                    initial={{ opacity: 0, y: -16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -16 }}
                                    transition={{ type: 'spring', stiffness: 220, damping: 20, mass: 0.6 }}
                                >
                                    <ListItem
                                        sx={{
                                            borderRadius: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            p: 2,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            bgcolor: tw.isDark ? '#262626' : '#FFFFFF',
                                            '&:hover': {
                                                bgcolor: tw.isDark ? '#2f2f2f' : '#F5F5F5'
                                            }
                                        }}
                                    >
                                        <Stack direction="row" spacing={2} sx={{ flex: 1, alignItems: 'center' }}>
                                            {/* Toggle switch */}
                                            <IOSSwitch
                                                checked={isOn}
                                                onChange={(e) => onToggleActive?.(product.product_id, e.target.checked)}
                                            />
                                            
                                            {/* Product info */}
                                            <Stack sx={{ flex: 1 }}>
                                                <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight={700}>
                                                    {product.product_name}
                                                </Typography>
                                                {typeLabels.length > 0 && (
                                                    <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" rowGap={0.3} mt={0.5}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mr: 0.5 }}>
                                                            Tags:
                                                        </Typography>
                                                        {typeLabels.slice(0, 3).map((label) => (
                                                            <Chip
                                                                key={label}
                                                                label={label}
                                                                size="small"
                                                                sx={{
                                                                    height: 18,
                                                                    borderRadius: '999px',
                                                                    bgcolor: tw.isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                                                                    color: tw.isDark ? 'text.secondary' : '#475569',
                                                                    fontWeight: 600,
                                                                    '& .MuiChip-label': { px: 1, fontSize: 11 },
                                                                }}
                                                            />
                                                        ))}
                                                        {typeLabels.length > 3 && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                +{typeLabels.length - 3} more
                                                            </Typography>
                                                        )}
                                                    </Stack>
                                                )}
                                            </Stack>
                                        </Stack>

                                        {/* Arrow icon */}
                                        <IconButton
                                            size="small"
                                            onClick={() => onSelect?.(product.product_id)}
                                            sx={{
                                                width: isMobile ? 32 : 36,
                                                height: isMobile ? 32 : 36,
                                                borderRadius: '50%',
                                                border: '1px solid rgba(245,121,121,0.25)',
                                                bgcolor: 'rgba(245,121,121,0.12)',
                                                color: '#f57979',
                                                transition: 'all 120ms ease',
                                                '&:hover': {
                                                    transform: 'scale(1.08)',
                                                    bgcolor: 'rgba(245,121,121,0.2)',
                                                },
                                            }}
                                        >
                                            <ArrowForwardIosIcon fontSize="inherit" />
                                        </IconButton>
                                    </ListItem>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </List>
            )}

            {/* Pagination */}
            {list.length > 0 && (
                <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 2 }}>
                    <Box
                        component="button"
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={clampedPage <= 1}
                        style={{ cursor: clampedPage <= 1 ? 'not-allowed' : 'pointer' }}
                        sx={{
                            px: 2,
                            py: 0.6,
                            borderRadius: 1,
                            border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
                            bgcolor: tw.isDark ? '#2f2f2f' : 'rgba(0,0,0,0.04)',
                            color: 'text.secondary',
                            fontWeight: 700,
                            opacity: clampedPage <= 1 ? 0.6 : 1,
                            fontSize: '0.875rem',
                        }}
                    >
                        Prev
                    </Box>
                    <Box
                        sx={{
                            px: 2,
                            py: 0.6,
                            borderRadius: 1,
                            border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
                            bgcolor: tw.isDark ? '#2f2f2f' : 'rgba(0,0,0,0.04)',
                            color: 'text.secondary',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                        }}
                    >
                        {clampedPage} / {totalPages}
                    </Box>
                    <Box
                        component="button"
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                        disabled={clampedPage >= totalPages}
                        style={{ cursor: clampedPage >= totalPages ? 'not-allowed' : 'pointer' }}
                        sx={{
                            px: 2,
                            py: 0.6,
                            borderRadius: 1,
                            border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
                            bgcolor: tw.isDark ? '#2f2f2f' : 'rgba(0,0,0,0.04)',
                            color: 'text.secondary',
                            fontWeight: 700,
                            opacity: clampedPage >= totalPages ? 0.6 : 1,
                            fontSize: '0.875rem',
                        }}
                    >
                        Next
                    </Box>
                </Stack>
            )}
            </Box>
        </Stack>
    );
};

export default ProductList;
