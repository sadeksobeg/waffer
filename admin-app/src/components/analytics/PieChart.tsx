import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  useTheme,
  Skeleton,
  Typography,
  Divider
} from '@mui/material';
import { 
  PieChart as MuiPieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface DataPoint {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  title: string;
  data: DataPoint[];
  loading?: boolean;
  height?: number;
  subtitle?: string;
  dataKey?: string;
  nameKey?: string;
  innerRadius?: number;
  outerRadius?: number;
}

const PieChart: React.FC<PieChartProps> = ({
  title,
  data,
  loading = false,
  height = 300,
  subtitle,
  dataKey = 'value',
  nameKey = 'name',
  innerRadius = 60,
  outerRadius = 80
}) => {
  const theme = useTheme();
  
  // Generate default colors if not provided
  const defaultColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.primary.light,
    theme.palette.secondary.light,
    theme.palette.success.light,
    theme.palette.error.light,
    theme.palette.warning.light,
    theme.palette.info.light,
  ];
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader 
        title={title} 
        titleTypographyProps={{ variant: 'h6' }}
        subheader={subtitle}
        subheaderTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
      />
      <Divider />
      <CardContent sx={{ height: height, pt: 2 }}>
        {loading ? (
          <Box sx={{ width: '100%', height: '100%' }}>
            <Skeleton variant="circular" width="100%" height="100%" />
          </Box>
        ) : data.length === 0 ? (
          <Box 
            sx={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <Typography variant="body2" color="textSecondary">
              No data available
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <MuiPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                fill="#8884d8"
                dataKey={dataKey}
                nameKey={nameKey}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || defaultColors[index % defaultColors.length]} 
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 4,
                  boxShadow: theme.shadows[3],
                }}
                formatter={(value: number) => [`${value}`, 'Value']}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ 
                  paddingTop: 20,
                  fontSize: 12,
                  color: theme.palette.text.secondary
                }}
              />
            </MuiPieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default PieChart;
