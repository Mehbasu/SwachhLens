import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Sun, Moon, Monitor } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeSwitcher = () => {
  const { theme, setTheme, colorScheme } = useTheme();

  const isDark = colorScheme === 'dark';
  const borderColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)';

  return (
    <View style={[styles.container, { borderColor }]}>
      <Option
        active={theme === 'system'}
        onPress={() => setTheme('system')}
        icon={<Monitor size={16} color={theme === 'system' ? (isDark ? '#fff' : '#000') : '#888'} />}
        borderRight={true}
        borderColor={borderColor}
      />
      <Option
        active={theme === 'light'}
        onPress={() => setTheme('light')}
        icon={<Sun size={16} color={theme === 'light' ? (isDark ? '#fff' : '#000') : '#888'} />}
        borderRight={true}
        borderColor={borderColor}
      />
      <Option
        active={theme === 'dark'}
        onPress={() => setTheme('dark')}
        icon={<Moon size={16} color={theme === 'dark' ? (isDark ? '#fff' : '#000') : '#888'} />}
        borderRight={false}
      />
    </View>
  );
};

const Option = ({ active, onPress, icon, borderRight, borderColor }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        borderRight && { borderRightWidth: 1, borderRightColor: borderColor },
        pressed && { opacity: 0.7 }
      ]}
    >
      {icon}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  option: {
    width: 32,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
