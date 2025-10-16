import React from 'react';
import { Button } from '@mui/material';

/**
 * GlassButton
 * - variant: 'primary' | 'secondary' | 'outline'
 * - size: 'regular' | 'large'
 */
export default function GlassButton({ variant = 'primary', size = 'regular', sx = {}, children, ...rest }) {
  const heights = { regular: 40, large: 48 };
  const base = {
    height: heights[size],
    padding: '12px 32px',
    fontSize: 14,
    fontWeight: 600,
    borderRadius: 12,
    transition: 'all 0.3s ease-in-out',
  };

  const stylesByVariant = {
    primary: {
      background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)',
      boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
      ':hover': { filter: 'brightness(1.06)', boxShadow: '0 12px 28px rgba(99,102,241,0.45)' },
      color: '#fff',
    },
    secondary: {
      background: 'rgba(255,255,255,0.3)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      color: '#0f172a',
      border: '1px solid rgba(255,255,255,0.4)',
      ':hover': { background: 'rgba(255,255,255,0.4)' },
    },
    outline: {
      background: 'transparent',
      color: '#6366F1',
      border: '1.5px solid rgba(99,102,241,0.5)',
      ':hover': { background: 'rgba(99,102,241,0.08)' },
    },
  };

  const sxMerged = { ...base, ...(stylesByVariant[variant] || {}), ...sx };

  return (
    <Button sx={sxMerged} {...rest}>
      {children}
    </Button>
  );
}
