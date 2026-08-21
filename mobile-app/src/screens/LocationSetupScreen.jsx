import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useTheme } from '../contexts/ThemeContext';
import indiaLocations from '../data/india_locations.json';

export default function LocationSetupScreen({ navigation }) {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const currentStyles = styles(isDark);

  const [isLocating, setIsLocating] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    // Attempt auto-location on mount
    autoLocate();
  }, []);

  const autoLocate = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please select your location manually.');
        setIsLocating(false);
        return;
      }

      const currentLoc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = currentLoc.coords;
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (geocode.length > 0) {
        const place = geocode[0];
        const foundState = place.region || place.administrativeArea;
        const foundDistrict = place.subregion || place.city;
        const foundCity = place.city || place.subregion;

        if (foundState) {
          Alert.alert(
            'Location Detected',
            `We detected you are in ${foundCity || foundDistrict}, ${foundState}. Is this correct?`,
            [
              {
                text: 'No, let me choose',
                style: 'cancel',
              },
              {
                text: 'Yes',
                onPress: () => {
                  setSelectedState(foundState);
                  setSelectedDistrict(foundDistrict || '');
                  setSelectedCity(foundCity || '');
                  handleContinue();
                }
              }
            ]
          );
        }
      }
    } catch (error) {
      console.log('Auto location failed', error);
    } finally {
      setIsLocating(false);
    }
  };

  // Update districts when state changes
  useEffect(() => {
    if (selectedState) {
      const stateObj = indiaLocations.states.find(s => s.name === selectedState);
      setDistricts(stateObj ? stateObj.districts : []);
      setSelectedDistrict('');
      setCities([]);
      setSelectedCity('');
    }
  }, [selectedState]);

  // Update cities when district changes
  useEffect(() => {
    if (selectedDistrict) {
      const districtObj = districts.find(d => d.name === selectedDistrict);
      setCities(districtObj ? districtObj.cities : []);
      setSelectedCity('');
    }
  }, [selectedDistrict]);

  const handleContinue = () => {
    if (!selectedState || !selectedDistrict || !selectedCity) {
      Alert.alert('Error', 'Please select State, District, and City to continue.');
      return;
    }
    
    // Normally you would save this to the backend or context here.
    // For now, we proceed to MainTabs
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={currentStyles.safeArea}>
      <View style={currentStyles.container}>
        <Text style={currentStyles.title}>Set Your Jurisdiction</Text>
        <Text style={currentStyles.subtitle}>
          This helps us show you relevant complaints in your area.
        </Text>

        <TouchableOpacity 
          style={currentStyles.autoBtn} 
          onPress={autoLocate}
          disabled={isLocating}
        >
          {isLocating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={currentStyles.autoBtnText}>📍 Detect My Location Automatically</Text>
          )}
        </TouchableOpacity>

        <View style={currentStyles.dividerContainer}>
          <View style={currentStyles.dividerLine} />
          <Text style={currentStyles.dividerText}>OR CHOOSE MANUALLY</Text>
          <View style={currentStyles.dividerLine} />
        </View>

        <Text style={currentStyles.label}>State</Text>
        <View style={currentStyles.pickerContainer}>
          <Picker
            selectedValue={selectedState}
            onValueChange={(itemValue) => setSelectedState(itemValue)}
            style={currentStyles.picker}
            dropdownIconColor={isDark ? "#fff" : "#000"}
          >
            <Picker.Item label="Select State..." value="" />
            {indiaLocations.states.map((s, idx) => (
              <Picker.Item key={idx} label={s.name} value={s.name} />
            ))}
          </Picker>
        </View>

        <Text style={currentStyles.label}>District</Text>
        <View style={currentStyles.pickerContainer}>
          <Picker
            selectedValue={selectedDistrict}
            onValueChange={(itemValue) => setSelectedDistrict(itemValue)}
            enabled={districts.length > 0}
            style={currentStyles.picker}
            dropdownIconColor={isDark ? "#fff" : "#000"}
          >
            <Picker.Item label="Select District..." value="" />
            {districts.map((d, idx) => (
              <Picker.Item key={idx} label={d.name} value={d.name} />
            ))}
          </Picker>
        </View>

        <Text style={currentStyles.label}>City/Ward</Text>
        <View style={currentStyles.pickerContainer}>
          <Picker
            selectedValue={selectedCity}
            onValueChange={(itemValue) => setSelectedCity(itemValue)}
            enabled={cities.length > 0}
            style={currentStyles.picker}
            dropdownIconColor={isDark ? "#fff" : "#000"}
          >
            <Picker.Item label="Select City..." value="" />
            {cities.map((c, idx) => (
              <Picker.Item key={idx} label={c} value={c} />
            ))}
          </Picker>
        </View>

        <View style={currentStyles.spacer} />

        <TouchableOpacity 
          style={[
            currentStyles.continueBtn, 
            (!selectedState || !selectedDistrict || !selectedCity) && currentStyles.continueBtnDisabled
          ]}
          onPress={handleContinue}
        >
          <Text style={currentStyles.continueBtnText}>Continue to Dashboard</Text>
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
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: isDark ? '#f8fafc' : '#0f172a',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: isDark ? '#94a3b8' : '#64748b',
    marginBottom: 32,
    lineHeight: 22,
  },
  autoBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  autoBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: isDark ? '#334155' : '#cbd5e1',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: '700',
    color: isDark ? '#64748b' : '#94a3b8',
    letterSpacing: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: isDark ? '#f8fafc' : '#0f172a',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#cbd5e1',
    marginBottom: 20,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: isDark ? '#f8fafc' : '#0f172a',
  },
  spacer: {
    flex: 1,
  },
  continueBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  continueBtnDisabled: {
    backgroundColor: isDark ? '#334155' : '#cbd5e1',
  },
  continueBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  }
});
