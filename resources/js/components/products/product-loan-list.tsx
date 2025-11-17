import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  useTheme,
  Box,
  CircularProgress,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import { useEffect, useState } from 'react';

// The ProductLoanList will fetch its data on open
interface ProductLoanListProps {
  open: boolean;
  onClose: () => void;
  onAdded: (type?: string) => void;
}

export default function ProductLoanList({
  open,
  onClose,
  onAdded,
}: ProductLoanListProps) {
  const theme = useTheme();
  const [selected, setSelected] = useState<string>("");
  const [loanTypes, setLoanTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  interface Product {
    typecode: string;
  }

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    // Update this URL to your actual API for loan types
    fetch('/api/admin/products') // or your endpoint, e.g. '/api/loan-types'
      .then(res => res.json())
      .then(data => {
        // If your API returns { products: [{ typecode: ... }, ...] }
        setLoanTypes(Array.isArray(data) ? data.map(p => p.typecode) : (data.products?.map((p: Product) => p.typecode) ?? []));
      })
      .catch(() => setLoanTypes([]))
      .finally(() => setLoading(false));
  }, [open]);

  const handleSave = () => {
    if (selected) {
      onAdded(selected);
      onClose();
      setSelected("");
    }
  };

  const handleCancel = () => {
    setSelected("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderRadius: { xs: 3, sm: 5 },
          boxShadow: 7,
        },
      }}
    >
      <DialogTitle sx={{ color: theme.palette.primary.main, fontWeight: 700, letterSpacing: 0.5 }}>
        <AddCircleOutlineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Select Loan to Add
      </DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="loan-type-select-label" color="primary">
            Loan Type
          </InputLabel>
          <Select
            labelId="loan-type-select-label"
            label="Loan Type"
            value={selected}
            onChange={e => setSelected(e.target.value as string)}
            color="primary"
            sx={{ borderRadius: 2, background: theme.palette.background.default }}
            MenuProps={{
              PaperProps: {
                sx: { borderRadius: 3 }
              }
            }}
            disabled={loading}
          >
            {loading && (
              <MenuItem disabled value="">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  Loading...
                </Box>
              </MenuItem>
            )}
            {!loading && loanTypes.length === 0 && (
              <MenuItem disabled value="">
                No loan types found
              </MenuItem>
            )}
            {!loading && loanTypes.map((typecode) => (
              <MenuItem key={typecode} value={typecode}>
                <AddCircleOutlineIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                {typecode}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: 3, pb: 2, justifyContent: 'flex-end', gap: 2 }}>
        <Button
          onClick={handleCancel}
          startIcon={<CancelIcon />}
          variant="text"
          color="secondary"
          sx={{ fontWeight: 600, borderRadius: 8 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          startIcon={<AddCircleOutlineIcon />}
          variant="contained"
          color="primary"
          disabled={!selected}
          sx={{ fontWeight: 700, borderRadius: 8, boxShadow: 3 }}
        >
          Add Loan
        </Button>
      </DialogActions>
    </Dialog>
  );
}
