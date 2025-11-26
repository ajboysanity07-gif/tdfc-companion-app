import React from 'react';
import {
  Autocomplete,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AddIcon from '@mui/icons-material/Add';
import IOSSwitch from '@/components/ui/ios-switch';
import type { ProductLntype } from '@/types/product-lntype';

type Props = {
  products: ProductLntype[];
  onToggleDisplay: (typecode: string, next: boolean) => void;
  onSelect?: (typecode: string) => void;
  onAdd?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchOptions?: string[]; // e.g., lntype or typecode list for autocomplete
};

const ProductList: React.FC<Props> = ({
  products,
  onToggleDisplay,
  onSelect,
  onAdd,
  searchValue = '',
  onSearchChange,
  searchOptions = [],
}) => {
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAdd}
          // disabled={!onAdd}
          sx={{ borderRadius: 2 }}
        >
          Add
        </Button>
        <Autocomplete
          freeSolo
          options={searchOptions}
          value={searchValue}
          onInputChange={(_, value) => onSearchChange?.(value)}
          renderInput={(params) => (
            <TextField {...params} label="Search products" size="small" />
          )}
          sx={{ flex: 1, minWidth: 220 }}
        />
      </Stack>

      {products.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No product available. You can always add a new product.
        </Typography>
      ) : (
        <List disablePadding sx={{ width: '100%' }}>
          {products.map((product) => {
            const isOn = product.display?.isDisplayed ?? false;
            return (
              <ListItem
                key={product.typecode}
                disableGutters
                secondaryAction={
                  <ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IOSSwitch
                      checked={isOn}
                      onChange={(_, checked) => onToggleDisplay(product.typecode, checked)}
                    />
                    <IconButton
                      size="small"
                      onClick={() => onSelect?.(product.typecode)}
                      sx={{ border: '1px solid rgba(0,0,0,0.08)' }}
                    >
                      <ArrowForwardIosIcon fontSize="inherit" />
                    </IconButton>
                  </ListItemSecondaryAction>
                }
              >
                <Stack>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {product.lntype}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Code: {product.typecode}
                  </Typography>
                </Stack>
              </ListItem>
            );
          })}
        </List>
      )}
    </Stack>
  );
};

export default ProductList;
