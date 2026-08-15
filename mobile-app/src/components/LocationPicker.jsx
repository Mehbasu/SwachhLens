import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

export default function LocationPicker({ location, onLocationChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [customAddress, setCustomAddress] = useState(location?.address || 'Boring Road Crossing, Patna');

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
          <View style={styles.liveDot} />
          <Text style={styles.gpsBadgeText}>GPS Active</Text>
        </View>
      </View>

      {isEditing ? (
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
          <Text style={styles.addressText}>{location?.address || 'Boring Road Crossing, Patna, Bihar'}</Text>
          <Text style={styles.coordsText}>
            Coordinates: {location?.gps?.lat?.toFixed(4) || '25.6093'}° N, {location?.gps?.lng?.toFixed(4) || '85.1235'}° E
          </Text>

          <TouchableOpacity
            style={styles.adjustBtn}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.adjustBtnText}>✏️ Adjust Location / Pin</Text>
          </TouchableOpacity>
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
    marginBottom: 8,
  },
  adjustBtn: {
    alignSelf: 'flex-start',
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
