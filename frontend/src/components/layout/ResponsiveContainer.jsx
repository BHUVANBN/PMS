import React from 'react';
import { useResponsive, getResponsiveGrid } from '../../utils/responsive';

export const ResponsiveContainer = ({ 
  children, 
  className = '',
  maxWidth = 'none',
  padding = true,
  ...props 
}) => {
  const screenSize = useResponsive();
  const grid = getResponsiveGrid(screenSize);

  const containerStyles = {
    width: '100%',
    maxWidth: maxWidth === 'none' ? '100%' : maxWidth,
    margin: '0 auto',
    padding: padding ? grid.padding : '0',
    boxSizing: 'border-box'
  };

  return (
    <div style={containerStyles} className={className} {...props}>
      {children}
    </div>
  );
};

export const ResponsiveGrid = ({ 
  children, 
  columns = 'auto',
  gap = 'md',
  className = '',
  ...props 
}) => {
  const screenSize = useResponsive();
  const grid = getResponsiveGrid(screenSize);

  const getColumns = () => {
    if (columns === 'auto') return grid.columns;
    if (typeof columns === 'object') {
      return columns[screenSize] || columns.lg || 3;
    }
    return columns;
  };

  const getGap = () => {
    if (gap === 'sm') return '12px';
    if (gap === 'md') return grid.gap;
    if (gap === 'lg') return '32px';
    return gap;
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: `repeat(${getColumns()}, 1fr)`,
    gap: getGap(),
    width: '100%'
  };

  return (
    <div style={gridStyles} className={className} {...props}>
      {children}
    </div>
  );
};

export const ResponsiveCard = ({ 
  children, 
  title,
  subtitle,
  className = '',
  padding = 'md',
  ...props 
}) => {
  const screenSize = useResponsive();
  
  const getPadding = () => {
    switch (padding) {
      case 'sm': return screenSize === 'xs' ? '12px' : '16px';
      case 'md': return screenSize === 'xs' ? '16px' : screenSize === 'sm' ? '20px' : '24px';
      case 'lg': return screenSize === 'xs' ? '20px' : screenSize === 'sm' ? '24px' : '32px';
      default: return padding;
    }
  };

  const cardStyles = {
    backgroundColor: '#111827',
    borderRadius: '8px',
    padding: getPadding(),
    border: '1px solid #374151',
    color: '#e5e7eb',
    width: '100%',
    boxSizing: 'border-box'
  };

  const titleStyles = {
    margin: '0 0 16px 0',
    color: '#4f46e5',
    fontSize: screenSize === 'xs' ? '16px' : screenSize === 'sm' ? '18px' : '20px',
    fontWeight: '600'
  };

  const subtitleStyles = {
    margin: '0 0 12px 0',
    color: '#9ca3af',
    fontSize: screenSize === 'xs' ? '12px' : '14px'
  };

  return (
    <div style={cardStyles} className={className} {...props}>
      {title && <h3 style={titleStyles}>{title}</h3>}
      {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
      {children}
    </div>
  );
};

export default ResponsiveContainer;
