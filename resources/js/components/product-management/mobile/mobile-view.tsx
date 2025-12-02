import React, { useMemo, useState } from 'react';
import type { ProductLntype, ProductPayload, WlnType } from '@/types/product-lntype';
import { Box, Button, Stack } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ProductList from '../product-list';
import ProductDetailsModal from './product-details-modal';
import { useMyTheme } from '@/hooks/use-mytheme';

type Props = {
  products: ProductLntype[];
  availableTypes?: WlnType[];
  onSave: (payload: ProductPayload, productId?: number | null) => Promise<void> | void;
  onDelete: (productId?: number | null) => Promise<void> | void;
  onToggleActive?: (productId: number, value: boolean) => void;
};

const MobileView: React.FC<Props> = ({ products, availableTypes = [], onSave, onDelete, onToggleActive }) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ProductLntype | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const tw = useMyTheme();

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    if (!term) return products;
    return products.filter(
      (p) =>
        p.product_name.toLowerCase().includes(term) ||
        p.types?.some((t) => t.typecode.toLowerCase().includes(term) || t.lntype.toLowerCase().includes(term)),
    );
  }, [products, search]);

  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        gap: 3,
        p: 0,
        pb: 0,
        minHeight: 'auto',
        bgcolor: tw.isDark ? '#171717' : '#fafafa',
      }}
    >
      <Stack
        sx={{
          borderRadius: 3,
          boxShadow: '0 12px 30px rgba(15,23,42,0.12)',
          backgroundColor: tw.isDark ? '#2f2f2f' : 'background.paper',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 'calc(100vh - 320px)',
          justifyContent: 'flex-start',
          width: '100%',
          maxWidth: 720,
          alignSelf: 'center',
        }}
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
      </Stack>

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

      <ProductDetailsModal
        open={modalOpen}
        product={selected}
        availableTypes={availableTypes}
        onClose={() => setModalOpen(false)}
        onSave={async (payload, productId) => {
          await onSave(payload, productId);
          setModalOpen(false);
        }}
        onDelete={async (productId) => {
          await onDelete(productId);
          setModalOpen(false);
        }}
        onToggleActive={onToggleActive}
      />
    </Box>
  );
};

export default MobileView;
