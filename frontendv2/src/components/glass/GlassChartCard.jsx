import React from 'react';
import { Box, Typography } from '@mui/material';
import GlassCard from './GlassCard';

export default function GlassChartCard({ title, actions, height = 280, children, sx = {}, headerSx = {}, contentSx = {}, ...rest }) {
  return (
    <GlassCard type="chart" sx={{ ...sx }} contentProps={{ sx: { p: 3, ...contentSx } }} {...rest}>
      {(title || actions) && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, ...headerSx }}>
          {title && (
            <Typography sx={{ fontSize: 18, fontWeight: 600 }}>{title}</Typography>
          )}
          {actions}
        </Box>
      )}
      <Box sx={{ width: '100%', height }}>
        {children}
      </Box>
    </GlassCard>
  );
}
