import { clsx } from 'clsx';

const Card = ({ 
  children, 
  className = '',
  padding = true,
  shadow = 'soft',
  ...props 
}) => {
  const shadowClasses = {
    none: '',
    soft: 'shadow-soft',
    medium: 'shadow-medium',
    large: 'shadow-large',
  };

  return (
    <div
      className={clsx(
        'card',
        shadowClasses[shadow],
        {
          'p-0': !padding,
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
