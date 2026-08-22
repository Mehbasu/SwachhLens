import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, ArrowLeft, Phone } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

// Use a fallback for emulator if API_URL is not set
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'web' ? 'http://localhost:8001' : 'http://10.0.2.2:8001');

export default function LoginScreen({ navigation }) {
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      // 2. Sync with Backend
      const response = await fetch(`${BASE_URL}/auth/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: 'citizen' }), 
      });

      const data = await response.json();

      if (response.ok) {
        if (data.state) await AsyncStorage.setItem('swachhlens_state', data.state);
        if (data.district) await AsyncStorage.setItem('swachhlens_district', data.district);
        if (data.city) await AsyncStorage.setItem('swachhlens_city', data.city);
        if (data.ward) await AsyncStorage.setItem('swachhlens_ward', data.ward);

        // If jurisdiction is fully setup, go to MainTabs, else LocationSetup
        if (data.role === 'citizen' || (data.state && data.district && data.city && data.ward)) {
          navigation.replace('MainTabs');
        } else {
          navigation.replace('LocationSetup');
        }
      } else {
        alert(data.detail || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message || 'Login failed.');
    }
  };

  const images = [
    'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&w=400&q=80'
  ];

  return (
    <View style={styles.container}>
      {/* Background Image Grid */}
      <View style={styles.imageGrid}>
        <View style={styles.column}>
          <Image source={{ uri: images[0] }} style={[styles.gridImage, { height: 180 }]} />
          <Image source={{ uri: images[1] }} style={[styles.gridImage, { height: 220 }]} />
        </View>
        <View style={[styles.column, { marginTop: -40 }]}>
          <Image source={{ uri: images[2] }} style={[styles.gridImage, { height: 200 }]} />
          <Image source={{ uri: images[3] }} style={[styles.gridImage, { height: 180 }]} />
        </View>
        <View style={styles.column}>
          <Image source={{ uri: images[4] }} style={[styles.gridImage, { height: 220 }]} />
          <Image source={{ uri: images[5] }} style={[styles.gridImage, { height: 160 }]} />
        </View>
      </View>

      {/* Gradient Overlay covering the bottom half */}
      <LinearGradient
        colors={['transparent', 'rgba(37, 99, 235, 0.9)', '#1d4ed8']}
        locations={[0, 0.4, 1]}
        style={styles.gradientOverlay}
      >
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.contentContainer}
          >
            {/* Header Text */}
            <View style={styles.header}>
              <View style={styles.logoRow}>
                <View style={styles.logoCircle}>
                  <Text style={styles.logoEmoji}>🍃</Text>
                </View>
                <Text style={styles.title}>SwachhLens</Text>
              </View>
              <Text style={styles.subtitle}>Clearer streets, smarter cities.</Text>
            </View>

            {/* Auth Toggle Content */}
            {!showEmailInput ? (
              <View style={styles.buttonsContainer}>
                <TouchableOpacity 
                  style={styles.primaryButton}
                  activeOpacity={0.8}
                  onPress={() => setShowEmailInput(true)}
                >
                  <Mail color="#0f172a" size={20} style={{ marginRight: 8 }} />
                  <Text style={styles.primaryButtonText}>Sign in with Email</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.secondaryButton}
                  activeOpacity={0.8}
                  onPress={() => alert('Mobile OTP Login coming soon!')}
                >
                  <Phone color="#ffffff" size={20} style={{ marginRight: 8 }} />
                  <Text style={styles.secondaryButtonText}>Sign in with Mobile</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formContainer}>
                <TouchableOpacity 
                  style={styles.backButton} 
                  onPress={() => setShowEmailInput(false)}
                >
                  <ArrowLeft color="#ffffff" size={20} />
                  <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />

                <TouchableOpacity 
                  style={[styles.primaryButton, { marginTop: 8 }]}
                  activeOpacity={0.8}
                  onPress={handleLogin}
                >
                  <Text style={styles.primaryButtonText}>Log In</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Doesn't have account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.footerLink}>Sign Up Now</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d4ed8', // Dark blue fallback
  },
  imageGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '65%',
    flexDirection: 'row',
    padding: 8,
    gap: 8,
    opacity: 0.8,
  },
  column: {
    flex: 1,
    flexDirection: 'column',
    gap: 8,
  },
  gridImage: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 100, // Make sure content doesn't hit the top of the gradient abruptly
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoEmoji: {
    fontSize: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  buttonsContainer: {
    gap: 16,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
  },
  primaryButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    marginBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  footerLink: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
