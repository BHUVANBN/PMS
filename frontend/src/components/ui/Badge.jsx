import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '12px',
    fontWeight: '500',
    textAlign: 'center',
    whiteSpace: 'nowrap'
  };

  const variants = {
    default: {
      backgroundColor: '#374151',
      color: '#e5e7eb'
    },
    primary: {
      backgroundColor: '#4f46e5',
      color: '#ffffff'
    },
    success: {
      backgroundColor: '#10b981',
      color: '#ffffff'
    },
    warning: {
      backgroundColor: '#f59e0b',
      color: '#ffffff'
    },
    danger: {
      backgroundColor: '#ef4444',
      color: '#ffffff'
    },
    info: {
      backgroundColor: '#3b82f6',
      color: '#ffffff'
    },
    secondary: {
      backgroundColor: '#6b7280',
      color: '#ffffff'
    }
  };

  const sizes = {
    sm: {
      padding: '2px 6px',
      fontSize: '11px',
      minHeight: '18px'
    },
    md: {
      padding: '4px 8px',
      fontSize: '12px',
      minHeight: '22px'
    },
    lg: {
      padding: '6px 12px',
      fontSize: '14px',
      minHeight: '28px'
    }
  };

  const badgeStyles = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size]
  };

  return (
    <span
      style={badgeStyles}
      className={className}
      {...props}
    >
      {children}
    </span>
  );
};

export { Badge };
export default Badge;
