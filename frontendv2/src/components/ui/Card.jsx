import { clsx } from 'clsx';
import React from 'react';

const Card = ({ 
  children, 
  className = '',
  variant = 'default',
  hover = false,
  clickable = false,
  selected = false,
  disabled = false,
  borderless = false,
  glass = false,
  ...props 
}) => {
  const variantClasses = {
    default: 'card',
    stat: 'card-stat',
    task: 'card-task',
    project: 'card-project',
  };

  return (
    <div
      className={clsx(
        borderless ? 'card-borderless' : glass ? 'card-glass' : variantClasses[variant],
        {
          'card-hover': hover,
          'card-clickable': clickable,
          'card-selected': selected,
          'card-disabled': disabled,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <div
      className={clsx('card-header', className)}
      {...props}
    >
      {children}
    </div>
  );
};

const CardBody = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <div
      className={clsx('card-body', className)}
      {...props}
    >
      {children}
    </div>
  );
};

const CardFooter = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <div
      className={clsx('card-footer', className)}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
