import React from 'react';
import { Box, Typography } from '@mui/material';
import GlassCard from './GlassCard';

export default function GlassMetricCard({ label, value, sublabel, sx = {}, ...rest }) {
  return (
    <GlassCard type="metric" sx={{ ...sx }} {...rest}>
      <Box>
        <Typography sx={{ fontSize: 14, color: 'text.secondary', fontWeight: 600 }}>{label}</Typography>
        <Typography sx={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2 }}>{value}</Typography>
        {sublabel && (
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>{sublabel}</Typography>
        )}
      </Box>
    </GlassCard>
  );
}
