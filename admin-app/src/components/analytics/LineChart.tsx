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
  LineChart as MuiLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface DataPoint {
  [key: string]: any;
}

interface LineChartProps {
  title: string;
  data: DataPoint[];
  xAxisKey: string;
  series: {
    name: string;
    dataKey: string;
    color?: string;
  }[];
  loading?: boolean;
  height?: number;
  subtitle?: string;
}

const LineChart: React.FC<LineChartProps> = ({
  title,
  data,
  xAxisKey,
  series,
  loading = false,
  height = 300,
  subtitle
}) => {
  const theme = useTheme();
  
  // Generate default colors if not provided
  const defaultColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main
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
            <Skeleton variant="rectangular" width="100%" height="100%" />
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
            <MuiLineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey={xAxisKey} 
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                stroke={theme.palette.divider}
              />
              <YAxis 
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                stroke={theme.palette.divider}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 4,
                  boxShadow: theme.shadows[3],
                }}
                labelStyle={{ color: theme.palette.text.primary }}
                itemStyle={{ color: theme.palette.text.primary }}
              />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: 10,
                  fontSize: 12,
                  color: theme.palette.text.secondary
                }} 
              />
              {series.map((s, index) => (
                <Line
                  key={s.dataKey}
                  type="monotone"
                  dataKey={s.dataKey}
                  name={s.name}
                  stroke={s.color || defaultColors[index % defaultColors.length]}
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              ))}
            </MuiLineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default LineChart;
