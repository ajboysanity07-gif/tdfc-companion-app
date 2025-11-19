import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Switch, Typography, Box, IconButton, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import type { FC } from 'react';
import type { ProductLntype } from '@/components/product-management/add-product-list-modal';

interface ProductDetailsModalProps {
  open: boolean;
  product: ProductLntype | null;
  onClose: () => void;
  onSave: (product: ProductLntype) => void;
  onDelete: (product: ProductLntype) => void;
}

const ProductDetailsModal: FC<ProductDetailsModalProps> = ({
  open,
  product,
  onClose,
  onSave,
  onDelete
}) => {
  if (!product) return null;

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <DialogTitle>Product Details</DialogTitle>
      <DialogContent>
        <Box className="mb-4">
          <Typography variant="h5">{product.wlntype}</Typography>
          <Typography variant="body2" color="textSecondary">
            Type Code: {product.typecode}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1} mt={2}>
            <Typography>Displayed</Typography>
            <Switch checked={product.isDisplayed} disabled classes={{ switchBase: 'MuiSwitch-switchBase' }} />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <IconButton color="error" onClick={() => onDelete(product)}>
          <DeleteIcon />
        </IconButton>
        <IconButton color="primary" onClick={() => onSave(product)}>
          <SaveIcon />
        </IconButton>
        <Button onClick={onClose} color="secondary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductDetailsModal;
