import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { statusConfig } from '../data/mockData';

export default function StatusBadge({ status, size = 'medium' }) {
  const config = statusConfig[status] || statusConfig.submitted;

  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bgLight,
          borderColor: config.borderColor,
          paddingVertical: isSmall ? 2 : 5,
          paddingHorizontal: isSmall ? 8 : 12,
        }
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text
        style={[
          styles.text,
          {
            color: config.color,
            fontSize: isSmall ? 11 : 12.5,
          }
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 20,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.2,
  }
});
