import React from 'react';
import { Box } from '@mui/material';
import useViewportSize from '../../utils/useViewportSize';
import { getLayoutMetrics } from '../../utils/breakpoints';

export default function TwoColumnRight({ right, children, gap, sx = {}, ...rest }) {
  const { width } = useViewportSize();
  const metrics = getLayoutMetrics(width);
  const G = gap ?? metrics.gap;
  const R = metrics.right;

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        minHeight: 'calc(100vh - 96px)',
        gap: `${G}px`,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
      {...rest}
    >
      <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden auto' }}>{children}</Box>
      <Box
        sx={{
          width: `${R}px`,
          minWidth: `${R}px`,
          height: 'calc(100vh - 128px)',
          position: 'sticky',
          top: 96,
          overflow: 'hidden auto',
          background: 'rgba(255,255,255,0.3)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255,255,255,0.25)',
          borderRadius: 2,
          p: 2,
        }}
      >
        {right}
      </Box>
    </Box>
  );
}
