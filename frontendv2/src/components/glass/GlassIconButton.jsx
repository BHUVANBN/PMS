import React from 'react';
import { IconButton } from '@mui/material';

export default function GlassIconButton({ sx = {}, children, ...rest }) {
  return (
    <IconButton
      sx={{
        width: 40,
        height: 40,
        borderRadius: 12,
        background: 'rgba(255,255,255,0.3)',
        border: '1px solid rgba(255,255,255,0.35)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease-in-out',
        ':hover': {
          background: 'rgba(255,255,255,0.45)',
          transform: 'translateY(-1px)'
        },
        ...sx,
      }}
      {...rest}
    >
      {children}
    </IconButton>
  );
}
