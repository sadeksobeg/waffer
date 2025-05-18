import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

interface QRCodeProps {
  value: string;
  size: number;
  color?: string;
  backgroundColor?: string;
}

// Simple QR code implementation for demo purposes
// In a real app, you would use a proper QR code library
export default function QRCode({ value, size, color = '#000000', backgroundColor = '#ffffff' }: QRCodeProps) {
  // This is just a placeholder that generates a grid pattern
  // In a real implementation, use react-native-qrcode-svg or similar
  
  const cellSize = Math.floor(size / 30);
  const cells = [];
  const padding = 4;
  
  // Generate a deterministic pattern based on the string
  const hash = value.split('').reduce((acc, char) => {
    return (acc * 31 + char.charCodeAt(0)) & 0xffffffff;
  }, 0);
  
  for (let i = 0; i < 25; i++) {
    for (let j = 0; j < 25; j++) {
      // Fixed pattern for corners and position markers
      if ((i < 7 && j < 7) || // top-left
          (i < 7 && j > 17) || // top-right
          (i > 17 && j < 7)) { // bottom-left
        
        if ((i === 0 || i === 6 || j === 0 || j === 6) || // outer frame
            (i >= 2 && i <= 4 && j >= 2 && j <= 4)) { // inner square
          cells.push({ x: j, y: i });
        }
      } 
      // Random pattern based on hash
      else if (((hash + i * j) % 3) === 0) {
        cells.push({ x: j, y: i });
      }
    }
  }
  
  // Add fixed data pattern
  for (let i = 19; i < 25; i++) {
    if (i % 2 === 0) cells.push({ x: 18, y: i });
  }
  
  return (
    <View style={[qrStyles.container, { backgroundColor, width: size, height: size }]}>
      <Svg width={size} height={size}>
        {cells.map((cell, index) => (
          <Rect
            key={index}
            x={padding + cell.x * cellSize}
            y={padding + cell.y * cellSize}
            width={cellSize - 1}
            height={cellSize - 1}
            fill={color}
          />
        ))}
      </Svg>
    </View>
  );
}

const qrStyles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
});