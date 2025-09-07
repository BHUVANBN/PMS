import React, { useState, useRef, useEffect } from 'react';

const Tooltip = ({
  children,
  content,
  position = 'top',
  trigger = 'hover',
  delay = 0,
  disabled = false,
  className = '',
  tooltipClassName = '',
  arrow = true,
  maxWidth = 'max-w-xs',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltip = tooltipRef.current;
      const trigger = triggerRef.current;
      const tooltipRect = tooltip.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newPosition = position;

      // Check if tooltip goes outside viewport and adjust position
      if (position === 'top' && tooltipRect.top < 0) {
        newPosition = 'bottom';
      } else if (position === 'bottom' && tooltipRect.bottom > viewportHeight) {
        newPosition = 'top';
      } else if (position === 'left' && tooltipRect.left < 0) {
        newPosition = 'right';
      } else if (position === 'right' && tooltipRect.right > viewportWidth) {
        newPosition = 'left';
      }

      setActualPosition(newPosition);
    }
  }, [isVisible, position]);

  const showTooltip = () => {
    if (disabled || !content) return;
    
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    } else {
      setIsVisible(true);
    }
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover' || trigger === 'both') {
      showTooltip();
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover' || trigger === 'both') {
      hideTooltip();
    }
  };

  const handleClick = () => {
    if (trigger === 'click' || trigger === 'both') {
      if (isVisible) {
        hideTooltip();
      } else {
        showTooltip();
      }
    }
  };

  const handleFocus = () => {
    if (trigger === 'focus') {
      showTooltip();
    }
  };

  const handleBlur = () => {
    if (trigger === 'focus') {
      hideTooltip();
    }
  };

  const getPositionClasses = () => {
    const positions = {
      top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
      'top-start': 'bottom-full left-0 mb-2',
      'top-end': 'bottom-full right-0 mb-2',
      'bottom-start': 'top-full left-0 mt-2',
      'bottom-end': 'top-full right-0 mt-2'
    };

    return positions[actualPosition] || positions.top;
  };

  const getArrowClasses = () => {
    const arrows = {
      top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
      bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
      left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900',
      right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900'
    };

    return arrows[actualPosition] || arrows.top;
  };

  const tooltipClasses = [
    'absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg',
    maxWidth,
    getPositionClasses(),
    tooltipClassName
  ].filter(Boolean).join(' ');

  const arrowClasses = [
    'absolute w-0 h-0 border-4',
    getArrowClasses()
  ].filter(Boolean).join(' ');

  if (!content) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative inline-block ${className}`} {...props}>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="cursor-help"
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={tooltipClasses}
          role="tooltip"
        >
          {content}
          {arrow && <div className={arrowClasses} />}
        </div>
      )}
    </div>
  );
};

// Specialized tooltip components
export const InfoTooltip = ({ children, content, ...props }) => (
  <Tooltip
    content={content}
    position="top"
    {...props}
  >
    <div className="inline-flex items-center">
      {children}
      <svg className="w-4 h-4 ml-1 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  </Tooltip>
);

export const HelpTooltip = ({ content, ...props }) => (
  <Tooltip
    content={content}
    position="top"
    trigger="hover"
    {...props}
  >
    <button
      type="button"
      className="inline-flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </button>
  </Tooltip>
);

export const StatusTooltip = ({ status, children, ...props }) => {
  const statusMessages = {
    success: 'Operation completed successfully',
    error: 'An error occurred',
    warning: 'Warning: Please review',
    info: 'Additional information available',
    pending: 'Operation in progress'
  };

  const statusColors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600',
    info: 'bg-blue-600',
    pending: 'bg-gray-600'
  };

  return (
    <Tooltip
      content={statusMessages[status] || 'Status information'}
      tooltipClassName={statusColors[status] || 'bg-gray-900'}
      {...props}
    >
      {children}
    </Tooltip>
  );
};

export const ConfirmTooltip = ({ 
  onConfirm, 
  onCancel, 
  message = 'Are you sure?',
  confirmText = 'Yes',
  cancelText = 'No',
  children,
  ...props 
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    onConfirm?.();
    setShowConfirm(false);
  };

  const handleCancel = () => {
    onCancel?.();
    setShowConfirm(false);
  };

  const confirmContent = (
    <div className="text-center">
      <p className="mb-3 text-sm">{message}</p>
      <div className="flex space-x-2">
        <button
          onClick={handleConfirm}
          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {confirmText}
        </button>
        <button
          onClick={handleCancel}
          className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          {cancelText}
        </button>
      </div>
    </div>
  );

  return (
    <Tooltip
      content={showConfirm ? confirmContent : null}
      trigger="click"
      maxWidth="max-w-sm"
      {...props}
    >
      <div onClick={() => setShowConfirm(true)}>
        {children}
      </div>
    </Tooltip>
  );
};

export default Tooltip;
