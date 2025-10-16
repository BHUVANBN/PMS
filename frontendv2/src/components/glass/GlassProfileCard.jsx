import React from 'react';
import { Avatar, Box, Typography } from '@mui/material';
import GlassCard from './GlassCard';
import MiniLineChart from '../charts/MiniLineChart';

export default function GlassProfileCard({
  name,
  role,
  avatar,
  status = 'online',
  chartData = [],
  sx = {},
  ...rest
}) {
  const statusColor = status === 'online' ? '#10B981' : '#94a3b8';
  const initials = (name || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <GlassCard type="profile" sx={{ ...sx }} {...rest}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ position: 'relative', mr: 2 }}>
          <Avatar sx={{ width: 60, height: 60 }} src={avatar}>
            {initials}
          </Avatar>
          <Box
            sx={{
              position: 'absolute',
              right: 2,
              bottom: 2,
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: statusColor,
              border: '2px solid #fff',
            }}
          />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, lineHeight: 1.2 }} noWrap>
            {name}
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', textTransform: 'capitalize' }} noWrap>
            {role}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ flex: 1 }}>
        <MiniLineChart data={chartData} height={80} color="#6366F1" />
      </Box>
    </GlassCard>
  );
}
