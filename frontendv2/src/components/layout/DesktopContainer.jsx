import React from 'react';
import { Box } from '@mui/material';
import useViewportSize from '../../utils/useViewportSize';
import { desktopSpacing } from '../../utils/breakpoints';

export default function DesktopContainer({ children, sx = {}, ...rest }) {
  const { width } = useViewportSize();
  const { padding } = desktopSpacing(width);
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        px: `${padding}px`,
        py: `${padding}px`,
        gap: `${padding}px`,
        boxSizing: 'border-box',
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}
