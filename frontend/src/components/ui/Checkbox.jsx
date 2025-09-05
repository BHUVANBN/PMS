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
  return (
    <div className={className}>
      <label htmlFor={id || name} className={`flex items-center gap-2 text-sm text-gray-200 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        <input
          type="checkbox"
          id={id || name}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`w-4 h-4 accent-indigo-500 ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          {...props}
        />
        {label}
      </label>
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
  );
};

export { Checkbox };
export default Checkbox;
