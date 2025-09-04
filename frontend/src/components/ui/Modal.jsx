import React from 'react';
import { Button } from './Button';

export const Modal = ({
  isOpen = false,
  onClose,
  title = '',
  children,
  size = 'md',
  showCloseButton = true,
  className = '',
  ...props
}) => {
  if (!isOpen) return null;

  const overlayStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px'
  };

  const sizes = {
    sm: { maxWidth: '400px', width: '100%' },
    md: { maxWidth: '600px', width: '100%' },
    lg: { maxWidth: '800px', width: '100%' },
    xl: { maxWidth: '1200px', width: '100%' }
  };

  const modalStyles = {
    backgroundColor: '#111827',
    borderRadius: '12px',
    border: '1px solid #374151',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
    color: '#e5e7eb',
    ...sizes[size],
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  };

  const headerStyles = {
    padding: '20px 24px',
    borderBottom: '1px solid #374151',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const titleStyles = {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#e5e7eb'
  };

  const contentStyles = {
    padding: '24px',
    overflow: 'auto',
    flex: 1
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div style={overlayStyles} onClick={handleOverlayClick} {...props}>
      <div style={modalStyles} className={className}>
        {(title || showCloseButton) && (
          <div style={headerStyles}>
            {title && <h2 style={titleStyles}>{title}</h2>}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                style={{ padding: '4px 8px' }}
              >
                ✕
              </Button>
            )}
          </div>
        )}
        <div style={contentStyles}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
