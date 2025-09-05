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
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-semibold border-none outline-none no-underline transition-all duration-200 ease-in-out';

  const variantClasses = {
    primary: disabled 
      ? 'bg-indigo-400 text-white border-indigo-400' 
      : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700',
    secondary: 'bg-transparent text-indigo-600 border border-indigo-600 hover:bg-indigo-50',
    danger: disabled 
      ? 'bg-red-400 text-white border-red-400' 
      : 'bg-red-500 text-white border-red-500 hover:bg-red-600',
    success: disabled 
      ? 'bg-emerald-400 text-white border-emerald-400' 
      : 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600',
    ghost: 'bg-transparent text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-100'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-8',
    md: 'px-4 py-2.5 text-base min-h-10',
    lg: 'px-5 py-3 text-lg min-h-12'
  };

  const disabledClasses = disabled || loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer';

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={buttonClasses}
      {...props}
    >
      {loading && (
        <svg
          className="mr-2 animate-spin w-4 h-4"
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
