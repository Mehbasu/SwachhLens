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
import { categoriesConfig, volumeConfig } from '../data/mockData';

export default function ConfirmationScreen({ route, navigation }) {
  const { report } = route.params || {};

  const categoryInfo = categoriesConfig[report?.category] || { label: report?.category };
  const volumeInfo = volumeConfig[report?.volume] || { label: report?.volume };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Header Banner */}
        <View style={styles.successBadge}>
          <Text style={styles.successCheck}>✅</Text>
          <Text style={styles.successTitle}>Report Submitted!</Text>
          <Text style={styles.trackingId}>Tracking ID: {report?.id}</Text>
        </View>

        {/* Captured Photo */}
        {report?.image_url && (
          <View style={styles.imageCard}>
            <Image
              source={{ uri: report.image_url }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Real Backend AI Classification Results Card */}
        <View style={styles.aiCard}>
          <View style={styles.aiCardHeader}>
            <Text style={styles.aiSparkle}>🤖</Text>
            <Text style={styles.aiCardTitle}>SwachhLens AI Analysis Result</Text>
            <View style={styles.confChip}>
              <Text style={styles.confText}>{report?.ai_confidence || 95}% Confidence</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.aiRow}>
            <Text style={styles.aiLabel}>Detected Category:</Text>
            <Text style={[styles.aiValue, { color: categoryInfo.color || '#34d399' }]}>
              {categoryInfo.label}
            </Text>
          </View>

          <View style={styles.aiRow}>
            <Text style={styles.aiLabel}>Estimated Volume:</Text>
            <Text style={styles.aiValue}>{volumeInfo.label}</Text>
          </View>

          <View style={styles.aiRow}>
            <Text style={styles.aiLabel}>Calculated Priority:</Text>
            <Text style={[styles.aiValue, { color: '#f59e0b' }]}>
              {report?.priority_score !== undefined ? `${report.priority_score} / 100` : 'Normal'}
            </Text>
          </View>

          {report?.recommended_action ? (
            <View style={styles.aiRow}>
              <Text style={styles.aiLabel}>Recommended Action:</Text>
              <Text style={styles.aiValueSmall} numberOfLines={2}>
                {report.recommended_action}
              </Text>
            </View>
          ) : null}

          {report?.is_duplicate ? (
            <View style={styles.aiRow}>
              <Text style={styles.aiLabel}>Duplicate Alert:</Text>
              <Text style={[styles.aiValueSmall, { color: '#f87171' }]} numberOfLines={1}>
                ⚠️ Linked to {report.duplicate_of || 'existing report'}
              </Text>
            </View>
          ) : null}

          <View style={styles.aiRow}>
            <Text style={styles.aiLabel}>GPS Location:</Text>
            <Text style={styles.aiValueSmall} numberOfLines={1}>
              {report?.address}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.btnGroup}>
          <PrimaryButton
            title="📋 View My Reports"
            onPress={() => navigation.navigate('MyReportsTab')}
            style={styles.btn}
          />

          <PrimaryButton
            title="🏠 Return to Home"
            variant="secondary"
            onPress={() => navigation.navigate('HomeTab')}
            style={styles.btn}
          />
        </View>
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
    color: '#f8fafc',
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
    borderColor: '#334155',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
  },
  aiCard: {
    width: '100%',
    backgroundColor: '#1e293b',
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
    color: '#f8fafc',
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
    backgroundColor: '#334155',
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
    color: '#94a3b8',
    fontWeight: '500',
  },
  aiValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#f8fafc',
  },
  aiValueSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
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
