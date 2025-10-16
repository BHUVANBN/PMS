import React from 'react';
import { Button } from '@mui/material';

export default function GlassSecondaryButton({ sx = {}, children, ...rest }) {
  return (
    <Button
      variant="outlined"
      sx={{
        height: 40,
        padding: '12px 32px',
        fontSize: 14,
        fontWeight: 600,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(99,102,241,0.5)',
        color: '#6366F1',
        background: 'transparent',
        ':hover': { background: 'rgba(99,102,241,0.06)' },
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Button>
  );
}
