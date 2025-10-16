import React from 'react';
import { Box } from '@mui/material';

export default function GlassContainer({ children, sx = {}, ...rest }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        p: { xs: 2.5, sm: 2.5, md: 3, lg: 3.5, xl: 4 },
        gap: { xs: 2.5, sm: 2.5, md: 2.5, lg: 3, xl: 3 },
        boxSizing: 'border-box',
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}
