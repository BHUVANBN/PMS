import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false, 
  onClick, 
  type = 'button',
  className = '',
  ...props 
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    fontWeight: '600',
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    textDecoration: 'none'
  };

  const variants = {
    primary: {
      backgroundColor: disabled ? '#6366f1' : '#4f46e5',
      color: '#ffffff',
      border: '1px solid #4f46e5'
    },
    secondary: {
      backgroundColor: 'transparent',
      color: '#4f46e5',
      border: '1px solid #4f46e5'
    },
    danger: {
      backgroundColor: disabled ? '#dc2626' : '#ef4444',
      color: '#ffffff',
      border: '1px solid #ef4444'
    },
    success: {
      backgroundColor: disabled ? '#059669' : '#10b981',
      color: '#ffffff',
      border: '1px solid #10b981'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#6b7280',
      border: '1px solid transparent'
    }
  };

  const sizes = {
    sm: {
      padding: '6px 12px',
      fontSize: '14px',
      minHeight: '32px'
    },
    md: {
      padding: '10px 16px',
      fontSize: '16px',
      minHeight: '40px'
    },
    lg: {
      padding: '12px 20px',
      fontSize: '18px',
      minHeight: '48px'
    }
  };

  const buttonStyles = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size],
    opacity: disabled ? 0.6 : 1
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={buttonStyles}
      className={className}
      {...props}
    >
      {loading && (
        <svg
          style={{ marginRight: '8px', animation: 'spin 1s linear infinite', width: '16px', height: '16px' }}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            opacity="0.25"
          />
          <path
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            opacity="0.75"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export { Button };
export default Button;
