import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar
} from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { useTheme } from '../contexts/ThemeContext';
import { categoriesConfig, volumeConfig } from '../data/mockData';

export default function ConfirmationScreen({ route, navigation }) {
  const { report } = route.params || {};
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const currentStyles = styles(isDark);

  const categoryInfo = categoriesConfig[report?.category] || { label: report?.category };
  const volumeInfo = volumeConfig[report?.volume] || { label: report?.volume };

  return (
    <SafeAreaView style={currentStyles.safeArea}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#0f172a" : "#f1f5f9"} />
      <ScrollView
        contentContainerStyle={currentStyles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Header Banner */}
        <View style={currentStyles.successBadge}>
          <Text style={currentStyles.successCheck}>✅</Text>
          <Text style={currentStyles.successTitle}>Report Submitted!</Text>
          <Text style={currentStyles.trackingId}>Tracking ID: {report?.id}</Text>
        </View>

        {/* Captured Photo */}
        {report?.image_url && (
          <View style={currentStyles.imageCard}>
            <Image
              source={{ uri: report.image_url }}
              style={currentStyles.image}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Real Backend AI Classification Results Card */}
        <View style={currentStyles.aiCard}>
          <View style={currentStyles.aiCardHeader}>
            <Text style={currentStyles.aiSparkle}>🤖</Text>
            <Text style={currentStyles.aiCardTitle}>SwachhLens AI Analysis Result</Text>
            <View style={currentStyles.confChip}>
              <Text style={currentStyles.confText}>{report?.ai_confidence || 95}% Confidence</Text>
            </View>
          </View>

          <View style={currentStyles.divider} />

          <View style={currentStyles.aiRow}>
            <Text style={currentStyles.aiLabel}>Detected Category:</Text>
            <Text style={[currentStyles.aiValue, { color: categoryInfo.color || '#34d399' }]}>
              {categoryInfo.label}
            </Text>
          </View>

          <View style={currentStyles.aiRow}>
            <Text style={currentStyles.aiLabel}>Estimated Volume:</Text>
            <Text style={currentStyles.aiValue}>{volumeInfo.label}</Text>
          </View>

          <View style={currentStyles.aiRow}>
            <Text style={currentStyles.aiLabel}>Calculated Priority:</Text>
            <Text style={[currentStyles.aiValue, { color: '#f59e0b' }]}>
              {report?.priority_score !== undefined ? `${report.priority_score} / 100` : 'Normal'}
            </Text>
          </View>

          {report?.recommended_action ? (
            <View style={currentStyles.aiRow}>
              <Text style={currentStyles.aiLabel}>Recommended Action:</Text>
              <Text style={currentStyles.aiValueSmall} numberOfLines={2}>
                {report.recommended_action}
              </Text>
            </View>
          ) : null}

          {report?.is_duplicate ? (
            <View style={currentStyles.aiRow}>
              <Text style={currentStyles.aiLabel}>Duplicate Alert:</Text>
              <Text style={[currentStyles.aiValueSmall, { color: '#f87171' }]} numberOfLines={1}>
                ⚠️ Linked to {report.duplicate_of || 'existing report'}
              </Text>
            </View>
          ) : null}

          <View style={currentStyles.aiRow}>
            <Text style={currentStyles.aiLabel}>GPS Location:</Text>
            <Text style={currentStyles.aiValueSmall} numberOfLines={1}>
              {report?.address}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={currentStyles.btnGroup}>
          <PrimaryButton
            title="📋 View My Reports"
            onPress={() => navigation.navigate('MyReportsTab')}
            style={currentStyles.btn}
          />

          <PrimaryButton
            title="🏠 Return to Home"
            variant="secondary"
            onPress={() => navigation.navigate('HomeTab')}
            style={currentStyles.btn}
          />
        </View>
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
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  successBadge: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  successCheck: {
    fontSize: 48,
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: isDark ? '#f8fafc' : '#0f172a',
    marginBottom: 4,
  },
  trackingId: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#10b981',
    letterSpacing: 0.5,
  },
  imageCard: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e2e8f0',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
  },
  aiCard: {
    width: '100%',
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#10b98150',
    marginBottom: 24,
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiSparkle: {
    fontSize: 20,
    marginRight: 8,
  },
  aiCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: isDark ? '#f8fafc' : '#0f172a',
    flex: 1,
  },
  confChip: {
    backgroundColor: '#10b98120',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b98140',
  },
  confText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34d399',
  },
  divider: {
    height: 1,
    backgroundColor: isDark ? '#334155' : '#e2e8f0',
    marginBottom: 12,
  },
  aiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiLabel: {
    fontSize: 13,
    color: isDark ? '#94a3b8' : '#64748b',
    fontWeight: '500',
  },
  aiValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: isDark ? '#f8fafc' : '#0f172a',
  },
  aiValueSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: isDark ? '#cbd5e1' : '#475569',
    maxWidth: '55%',
  },
  btnGroup: {
    width: '100%',
    gap: 12,
  },
  btn: {
    width: '100%',
  }
});
