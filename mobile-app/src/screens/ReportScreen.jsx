import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import LocationPicker from '../components/LocationPicker';
import PrimaryButton from '../components/PrimaryButton';
import { submitComplaint } from '../services/api';
import { useReports } from '../context/ReportsContext';

export default function ReportScreen({ navigation }) {
  const { addReport } = useReports();

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
    <SafeAreaView style={styles.safeArea}>
      {isAnalyzing && (
        <View style={styles.overlay}>
          <View style={styles.analyzingCard}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.analyzingTitle}>SwachhLens AI Analyzing...</Text>
            <Text style={styles.analyzingSub}>
              Extracting waste classification, volume estimation & spatial geotags.
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Report a Waste Issue</Text>
        <Text style={styles.screenSub}>
          Take or upload a photo/video to immediately alert municipal sanitation crews.
        </Text>

        {/* Photo/Video Capture Section */}
        <View style={styles.photoContainer}>
          {selectedImage ? (
            <View style={styles.previewWrapper}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.retakeBtn}
                onPress={() => {
                  setSelectedImage(null);
                  setCapturedTimestamp(null);
                }}
              >
                <Text style={styles.retakeBtnText}>🔄 Change Media</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.captureBox}>
              <Text style={styles.cameraIcon}>📸</Text>
              <Text style={styles.capturePrompt}>No media selected yet</Text>
              
              <View style={styles.photoBtnRow}>
                <TouchableOpacity
                  style={styles.photoBtnPrimary}
                  onPress={handleLaunchCamera}
                >
                  <Text style={styles.photoBtnText}>📷 Take Photo/Video</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.photoBtnSecondary}
                  onPress={handleLaunchGallery}
                >
                  <Text style={styles.photoBtnSecondaryText}>🖼️ Choose Gallery</Text>
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
        <Text style={styles.fieldLabel}>Add a Note / Remark (Optional)</Text>
        <TextInput
          style={styles.textArea}
          value={comment}
          onChangeText={setComment}
          placeholder="e.g. 'Blocking pedestrian path near traffic light...'"
          placeholderTextColor="#64748b"
          multiline
          numberOfLines={3}
        />

        {/* Submit Primary CTA */}
        <PrimaryButton
          title="✨ Submit Report & Run AI Verification"
          onPress={handleSubmit}
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 4,
    marginTop: 8,
  },
  screenSub: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 16,
  },
  photoContainer: {
    marginBottom: 16,
  },
  captureBox: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#334155',
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
    color: '#94a3b8',
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
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  photoBtnSecondaryText: {
    color: '#cbd5e1',
    fontWeight: '600',
    fontSize: 13,
  },
  previewWrapper: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
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
    backgroundColor: '#0f172ae0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#475569',
  },
  retakeBtnText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
    marginTop: 6,
  },
  textArea: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 12,
    color: '#f8fafc',
    fontSize: 13.5,
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitBtn: {
    marginTop: 4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000bb',
    zIndex: 99,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  analyzingCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  analyzingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
    marginTop: 16,
    marginBottom: 6,
  },
  analyzingSub: {
    fontSize: 12.5,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
  }
});
