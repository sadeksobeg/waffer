import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Typography,
  LinearProgress,
  Chip,
  Avatar
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';

// Define the coupon type
interface Coupon {
  id: string;
  title: string;
  merchant: {
    name: string;
    image: string;
  };
  category: string;
  issuances: number;
  redemptions: number;
  redemptionRate: number;
  revenue: number;
}

// Mock data for coupon performance
const generateMockCouponData = (): Coupon[] => {
  const coupons = [
    {
      id: 'coupon1',
      title: '20% Off All Clothing',
      merchant: {
        name: 'Fashion Hub',
        image: 'https://via.placeholder.com/40',
      },
      category: 'fashion',
      issuances: 450,
      redemptions: 320,
      redemptionRate: 71.1,
      revenue: 4800,
    },
    {
      id: 'coupon2',
      title: 'Free Coffee with Breakfast',
      merchant: {
        name: 'Café Delight',
        image: 'https://via.placeholder.com/40',
      },
      category: 'coffee',
      issuances: 380,
      redemptions: 210,
      redemptionRate: 55.3,
      revenue: 1890,
    },
    {
      id: 'coupon3',
      title: '30% Off Smartphones',
      merchant: {
        name: 'Tech World',
        image: 'https://via.placeholder.com/40',
      },
      category: 'electronics',
      issuances: 250,
      redemptions: 180,
      redemptionRate: 72.0,
      revenue: 9000,
    },
    {
      id: 'coupon4',
      title: '2 Months Free Membership',
      merchant: {
        name: 'Fitness First',
        image: 'https://via.placeholder.com/40',
      },
      category: 'fitness',
      issuances: 200,
      redemptions: 85,
      redemptionRate: 42.5,
      revenue: 5100,
    },
    {
      id: 'coupon5',
      title: '15% Off Flight Bookings',
      merchant: {
        name: 'Travel Paradise',
        image: 'https://via.placeholder.com/40',
      },
      category: 'travel',
      issuances: 320,
      redemptions: 190,
      redemptionRate: 59.4,
      revenue: 12350,
    },
    {
      id: 'coupon6',
      title: 'Buy One Get One Free Pizza',
      merchant: {
        name: 'Pizza Palace',
        image: 'https://via.placeholder.com/40',
      },
      category: 'food',
      issuances: 520,
      redemptions: 410,
      redemptionRate: 78.8,
      revenue: 6150,
    },
    {
      id: 'coupon7',
      title: '50% Off Second Item',
      merchant: {
        name: 'Fashion Hub',
        image: 'https://via.placeholder.com/40',
      },
      category: 'fashion',
      issuances: 350,
      redemptions: 220,
      redemptionRate: 62.9,
      revenue: 3300,
    },
    {
      id: 'coupon8',
      title: '$10 Off Orders Over $50',
      merchant: {
        name: 'Grocery Express',
        image: 'https://via.placeholder.com/40',
      },
      category: 'grocery',
      issuances: 480,
      redemptions: 380,
      redemptionRate: 79.2,
      revenue: 7600,
    },
  ];

  return coupons;
};

interface CouponPerformanceTableProps {
  startDate: Date | null;
  endDate: Date | null;
}

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof Coupon | 'merchant';
  label: string;
  numeric: boolean;
}

export default function CouponPerformanceTable({ startDate, endDate }: CouponPerformanceTableProps) {
  const { t } = useTranslation(['common', 'analytics']);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<string>('redemptionRate');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // In a real app, you would fetch data based on the date range
  const coupons = generateMockCouponData();

  const headCells: HeadCell[] = [
    { id: 'title', numeric: false, label: t('analytics:table.coupon') },
    { id: 'merchant', numeric: false, label: t('analytics:table.merchant') },
    { id: 'issuances', numeric: true, label: t('analytics:table.issuances') },
    { id: 'redemptions', numeric: true, label: t('analytics:table.redemptions') },
    { id: 'redemptionRate', numeric: true, label: t('analytics:table.redemptionRate') },
    { id: 'revenue', numeric: true, label: t('analytics:table.revenue') },
  ];

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Sort function
  function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  function getComparator(
    order: Order,
    orderBy: string,
  ): (a: Coupon, b: Coupon) => number {
    return order === 'desc'
      ? (a, b) => {
          // Special handling for merchant which is an object
          if (orderBy === 'merchant') {
            return descendingComparator(a.merchant, b.merchant, 'name');
          }
          return descendingComparator(a, b, orderBy as keyof Coupon);
        }
      : (a, b) => {
          // Special handling for merchant which is an object
          if (orderBy === 'merchant') {
            return -descendingComparator(a.merchant, b.merchant, 'name');
          }
          return -descendingComparator(a, b, orderBy as keyof Coupon);
        };
  }

  // Sorting logic
  const sortedCoupons = coupons.sort(getComparator(order, orderBy));

  // Pagination
  const paginatedCoupons = sortedCoupons.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Box>
      <TableContainer>
        <Table aria-labelledby="tableTitle" size="medium">
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.numeric ? 'right' : 'left'}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : 'asc'}
                    onClick={() => handleRequestSort(headCell.id)}
                  >
                    {headCell.label}
                    {orderBy === headCell.id ? (
                      <Box component="span" sx={visuallyHidden}>
                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                      </Box>
                    ) : null}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCoupons.map((coupon) => (
              <TableRow
                hover
                key={coupon.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {coupon.title}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={coupon.merchant.image}
                      alt={coupon.merchant.name}
                      sx={{ width: 24, height: 24, mr: 1 }}
                    />
                    {coupon.merchant.name}
                  </Box>
                </TableCell>
                <TableCell align="right">{coupon.issuances}</TableCell>
                <TableCell align="right">{coupon.redemptions}</TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Box sx={{ width: '60%', mr: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={coupon.redemptionRate}
                        color={
                          coupon.redemptionRate > 70 ? 'success' :
                          coupon.redemptionRate > 40 ? 'primary' : 'warning'
                        }
                        sx={{ height: 8, borderRadius: 5 }}
                      />
                    </Box>
                    <Typography variant="body2">
                      {coupon.redemptionRate.toFixed(1)}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">${coupon.revenue.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={coupons.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
}
