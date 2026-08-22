import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReports } from '../contexts/ReportsContext';
import { useTheme } from '../contexts/ThemeContext';
import ReportCard from '../components/ReportCard';
import PrimaryButton from '../components/PrimaryButton';

export default function HomeScreen({ navigation }) {
  const { getStats, getRecentReports } = useReports();
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const currentStyles = styles(isDark);
  const stats = getStats();
  const recentReports = getRecentReports(3);

  return (
    <SafeAreaView style={currentStyles.safeArea}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#0f172a" : "#f1f5f9"} />
      <ScrollView
        contentContainerStyle={currentStyles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Civic Header */}
        <View style={currentStyles.header}>
          <View>
            <Text style={currentStyles.cityName}>PATNA MUNICIPAL CORPORATION</Text>
            <Text style={currentStyles.title}>SwachhLens 🌿</Text>
          </View>
          <View style={currentStyles.ecoBadge}>
            <Text style={currentStyles.ecoIcon}>⭐</Text>
            <Text style={currentStyles.ecoPts}>{stats.ecoPoints} Pts</Text>
          </View>
        </View>

        {/* Welcome Hero Card */}
        <View style={currentStyles.heroCard}>
          <Text style={currentStyles.heroTitle}>Keep Your City Clean & Green</Text>
          <Text style={currentStyles.heroSub}>
            Spot garbage overflow or drain blockage? Snap a quick photo with SwachhLens AI geotagging.
          </Text>

          <PrimaryButton
            title="📷  Report an Issue Now"
            onPress={() => navigation.navigate('ReportTab')}
            style={currentStyles.heroCta}
          />
        </View>

        {/* Quick Stats Grid */}
        <Text style={currentStyles.sectionTitle}>Your Impact Summary</Text>
        <View style={currentStyles.statsGrid}>
          <View style={[currentStyles.statBox, { borderColor: '#3b82f640' }]}>
            <Text style={[currentStyles.statNumber, { color: '#60a5fa' }]}>
              {stats.submitted}
            </Text>

            <Text style={currentStyles.statLabel}>Submitted</Text>
          </View>

          <View style={[currentStyles.statBox, { borderColor: '#f9731640' }]}>
            <Text style={[currentStyles.statNumber, { color: '#fb923c' }]}>
              {stats.inProgress}
            </Text>

            <Text style={currentStyles.statLabel}>In Progress</Text>
          </View>

          <View style={[currentStyles.statBox, { borderColor: '#10b98140' }]}>
            <Text style={[currentStyles.statNumber, { color: '#34d399' }]}>
              {stats.resolved}
            </Text>

            <Text style={currentStyles.statLabel}>Resolved</Text>
          </View>
        </View>

        {/* Quick Actions / Categories */}
        <View style={currentStyles.sectionHeader}>
          <Text style={currentStyles.sectionTitle}>Recent Reports</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyReportsTab')}>
            <Text style={currentStyles.seeAllText}>See All ({stats.total}) →</Text>
          </TouchableOpacity>
        </View>

        {recentReports.length === 0 ? (
          <View style={currentStyles.emptyCard}>
            <Text style={currentStyles.emptyIcon}>🗑️</Text>
            <Text style={currentStyles.emptyText}>No issues reported yet.</Text>
            <Text style={currentStyles.emptySub}>
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

const styles = (isDark) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
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
    color: isDark ? '#f8fafc' : '#0f172a',
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
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e2e8f0',
  },
  heroTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: isDark ? '#f8fafc' : '#0f172a',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 13.5,
    color: isDark ? '#94a3b8' : '#64748b',
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
    color: isDark ? '#f8fafc' : '#0f172a',
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
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
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
    color: isDark ? '#f8fafc' : '#0f172a',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: isDark ? '#94a3b8' : '#64748b',
  },
  emptyCard: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e2e8f0',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: isDark ? '#f8fafc' : '#0f172a',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12.5,
    color: isDark ? '#64748b' : '#94a3b8',
    textAlign: 'center',
  }
});
