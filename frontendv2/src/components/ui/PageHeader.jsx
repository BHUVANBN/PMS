import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ChevronRight, Home } from '@mui/icons-material';
import { Link } from 'react-router-dom';

/**
 * Breadcrumbs Component
 * 
 * @param {Object} props
 * @param {Array} props.items - Breadcrumb items [{label, href}]
 * @param {string} props.separator - Separator character (default: "/")
 * @param {boolean} props.showHome - Show home icon (default: true)
 * @param {string} props.className - Additional CSS classes
 */
export const Breadcrumbs = ({ 
  items = [], 
  separator = "/",
  showHome = true,
  className = ""
}) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className={`breadcrumbs ${className}`} aria-label="Breadcrumb">
      {showHome && (
        <div className="breadcrumb-item">
          <Link to="/" className="breadcrumb-link">
            <Home sx={{ fontSize: 16 }} />
          </Link>
          <span className="breadcrumb-separator">{separator}</span>
        </div>
      )}
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <div key={index} className="breadcrumb-item">
            {isLast ? (
              <span className="breadcrumb-current" aria-current="page">
                {item.label}
              </span>
            ) : (
              <>
                {item.href ? (
                  <Link to={item.href} className="breadcrumb-link">
                    {item.label}
                  </Link>
                ) : (
                  <span className="breadcrumb-link">{item.label}</span>
                )}
                <span className="breadcrumb-separator">{separator}</span>
              </>
            )}
          </div>
        );
      })}
    </nav>
  );
};

/**
 * PageHeader Component
 * 
 * @param {Object} props
 * @param {string} props.title - Page title (H1)
 * @param {string} props.description - Optional page description
 * @param {Array} props.breadcrumbs - Breadcrumb items
 * @param {React.ReactNode} props.actions - Action buttons
 * @param {boolean} props.bordered - Show bottom border
 * @param {boolean} props.compact - Compact spacing
 * @param {boolean} props.large - Large spacing
 * @param {boolean} props.centered - Center align content
 * @param {React.ReactNode} props.tabs - Optional tabs
 * @param {React.ReactNode} props.stats - Optional stats
 * @param {string} props.className - Additional CSS classes
 */
const PageHeader = ({
  title,
  description,
  breadcrumbs = [],
  actions,
  bordered = false,
  compact = false,
  large = false,
  centered = false,
  tabs,
  stats,
  className = "",
  children
}) => {
  const headerClasses = [
    'page-header',
    bordered && 'page-header-bordered',
    compact && 'page-header-compact',
    large && 'page-header-large',
    centered && 'page-header-centered',
    tabs && 'page-header-with-tabs',
    className
  ].filter(Boolean).join(' ');

  return (
    <Box className={headerClasses}>
      {breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} />
      )}
      
      <Box className="page-header-content">
        <Box className="page-header-main">
          <Typography variant="h1" className="page-title">
            {title}
          </Typography>
          
          {description && (
            <Typography className="page-description">
              {description}
            </Typography>
          )}
          
          {children}
        </Box>
        
        {actions && (
          <Box className="page-header-actions">
            {actions}
          </Box>
        )}
      </Box>
      
      {tabs && (
        <Box className="page-header-tabs">
          {tabs}
        </Box>
      )}
      
      {stats && (
        <Box className="page-header-stats">
          {stats}
        </Box>
      )}
    </Box>
  );
};

/**
 * PageHeaderStat Component
 * For displaying statistics in page header
 */
export const PageHeaderStat = ({ label, value }) => (
  <Box className="page-header-stat">
    <Typography className="page-header-stat-label">{label}</Typography>
    <Typography className="page-header-stat-value">{value}</Typography>
  </Box>
);

/**
 * PageHeaderTab Component
 * For tab navigation in page header
 */
export const PageHeaderTab = ({ label, active = false, onClick, href }) => {
  const tabClasses = ['page-header-tab', active && 'page-header-tab-active']
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <Link to={href} className={tabClasses}>
        {label}
      </Link>
    );
  }

  return (
    <button className={tabClasses} onClick={onClick}>
      {label}
    </button>
  );
};

export default PageHeader;
