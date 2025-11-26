import React, { useState, useMemo } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import ProductList from '../product-list';
import type { ProductLntype } from '@/types/product-lntype';
type Props = {
  products: ProductLntype[];
  onToggleDisplay: (typecode: string, next: boolean) => void;
  onSelect?: (typecode: string) => void;
  onAdd?: () => void;
};

const DesktopView: React.FC<Props> = ({ products, onToggleDisplay, onSelect, onAdd }) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    if (!term) return products;
    return products.filter(
      (p) =>
        p.lntype.toLowerCase().includes(term) ||
        p.typecode.toLowerCase().includes(term)
    );
  }, [products, search]);

  return (
    <Stack direction="row" spacing={3} alignItems="stretch">
      <Box
        sx={{
          flex: 1,
          borderRadius: 3,
          boxShadow: '0 12px 30px rgba(15,23,42,0.12)',
          backgroundColor: 'background.paper',
          p: 2,
        }}
      >
        <Box sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>Products</Typography>
          {/* <Typography variant="body2" color="text.secondary">Toggle visibility</Typography> */}
        </Box>
        <ProductList
          products={filtered}
          onToggleDisplay={onToggleDisplay}
          onSelect={onSelect}
          onAdd={onAdd}
          searchValue={search}
          onSearchChange={setSearch}
          searchOptions={products.map((p) => p.lntype)}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          borderRadius: 3,
          boxShadow: '0 12px 30px rgba(15,23,42,0.12)',
          backgroundColor: 'background.paper',
          p: 2,
        }}
      >
        <Box sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>Details</Typography>
          <Typography variant="body2" color="text.secondary">Select a product</Typography>
        </Box>
        {/* Detail content goes here */}
      </Box>
    </Stack>
  );
};

export default DesktopView;
