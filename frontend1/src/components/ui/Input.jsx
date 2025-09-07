import React, { forwardRef } from 'react';

const Input = forwardRef(({
  type = 'text',
  label = null,
  placeholder = '',
  value = '',
  onChange = null,
  onBlur = null,
  onFocus = null,
  error = null,
  helperText = null,
  disabled = false,
  required = false,
  size = 'md',
  fullWidth = false,
  icon = null,
  iconPosition = 'left',
  className = '',
  inputClassName = '',
  ...props
}, ref) => {
  const baseInputClasses = 'block border border-gray-300 rounded-lg shadow-sm transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const errorClasses = error 
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
    : '';

  const inputClasses = [
    baseInputClasses,
    sizeClasses[size],
    errorClasses,
    fullWidth ? 'w-full' : '',
    icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : '',
    inputClassName
  ].filter(Boolean).join(' ');

  const containerClasses = [
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <div className="mt-1">
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {helperText && !error && (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Specialized input components
export const SearchInput = (props) => (
  <Input
    type="text"
    placeholder="Search..."
    icon={
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    }
    iconPosition="left"
    {...props}
  />
);

export const PasswordInput = ({ showPassword, onTogglePassword, ...props }) => (
  <Input
    type={showPassword ? 'text' : 'password'}
    icon={
      <button
        type="button"
        onClick={onTogglePassword}
        className="text-gray-400 hover:text-gray-600 focus:outline-none pointer-events-auto"
      >
        {showPassword ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    }
    iconPosition="right"
    {...props}
  />
);

export const EmailInput = (props) => (
  <Input
    type="email"
    placeholder="Enter email address"
    icon={
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
      </svg>
    }
    iconPosition="left"
    {...props}
  />
);

export const NumberInput = (props) => (
  <Input
    type="number"
    {...props}
  />
);

export const DateInput = (props) => (
  <Input
    type="date"
    {...props}
  />
);

export const TimeInput = (props) => (
  <Input
    type="time"
    {...props}
  />
);

export const TextArea = forwardRef(({
  label = null,
  placeholder = '',
  value = '',
  onChange = null,
  onBlur = null,
  onFocus = null,
  error = null,
  helperText = null,
  disabled = false,
  required = false,
  rows = 3,
  fullWidth = false,
  className = '',
  textareaClassName = '',
  ...props
}, ref) => {
  const baseTextareaClasses = 'block border border-gray-300 rounded-lg shadow-sm transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed resize-vertical';

  const errorClasses = error 
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
    : '';

  const textareaClasses = [
    baseTextareaClasses,
    'px-3 py-2 text-sm',
    errorClasses,
    fullWidth ? 'w-full' : '',
    textareaClassName
  ].filter(Boolean).join(' ');

  const containerClasses = [
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        className={textareaClasses}
        {...props}
      />
      
      {(error || helperText) && (
        <div className="mt-1">
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {helperText && !error && (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default Input;
