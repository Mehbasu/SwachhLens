import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useReports } from '../context/ReportsContext';
import ReportCard from '../components/ReportCard';
import PrimaryButton from '../components/PrimaryButton';

export default function HomeScreen({ navigation }) {
  const { getStats, getRecentReports } = useReports();
  const stats = getStats();
  const recentReports = getRecentReports(3);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Civic Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.cityName}>PATNA MUNICIPAL CORPORATION</Text>
            <Text style={styles.title}>SwachhLens 🌿</Text>
          </View>
          <View style={styles.ecoBadge}>
            <Text style={styles.ecoIcon}>⭐</Text>
            <Text style={styles.ecoPts}>{stats.ecoPoints} Pts</Text>
          </View>
        </View>

        {/* Welcome Hero Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Keep Your City Clean & Green</Text>
          <Text style={styles.heroSub}>
            Spot garbage overflow or drain blockage? Snap a quick photo with SwachhLens AI geotagging.
          </Text>

          <PrimaryButton
            title="📷  Report an Issue Now"
            onPress={() => navigation.navigate('ReportTab')}
            style={styles.heroCta}
          />
        </View>

        {/* Quick Stats Grid */}
        <Text style={styles.sectionTitle}>Your Impact Summary</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { borderColor: '#3b82f640' }]}>
            <Text style={[styles.statNumber, { color: '#60a5fa' }]}>
              {stats.submitted}
            </Text>

            <Text style={styles.statLabel}>Submitted</Text>
          </View>

          <View style={[styles.statBox, { borderColor: '#f9731640' }]}>
            <Text style={[styles.statNumber, { color: '#fb923c' }]}>
              {stats.inProgress}
            </Text>

            <Text style={styles.statLabel}>In Progress</Text>
          </View>

          <View style={[styles.statBox, { borderColor: '#10b98140' }]}>
            <Text style={[styles.statNumber, { color: '#34d399' }]}>
              {stats.resolved}
            </Text>

            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>

        {/* Quick Actions / Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyReportsTab')}>
            <Text style={styles.seeAllText}>See All ({stats.total}) →</Text>
          </TouchableOpacity>
        </View>

        {recentReports.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🗑️</Text>
            <Text style={styles.emptyText}>No issues reported yet.</Text>
            <Text style={styles.emptySub}>
              Be the first citizen to report waste in your neighborhood!
            </Text>
          </View>
        ) : (
          recentReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onPress={() => navigation.navigate('ReportDetail', { reportId: report.id })}
            />
          ))
        )}
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
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 8,
  },
  cityName: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#10b981',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
  },
  ecoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98120',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#10b98150',
  },
  ecoIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  ecoPts: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34d399',
  },
  heroCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  heroTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 13.5,
    color: '#94a3b8',
    lineHeight: 19,
    marginBottom: 16,
  },
  heroCta: {
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#38bdf8',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  emptyCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12.5,
    color: '#64748b',
    textAlign: 'center',
  }
});
