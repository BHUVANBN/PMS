import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function GlassSearchBar({ placeholder = 'Search...', value, onChange, sx = {}, ...rest }) {
  return (
    <TextField
      fullWidth
      size="medium"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        ),
        sx: {
          height: 44,
          background: 'rgba(255,255,255,0.3)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }
      }}
      sx={{ borderRadius: 2, ...sx }}
      {...rest}
    />
  );
}
