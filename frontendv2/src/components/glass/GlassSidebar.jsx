import React from 'react';
import { Box } from '@mui/material';
import useViewportSize from '../../utils/useViewportSize';
import { getLayoutMetrics } from '../../utils/breakpoints';

export default function GlassSidebar({ children, position = 'left', sx = {}, ...rest }) {
  const { width } = useViewportSize();
  const { left, right } = getLayoutMetrics(width);
  const W = position === 'right' ? right : left;

  return (
    <Box
      sx={{
        width: `${W}px`,
        minWidth: `${W}px`,
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflow: 'hidden auto',
        background: 'rgba(255,255,255,0.3)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: position === 'left' ? '1px solid rgba(255,255,255,0.25)' : 'none',
        borderLeft: position === 'right' ? '1px solid rgba(255,255,255,0.25)' : 'none',
        borderRadius: 2,
        scrollbarWidth: 'thin',
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}
