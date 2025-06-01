import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Typography,
  Divider,
  Chip
} from '@mui/material';

interface Column {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  format?: (value: any) => React.ReactNode;
  minWidth?: number;
}

interface DataTableProps {
  title: string;
  columns: Column[];
  data: any[];
  loading?: boolean;
  subtitle?: string;
  maxHeight?: number;
}

const DataTable: React.FC<DataTableProps> = ({
  title,
  columns,
  data,
  loading = false,
  subtitle,
  maxHeight
}) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader 
        title={title} 
        titleTypographyProps={{ variant: 'h6' }}
        subheader={subtitle}
        subheaderTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
      />
      <Divider />
      <CardContent sx={{ flex: 1, p: 0, '&:last-child': { pb: 0 } }}>
        {loading ? (
          <Box sx={{ p: 2 }}>
            <Skeleton variant="rectangular" width="100%" height={40} />
            <Skeleton variant="rectangular" width="100%" height={40} sx={{ mt: 1 }} />
            <Skeleton variant="rectangular" width="100%" height={40} sx={{ mt: 1 }} />
            <Skeleton variant="rectangular" width="100%" height={40} sx={{ mt: 1 }} />
            <Skeleton variant="rectangular" width="100%" height={40} sx={{ mt: 1 }} />
          </Box>
        ) : data.length === 0 ? (
          <Box 
            sx={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              p: 3
            }}
          >
            <Typography variant="body2" color="textSecondary">
              No data available
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight, boxShadow: 'none', height: '100%' }}>
            <Table stickyHeader aria-label={`${title} table`} size="small">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align || 'left'}
                      style={{ minWidth: column.minWidth }}
                      sx={{ 
                        fontWeight: 'bold',
                        backgroundColor: (theme) => theme.palette.background.default
                      }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow 
                    hover 
                    role="checkbox" 
                    tabIndex={-1} 
                    key={index}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align || 'left'}>
                          {column.format ? column.format(value) : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default DataTable;
