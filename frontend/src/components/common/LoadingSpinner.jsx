import React from 'react';

export const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue', 
  className = '',
  ...props 
}) => {
  const sizes = {
    sm: '16px',
    md: '32px',
    lg: '48px',
    xl: '64px'
  };

  const colors = {
    blue: '#3b82f6',
    gray: '#6b7280',
    white: '#ffffff',
    green: '#10b981',
    red: '#ef4444'
  };

  const spinnerStyles = {
    width: sizes[size],
    height: sizes[size],
    border: `2px solid transparent`,
    borderTop: `2px solid ${colors[color]}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div 
        style={spinnerStyles} 
        className={className}
        {...props}
      />
    </>
  );
};

export default LoadingSpinner;
