import IOSSwitch from '@/components/ui/ios-switch';
import { useMyTheme } from '@/hooks/use-mytheme';
import type { ProductLntype } from '@/types/product-lntype';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, Box, Chip, IconButton, List, ListItem, Paper, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BoxHeader from './box-header';
import { PRODUCT_LIST_PAGE_SIZE } from './product-list-skeleton';

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
    const cardBg = tw.isDark ? '#2f2f2f' : '#f7f7f7';
    const cardBorder = tw.isDark ? '#3a3a3a' : '#e5e5e5';
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
            sx={fullHeight ? { flex: 1, minHeight: '100%', alignItems: 'stretch', justifyContent: 'flex-start' } : undefined}
        >
            <BoxHeader title="Products" />
            <Box
                sx={{
                    p: isMobile ? 1 : 1.5,
                    borderRadius: 2,
                    bgcolor: tw.isDark ? '#262626' : 'rgba(0,0,0,0.04)',
                    border: tw.isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
                    flex: fullHeight ? 1 : 'unset',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isMobile ? 1 : 1.25,
                }}
            >
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
                    sx={{ minWidth: 220 }}
                />

                {paginated.length === 0 ? (
                    <Box
                        sx={{
                            border: `1px dashed ${cardBorder}`,
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
                    <List
                        disablePadding
                        sx={{
                            width: '100%',
                            mt: isMobile ? 0.25 : 0.5,
                            flexGrow: 0,
                            alignSelf: 'stretch',
                        }}
                    >
                        <AnimatePresence initial={false}>
                    {paginated.map((product) => {
                        const isOn = product.is_active ?? false;
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
                                      elevation={2}
                                      sx={{
                                          mb: isMobile ? 1 : 1.25,
                                          borderRadius: isMobile ? 2 : 2.5,
                                          overflow: 'hidden',
                                          bgcolor: cardBg,
                                          border: `1px solid ${cardBorder}`,
                                      }}
                                  >
                                      <ListItem disableGutters sx={{ px: isMobile ? 1.5 : 2, py: isMobile ? 1 : 1.5 }}>
                                          <Stack direction="row" alignItems="center" spacing={isMobile ? 1.25 : 1.5} sx={{ width: '100%' }}>
                                              <IOSSwitch
                                                  checked={isOn}
                                                  onChange={(e) => onToggleActive?.(product.product_id, e.target.checked)}
                                              />
                                              <Stack sx={{ flex: 1, alignItems: 'center', textAlign: 'center' }}>
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
                                                                      color: tw.isDark ? 'text.secondary' : '#475569',
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
                                                                  color: tw.isDark ? 'text.secondary' : '#475569',
                                                                  '& .MuiChip-label': { px: isMobile ? 1 : 1.25, fontSize: isMobile ? 11 : 12 },
                                                              }}
                                                          />
                                                      )}
                                                  </Stack>
                                              </Stack>
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
            {list.length > 0 ? (
                <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="center"
                    alignItems="center"
                    sx={{ pt: isMobile ? 0.75 : 1, width: '100%' }}
                >
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
                        }}
                    >
                        Next
                    </Box>
                </Stack>
            ) : null}
        </Stack>
    );
};

export default ProductList;
