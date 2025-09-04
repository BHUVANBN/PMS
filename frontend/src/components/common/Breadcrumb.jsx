import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Breadcrumb = ({ 
  items = [], 
  separator = '/', 
  className = '',
  ...props 
}) => {
  const location = useLocation();
  
  // Auto-generate breadcrumbs from current path if no items provided
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    const breadcrumbs = [{ label: 'Home', path: '/' }];
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
      breadcrumbs.push({
        label,
        path: currentPath,
        isLast: index === pathSegments.length - 1
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbs();

  const containerStyles = {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    color: '#9ca3af'
  };

  const linkStyles = {
    color: '#3b82f6',
    textDecoration: 'none',
    transition: 'color 0.2s ease'
  };

  const linkHoverStyles = {
    color: '#1d4ed8'
  };

  const separatorStyles = {
    margin: '0 8px',
    color: '#6b7280'
  };

  const currentStyles = {
    color: '#e5e7eb',
    fontWeight: '500'
  };

  return (
    <nav style={containerStyles} className={className} {...props}>
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span style={separatorStyles}>{separator}</span>}
          {item.isLast || index === breadcrumbItems.length - 1 ? (
            <span style={currentStyles}>{item.label}</span>
          ) : (
            <Link 
              to={item.path} 
              style={linkStyles}
              onMouseEnter={(e) => Object.assign(e.target.style, linkHoverStyles)}
              onMouseLeave={(e) => Object.assign(e.target.style, linkStyles)}
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
