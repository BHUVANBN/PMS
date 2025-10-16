import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box } from '@mui/material';

export default function GlassTable({ columns = [], rows = [], height = 450, loading = false, emptyText = 'No data', footer, sx = {}, ...rest }) {
  return (
    <Paper elevation={1} sx={{ p: 0, overflow: 'hidden', ...sx }} {...rest}>
      <TableContainer sx={{ maxHeight: height }}>
        <Table stickyHeader size="medium" sx={{
          '& th, & td': { height: 56, fontSize: 14 },
          '& thead th': { fontWeight: 600, height: 48 }
        }}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.field || col.key} align={col.align || 'left'} sx={{ width: col.width }}>{col.headerName || col.label || col.field}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <Typography variant="body2" color="text.secondary">Loading...</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">{emptyText}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => (
                <TableRow key={row.id || row._id || idx} hover>
                  {columns.map((col) => (
                    <TableCell key={col.field || col.key} align={col.align || 'left'}>
                      {typeof col.render === 'function' ? col.render(row) : (row[col.field] ?? row[col.key])}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {footer}
    </Paper>
  );
}
