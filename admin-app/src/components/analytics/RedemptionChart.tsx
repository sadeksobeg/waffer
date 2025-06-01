import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, useMediaQuery } from '@mui/material';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { format, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, isSameDay, isSameMonth } from 'date-fns';

// Generate mock data based on date range
const generateMockData = (startDate: Date | null, endDate: Date | null) => {
  if (!startDate || !endDate) {
    return [];
  }
  
  // Determine interval based on date range
  const days = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  let interval: Date[];
  let dateFormat: string;
  
  if (days <= 31) {
    // Daily data for ranges up to a month
    interval = eachDayOfInterval({ start: startDate, end: endDate });
    dateFormat = 'MMM d';
  } else if (days <= 90) {
    // Weekly data for ranges up to 3 months
    interval = eachWeekOfInterval({ start: startDate, end: endDate });
    dateFormat = 'MMM d';
  } else {
    // Monthly data for longer ranges
    interval = eachMonthOfInterval({ start: startDate, end: endDate });
    dateFormat = 'MMM yyyy';
  }
  
  // Generate random data for each interval point
  return interval.map(date => {
    const issuances = Math.floor(Math.random() * 50) + 30;
    const redemptions = Math.floor(Math.random() * issuances);
    
    return {
      date,
      name: format(date, dateFormat),
      issuances,
      redemptions,
      redemptionRate: Math.round((redemptions / issuances) * 100),
    };
  });
};

interface RedemptionChartProps {
  startDate: Date | null;
  endDate: Date | null;
}

export default function RedemptionChart({ startDate, endDate }: RedemptionChartProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const data = generateMockData(startDate, endDate);

  return (
    <Box sx={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: isMobile ? 10 : 12 }}
            interval={isMobile ? 'preserveStartEnd' : 0}
          />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'redemptionRate') {
                return [`${value}%`, 'Redemption Rate'];
              }
              return [value, name === 'issuances' ? 'Issuances' : 'Redemptions'];
            }}
          />
          <Legend />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="issuances"
            name="Issuances"
            stroke={theme.palette.primary.main}
            fill={`${theme.palette.primary.main}20`}
            activeDot={{ r: 8 }}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="redemptions"
            name="Redemptions"
            stroke={theme.palette.secondary.main}
            fill={`${theme.palette.secondary.main}20`}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="redemptionRate"
            name="Redemption Rate (%)"
            stroke={theme.palette.success.main}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
