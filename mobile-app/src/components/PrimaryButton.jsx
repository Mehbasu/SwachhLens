import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon: IconComponent,
  style
}) {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const currentStyles = styles(isDark);
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';

  const getBgColor = () => {
    if (disabled) return isDark ? '#334155' : '#cbd5e1';
    if (isSecondary) return isDark ? '#1e293b' : '#f1f5f9';
    if (isOutline) return 'transparent';
    return '#10b981'; // Civic Green primary
  };

  const getTextColor = () => {
    if (disabled) return isDark ? '#94a3b8' : '#64748b';
    if (isOutline) return '#10b981';
    if (isSecondary) return isDark ? '#f8fafc' : '#0f172a';
    return '#ffffff';
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        currentStyles.button,
        {
          backgroundColor: getBgColor(),
          borderColor: isOutline ? '#10b981' : (isSecondary ? (isDark ? '#334155' : '#e2e8f0') : 'transparent'),
          borderWidth: isOutline || isSecondary ? 1.5 : 0,
        },
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={currentStyles.content}>
          {IconComponent && (
            <View style={currentStyles.iconWrapper}>
              <IconComponent size={20} color={getTextColor()} />
            </View>
          )}
          <Text style={[currentStyles.text, { color: getTextColor() }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = (isDark) => StyleSheet.create({
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
