import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon: IconComponent,
  style
}) {
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';

  const getBgColor = () => {
    if (disabled) return '#334155';
    if (isSecondary) return '#1e293b';
    if (isOutline) return 'transparent';
    return '#10b981'; // Civic Green primary
  };

  const getTextColor = () => {
    if (disabled) return '#94a3b8';
    if (isOutline) return '#10b981';
    return '#ffffff';
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBgColor(),
          borderColor: isOutline ? '#10b981' : 'transparent',
          borderWidth: isOutline ? 1.5 : 0,
        },
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.content}>
          {IconComponent && (
            <View style={styles.iconWrapper}>
              <IconComponent size={20} color={getTextColor()} />
            </View>
          )}
          <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  }
});
