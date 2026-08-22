import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  
  StatusBar,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReports } from '../contexts/ReportsContext';
import { useTheme } from '../contexts/ThemeContext';
import ReportCard from '../components/ReportCard';

export default function MyReportsScreen({ navigation }) {
  const { reports, loading, refreshReports } = useReports();
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const currentStyles = styles(isDark);
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshReports();
    setRefreshing(false);
  };

  const filteredReports = reports.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  return (
    <SafeAreaView style={currentStyles.safeArea}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#0f172a" : "#f1f5f9"} />
      <View style={currentStyles.container}>
        {/* Header */}
        <View style={currentStyles.header}>
          <Text style={currentStyles.title}>My Reports 📋</Text>
          <Text style={currentStyles.subtitle}>
            Track real-time municipal response & cleanup verification
          </Text>
        </View>

        {/* Filter Chips */}
        <View style={currentStyles.filterRow}>
          <TouchableOpacity
            onPress={() => setFilterStatus('all')}
            style={[
              currentStyles.filterChip,
              filterStatus === 'all' && currentStyles.filterChipActive
            ]}
          >
            <Text
              style={[
                currentStyles.filterText,
                filterStatus === 'all' && currentStyles.filterTextActive
              ]}
            >
              All ({reports.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterStatus('submitted')}
            style={[
              currentStyles.filterChip,
              filterStatus === 'submitted' && currentStyles.filterChipActiveBlue
            ]}
          >
            <Text
              style={[
                currentStyles.filterText,
                filterStatus === 'submitted' && { color: '#60a5fa' }
              ]}
            >
              Submitted
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterStatus('in_progress')}
            style={[
              currentStyles.filterChip,
              filterStatus === 'in_progress' && currentStyles.filterChipActiveOrange
            ]}
          >
            <Text
              style={[
                currentStyles.filterText,
                filterStatus === 'in_progress' && { color: '#fb923c' }
              ]}
            >
              In Progress
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterStatus('resolved')}
            style={[
              currentStyles.filterChip,
              filterStatus === 'resolved' && currentStyles.filterChipActiveGreen
            ]}
          >
            <Text
              style={[
                currentStyles.filterText,
                filterStatus === 'resolved' && { color: '#34d399' }
              ]}
            >
              Resolved
            </Text>
          </TouchableOpacity>
        </View>

        {/* Reports List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={currentStyles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || loading}
              onRefresh={onRefresh}
              tintColor="#10b981"
              colors={['#10b981']}
            />
          }
        >
          {filteredReports.length === 0 ? (
            <View style={currentStyles.emptyCard}>
              <Text style={currentStyles.emptyIcon}>🔍</Text>
              <Text style={currentStyles.emptyTitle}>No reports match filter</Text>
              <Text style={currentStyles.emptySub}>
                Try selecting 'All' or reporting a new issue.
              </Text>
            </View>
          ) : (
            filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onPress={() => navigation.navigate('ReportDetail', { reportId: report.id })}
              />
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = (isDark) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: isDark ? '#f8fafc' : '#0f172a',
  },
  subtitle: {
    fontSize: 12.5,
    color: isDark ? '#94a3b8' : '#64748b',
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: isDark ? '#334155' : '#cbd5e1',
    borderColor: isDark ? '#64748b' : '#94a3b8',
  },
  filterChipActiveBlue: {
    backgroundColor: '#1e3a8a30',
    borderColor: '#3b82f6',
  },
  filterChipActiveOrange: {
    backgroundColor: '#7c2d1230',
    borderColor: '#f97316',
  },
  filterChipActiveGreen: {
    backgroundColor: '#064e3b30',
    borderColor: '#10b981',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: isDark ? '#94a3b8' : '#64748b',
  },
  filterTextActive: {
    color: isDark ? '#f8fafc' : '#0f172a',
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 32,
  },
  emptyCard: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginTop: 24,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e2e8f0',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: isDark ? '#f8fafc' : '#0f172a',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12.5,
    color: isDark ? '#64748b' : '#94a3b8',
  }
});
