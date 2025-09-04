import { useState, useEffect } from 'react';

// Responsive design utilities
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Hook to detect screen size
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState('lg');

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenSize('xs');
      else if (width < 768) setScreenSize('sm');
      else if (width < 1024) setScreenSize('md');
      else if (width < 1280) setScreenSize('lg');
      else setScreenSize('xl');
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
};

// Responsive grid utility
export const getResponsiveGrid = (screenSize) => {
  switch (screenSize) {
    case 'xs':
      return { columns: 1, gap: '12px', padding: '12px' };
    case 'sm':
      return { columns: 1, gap: '16px', padding: '16px' };
    case 'md':
      return { columns: 2, gap: '20px', padding: '20px' };
    case 'lg':
      return { columns: 3, gap: '24px', padding: '24px' };
    case 'xl':
      return { columns: 4, gap: '24px', padding: '32px' };
    default:
      return { columns: 3, gap: '24px', padding: '24px' };
  }
};

// Responsive card padding
export const getResponsiveCardPadding = (screenSize) => {
  switch (screenSize) {
    case 'xs':
    case 'sm':
      return '12px';
    case 'md':
      return '16px';
    default:
      return '24px';
  }
};

// Responsive font sizes
export const getResponsiveFontSize = (size, screenSize) => {
  const sizes = {
    xs: {
      title: '20px',
      subtitle: '14px',
      body: '14px',
      small: '12px'
    },
    sm: {
      title: '24px',
      subtitle: '16px',
      body: '14px',
      small: '12px'
    },
    md: {
      title: '28px',
      subtitle: '16px',
      body: '16px',
      small: '14px'
    },
    lg: {
      title: '32px',
      subtitle: '18px',
      body: '16px',
      small: '14px'
    },
    xl: {
      title: '36px',
      subtitle: '20px',
      body: '18px',
      small: '16px'
    }
  };

  return sizes[screenSize]?.[size] || sizes.lg[size];
};

// Responsive spacing
export const getResponsiveSpacing = (size, screenSize) => {
  const multiplier = {
    xs: 0.75,
    sm: 0.875,
    md: 1,
    lg: 1,
    xl: 1.125
  };

  const baseSpacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48
  };

  return `${baseSpacing[size] * (multiplier[screenSize] || 1)}px`;
};
