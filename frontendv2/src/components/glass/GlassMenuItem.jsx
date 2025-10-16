import React from 'react';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

export default function GlassMenuItem({ icon, label, active, onClick, sx = {}, ...rest }) {
  return (
    <ListItemButton
      onClick={onClick}
      selected={active}
      sx={{
        height: 48,
        py: 1,
        px: 2.5,
        borderRadius: 2,
        '&.Mui-selected': {
          backgroundColor: 'rgba(99,102,241,0.1)'
        },
        '&.Mui-selected:hover': {
          backgroundColor: 'rgba(99,102,241,0.12)'
        },
        ':hover': {
          backgroundColor: 'rgba(99,102,241,0.06)'
        },
        ...sx,
      }}
      {...rest}
    >
      {icon && (
        <ListItemIcon sx={{ minWidth: 28, '& .MuiSvgIcon-root': { width: 20, height: 20 } }}>
          {icon}
        </ListItemIcon>
      )}
      <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 500 }} />
    </ListItemButton>
  );
}
