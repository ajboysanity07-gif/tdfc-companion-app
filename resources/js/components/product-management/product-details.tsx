import { Card, CardContent, Typography, Button, Stack, Switch } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { FC } from 'react';
import type { ProductLntype } from './add-product-list-modal';

interface ProductDetailsProps {
  product: ProductLntype | null;
  onSave: (product: ProductLntype) => void;
  onDelete: (product: ProductLntype) => void;
  onCancel: () => void;
}

const ProductDetails: FC<ProductDetailsProps> = ({
  product,
  onSave,
  onDelete,
  onCancel,
}) => {
  if (!product)
    return (
      <Card className="shadow-lg">
        <CardContent>
          <Typography color="textSecondary" align="center">
            Select a product type from the list to view details.
          </Typography>
        </CardContent>
      </Card>
    );

  return (
    <Card className="shadow-lg">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {product.wlntype}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Type Code: {product.typecode}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1} mt={2}>
          <Typography>Displayed</Typography>
          <Switch checked={product.isDisplayed} disabled />
        </Stack>
      </CardContent>
      <Stack direction="row" spacing={2} justifyContent="flex-end" p={2}>
        <Button variant="text" color="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant="contained" color="primary" startIcon={<EditIcon />} onClick={() => onSave(product)}>
          Save
        </Button>
        <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => onDelete(product)}>
          Delete
        </Button>
      </Stack>
    </Card>
  );
};

export default ProductDetails;
