import React from 'react';
import { Dialog, AppBar, Toolbar, IconButton, Typography, Slide, Box, Button, useMediaQuery } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/material/styles';
import type { TransitionProps } from '@mui/material/transitions';
import type { ProductLntype, ProductPayload, WlnType } from '@/types/product-lntype';
import ProductCrud from '../product-crud';
import { useEffect, useRef } from 'react';

type Props = {
  open: boolean;
  product: ProductLntype | null;
  availableTypes?: WlnType[];
  onClose: () => void;
  onSave: (payload: ProductPayload, productId?: number | null) => Promise<void> | void;
  onDelete: (productId?: number | null) => Promise<void> | void;
  onToggleActive?: (productId: number, value: boolean) => void;
};

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  const theme = useTheme();

  return (
    <Slide
      direction="left"
      ref={ref}
      timeout={{ enter: 6000, exit: 4000 }}
      easing={{
        enter: theme.transitions.easing.easeOut,
        exit: theme.transitions.easing.sharp,
      }}
      {...props}
    />
  );
});

const ProductDetailsModal: React.FC<Props> = ({
  open,
  product,
  availableTypes = [],
  onClose,
  onSave,
  onDelete,
  onToggleActive,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (open) {
      document.body.classList.add('product-details-open');
    } else {
      document.body.classList.remove('product-details-open');
    }
    window.dispatchEvent(new Event('product-details-toggle'));

    return () => {
      document.body.classList.remove('product-details-open');
      window.dispatchEvent(new Event('product-details-toggle'));
    };
  }, [open]);

  return (
    <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            {product ? 'Edit Product' : 'Add Product'}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          p: { xs: 3, sm: 4 },
          pb: { xs: 15, sm: 5 }, // extra padding so mobile nav/fabs don't cover fields
        }}
      >
        <ProductCrud
          product={product}
          availableTypes={availableTypes}
          onCancel={onClose}
          onSave={(payload) => onSave(payload, product?.product_id)}
          onDelete={() => onDelete(product?.product_id)}
          onToggleActive={onToggleActive}
          compactActions
          saveButtonRef={saveButtonRef}
          deleteButtonRef={deleteButtonRef}
          hideActionsOnMobile
        />
      </Box>
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            right: 14,
            bottom: 104,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            zIndex: theme.zIndex.modal + 3,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              saveButtonRef.current?.click();
            }}
            sx={{
              width: 58,
              height: 58,
              minWidth: 0,
              borderRadius: '50%',
              boxShadow: 4,
              padding: 0,
            }}
            aria-label="Save product"
          >
            <SaveIcon />
          </Button>
          {product && (
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                deleteButtonRef.current?.click();
              }}
              sx={{
                width: 58,
                height: 58,
                minWidth: 0,
                borderRadius: '50%',
                boxShadow: 4,
                padding: 0,
              }}
              aria-label="Delete product"
            >
              <DeleteIcon />
            </Button>
          )}
        </Box>
      )}
    </Dialog>
  );
};

export default ProductDetailsModal;
