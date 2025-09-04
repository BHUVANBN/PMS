import React, { useState } from 'react';

const Tooltip = ({
  children,
  content,
  position = 'top',
  className = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const tooltipStyles = {
    position: 'relative',
    display: 'inline-block'
  };

  const tooltipContentStyles = {
    position: 'absolute',
    backgroundColor: '#1f2937',
    color: '#e5e7eb',
    padding: '6px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    whiteSpace: 'nowrap',
    zIndex: 1000,
    opacity: isVisible ? 1 : 0,
    visibility: isVisible ? 'visible' : 'hidden',
    transition: 'opacity 0.2s ease-in-out',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #374151'
  };

  const positions = {
    top: {
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginBottom: '5px'
    },
    bottom: {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginTop: '5px'
    },
    left: {
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginRight: '5px'
    },
    right: {
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginLeft: '5px'
    }
  };

  const finalTooltipStyles = {
    ...tooltipContentStyles,
    ...positions[position]
  };

  return (
    <div
      style={tooltipStyles}
      className={className}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      {...props}
    >
      {children}
      <div style={finalTooltipStyles}>
        {content}
      </div>
    </div>
  );
};

export { Tooltip };
export default Tooltip;
