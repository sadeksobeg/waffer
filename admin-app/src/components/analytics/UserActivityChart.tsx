import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { format, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';

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
    const newUsers = Math.floor(Math.random() * 30) + 5;
    const activeUsers = Math.floor(Math.random() * 100) + 50;
    
    return {
      date,
      name: format(date, dateFormat),
      newUsers,
      activeUsers,
    };
  });
};

interface UserActivityChartProps {
  startDate: Date | null;
  endDate: Date | null;
}

export default function UserActivityChart({ startDate, endDate }: UserActivityChartProps) {
  const theme = useTheme();
  
  const data = generateMockData(startDate, endDate);

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="newUsers" 
            name="New Users" 
            fill={theme.palette.primary.main} 
          />
          <Bar 
            dataKey="activeUsers" 
            name="Active Users" 
            fill={theme.palette.info.main} 
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
