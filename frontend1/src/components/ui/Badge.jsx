import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = true,
  removable = false,
  onRemove = null,
  icon = null,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center font-medium';

  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-600 text-white',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-50 text-blue-700',
    light: 'bg-gray-50 text-gray-600',
    dark: 'bg-gray-800 text-white',
    outline: 'border border-gray-300 text-gray-700 bg-white',
    'outline-primary': 'border border-blue-300 text-blue-700 bg-blue-50',
    'outline-success': 'border border-green-300 text-green-700 bg-green-50',
    'outline-danger': 'border border-red-300 text-red-700 bg-red-50',
    'outline-warning': 'border border-yellow-300 text-yellow-700 bg-yellow-50'
  };

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm',
    xl: 'px-4 py-1 text-base'
  };

  const roundedClasses = rounded ? 'rounded-full' : 'rounded';

  const classes = [
    baseClasses,
    variantClasses[variant] || variantClasses.default,
    sizeClasses[size],
    roundedClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {icon && (
        <span className="mr-1">
          {icon}
        </span>
      )}
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 inline-flex items-center justify-center w-4 h-4 text-current hover:bg-black hover:bg-opacity-10 rounded-full focus:outline-none focus:bg-black focus:bg-opacity-10"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};

// Status badges for common use cases
export const StatusBadge = ({ status, ...props }) => {
  const statusVariants = {
    active: 'success',
    inactive: 'danger',
    pending: 'warning',
    completed: 'success',
    cancelled: 'danger',
    draft: 'light',
    published: 'success',
    archived: 'secondary'
  };

  return (
    <Badge variant={statusVariants[status] || 'default'} {...props}>
      {status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </Badge>
  );
};

// Priority badges
export const PriorityBadge = ({ priority, ...props }) => {
  const priorityVariants = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
    critical: 'danger'
  };

  const priorityIcons = {
    low: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
    medium: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    ),
    high: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    critical: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    )
  };

  return (
    <Badge 
      variant={priorityVariants[priority] || 'default'} 
      icon={priorityIcons[priority]}
      {...props}
    >
      {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
    </Badge>
  );
};

// Type badges
export const TypeBadge = ({ type, ...props }) => {
  const typeVariants = {
    feature: 'primary',
    bug: 'danger',
    improvement: 'success',
    task: 'info',
    epic: 'secondary',
    story: 'primary',
    subtask: 'light'
  };

  const typeIcons = {
    feature: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    bug: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    improvement: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    task: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )
  };

  return (
    <Badge 
      variant={typeVariants[type] || 'default'} 
      icon={typeIcons[type]}
      {...props}
    >
      {type?.charAt(0).toUpperCase() + type?.slice(1)}
    </Badge>
  );
};

// Role badges
export const RoleBadge = ({ role, ...props }) => {
  const roleVariants = {
    admin: 'danger',
    manager: 'primary',
    developer: 'success',
    tester: 'info',
    hr: 'warning',
    employee: 'secondary'
  };

  return (
    <Badge variant={roleVariants[role] || 'default'} {...props}>
      {role?.charAt(0).toUpperCase() + role?.slice(1)}
    </Badge>
  );
};

// Count badge (for notifications, etc.)
export const CountBadge = ({ count, max = 99, ...props }) => {
  const displayCount = count > max ? `${max}+` : count.toString();
  
  return (
    <Badge variant="danger" size="xs" {...props}>
      {displayCount}
    </Badge>
  );
};

// Dot badge (simple indicator)
export const DotBadge = ({ variant = 'default', className = '', ...props }) => {
  const dotClasses = [
    'w-2 h-2 rounded-full',
    variantClasses[variant] || variantClasses.default,
    className
  ].filter(Boolean).join(' ');

  const variantClasses = {
    default: 'bg-gray-400',
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    danger: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-400'
  };

  return <span className={dotClasses} {...props} />;
};

export default Badge;
