import { forwardRef } from 'react';
import { clsx } from 'clsx';

const Input = forwardRef(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const hasError = !!error;
  
  return (
    <div className={clsx('form-group', containerClassName)}>
      {label && (
        <label className="form-label" htmlFor={props.id}>
          {label}
          {props.required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-neutral-400">
              {leftIcon}
            </span>
          </div>
        )}
        
        <input
          ref={ref}
          className={clsx(
            'input',
            {
              'input-error': hasError,
              'pl-10': leftIcon,
              'pr-10': rightIcon,
            },
            className
          )}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span className="text-neutral-400">
              {rightIcon}
            </span>
          </div>
        )}
      </div>
      
      {error && (
        <p className="form-error mt-1">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="form-help mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
