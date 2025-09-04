import React from 'react';
import { Badge } from '../ui/Badge';

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  emptyMessage = 'No data available',
  className = '',
  ...props
}) => {
  const tableStyles = {
    width: '100%',
    backgroundColor: '#111827',
    borderRadius: '8px',
    border: '1px solid #374151',
    overflow: 'hidden'
  };

  const headerStyles = {
    backgroundColor: '#1f2937',
    borderBottom: '1px solid #374151'
  };

  const headerCellStyles = {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    color: '#e5e7eb',
    borderRight: '1px solid #374151'
  };

  const rowStyles = {
    borderBottom: '1px solid #374151'
  };

  const cellStyles = {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#e5e7eb',
    borderRight: '1px solid #374151'
  };

  const loadingStyles = {
    padding: '40px',
    textAlign: 'center',
    color: '#9ca3af'
  };

  const emptyStyles = {
    padding: '40px',
    textAlign: 'center',
    color: '#9ca3af'
  };

  const renderCellContent = (value, column) => {
    if (column.render) {
      return column.render(value);
    }

    if (column.type === 'badge') {
      return <Badge variant={column.variant || 'default'}>{value}</Badge>;
    }

    if (column.type === 'date') {
      return new Date(value).toLocaleDateString();
    }

    return value;
  };

  if (loading) {
    return (
      <div style={tableStyles} className={className} {...props}>
        <div style={loadingStyles}>Loading...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={tableStyles} className={className} {...props}>
        <div style={emptyStyles}>{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div style={tableStyles} className={className} {...props}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={headerStyles}>
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key || index}
                style={{
                  ...headerCellStyles,
                  borderRight: index === columns.length - 1 ? 'none' : headerCellStyles.borderRight
                }}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex} style={rowStyles}>
              {columns.map((column, colIndex) => (
                <td
                  key={`${rowIndex}-${column.key || colIndex}`}
                  style={{
                    ...cellStyles,
                    borderRight: colIndex === columns.length - 1 ? 'none' : cellStyles.borderRight
                  }}
                >
                  {renderCellContent(row[column.key], column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { DataTable };
export default DataTable;
