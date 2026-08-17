import React from 'react';
import { View, Text, StyleSheet, Animated, Platform, TouchableOpacity, LogBox } from 'react-native';

LogBox.ignoreLogs([
  "Passing an object as the argument to 'navigate' is deprecated",
]);
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CurvedBottomBar } from 'react-native-curved-bottom-bar';
import { StatusBar } from 'expo-status-bar';

import { ReportsProvider } from './src/context/ReportsContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { Home, ClipboardList, Camera, Bell, User } from 'lucide-react-native';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ReportScreen from './src/screens/ReportScreen';
import ConfirmationScreen from './src/screens/ConfirmationScreen';
import MyReportsScreen from './src/screens/MyReportsScreen';
import ReportDetailScreen from './src/screens/ReportDetailScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import SplashScreen from './src/screens/SplashScreen';

// Custom Tab Bar Rendering
const _renderIcon = (routeName, selectedTab, isDark) => {
  const activeColor = '#3b82f6';
  const inactiveColor = isDark ? '#94a3b8' : '#64748b';
  const color = routeName === selectedTab ? activeColor : inactiveColor;
  let IconComp = Home;

  switch (routeName) {
    case 'HomeTab': IconComp = Home; break;
    case 'MyReportsTab': IconComp = ClipboardList; break;
    case 'NotificationsTab': IconComp = Bell; break;
    case 'ProfileTab': IconComp = User; break;
  }

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <IconComp size={24} color={color} />
      {routeName === selectedTab && (
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: activeColor, marginTop: 4, position: 'absolute', bottom: -10 }} />
      )}
    </View>
  );
};

// Bottom Tab Navigator Component
function BottomTabNavigator() {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const bgColor = isDark ? '#1e293b' : '#ffffff';

  return (
    <CurvedBottomBar.Navigator
      type="DOWN"
      style={{
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        elevation: 0,
      }}
      shadowStyle={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
      }}
      height={65}
      circleWidth={60}
      bgColor={bgColor}
      initialRouteName="HomeTab"
      borderTopLeftRight
      screenOptions={{ headerShown: false }}
      renderCircle={({ selectedTab, navigate }) => (
        <View style={[styles.btnCircleUp, { backgroundColor: '#3b82f6', borderColor: isDark ? '#0f172a' : '#f1f5f9' }]}>
          <TouchableOpacity
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            onPress={() => navigate('ReportTab')}
          >
            <Camera size={28} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}
      tabBar={({ routeName, selectedTab, navigate }) => {
        return (
          <TouchableOpacity
            onPress={() => navigate(routeName)}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            {_renderIcon(routeName, selectedTab, isDark)}
          </TouchableOpacity>
        );
      }}
    >
      <CurvedBottomBar.Screen
        name="HomeTab"
        position="LEFT"
        component={HomeScreen}
      />

      <CurvedBottomBar.Screen
        name="MyReportsTab"
        position="LEFT"
        component={MyReportsScreen}
      />

      <CurvedBottomBar.Screen
        name="ReportTab"
        component={ReportScreen}
        position="CENTER"
      />

      <CurvedBottomBar.Screen
        name="NotificationsTab"
        position="RIGHT"
        component={NotificationsScreen}
      />

      <CurvedBottomBar.Screen
        name="ProfileTab"
        position="RIGHT"
        component={ProfileScreen}
      />
    </CurvedBottomBar.Navigator>
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
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: bgColor }
        }}
      >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
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

const Stack = createNativeStackNavigator();

const styles = StyleSheet.create({
  btnCircleUp: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    bottom: 30,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  }
});
