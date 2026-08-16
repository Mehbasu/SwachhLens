import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useTheme } from '../contexts/ThemeContext';

export default function LocationPicker({ location, onLocationChange }) {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const currentStyles = styles(isDark);
  const [isEditing, setIsEditing] = useState(false);
  const [customAddress, setCustomAddress] = useState(location?.address || '');
  const [isLocating, setIsLocating] = useState(false);

  // Automatically fetch location on mount if not already set
  useEffect(() => {
    if (!location?.gps?.lat || location.address.includes('Boring Road')) {
      fetchRealLocation();
    } else {
      setCustomAddress(location.address);
    }
  }, []);

  const fetchRealLocation = async () => {
    setIsLocating(true);
    try {
      // 1. Request Permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        setIsLocating(false);
        return;
      }

      // 2. Get GPS Coordinates
      let currentLoc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const { latitude, longitude } = currentLoc.coords;

      // 3. Reverse Geocode to get street address
      let geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      let addressString = 'Unknown Location';
      if (geocode.length > 0) {
        const place = geocode[0];
        // Build a readable address string (e.g. "Main St, Patna, Bihar")
        addressString = [place.street, place.city, place.region]
          .filter(Boolean)
          .join(', ');
      }

      // 4. Update parent state
      if (onLocationChange) {
        onLocationChange({
          gps: { lat: latitude, lng: longitude },
          address: addressString
        });
      }
      setCustomAddress(addressString);
    } catch (error) {
      console.error("Error fetching location:", error);
      Alert.alert('Location Error', 'Could not fetch your exact location. Please enter it manually.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    if (onLocationChange) {
      onLocationChange({
        ...location,
        address: customAddress
      });
    }
  };

  return (
    <View style={currentStyles.container}>
      <View style={currentStyles.header}>
        <View style={currentStyles.titleRow}>
          <Text style={currentStyles.icon}>📍</Text>
          <Text style={currentStyles.title}>GPS Geotag Location</Text>
        </View>
        <View style={currentStyles.gpsBadge}>
          <View style={[currentStyles.liveDot, isLocating && { backgroundColor: '#fbbf24' }]} />
          <Text style={[currentStyles.gpsBadgeText, isLocating && { color: '#fbbf24' }]}>
            {isLocating ? 'Acquiring...' : 'GPS Active'}
          </Text>
        </View>
      </View>

      {isLocating ? (
        <View style={currentStyles.loadingBox}>
          <ActivityIndicator size="small" color="#10b981" />
          <Text style={currentStyles.loadingText}>Fetching precise GPS coordinates...</Text>
        </View>
      ) : isEditing ? (
        <View style={currentStyles.editBox}>
          <TextInput
            style={currentStyles.input}
            value={customAddress}
            onChangeText={setCustomAddress}
            placeholder="Enter custom location/address..."
            placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
          />
          <TouchableOpacity style={currentStyles.saveBtn} onPress={handleSave}>
            <Text style={currentStyles.saveBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={currentStyles.infoBox}>
          <Text style={currentStyles.addressText}>{location?.address || 'Locating...'}</Text>
          <Text style={currentStyles.coordsText}>
            Coordinates: {location?.gps?.lat?.toFixed(5) || '---'}° N, {location?.gps?.lng?.toFixed(5) || '---'}° E
          </Text>

          <View style={currentStyles.btnRow}>
            <TouchableOpacity
              style={currentStyles.adjustBtn}
              onPress={() => setIsEditing(true)}
            >
              <Text style={currentStyles.adjustBtnText}>✏️ Edit Address</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={currentStyles.refreshBtn}
              onPress={fetchRealLocation}
            >
              <Text style={currentStyles.refreshBtnText}>🔄 Refresh GPS</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = (isDark) => StyleSheet.create({
  container: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e2e8f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: isDark ? '#f8fafc' : '#0f172a',
  },
  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98120',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b98140',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 5,
  },
  gpsBadgeText: {
    fontSize: 10.5,
    color: '#10b981',
    fontWeight: '700',
  },
  loadingBox: {
    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: isDark ? '#94a3b8' : '#64748b',
    fontSize: 12.5,
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e2e8f0',
  },
  addressText: {
    fontSize: 13.5,
    color: isDark ? '#f1f5f9' : '#0f172a',
    fontWeight: '600',
    marginBottom: 4,
  },
  coordsText: {
    fontSize: 11.5,
    color: isDark ? '#64748b' : '#94a3b8',
    fontWeight: '500',
    marginBottom: 12,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  adjustBtn: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: isDark ? '#475569' : '#cbd5e1',
  },
  adjustBtnText: {
    fontSize: 11.5,
    color: '#38bdf8',
    fontWeight: '600',
  },
  refreshBtn: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: isDark ? '#475569' : '#cbd5e1',
  },
  refreshBtnText: {
    fontSize: 11.5,
    color: '#10b981',
    fontWeight: '600',
  },
  editBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: isDark ? '#f8fafc' : '#0f172a',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#38bdf8',
    marginRight: 8,
  },
  saveBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12.5,
  }
});
