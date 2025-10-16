import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import GlassCard from './GlassCard';

export default function GlassStatsCard({ title, value, change, changeColor = 'text.secondary', icon: Icon, iconColor = 'primary.main', sx = {}, ...rest }) {
  return (
    <GlassCard type="stats" sx={{ ...sx }} {...rest}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography sx={{ fontSize: 14, color: 'text.secondary', fontWeight: 600 }}>{title}</Typography>
          <Typography sx={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2 }}>{value}</Typography>
          {change && (
            <Typography sx={{ fontSize: 13, color: changeColor, mt: 0.5 }}>{change}</Typography>
          )}
        </Box>
        {Icon && (
          <Avatar sx={{ bgcolor: iconColor, width: 56, height: 56 }}>
            <Icon />
          </Avatar>
        )}
      </Box>
    </GlassCard>
  );
}
