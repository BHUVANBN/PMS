import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Paper,
  Checkbox,
  IconButton,
  Chip,
  Avatar,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Toolbar,
  Tooltip,
  Menu,
  MenuItem,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search,
  FilterList,
  MoreVert,
  GetApp,
  Refresh,
  Add,
  Edit,
  Delete,
  Visibility,
  CheckCircle,
  Cancel,
  Warning,
  Info
} from '@mui/icons-material';

const DataTable = ({
  // Data props
  data = [],
  columns = [],
  loading = false,
  error = null,
  
  // Table configuration
  title,
  subtitle,
  selectable = false,
  sortable = true,
  searchable = true,
  filterable = false,
  paginated = true,
  
  // Pagination props
  page = 0,
  rowsPerPage = 10,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  
  // Selection props
  selected = [],
  onSelectionChange,
  
  // Action props
  actions = [],
  bulkActions = [],
  onAction,
  
  // Styling props
  dense = false,
  stickyHeader = false,
  maxHeight,
  
  // Custom renderers
  renderRow,
  renderCell,
  renderEmpty,
  
  // Event handlers
  onSort,
  onSearch,
  onRefresh,

  // Extended compatibility props (aliases / enhancements)
  enableSearch,            // alias of `searchable`
  searchableKeys,          // restrict search to these keys
  initialPageSize,         // default rows per page if `rowsPerPage` not provided
  emptyMessage             // custom empty message
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
  const [actionMenuRow, setActionMenuRow] = useState(null);

  // Resolve effective props with backward compatibility
  const isSearchable = enableSearch !== undefined ? enableSearch : searchable;
  const effectiveRowsPerPage = rowsPerPage || initialPageSize || 10;

  // Normalize columns to support both { field, headerName } and { key, label }
  const normalizedColumns = useMemo(() => {
    return (columns || []).map((col) => ({
      ...col,
      field: col.field || col.key,
      headerName: col.headerName || col.label || col.field || col.key,
    })).filter((c) => !!c.field);
  }, [columns]);

  // Filter and search data
  const filteredData = useMemo(() => {
    if (!isSearchable || !searchTerm) return data;

    const fieldsToSearch = Array.isArray(searchableKeys) && searchableKeys.length > 0
      ? searchableKeys
      : normalizedColumns.map((c) => c.field);

    return data.filter((row) =>
      fieldsToSearch.some((field) => {
        const value = row?.[field];
        if (value == null || value === '') return false;
        return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, normalizedColumns, isSearchable, searchableKeys]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortable || !sortBy) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a?.[sortBy];
      const bValue = b?.[sortBy];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortOrder === 'asc' ? -1 : 1;
      if (bValue == null) return sortOrder === 'asc' ? 1 : -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [filteredData, sortBy, sortOrder, sortable]);

  // Handle sort
  const handleSort = (field) => {
    if (!sortable) return;
    
    const isAsc = sortBy === field && sortOrder === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    
    setSortBy(field);
    setSortOrder(newOrder);
    
    if (onSort) {
      onSort(field, newOrder);
    }
  };

  // Handle search
  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    if (onSearch) {
      onSearch(value);
    }
  };

  // Handle selection
  const handleSelectAll = (event) => {
    if (!selectable || !onSelectionChange) return;
    
    if (event.target.checked) {
      const newSelected = sortedData.map(row => row.id || row._id);
      onSelectionChange(newSelected);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id) => {
    if (!selectable || !onSelectionChange) return;
    
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    onSelectionChange(newSelected);
  };

  // Handle actions
  const handleActionClick = (action, row) => {
    if (onAction) {
      onAction(action, row);
    }
    setActionMenuAnchorEl(null);
  };

  // Render cell content
  const renderCellContent = (column, row) => {
    if (renderCell) {
      const customContent = renderCell(column, row);
      if (customContent !== undefined) return customContent;
    }

    // Column-level custom renderer support
    if (typeof column.render === 'function') {
      return column.render(row);
    }

    const raw = row?.[column.field];
    const value = column.valueMap ? (column.valueMap[raw] ?? raw) : raw;
    
    if (value == null || value === '') return '';
    
    // Handle different column types
    switch (column.type) {
      case 'avatar':
        return (
          <Avatar sx={{ width: 32, height: 32 }}>
            {typeof value === 'string' ? value[0]?.toUpperCase() : '?'}
          </Avatar>
        );
      
      case 'chip':
        return (
          <Chip
            label={value}
            size="small"
            color={column.chipColor || 'default'}
            variant={column.chipVariant || 'filled'}
          />
        );
      
      case 'status': {
        const statusColors = {
          active: 'success',
          inactive: 'error',
          pending: 'warning',
          completed: 'info',
          'in progress': 'info',
          'in-progress': 'info',
          open: 'warning',
          resolved: 'success',
          closed: 'default',
          done: 'success',
          testing: 'warning'
        };
        const lower = (value || '').toString().toLowerCase();
        return (
          <Chip
            label={value}
            size="small"
            color={statusColors[lower] || 'default'}
            icon={lower === 'active' ? <CheckCircle /> : 
                  lower === 'inactive' ? <Cancel /> :
                  lower === 'pending' ? <Warning /> : <Info />}
          />
        );
      }
      
      case 'date':
        return new Date(value).toLocaleDateString();
      
      case 'datetime':
        return new Date(value).toLocaleString();
      
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      
      case 'number':
        return new Intl.NumberFormat().format(value);
      
      case 'boolean':
        return value ? <CheckCircle color="success" /> : <Cancel color="error" />;
      
      default:
        return column.maxLength && value.length > column.maxLength
          ? `${value.substring(0, column.maxLength)}...`
          : value;
    }
  };

  // Render empty state
  const renderEmptyState = () => {
    if (renderEmpty) {
      return renderEmpty();
    }
    
    return (
      <TableRow>
        <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}>
          <Box display="flex" flexDirection="column" alignItems="center" py={4}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {emptyMessage || 'No data available'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {searchTerm ? 'No results match your search criteria' : 'There are no items to display'}
            </Typography>
          </Box>
        </TableCell>
      </TableRow>
    );
  };

  if (error) {
    return (
      <Alert severity="error" action={
        onRefresh && (
          <Button color="inherit" size="small" onClick={onRefresh}>
            Retry
          </Button>
        )
      }>
        {error}
      </Alert>
    );
  }

  return (
    <Paper elevation={1}>
      {/* Toolbar */}
      {(title || isSearchable || filterable || bulkActions.length > 0 || onRefresh) && (
        <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
          <Box sx={{ flex: '1 1 100%' }}>
            {title && (
              <Typography variant="h6" component="div">
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Search */}
            {isSearchable && (
              <TextField
                size="small"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 200 }}
              />
            )}
            
            {/* Filter */}
            {filterable && (
              <Tooltip title="Filter">
                <IconButton onClick={(e) => setFilterAnchorEl(e.currentTarget)}>
                  <FilterList />
                </IconButton>
              </Tooltip>
            )}
            
            {/* Bulk Actions */}
            {selected.length > 0 && bulkActions.map((action, index) => (
              <Tooltip key={index} title={action.label}>
                <IconButton onClick={() => handleActionClick(action, selected)}>
                  {action.icon}
                </IconButton>
              </Tooltip>
            ))}
            
            {/* Refresh */}
            {onRefresh && (
              <Tooltip title="Refresh">
                <IconButton onClick={onRefresh} disabled={loading}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Toolbar>
      )}

      {/* Table */}
      <TableContainer sx={{ maxHeight }}>
        <Table stickyHeader={stickyHeader} size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {/* Selection column */}
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < sortedData.length}
                    checked={sortedData.length > 0 && selected.length === sortedData.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              
              {/* Data columns */}
              {normalizedColumns.map((column) => (
                <TableCell
                  key={column.field}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                  sortDirection={sortBy === column.field ? sortOrder : false}
                >
                  {sortable && column.sortable !== false ? (
                    <TableSortLabel
                      active={sortBy === column.field}
                      direction={sortBy === column.field ? sortOrder : 'asc'}
                      onClick={() => handleSort(column.field)}
                    >
                      {column.headerName || column.field}
                    </TableSortLabel>
                  ) : (
                    column.headerName || column.field
                  )}
                </TableCell>
              ))}
              
              {/* Actions column */}
              {actions.length > 0 && (
                <TableCell align="right">Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}>
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : sortedData.length === 0 ? (
              renderEmptyState()
            ) : (
              sortedData.map((row, index) => {
                const rowId = row.id || row._id || index;
                const isSelected = selected.indexOf(rowId) !== -1;
                
                if (renderRow) {
                  const customRow = renderRow(row, index, isSelected);
                  if (customRow) return customRow;
                }
                
                return (
                  <TableRow
                    key={rowId}
                    hover
                    selected={isSelected}
                    sx={{ cursor: selectable ? 'pointer' : 'default' }}
                  >
                    {/* Selection cell */}
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowId)}
                        />
                      </TableCell>
                    )}
                    
                    {/* Data cells */}
                    {normalizedColumns.map((column) => (
                      <TableCell
                        key={column.field}
                        align={column.align || 'left'}
                      >
                        {renderCellContent(column, row)}
                      </TableCell>
                    ))}
                    
                    {/* Actions cell */}
                    {actions.length > 0 && (
                      <TableCell align="right">
                        {actions.length === 1 ? (
                          <Tooltip title={actions[0].label}>
                            <IconButton
                              size="small"
                              onClick={() => handleActionClick(actions[0], row)}
                            >
                              {actions[0].icon}
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              setActionMenuAnchorEl(e.currentTarget);
                              setActionMenuRow(row);
                            }}
                          >
                            <MoreVert />
                          </IconButton>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {paginated && !loading && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount || sortedData.length}
          rowsPerPage={effectiveRowsPerPage}
          page={page}
          onPageChange={onPageChange || (() => {})}
          onRowsPerPageChange={onRowsPerPageChange || (() => {})}
        />
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl)}
        onClose={() => setActionMenuAnchorEl(null)}
      >
        {actions.map((action, index) => (
          <MenuItem
            key={index}
            onClick={() => handleActionClick(action, actionMenuRow)}
          >
            {action.icon && <Box mr={1}>{action.icon}</Box>}
            {action.label}
          </MenuItem>
        ))}
      </Menu>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <MenuItem onClick={() => setFilterAnchorEl(null)}>
          Filter options coming soon...
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default DataTable;
