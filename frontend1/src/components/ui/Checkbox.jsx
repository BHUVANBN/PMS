import React from 'react';

const Checkbox = ({
  checked = false,
  onChange = null,
  disabled = false,
  indeterminate = false,
  label = null,
  description = null,
  error = null,
  size = 'md',
  color = 'blue',
  className = '',
  labelClassName = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const colorClasses = {
    blue: 'text-blue-600 focus:ring-blue-500',
    green: 'text-green-600 focus:ring-green-500',
    red: 'text-red-600 focus:ring-red-500',
    purple: 'text-purple-600 focus:ring-purple-500',
    yellow: 'text-yellow-600 focus:ring-yellow-500',
    gray: 'text-gray-600 focus:ring-gray-500'
  };

  const baseClasses = 'rounded border-gray-300 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200';

  const checkboxClasses = [
    baseClasses,
    sizeClasses[size],
    colorClasses[color] || colorClasses.blue,
    error ? 'border-red-300' : '',
    className
  ].filter(Boolean).join(' ');

  const containerClasses = label || description ? 'flex items-start' : '';

  const labelSizeClasses = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={containerClasses}>
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          ref={(input) => {
            if (input) input.indeterminate = indeterminate;
          }}
          className={checkboxClasses}
          {...props}
        />
      </div>
      
      {(label || description) && (
        <div className="ml-3">
          {label && (
            <label className={`font-medium text-gray-900 ${labelSizeClasses[size]} ${labelClassName}`}>
              {label}
            </label>
          )}
          {description && (
            <p className={`text-gray-500 ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>
              {description}
            </p>
          )}
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Checkbox group component
export const CheckboxGroup = ({
  options = [],
  value = [],
  onChange = null,
  label = null,
  error = null,
  direction = 'vertical',
  size = 'md',
  color = 'blue',
  className = ''
}) => {
  const handleCheckboxChange = (optionValue, checked) => {
    const newValue = checked
      ? [...value, optionValue]
      : value.filter(v => v !== optionValue);
    onChange?.(newValue);
  };

  const containerClasses = [
    direction === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-2',
    className
  ].filter(Boolean).join(' ');

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className={containerClasses}>
        {options.map((option, index) => {
          const optionValue = typeof option === 'object' ? option.value : option;
          const optionLabel = typeof option === 'object' ? option.label : option;
          const optionDescription = typeof option === 'object' ? option.description : null;
          const isChecked = value.includes(optionValue);

          return (
            <Checkbox
              key={optionValue || index}
              checked={isChecked}
              onChange={(e) => handleCheckboxChange(optionValue, e.target.checked)}
              label={optionLabel}
              description={optionDescription}
              size={size}
              color={color}
            />
          );
        })}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Switch component (styled checkbox)
export const Switch = ({
  checked = false,
  onChange = null,
  disabled = false,
  label = null,
  description = null,
  size = 'md',
  color = 'blue',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-7',
    md: 'h-5 w-9',
    lg: 'h-6 w-11'
  };

  const thumbSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const colorClasses = {
    blue: checked ? 'bg-blue-600' : 'bg-gray-200',
    green: checked ? 'bg-green-600' : 'bg-gray-200',
    red: checked ? 'bg-red-600' : 'bg-gray-200',
    purple: checked ? 'bg-purple-600' : 'bg-gray-200',
    yellow: checked ? 'bg-yellow-600' : 'bg-gray-200'
  };

  const switchClasses = [
    'relative inline-flex flex-shrink-0 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    sizeClasses[size],
    colorClasses[color] || colorClasses.blue,
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className
  ].filter(Boolean).join(' ');

  const thumbClasses = [
    'pointer-events-none inline-block rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
    thumbSizeClasses[size],
    checked ? (size === 'sm' ? 'translate-x-3' : size === 'md' ? 'translate-x-4' : 'translate-x-5') : 'translate-x-0'
  ].filter(Boolean).join(' ');

  return (
    <div className={label || description ? 'flex items-center justify-between' : ''}>
      {(label || description) && (
        <div className="mr-4">
          {label && (
            <label className="text-sm font-medium text-gray-900">
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-gray-500">
              {description}
            </p>
          )}
        </div>
      )}
      
      <button
        type="button"
        className={switchClasses}
        onClick={() => !disabled && onChange?.(!checked)}
        disabled={disabled}
        role="switch"
        aria-checked={checked}
      >
        <span className={thumbClasses} />
      </button>
    </div>
  );
};

export default Checkbox;
