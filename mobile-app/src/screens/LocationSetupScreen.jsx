import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

export default function LocationSetupScreen({ navigation }) {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const currentStyles = styles(isDark);

  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      Alert.alert("Pending", "Still pending. Please wait for an administrator to assign your jurisdiction, then log in again.");
    }, 1000);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('swachhlens_token');
    await AsyncStorage.removeItem('swachhlens_role');
    await AsyncStorage.removeItem('swachhlens_state');
    await AsyncStorage.removeItem('swachhlens_district');
    await AsyncStorage.removeItem('swachhlens_city');
    await AsyncStorage.removeItem('swachhlens_ward');
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={currentStyles.safeArea}>
      <View style={currentStyles.container}>
        <View style={currentStyles.iconContainer}>
          <Feather name="shield" size={48} color="#f59e0b" />
        </View>

        <Text style={currentStyles.title}>Pending Approval</Text>
        <Text style={currentStyles.subtitle}>
          Your account has been created successfully. However, your official jurisdiction has not yet been assigned.
          {'\n\n'}
          Please wait for a Commissioner to approve your account and assign your sector.
        </Text>

        <View style={currentStyles.spacer} />

        <TouchableOpacity 
          style={currentStyles.checkBtn} 
          onPress={checkStatus}
          disabled={isChecking}
        >
          {isChecking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={currentStyles.checkBtnText}>Check Status</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={currentStyles.logoutBtn} 
          onPress={handleLogout}
        >
          <Text style={currentStyles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = (isDark) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: isDark ? '#f8fafc' : '#0f172a',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: isDark ? '#94a3b8' : '#64748b',
    marginBottom: 32,
    lineHeight: 22,
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
    maxHeight: 40,
  },
  checkBtn: {
    backgroundColor: '#f59e0b',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  checkBtnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#cbd5e1',
  },
  logoutBtnText: {
    color: isDark ? '#f8fafc' : '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  }
});
