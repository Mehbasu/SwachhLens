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
          paddingVertical: isSmall ? 2 : 4,
          paddingHorizontal: isSmall ? 8 : 10,
        }
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: config.color,
            fontSize: isSmall ? 10 : 12,
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
    borderRadius: 6,
    borderWidth: 1,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.2,
  }
});
