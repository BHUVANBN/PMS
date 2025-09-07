import React, { useState, useRef, useEffect } from 'react';

const Select = ({
  options = [],
  value = '',
  onChange = null,
  onBlur = null,
  placeholder = 'Select an option',
  label = null,
  error = null,
  helperText = null,
  disabled = false,
  required = false,
  multiple = false,
  searchable = false,
  size = 'md',
  fullWidth = false,
  className = '',
  optionClassName = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const filteredOptions = searchable && searchTerm
    ? options.filter(option => 
        (option.label || option.name || option.toString())
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : options;

  const getOptionValue = (option) => {
    if (typeof option === 'object') {
      return option.value !== undefined ? option.value : option.id || option._id;
    }
    return option;
  };

  const getOptionLabel = (option) => {
    if (typeof option === 'object') {
      return option.label || option.name || option.title || option.toString();
    }
    return option.toString();
  };

  const isSelected = (option) => {
    const optionValue = getOptionValue(option);
    if (multiple) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  const handleOptionClick = (option) => {
    const optionValue = getOptionValue(option);
    
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = isSelected(option)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onChange?.(newValues);
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const getDisplayValue = () => {
    if (multiple) {
      const selectedOptions = options.filter(option => isSelected(option));
      if (selectedOptions.length === 0) return placeholder;
      if (selectedOptions.length === 1) return getOptionLabel(selectedOptions[0]);
      return `${selectedOptions.length} selected`;
    }

    const selectedOption = options.find(option => getOptionValue(option) === value);
    return selectedOption ? getOptionLabel(selectedOption) : placeholder;
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const baseClasses = 'relative block w-full border border-gray-300 rounded-lg shadow-sm bg-white transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed cursor-pointer';

  const errorClasses = error 
    ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
    : '';

  const selectClasses = [
    baseClasses,
    sizeClasses[size],
    errorClasses,
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');

  const containerClasses = [
    'relative',
    fullWidth ? 'w-full' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div ref={selectRef} className="relative">
        <div
          className={selectClasses}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          {...props}
        >
          <div className="flex items-center justify-between">
            <span className={value || (multiple && Array.isArray(value) && value.length > 0) ? 'text-gray-900' : 'text-gray-500'}>
              {getDisplayValue()}
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {searchable && (
              <div className="p-2 border-b border-gray-200">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                {searchTerm ? 'No options found' : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const optionValue = getOptionValue(option);
                const optionLabel = getOptionLabel(option);
                const selected = isSelected(option);

                return (
                  <div
                    key={optionValue || index}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center justify-between ${
                      selected ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                    } ${optionClassName}`}
                    onClick={() => handleOptionClick(option)}
                  >
                    <span>{optionLabel}</span>
                    {selected && (
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                );
              })
            )}
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
};

// Specialized select components
export const UserSelect = ({ users = [], ...props }) => {
  const userOptions = users.map(user => ({
    value: user._id || user.id,
    label: `${user.firstName} ${user.lastName}`,
    ...user
  }));

  return (
    <Select
      options={userOptions}
      searchable
      placeholder="Select a user"
      {...props}
    />
  );
};

export const ProjectSelect = ({ projects = [], ...props }) => {
  const projectOptions = projects.map(project => ({
    value: project._id || project.id,
    label: project.name,
    ...project
  }));

  return (
    <Select
      options={projectOptions}
      searchable
      placeholder="Select a project"
      {...props}
    />
  );
};

export const StatusSelect = ({ statuses = [], ...props }) => {
  const statusOptions = statuses.map(status => ({
    value: status,
    label: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }));

  return (
    <Select
      options={statusOptions}
      placeholder="Select status"
      {...props}
    />
  );
};

export const PrioritySelect = ({ priorities = ['low', 'medium', 'high', 'critical'], ...props }) => {
  const priorityOptions = priorities.map(priority => ({
    value: priority,
    label: priority.charAt(0).toUpperCase() + priority.slice(1)
  }));

  return (
    <Select
      options={priorityOptions}
      placeholder="Select priority"
      {...props}
    />
  );
};

export default Select;
