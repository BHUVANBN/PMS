import React from 'react';
import { Chip } from '@mui/material';

const STATUS_MAP = {
  completed: { color: '#10B981' },
  canceled: { color: '#EF4444' },
  cancelled: { color: '#EF4444' },
  pending: { color: '#F59E0B' },
};

export default function GlassBadge({ status, label, color, sx = {}, ...rest }) {
  const key = (status || '').toString().toLowerCase();
  const base = STATUS_MAP[key] || {};
  const c = color || base.color || '#64748b';
  const bg = `${c}22`;
  const border = `${c}44`;

  return (
    <Chip
      label={label || status}
      size="small"
      sx={{
        px: 1.5,
        py: 0.25,
        fontSize: 12,
        fontWeight: 500,
        color: c,
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: 10,
        ...sx,
      }}
      {...rest}
    />
  );
}
