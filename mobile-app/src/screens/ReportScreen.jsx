import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import LocationPicker from '../components/LocationPicker';
import PrimaryButton from '../components/PrimaryButton';
import { submitComplaint } from '../services/api';
import { useReports } from '../context/ReportsContext';
import { useTheme } from '../contexts/ThemeContext';

export default function ReportScreen({ navigation }) {
  const { addReport } = useReports();
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const currentStyles = styles(isDark);

  const [selectedImage, setSelectedImage] = useState(null);
  const [capturedTimestamp, setCapturedTimestamp] = useState(null);
  const [comment, setComment] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [location, setLocation] = useState({
    gps: { lat: 25.6093, lng: 85.1235 },
    address: 'Boring Road Crossing, near Axis Bank, Patna'
  });

  // Pick image or video from camera
  const handleLaunchCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Camera access is required to take photos/videos of waste issues.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3]
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        setCapturedTimestamp(new Date().toISOString());
      }
    } catch {
      // Fallback sample image if running in web/emulator without physical camera
      setSelectedImage('https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80');
      setCapturedTimestamp(new Date().toISOString());
    }
  };

  // Pick image or video from gallery
  const handleLaunchGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Gallery access is required to choose photo/video.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3]
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        setCapturedTimestamp(new Date().toISOString());
      }
    } catch {
      // Fallback sample image
      setSelectedImage('https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80');
      setCapturedTimestamp(new Date().toISOString());
    }
  };

  const handleSubmit = async () => {
    setIsAnalyzing(true);

    try {
      const submittedReport = await submitComplaint({
        imageUri: selectedImage,
        timestamp: capturedTimestamp,
        gps: location.gps,
        address: location.address,
        comment: comment.trim() || 'Reported via SwachhLens Citizen App'
      });

      // Update global context
      addReport(submittedReport);

      setIsAnalyzing(false);

      // Navigate to Confirmation Screen
      navigation.navigate('Confirmation', { report: submittedReport });
    } catch (err) {
      console.error('Error submitting complaint:', err);
      setIsAnalyzing(false);
      Alert.alert(
        'Connection Error',
        "Couldn't connect to SwachhLens Backend Server.\n\nPlease ensure backend is running at http://localhost:8000 (or http://10.0.2.2:8000 on Android emulator)."
      );
    }
  };

  return (
    <SafeAreaView style={currentStyles.safeArea}>
      {isAnalyzing && (
        <View style={currentStyles.overlay}>
          <View style={currentStyles.analyzingCard}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={currentStyles.analyzingTitle}>SwachhLens AI Analyzing...</Text>
            <Text style={currentStyles.analyzingSub}>
              Extracting waste classification, volume estimation & spatial geotags.
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={currentStyles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={currentStyles.screenTitle}>Report a Waste Issue</Text>
        <Text style={currentStyles.screenSub}>
          Take or upload a photo/video to immediately alert municipal sanitation crews.
        </Text>

        {/* Photo/Video Capture Section */}
        <View style={currentStyles.photoContainer}>
          {selectedImage ? (
            <View style={currentStyles.previewWrapper}>
              <Image source={{ uri: selectedImage }} style={currentStyles.previewImage} />
              <TouchableOpacity
                style={currentStyles.retakeBtn}
                onPress={() => {
                  setSelectedImage(null);
                  setCapturedTimestamp(null);
                }}
              >
                <Text style={currentStyles.retakeBtnText}>🔄 Change Media</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={currentStyles.captureBox}>
              <Text style={currentStyles.cameraIcon}>📸</Text>
              <Text style={currentStyles.capturePrompt}>No media selected yet</Text>
              
              <View style={currentStyles.photoBtnRow}>
                <TouchableOpacity
                  style={currentStyles.photoBtnPrimary}
                  onPress={handleLaunchCamera}
                >
                  <Text style={currentStyles.photoBtnText}>📷 Take Photo/Video</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={currentStyles.photoBtnSecondary}
                  onPress={handleLaunchGallery}
                >
                  <Text style={currentStyles.photoBtnSecondaryText}>🖼️ Choose Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* GPS Geotag Location Picker */}
        <LocationPicker
          location={location}
          onLocationChange={setLocation}
        />

        {/* Optional Comment Input */}
        <Text style={currentStyles.fieldLabel}>Add a Note / Remark (Optional)</Text>
        <TextInput
          style={currentStyles.textArea}
          value={comment}
          onChangeText={setComment}
          placeholder="e.g. 'Blocking pedestrian path near traffic light...'"
          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
          multiline
          numberOfLines={3}
        />

        {/* Submit Primary CTA */}
        <PrimaryButton
          title="✨ Submit Report & Run AI Verification"
          onPress={handleSubmit}
          style={currentStyles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (isDark) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: isDark ? '#f8fafc' : '#0f172a',
    marginBottom: 4,
    marginTop: 8,
  },
  screenSub: {
    fontSize: 13,
    color: isDark ? '#94a3b8' : '#64748b',
    marginBottom: 16,
  },
  photoContainer: {
    marginBottom: 16,
  },
  captureBox: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: isDark ? '#334155' : '#cbd5e1',
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
  },
  cameraIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  capturePrompt: {
    fontSize: 13.5,
    color: isDark ? '#94a3b8' : '#64748b',
    fontWeight: '500',
    marginBottom: 16,
  },
  photoBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  photoBtnPrimary: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  photoBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  photoBtnSecondary: {
    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#cbd5e1',
  },
  photoBtnSecondaryText: {
    color: isDark ? '#cbd5e1' : '#475569',
    fontWeight: '600',
    fontSize: 13,
  },
  previewWrapper: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e2e8f0',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 18,
  },
  retakeBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: isDark ? '#0f172ae0' : '#ffffffd9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: isDark ? '#475569' : '#cbd5e1',
  },
  retakeBtnText: {
    color: isDark ? '#38bdf8' : '#0284c7',
    fontSize: 12,
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: isDark ? '#f8fafc' : '#0f172a',
    marginBottom: 8,
    marginTop: 6,
  },
  textArea: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 14,
    padding: 12,
    color: isDark ? '#f8fafc' : '#0f172a',
    fontSize: 13.5,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#cbd5e1',
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitBtn: {
    marginTop: 4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: isDark ? '#000000bb' : '#ffffffbb',
    zIndex: 99,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  analyzingCard: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  analyzingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: isDark ? '#f8fafc' : '#0f172a',
    marginTop: 16,
    marginBottom: 6,
  },
  analyzingSub: {
    fontSize: 12.5,
    color: isDark ? '#94a3b8' : '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  }
});
