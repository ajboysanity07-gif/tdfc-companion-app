import React from 'react';
import { Autocomplete, TextField, InputAdornment, Skeleton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';

export interface SearchAutocompleteProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  loading?: boolean; // <-- NEW
  disabled?: boolean;  // <-- Add this line!
}

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  options,
  value,
  onChange,
  placeholder,
  className,
  loading = false,
}) => {
  const theme = useTheme();

  const background = theme.palette.background.paper;
  const textColor = theme.palette.text.primary;
  const borderColor = theme.palette.divider;

  if (loading) {
    return (
      <Skeleton
        variant="rectangular"
        height={42}
        sx={{
          width: '100%',
          borderRadius: 2,
          mb: 2,
          mt: 2,
          bgcolor: theme.palette.mode === 'dark'
            ? theme.palette.background.default
            : background,
        }}
      />
    );
  }

  return (
    <Autocomplete
      options={options}
      renderInput={(params) => (
        <TextField
          {...params}
          label={null}
          placeholder={placeholder}
          variant="outlined"
          size="small"
          className={className}
          sx={{
            mb: 2,
            mt: 2,
            background: background,
            borderRadius: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              paddingLeft: 1,
              paddingRight: 1,
              background: background,
              boxShadow: 'none'
            },
            '& input': {
              fontSize: '1.03rem',
              fontWeight: 500,
              color: textColor
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: borderColor
            },
            '& input:-webkit-autofill': {
              WebkitBoxShadow: `0 0 0 100px ${background} inset`,
              WebkitTextFillColor: textColor
            }
          }}
          InputProps={{
            ...Object.fromEntries(
              Object.entries(params.InputProps).filter(([key]) => key !== 'disableUnderline')
            ),
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 22 }} />
              </InputAdornment>
            ),
          }}
        />
      )}
      value={value}
      onInputChange={(_, v) => onChange(v)}
      freeSolo
    />
  );
};

export default SearchAutocomplete;
