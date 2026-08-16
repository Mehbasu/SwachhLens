import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { ReportsProvider } from './src/context/ReportsContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ReportScreen from './src/screens/ReportScreen';
import ConfirmationScreen from './src/screens/ConfirmationScreen';
import MyReportsScreen from './src/screens/MyReportsScreen';
import ReportDetailScreen from './src/screens/ReportDetailScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Custom Bottom Tab Bar Icons helper
function TabIcon({ emoji, label, focused, isCenter = false, currentStyles }) {
  if (isCenter) {
    return (
      <View style={currentStyles.centerButtonWrapper}>
        <View style={currentStyles.centerButton}>
          <Text style={currentStyles.centerEmoji}>📷</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={currentStyles.tabIconContainer}>
      <Text style={[currentStyles.tabEmoji, focused && currentStyles.tabEmojiFocused]}>
        {emoji}
      </Text>
      <Text style={[currentStyles.tabLabel, focused && currentStyles.tabLabelFocused]}>
        {label}
      </Text>
    </View>
  );
}

// Bottom Tab Navigator Component
function BottomTabNavigator() {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const currentStyles = styles(isDark);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: currentStyles.tabBarStyle,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} currentStyles={currentStyles} />
          ),
        }}
      />

      <Tab.Screen
        name="MyReportsTab"
        component={MyReportsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📋" label="My Reports" focused={focused} currentStyles={currentStyles} />
          ),
        }}
      />

      {/* Prominent Center Camera Button */}
      <Tab.Screen
        name="ReportTab"
        component={ReportScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon isCenter focused={focused} currentStyles={currentStyles} />
          ),
        }}
      />

      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🔔" label="Alerts" focused={focused} currentStyles={currentStyles} />
          ),
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label="Profile" focused={focused} currentStyles={currentStyles} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Main App Navigation Root
function RootNavigator() {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const bgColor = isDark ? '#0f172a' : '#f1f5f9';

  return (
    <NavigationContainer>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: bgColor }
        }}
      >
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
          <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ReportsProvider>
        <RootNavigator />
      </ReportsProvider>
    </ThemeProvider>
  );
}

const styles = (isDark) => StyleSheet.create({
  tabBarStyle: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderTopColor: isDark ? '#334155' : '#e2e8f0',
    borderTopWidth: 1,
    height: 68,
    paddingBottom: 8,
    paddingTop: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabEmoji: {
    fontSize: 20,
    opacity: 0.6,
  },
  tabEmojiFocused: {
    opacity: 1,
    transform: [{ scale: 1.15 }],
  },
  tabLabel: {
    fontSize: 10,
    color: isDark ? '#94a3b8' : '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  tabLabelFocused: {
    color: '#10b981',
    fontWeight: '700',
  },
  centerButtonWrapper: {
    top: -18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 4,
    borderColor: isDark ? '#0f172a' : '#f1f5f9',
  },
  centerEmoji: {
    fontSize: 26,
  }
});
