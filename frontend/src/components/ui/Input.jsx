import React from 'react';

const Input = ({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  name,
  id,
  disabled = false,
  required = false,
  error = '',
  label = '',
  className = '',
  autoComplete,
  ...props
}) => {
  const inputStyles = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: error ? '1px solid #ef4444' : '1px solid #374151',
    backgroundColor: '#0b1220',
    color: '#e5e7eb',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s ease-in-out',
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text'
  };

  const labelStyles = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    color: '#e5e7eb',
    fontWeight: '500'
  };

  const errorStyles = {
    color: '#ef4444',
    fontSize: '12px',
    marginTop: '4px'
  };

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id || name} style={labelStyles}>
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
        </label>
      )}
      <input
        type={type}
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        style={inputStyles}
        {...props}
      />
      {error && <div style={errorStyles}>{error}</div>}
    </div>
  );
};

export { Input };
export default Input;
