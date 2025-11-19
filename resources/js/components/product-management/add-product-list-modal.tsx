import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, Chip, Box } from '@mui/material';
import type { FC } from 'react';
import type { SelectChangeEvent } from '@mui/material/Select';
export interface ProductLntype {
  typecode: string;
  wlntype: string;
  isDisplayed: boolean;
}

interface AddProductListModalProps {
  open: boolean;
  onClose: () => void;
  hiddenLntypes: ProductLntype[];
  selectedCart: ProductLntype[];
  setSelectedCart: (cart: ProductLntype[]) => void;
  onAdd: () => void;
}

const AddProductListModal: FC<AddProductListModalProps> = ({
  open,
  onClose,
  hiddenLntypes,
  selectedCart,
  setSelectedCart,
  onAdd,
}) => {
const handleSelectChange = (event: SelectChangeEvent<string[]>) => {
  const selectedIds = event.target.value as string[];
  setSelectedCart(hiddenLntypes.filter((lt) => selectedIds.includes(lt.typecode)));
};

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add Product Types</DialogTitle>
      <DialogContent>
        <Select
          multiple
          value={selectedCart.map((lt) => lt.typecode)}
          onChange={handleSelectChange}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as string[]).map((typecode) => {
                const lntype = hiddenLntypes.find((lt) => lt.typecode === typecode);
                return lntype ? <Chip key={typecode} label={lntype.wlntype} /> : null;
              })}
            </Box>
          )}
          fullWidth
        >
          {hiddenLntypes.map((lntype) => (
            <MenuItem key={lntype.typecode} value={lntype.typecode}>
              {lntype.wlntype} ({lntype.typecode})
            </MenuItem>
          ))}
        </Select>
        <Box className="mt-4">
          <div className="text-xs font-bold mb-2">Selected Types:</div>
          <ul>
            {selectedCart.map((lt) => (
              <li key={lt.typecode} className="py-1 text-sm">{lt.wlntype} ({lt.typecode})</li>
            ))}
          </ul>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="text">Cancel</Button>
        <Button
          onClick={() => {
            onAdd();
            onClose();
          }}
          color="primary"
          variant="contained"
          disabled={selectedCart.length === 0}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProductListModal;
