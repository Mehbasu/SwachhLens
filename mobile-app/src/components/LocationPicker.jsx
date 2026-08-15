import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';

export default function LocationPicker({ location, onLocationChange }) {
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
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.title}>GPS Geotag Location</Text>
        </View>
        <View style={styles.gpsBadge}>
          <View style={[styles.liveDot, isLocating && { backgroundColor: '#fbbf24' }]} />
          <Text style={[styles.gpsBadgeText, isLocating && { color: '#fbbf24' }]}>
            {isLocating ? 'Acquiring...' : 'GPS Active'}
          </Text>
        </View>
      </View>

      {isLocating ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#10b981" />
          <Text style={styles.loadingText}>Fetching precise GPS coordinates...</Text>
        </View>
      ) : isEditing ? (
        <View style={styles.editBox}>
          <TextInput
            style={styles.input}
            value={customAddress}
            onChangeText={setCustomAddress}
            placeholder="Enter custom location/address..."
            placeholderTextColor="#64748b"
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.infoBox}>
          <Text style={styles.addressText}>{location?.address || 'Locating...'}</Text>
          <Text style={styles.coordsText}>
            Coordinates: {location?.gps?.lat?.toFixed(5) || '---'}° N, {location?.gps?.lng?.toFixed(5) || '---'}° E
          </Text>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.adjustBtn}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.adjustBtnText}>✏️ Edit Address</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={fetchRealLocation}
            >
              <Text style={styles.refreshBtnText}>🔄 Refresh GPS</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
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
    color: '#f8fafc',
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
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 12.5,
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  addressText: {
    fontSize: 13.5,
    color: '#f1f5f9',
    fontWeight: '600',
    marginBottom: 4,
  },
  coordsText: {
    fontSize: 11.5,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 12,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  adjustBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
  },
  adjustBtnText: {
    fontSize: 11.5,
    color: '#38bdf8',
    fontWeight: '600',
  },
  refreshBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
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
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#f8fafc',
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
