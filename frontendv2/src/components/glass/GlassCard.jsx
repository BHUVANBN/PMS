import React from 'react';
import { Card, CardContent, Box } from '@mui/material';
const MIN_HEIGHT_BY_TYPE = {
  profile: 240,
  stats: 160,
  metric: 120,
  chart: 280,
  table: 400,
  default: 160,
};

export default function GlassCard({ type = 'default', minHeight, children, sx = {}, contentProps = {}, ...rest }) {
  const computedMin = minHeight ?? (MIN_HEIGHT_BY_TYPE[type] || MIN_HEIGHT_BY_TYPE.default);
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        minHeight: computedMin,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18)'
        },
        ...sx,
      }}
      {...rest}
    >
      <CardContent sx={{ flexGrow: 1 }} {...contentProps}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  );
}
