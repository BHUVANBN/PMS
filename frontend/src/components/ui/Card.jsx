import React from 'react';

const Card = ({
  children,
  title = '',
  subtitle = '',
  className = '',
  padding = 'md',
  ...props
}) => {
  const paddingStyles = {
    sm: '16px',
    md: '24px',
    lg: '32px'
  };

  const cardStyles = {
    backgroundColor: '#111827',
    borderRadius: '8px',
    border: '1px solid #374151',
    color: '#e5e7eb',
    padding: paddingStyles[padding]
  };

  const headerStyles = {
    marginBottom: title || subtitle ? '16px' : '0'
  };

  const titleStyles = {
    margin: '0 0 4px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#e5e7eb'
  };

  const subtitleStyles = {
    margin: 0,
    fontSize: '14px',
    color: '#9ca3af'
  };

  return (
    <div style={cardStyles} className={className} {...props}>
      {(title || subtitle) && (
        <div style={headerStyles}>
          {title && <h3 style={titleStyles}>{title}</h3>}
          {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export { Card };
export default Card;
