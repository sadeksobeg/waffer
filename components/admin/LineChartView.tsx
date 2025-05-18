import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '@/contexts/ThemeContext';

interface LineChartViewProps {
  data: {
    labels: string[];
    datasets: {
      data: number[];
    }[];
  };
  width: number;
  height: number;
  yAxisLabel: string;
  yAxisSuffix: string;
  chartColors?: string[];
}

export default function LineChartView({ 
  data, 
  width, 
  height, 
  yAxisLabel, 
  yAxisSuffix,
  chartColors
}: LineChartViewProps) {
  const { theme } = useTheme();
  
  const chartConfig = {
    backgroundGradientFrom: theme.colors.card,
    backgroundGradientTo: theme.colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => chartColors?.[0] || theme.colors.primary[500],
    labelColor: (opacity = 1) => theme.colors.text,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: chartColors?.[0] || theme.colors.primary[500],
    },
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: theme.colors.border,
    },
  };
  
  return (
    <View style={lineChartStyles.container}>
      <Text style={[lineChartStyles.title, { color: theme.colors.text }]}>Monthly Activity</Text>
      <LineChart
        data={data}
        width={width}
        height={height}
        chartConfig={chartConfig}
        bezier
        style={lineChartStyles.chart}
        yAxisLabel={yAxisLabel}
        yAxisSuffix={yAxisSuffix}
      />
    </View>
  );
}

const lineChartStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
});