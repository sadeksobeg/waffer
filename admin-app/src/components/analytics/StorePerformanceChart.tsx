import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend 
} from 'recharts';

// Mock data for store performance
const generateMockStoreData = () => {
  return [
    { name: 'Fashion Hub', value: 320, redemptions: 240 },
    { name: 'Café Delight', value: 210, redemptions: 180 },
    { name: 'Tech World', value: 180, redemptions: 120 },
    { name: 'Fitness First', value: 150, redemptions: 90 },
    { name: 'Travel Paradise', value: 190, redemptions: 150 },
  ];
};

interface StorePerformanceChartProps {
  startDate: Date | null;
  endDate: Date | null;
}

export default function StorePerformanceChart({ startDate, endDate }: StorePerformanceChartProps) {
  const theme = useTheme();
  
  // In a real app, you would fetch data based on the date range
  const data = generateMockStoreData();
  
  // Colors for the pie chart
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name, props) => [`${value} coupons`, props.payload.name]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
}
