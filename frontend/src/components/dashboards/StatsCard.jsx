import React from 'react';

export const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = 'blue',
  className = ''
}) => {
  const colors = {
    blue: { bg: '#1e40af', light: '#3b82f6', lighter: '#dbeafe' },
    green: { bg: '#059669', light: '#10b981', lighter: '#d1fae5' },
    red: { bg: '#dc2626', light: '#ef4444', lighter: '#fee2e2' },
    yellow: { bg: '#d97706', light: '#f59e0b', lighter: '#fef3c7' },
    purple: { bg: '#7c3aed', light: '#8b5cf6', lighter: '#ede9fe' },
    gray: { bg: '#4b5563', light: '#6b7280', lighter: '#f3f4f6' }
  };

  const cardStyles = {
    backgroundColor: '#111827',
    border: '1px solid #374151',
    borderRadius: '8px',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden'
  };

  const headerStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px'
  };

  const titleStyles = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#9ca3af',
    margin: 0
  };

  const iconStyles = {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: colors[color].light,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px'
  };

  const valueStyles = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#e5e7eb',
    margin: '8px 0',
    lineHeight: 1
  };

  const subtitleStyles = {
    fontSize: '12px',
    color: '#6b7280',
    margin: 0
  };

  const trendStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '8px'
  };

  const trendValueStyles = {
    fontSize: '12px',
    fontWeight: '600',
    color: trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#6b7280'
  };

  const trendIconStyles = {
    fontSize: '12px',
    color: trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#6b7280'
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      case 'neutral': return '→';
      default: return '';
    }
  };

  return (
    <div style={cardStyles} className={className}>
      <div style={headerStyles}>
        <h3 style={titleStyles}>{title}</h3>
        {icon && (
          <div style={iconStyles}>
            {icon}
          </div>
        )}
      </div>
      
      <div style={valueStyles}>{value}</div>
      
      {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
      
      {trend && trendValue && (
        <div style={trendStyles}>
          <span style={trendIconStyles}>{getTrendIcon()}</span>
          <span style={trendValueStyles}>{trendValue}</span>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>vs last period</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
