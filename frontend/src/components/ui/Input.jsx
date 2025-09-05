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
  const inputClasses = `
    w-full px-3 py-2.5 rounded-lg border text-base outline-none
    transition-colors duration-200 ease-in-out
    ${error 
      ? 'border-red-500 bg-slate-800 text-gray-200' 
      : 'border-gray-700 bg-slate-800 text-gray-200 focus:border-indigo-500'
    }
    ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-text'}
  `;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id || name} className="block mb-1.5 text-sm text-gray-200 font-medium">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
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
        className={inputClasses}
        {...props}
      />
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
  );
};

export { Input };
export default Input;
