import React from 'react';
import { Box } from '@mui/material';
import useViewportSize from '../../utils/useViewportSize';
import { getLayoutMetrics } from '../../utils/breakpoints';

/**
 * ThreeColumnLayout
 * Desktop-first three column shell: left (fixed), main (flex), right (fixed)
 * Props:
 * - left: ReactNode
 * - right: ReactNode
 * - children: main content
 * - leftWidth / rightWidth: optional override in px
 * - gap: override gap in px
 */
export default function ThreeColumnLayout({ left, right, children, leftWidth, rightWidth, gap, sx = {}, ...rest }) {
  const { width, height } = useViewportSize();
  const metrics = getLayoutMetrics(width);
  const L = leftWidth ?? metrics.left;
  const R = rightWidth ?? metrics.right;
  const G = gap ?? metrics.gap;

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        gap: `${G}px`,
        boxSizing: 'border-box',
        overflow: 'hidden',
        px: `${metrics.padding}px`,
        py: `${metrics.padding}px`,
        ...sx,
      }}
      {...rest}
    >
      {/* Left rail */}
      <Box
        aria-label="Left sidebar"
        sx={{
          width: `${L}px`,
          minWidth: `${L}px`,
          height: 'calc(100vh - 2px)',
          position: 'sticky',
          top: 0,
          overflow: 'hidden auto',
          borderRight: '1px solid rgba(255,255,255,0.25)',
          borderRadius: 2,
          background: 'rgba(255,255,255,0.3)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}
      >
        {left}
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          height: 'calc(100vh - 2px)',
          overflow: 'hidden auto',
          borderRadius: 2,
        }}
      >
        {children}
      </Box>

      {/* Right rail */}
      <Box
        aria-label="Right sidebar"
        sx={{
          width: `${R}px`,
          minWidth: `${R}px`,
          height: 'calc(100vh - 2px)',
          position: 'sticky',
          top: 0,
          overflow: 'hidden auto',
          borderRadius: 2,
          background: 'rgba(255,255,255,0.3)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}
      >
        {right}
      </Box>
    </Box>
  );
}
