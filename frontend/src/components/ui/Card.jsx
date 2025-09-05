import React from 'react';

const Card = ({
  children,
  title = '',
  subtitle = '',
  className = '',
  padding = 'md',
  ...props
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const cardClasses = `
    bg-gray-900 rounded-lg border border-gray-700 text-gray-200
    ${paddingClasses[padding]}
    ${className}
  `;

  return (
    <div className={cardClasses} {...props}>
      {(title || subtitle) && (
        <div className={`${title || subtitle ? 'mb-4' : 'mb-0'}`}>
          {title && <h3 className="m-0 mb-1 text-lg font-semibold text-gray-200">{title}</h3>}
          {subtitle && <p className="m-0 text-sm text-gray-400">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export { Card };
export default Card;
