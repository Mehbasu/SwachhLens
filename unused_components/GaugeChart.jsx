import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

export default function GaugeChart({ 
  percentage = 86, 
  title = "Completion Rate", 
  size = 200,
  strokeWidth = 24
}) {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = Math.PI * radius; // length of a semi-circle
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Path for a semi-circle (from left middle, up to top, down to right middle)
  const d = `
    M ${strokeWidth / 2} ${center}
    A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${center}
  `;

  return (
    <View style={[styles.container, { width: size, height: center + 20 }]}>
      <Svg width={size} height={center + 10}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#3b82f6" stopOpacity="1" />
            <Stop offset="1" stopColor="#2563eb" stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#f1f5f9" stopOpacity="1" />
            <Stop offset="1" stopColor="#e2e8f0" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Background Arc */}
        <Path
          d={d}
          stroke="url(#bgGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {/* Foreground Progress Arc */}
        <Path
          d={d}
          stroke="url(#grad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </Svg>
      
      <View style={[styles.textContainer, { top: center - 40 }]}>
        <Text style={styles.percentageText}>{percentage}%</Text>
        <Text style={styles.titleText}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'relative',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -1,
  },
  titleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
});
