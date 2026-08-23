import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { auth } from '../config/firebase';
import { Picker } from '@react-native-picker/picker';
import indiaLocations from '../data/india_locations.json';

export default function LocationSetupScreen({ navigation }) {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const currentStyles = styles(isDark);

  const [isLoading, setIsLoading] = useState(false);
  const [stateLoc, setStateLoc] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [ward, setWard] = useState('');

  const handleSave = async () => {
    if (!stateLoc || !district || !city) {
      Alert.alert('Error', 'Please fill in State, District, and City.');
      return;
    }

    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Not authenticated.');
      }
      const token = await user.getIdToken();

      const BASE_URL =
        (typeof process !== 'undefined' && process.env && (process.env.EXPO_PUBLIC_API_URL || process.env.API_BASE_URL)) ||
        (Platform.OS === 'web' ? 'http://localhost:8001' : 'http://10.0.2.2:8001');

      const response = await fetch(`${BASE_URL}/auth/jurisdiction/self`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ state: stateLoc, district, city, ward })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to update jurisdiction');
      }

      await AsyncStorage.setItem('swachhlens_state', stateLoc);
      await AsyncStorage.setItem('swachhlens_district', district);
      await AsyncStorage.setItem('swachhlens_city', city);
      await AsyncStorage.setItem('swachhlens_ward', ward);

      navigation.replace('MainApp');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save location setup.');
    } finally {
      setIsLoading(false);
    }
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
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={currentStyles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={currentStyles.iconContainer}>
            <Feather name="map-pin" size={48} color="#10b981" />
          </View>

          <Text style={currentStyles.title}>Set Jurisdiction</Text>
          <Text style={currentStyles.subtitle}>
            Please specify the region you are responsible for to continue.
          </Text>

          <View style={currentStyles.formContainer}>
            <View style={currentStyles.pickerContainer}>
              <Picker
                selectedValue={stateLoc}
                onValueChange={(val) => { setStateLoc(val); setDistrict(''); setCity(''); }}
                style={currentStyles.picker}
                dropdownIconColor={isDark ? '#f8fafc' : '#0f172a'}
              >
                <Picker.Item label="Select State *" value="" color={isDark ? '#64748b' : '#94a3b8'} />
                {indiaLocations.states.map((s) => (
                  <Picker.Item key={s.name} label={s.name} value={s.name} color={isDark ? '#f8fafc' : '#0f172a'} />
                ))}
              </Picker>
            </View>

            <View style={currentStyles.pickerContainer}>
              <Picker
                selectedValue={district}
                onValueChange={(val) => { setDistrict(val); setCity(''); }}
                enabled={!!stateLoc}
                style={currentStyles.picker}
                dropdownIconColor={isDark ? '#f8fafc' : '#0f172a'}
              >
                <Picker.Item label="Select District *" value="" color={isDark ? '#64748b' : '#94a3b8'} />
                {stateLoc && indiaLocations.states.find(s => s.name === stateLoc)?.districts.map((d) => (
                  <Picker.Item key={d.name} label={d.name} value={d.name} color={isDark ? '#f8fafc' : '#0f172a'} />
                ))}
              </Picker>
            </View>

            <View style={currentStyles.pickerContainer}>
              <Picker
                selectedValue={city}
                onValueChange={(val) => setCity(val)}
                enabled={!!district}
                style={currentStyles.picker}
                dropdownIconColor={isDark ? '#f8fafc' : '#0f172a'}
              >
                <Picker.Item label="Select City *" value="" color={isDark ? '#64748b' : '#94a3b8'} />
                {district && indiaLocations.states.find(s => s.name === stateLoc)?.districts.find(d => d.name === district)?.cities.map((c) => (
                  <Picker.Item key={c} label={c} value={c} color={isDark ? '#f8fafc' : '#0f172a'} />
                ))}
              </Picker>
            </View>
            <TextInput
              style={currentStyles.input}
              placeholder="Ward (Optional)"
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              value={ward}
              onChangeText={setWard}
            />
          </View>

          <View style={currentStyles.spacer} />

          <TouchableOpacity 
            style={currentStyles.saveBtn} 
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={currentStyles.saveBtnText}>Save & Continue</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={currentStyles.logoutBtn} 
            onPress={handleLogout}
          >
            <Text style={currentStyles.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = (isDark) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
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
  formContainer: {
    width: '100%',
    marginBottom: 24,
  },
  input: {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#cbd5e1',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: isDark ? '#f8fafc' : '#0f172a',
    marginBottom: 16,
  },
  pickerContainer: {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#cbd5e1',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    height: 56,
    justifyContent: 'center'
  },
  picker: {
    color: isDark ? '#f8fafc' : '#0f172a',
    width: '100%',
    height: '100%',
  },
  spacer: {
    flex: 1,
    maxHeight: 40,
  },
  saveBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  saveBtnText: {
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
