import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
  Paper,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { ProductLntype } from '@/types/product-lntype';
import axios from 'axios';

type Props = {
  open: boolean;
  onClose: () => void;
  onActivateMany: (typecodes: string[]) => Promise<void>;
  loading?: boolean;
};

const DisplayProductsModal: React.FC<Props> = ({
  open,
  onClose,
  onActivateMany,
  loading = false,
}) => {
  const [selected, setSelected] = useState<string>('');
  const [pending, setPending] = useState<ProductLntype[]>([]);
  const [fetchedHidden, setFetchedHidden] = useState<ProductLntype[]>([]);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const loadHidden = async () => {
      setLocalLoading(true);
      try {
        const res = await axios.get<ProductLntype[]>('/api/products/hidden');
        setFetchedHidden(res.data);
      } catch (e) {
        console.error('Failed to load hidden products', e);
        setFetchedHidden([]);
      } finally {
        setLocalLoading(false);
      }
    };
    loadHidden();
  }, [open]);

  const options = useMemo(
    () => fetchedHidden.filter((p) => !pending.some((q) => q.typecode === p.typecode)),
    [fetchedHidden, pending],
  );

  const handleAdd = () => {
    const prod = fetchedHidden.find((p) => p.typecode === selected);
    if (prod) {
      setPending((prev) => [...prev, prod]);
      setSelected('');
    }
  };

  const handleRemove = (typecode: string) => {
    setPending((prev) => prev.filter((p) => p.typecode !== typecode));
  };

  const handleActivate = async () => {
    if (pending.length === 0) return;
    await onActivateMany(pending.map((p) => p.typecode));
    setPending([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Display Products</DialogTitle>
      <DialogContent dividers>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" mb={2}>
          <FormControl fullWidth size="small">
            <InputLabel id="prod-select">Select product</InputLabel>
            <Select
              labelId="prod-select"
              value={selected}
              label="Select product"
              onChange={(e) => setSelected(e.target.value as string)}
              disabled={loading || localLoading}
            >
              {options.length === 0 && (
                <MenuItem value="" disabled>
                  No hidden products
                </MenuItem>
              )}
              {options.map((p) => (
                <MenuItem key={p.typecode} value={p.typecode}>
                  {p.lntype}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={!selected || loading || localLoading}
            sx={{ minWidth: 140, borderRadius: 2 }}
          >
            Add product
          </Button>
        </Stack>

        {pending.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            No products added yet.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {pending.map((p) => (
              <Paper
                key={p.typecode}
                variant="outlined"
                sx={{
                  p: 1.5,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <Typography fontWeight={700}>{p.lntype}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Code: {p.typecode}
                  </Typography>
                </div>
                <IconButton
                  onClick={() => handleRemove(p.typecode)}
                  size="small"
                  disabled={loading || localLoading}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Paper>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleActivate}
          disabled={pending.length === 0 || loading}
        >
          Display these products
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DisplayProductsModal;
