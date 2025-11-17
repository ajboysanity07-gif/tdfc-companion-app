import { useState } from 'react';
import {
  TextField,
  Switch,
  Button,
  MenuItem,
  Chip,
  Autocomplete,
  Box,
  Stack,
  Typography,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useProductsApi } from '@/hooks/use-products-api';

type ProductSettings = {
  ln_isActive?: boolean;
  ln_scheme?: string;
  rate_isEditable?: boolean;
  max_term?: number;
  max_term_isEditable?: boolean;
  max_amortization?: number;
  max_amortization_isEditable?: boolean;
  service_fee?: number;
  lrf?: number;
  doc_stamp?: number;
  mort_notarial?: number;
  terms_and_info?: string;
  installment_mode?: string;
  allow_multiple?: boolean;
  [key: string]: unknown;
};
type ProductTag = { tag_name: string; };
type Product = {
  typecode: string;
  lntype?: string;
  int_rate?: number;
  settings?: ProductSettings;
  display?: Record<string, unknown>;
  tags?: ProductTag[];
};
interface ProductDetailsInfoProps {
  product: Product;
  onChange: () => void;
}

export default function ProductDetailsInfo({ product, onChange }: ProductDetailsInfoProps) {
  const { updateProduct, deleteProduct } = useProductsApi();
  const theme = useTheme();

  const [values, setValues] = useState<Product>({ ...product });
  const [tags, setTags] = useState<string[]>(product.tags?.map((t) => t.tag_name) ?? []);
  const [saving, setSaving] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleChange = (
    field: string,
    value: unknown,
    section: keyof Pick<Product, 'settings' | 'display'> = 'settings'
  ) => {
    const prevSectionValue = typeof values[section] === 'object' && values[section] !== null
      ? values[section] as Record<string, unknown>
      : {};
    setValues((v) => ({
      ...v,
      [section]: {
        ...prevSectionValue,
        [field]: value,
      },
    }));
  };
  const handleTagChange = (_event: unknown, value: string[]) => setTags(value);
  const handleSave = async () => {
    setSaving(true);
    await updateProduct(product.typecode, {
      lntype: values.lntype,
      int_rate: values.int_rate,
      settings: values.settings,
      display: values.display,
    });
    setSaving(false);
    onChange();
  };
  const handleDelete = async () => {
    if (confirm('Delete this product?')) {
      await deleteProduct(product.typecode);
      onChange();
    }
  };

  return (
    <Box sx={{
      width: "100%",
      maxWidth: "100%",
      bgcolor: "transparent",
      p: { xs: 2, sm: 3, md: 4 },
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    }}>
      {/* Top Section - Two columns: Active Switch + Tags */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        gap={{ xs: 2, md: 3 }}
        sx={{ width: '100%' }}
      >
        {/* Active Switch */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Switch
            checked={!!values.settings?.ln_isActive}
            onChange={e => handleChange('ln_isActive', e.target.checked)}
            sx={{
              '& .MuiSwitch-switchBase': { color: theme.palette.grey[400] },
              '& .MuiSwitch-switchBase.Mui-checked': { color: '#34C759' },
              '& .MuiSwitch-track': { backgroundColor: theme.palette.grey[300] },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#34C75966' }
            }}
          />
        </Box>

        {/* Tags Section */}
        <Box sx={{ flex: 1, width: { xs: '100%', md: 'auto' } }}>
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: 13,
              textAlign: "left",
              color: "#75767f",
              mb: 1,
            }}
          >Type Relation Tags:</Typography>
          <Autocomplete
            multiple
            options={inputValue && !tags.includes(inputValue) ? [inputValue] : []}
            value={tags}
            freeSolo
            onChange={handleTagChange}
            onInputChange={(_event, value) => setInputValue(value)}
            filterSelectedOptions
            noOptionsText={inputValue && !tags.includes(inputValue) ? '' : 'No tags'}
            renderInput={params => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                sx={{
                  bgcolor: "#fff",
                  borderRadius: 1,
                  input: { fontSize: 13 },
                  minWidth: { xs: '100%', md: 300 }
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option}>
                <span style={{ fontWeight: 500 }}>+ Add "{option}"</span>
              </li>
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, idx) => {
                const { key, ...itemProps } = getTagProps({ index: idx });
                return (
                  <Chip
                    variant="outlined"
                    label={option}
                    key={key}
                    {...itemProps}
                    sx={{ fontWeight: 700, fontSize: 12, mr: 0.5, mb: 0.5 }}
                  />
                );
              })
            }
            sx={{
              bgcolor: "#fafafa",
              borderRadius: 1,
              my: 0
            }}
          />
        </Box>

        {/* Action Buttons - inline with tags section */}
        <Stack
          gap={1}
          direction="row"
          sx={{ alignSelf: { xs: 'auto', md: 'center' } }}
        >
          <Button
            sx={{
              minWidth: 45,
              minHeight: 45,
              borderRadius: "50%",
              bgcolor: "#34C759",
              color: "#fff",
              p: 0,
              '&:hover': { bgcolor: "#2EBE50" }
            }}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" style={{ width: '24px', height: '24px' }}><path d="M12 4v16m8-8H4" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
          </Button>
          <Button
            sx={{
              minWidth: 45,
              minHeight: 45,
              borderRadius: "50%",
              bgcolor: "#F57373",
              color: "#fff",
              p: 0,
              '&:hover': { bgcolor: "#f25d5d" }
            }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }}><path d="M8 16L16 8M8 8l8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
          </Button>
        </Stack>
      </Stack>

      {/* Form Fields */}
      <Stack spacing={2} sx={{ width: "100%" }}>
        {/* Scheme - Allow Multiple */}
        <Stack
          direction="column"
          alignItems="flex-start"
          gap={1.5}
        >
          <TextField
            select
            label="Scheme"
            value={values.settings?.ln_scheme ?? ''}
            onChange={e => handleChange('ln_scheme', e.target.value)}
            size="small"
            sx={{ width: '100%' }}
          >
            <MenuItem value="ADD-ON">ADD-ON</MenuItem>
            <MenuItem value="PREPAID">PREPAID</MenuItem>
          </TextField>
          <Stack direction="row" alignItems="center" gap={2} sx={{ width: '100%' }}>
            <Typography sx={{ fontSize: 13 }}>allow multiple?</Typography>
            <Switch
              checked={!!values.settings?.allow_multiple}
              onChange={e => handleChange('allow_multiple', e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase': { color: theme.palette.grey[400] },
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#34C759' },
                '& .MuiSwitch-track': { backgroundColor: theme.palette.grey[300] },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#34C75966' }
              }}
            />
          </Stack>
        </Stack>

        {/* Mode - Editable */}
        <Stack
          direction="column"
          alignItems="flex-start"
          gap={1.5}
        >
          <TextField
            select
            label="Mode"
            value={values.settings?.installment_mode ?? ''}
            onChange={e => handleChange('installment_mode', e.target.value)}
            size="small"
            sx={{ width: '100%' }}
          >
            <MenuItem value="MONTHLY">MONTHLY</MenuItem>
            <MenuItem value="WEEKLY">WEEKLY</MenuItem>
            <MenuItem value="DUE-DATE">DUE-DATE</MenuItem>
          </TextField>
          <Stack direction="row" alignItems="center" gap={2} sx={{ width: '100%' }}>
            <Typography sx={{ fontSize: 13 }}>editable?</Typography>
            <Switch
              checked={!!values.settings?.rate_isEditable}
              onChange={e => handleChange('rate_isEditable', e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase': { color: theme.palette.grey[400] },
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#34C759' },
                '& .MuiSwitch-track': { backgroundColor: theme.palette.grey[300] },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#34C75966' }
              }}
            />
          </Stack>
        </Stack>

        {/* Rate (P.A.) */}
        <TextField
          label="Rate (P.A.)"
          value={values.int_rate ?? ''}
          onChange={e => setValues({ ...values, int_rate: Number(e.target.value) || undefined })}
          size="small"
          sx={{ width: '100%' }}
          inputProps={{ inputMode: 'decimal', pattern: '[0-9]*[.]?[0-9]*' }}
        />

        {/* Max Term - Editable */}
        <Stack
          direction="column"
          alignItems="flex-start"
          gap={1.5}
        >
          <TextField
            label="Max Term (days)"
            value={values.settings?.max_term ?? ''}
            onChange={e => handleChange('max_term', Number(e.target.value) || undefined)}
            size="small"
            sx={{ width: '100%' }}
            inputProps={{ inputMode: 'decimal', pattern: '[0-9]*' }}
          />
          <Stack direction="row" alignItems="center" gap={2} sx={{ width: '100%' }}>
            <Typography sx={{ fontSize: 13 }}></Typography>
            <Switch
              checked={!!values.settings?.max_term_isEditable}
              onChange={e => handleChange('max_term_isEditable', e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase': { color: theme.palette.grey[400] },
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#34C759' },
                '& .MuiSwitch-track': { backgroundColor: theme.palette.grey[300] },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#34C75966' }
              }}
            />
          </Stack>
        </Stack>

        {/* Max Amortization - Editable */}
        <Stack
          direction="column"
          alignItems="flex-start"
          gap={1.5}
        >
          <TextField
            label="Max Amortization"
            value={values.settings?.max_amortization ?? ''}
            onChange={e => handleChange('max_amortization', Number(e.target.value) || undefined)}
            size="small"
            sx={{ width: '100%' }}
            inputProps={{ inputMode: 'decimal', pattern: '[0-9]*' }}
          />
          <Stack direction="row" alignItems="center" gap={2} sx={{ width: '100%' }}>
            <Typography sx={{ fontSize: 13 }}></Typography>
            <Switch
              checked={!!values.settings?.max_amortization_isEditable}
              onChange={e => handleChange('max_amortization_isEditable', e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase': { color: theme.palette.grey[400] },
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#34C759' },
                '& .MuiSwitch-track': { backgroundColor: theme.palette.grey[300] },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#34C75966' }
              }}
            />
          </Stack>
        </Stack>

        <Typography color="info.light" sx={{ fontSize: 12, textAlign: "center", my: 1 }}>
          *can use variable (basic) for custom formulas
        </Typography>

        {/* Cost Fields */}
        <Stack gap={1.5}>
          <Stack direction="row" alignItems="center" gap={2}>
            <Typography sx={{ flex: 1, fontSize: 13 }}>Service Fee (% of amount Applied):</Typography>
            <TextField
              value={values.settings?.service_fee ?? ''}
              onChange={e => handleChange('service_fee', Number(e.target.value) || undefined)}
              size="small"
              sx={{ width: 80 }}
              inputProps={{ inputMode: 'decimal', pattern: '[0-9]*[.]?[0-9]*' }}
            />
          </Stack>
          <Stack direction="row" alignItems="center" gap={2}>
            <Typography sx={{ flex: 1, fontSize: 13 }}>LRF (% of amount Applied):</Typography>
            <TextField
              value={values.settings?.lrf ?? ''}
              onChange={e => handleChange('lrf', Number(e.target.value) || undefined)}
              size="small"
              sx={{ width: 80 }}
              inputProps={{ inputMode: 'decimal', pattern: '[0-9]*[.]?[0-9]*' }}
            />
          </Stack>
          <Stack direction="row" alignItems="center" gap={2}>
            <Typography sx={{ flex: 1, fontSize: 13 }}>Doc Stamp (% of amount Applied):</Typography>
            <TextField
              value={values.settings?.doc_stamp ?? ''}
              onChange={e => handleChange('doc_stamp', Number(e.target.value) || undefined)}
              size="small"
              sx={{ width: 80 }}
              inputProps={{ inputMode: 'decimal', pattern: '[0-9]*[.]?[0-9]*' }}
            />
          </Stack>
          <Stack direction="row" alignItems="center" gap={2}>
            <Typography sx={{ flex: 1, fontSize: 13 }}>Mort + Notarial:</Typography>
            <TextField
              value={values.settings?.mort_notarial ?? ''}
              onChange={e => handleChange('mort_notarial', Number(e.target.value) || undefined)}
              size="small"
              sx={{ width: 80 }}
              inputProps={{ inputMode: 'decimal', pattern: '[0-9]*[.]?[0-9]*' }}
            />
          </Stack>
        </Stack>
      </Stack>

      {/* Terms/Information Section */}
      <Divider sx={{ my: 3 }} />
      <Stack spacing={1.5}>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: 0.5,
            color: "#73778f",
          }}
        >TERMS/INFORMATION FOR CLIENTS:</Typography>
        <TextField
          multiline
          minRows={3}
          maxRows={10}
          value={values.settings?.terms_and_info ?? ''}
          onChange={e => handleChange('terms_and_info', e.target.value)}
          sx={{
            width: "100%",
            background: "#fff",
            borderRadius: 2,
            boxShadow: theme.shadows[1],
            '& .MuiOutlinedInput-root': {
              fontSize: 13
            }
          }}
        />
      </Stack>

      {/* Floating Action Buttons */}
      <Box sx={{
        position: "fixed",
        bottom: { xs: 76, sm: 24 },
        right: { xs: 16, sm: 24 },
        display: "flex",
        flexDirection: "column",
        zIndex: 41,
        gap: 2,
        alignItems: "center"
      }}>
        <Button
          onClick={handleSave}
          disabled={saving}
          variant="contained"
          sx={{
            minWidth: 0,
            width: 60,
            height: 60,
            borderRadius: "50%",
            bgcolor: theme.palette.primary.main,
            color: "#fff",
            boxShadow: 4,
            '&:hover': { bgcolor: theme.palette.primary.dark }
          }}
        >
          <svg fill="#fff" width="32" height="32" viewBox="0 0 24 24" style={{ width: '32px', height: '32px' }}><path d="M 17 3 v 2 H 7 V 3 H 5 v 2 H 4 c -1.1 0 -2 .9 -2 2 v 12 c 0 1.1 .9 2 2 2 h 16 c 1.1 0 2 -.9 2 -2 V 7 c 0 -1.1 -.9 -2 -2 -2 h -1 V 3 h -2 z m 3 16 H 4 V 8 h 16 v 11 z m -8 -9 v 6 h 2 v -6 h -2 z"/></svg>
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          sx={{
            minWidth: 0,
            width: 60,
            height: 60,
            bgcolor: "#f57373",
            color: "#fff",
            borderRadius: "50%",
            boxShadow: 4,
            '&:hover': { bgcolor: "#d95353" }
          }}
        >
          <svg fill="#fff" width="28" height="28" viewBox="0 0 24 24" style={{ width: '28px', height: '28px' }}><path d="M 6 19 c 0 1.1 .9 2 2 2 h 8 c 1.1 0 2 -0.9 2 -2 V 7 H 6 v 12 z m 3.46 -8.12 l 1.41 -1.41 L 12 10.59 l 1.13 -1.12 l 1.41 1.41 L 13.41 12 l 1.12 1.13 l -1.41 1.41 L 12 13.41 l -1.13 1.12 l -1.41 -1.41 L 10.59 12 l -1.13 -1.12 z M 19 4 h-3.5 l -1 -1 h -5 l -1 1 H 5 v 2 h 14 V 4 z"/></svg>
        </Button>
      </Box>
    </Box>
  );
}
