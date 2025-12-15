import IOSSwitch from '@/components/ui/ios-switch';
import { useMyTheme } from '@/hooks/use-mytheme';
import type { ProductLntype } from '@/types/product-lntype';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, Box, Chip, IconButton, List, ListItem, Paper, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BoxHeader from './box-header';

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

    // Dummy data to show something when no products are passed in (can be removed once API is wired)

    const list = products;

    return (
        <Stack
            spacing={isMobile ? 1.1 : 1.6}
            sx={fullHeight ? { flex: 1, minHeight: '100%', alignItems: 'stretch', justifyContent: 'flex-start' } : undefined}
        >
            <BoxHeader title="Products" />
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

            {list.length === 0 ? (
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
                    {list.map((product) => {
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
                                                                  bgcolor: tw.isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                                                                  color: 'text.secondary',
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
                                                              bgcolor: tw.isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                                                              color: 'text.secondary',
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
                                                  border: '1px solid rgba(255,255,255,0.1)',
                                                  bgcolor: tw.isDark ? '#353535' : '#f0f0f0',
                                                  color: 'text.primary',
                                                  transition: 'all 120ms ease',
                                                  '&:hover': {
                                                      transform: 'scale(1.08)',
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
        </Stack>
    );
};

export default ProductList;
