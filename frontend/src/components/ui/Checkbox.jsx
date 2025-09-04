import React from 'react';

const Checkbox = ({
  checked = false,
  onChange,
  name,
  id,
  disabled = false,
  label = '',
  error = '',
  className = '',
  ...props
}) => {
  const checkboxStyles = {
    width: '16px',
    height: '16px',
    accentColor: '#4f46e5',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1
  };

  const labelStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#e5e7eb',
    cursor: disabled ? 'not-allowed' : 'pointer'
  };

  const errorStyles = {
    color: '#ef4444',
    fontSize: '12px',
    marginTop: '4px'
  };

  return (
    <div className={className}>
      <label htmlFor={id || name} style={labelStyles}>
        <input
          type="checkbox"
          id={id || name}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          style={checkboxStyles}
          {...props}
        />
        {label}
      </label>
      {error && <div style={errorStyles}>{error}</div>}
    </div>
  );
};

export { Checkbox };
export default Checkbox;
