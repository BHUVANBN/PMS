import React from 'react';

export const ChartWidget = ({
  title,
  data = [],
  type = 'bar',
  height = 200,
  className = ''
}) => {
  const containerStyles = {
    backgroundColor: '#111827',
    border: '1px solid #374151',
    borderRadius: '8px',
    padding: '20px'
  };

  const headerStyles = {
    marginBottom: '16px'
  };

  const titleStyles = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#e5e7eb',
    margin: 0
  };

  const chartContainerStyles = {
    height: `${height}px`,
    position: 'relative',
    display: 'flex',
    alignItems: 'end',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #374151'
  };

  const renderBarChart = () => {
    const maxValue = Math.max(...data.map(item => item.value));
    
    return (
      <div style={chartContainerStyles}>
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * (height - 40) : 0;
          
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                maxWidth: '60px'
              }}
            >
              <div
                style={{
                  width: '30px',
                  height: `${barHeight}px`,
                  backgroundColor: item.color || '#3b82f6',
                  borderRadius: '2px 2px 0 0',
                  marginBottom: '8px',
                  transition: 'all 0.3s ease'
                }}
              />
              <div style={{
                fontSize: '12px',
                color: '#9ca3af',
                textAlign: 'center',
                transform: 'rotate(-45deg)',
                transformOrigin: 'center',
                whiteSpace: 'nowrap'
              }}>
                {item.label}
              </div>
              <div style={{
                fontSize: '11px',
                color: '#6b7280',
                marginTop: '4px'
              }}>
                {item.value}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderLineChart = () => {
    const maxValue = Math.max(...data.map(item => item.value));
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = maxValue > 0 ? 100 - (item.value / maxValue) * 80 : 50;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div style={{ ...chartContainerStyles, flexDirection: 'column' }}>
        <svg width="100%" height={height - 40} style={{ marginBottom: '10px' }}>
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={points}
          />
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = maxValue > 0 ? 100 - (item.value / maxValue) * 80 : 50;
            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={`${y}%`}
                r="3"
                fill="#3b82f6"
              />
            );
          })}
        </svg>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#9ca3af'
        }}>
          {data.map((item, index) => (
            <span key={index}>{item.label}</span>
          ))}
        </div>
      </div>
    );
  };

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    const radius = 60;
    const centerX = 80;
    const centerY = 80;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <svg width="160" height="160">
          {data.map((item, index) => {
            const angle = (item.value / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
            const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
            const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
            const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');
            
            currentAngle += angle;
            
            return (
              <path
                key={index}
                d={pathData}
                fill={item.color || `hsl(${index * 60}, 70%, 50%)`}
                stroke="#111827"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        
        <div style={{ flex: 1 }}>
          {data.map((item, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '2px',
                backgroundColor: item.color || `hsl(${index * 60}, 70%, 50%)`
              }} />
              <span style={{ color: '#e5e7eb' }}>{item.label}</span>
              <span style={{ color: '#9ca3af', marginLeft: 'auto' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'line': return renderLineChart();
      case 'pie': return renderPieChart();
      case 'bar':
      default: return renderBarChart();
    }
  };

  return (
    <div style={containerStyles} className={className}>
      <div style={headerStyles}>
        <h3 style={titleStyles}>{title}</h3>
      </div>
      
      {data.length === 0 ? (
        <div style={{
          height: `${height}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          fontSize: '14px'
        }}>
          No data available
        </div>
      ) : (
        renderChart()
      )}
    </div>
  );
};

export default ChartWidget;
