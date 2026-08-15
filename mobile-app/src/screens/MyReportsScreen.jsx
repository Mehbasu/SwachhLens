import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl
} from 'react-native';
import { useReports } from '../context/ReportsContext';
import ReportCard from '../components/ReportCard';

export default function MyReportsScreen({ navigation }) {
  const { reports, loading, refreshReports } = useReports();
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Reports 📋</Text>
          <Text style={styles.subtitle}>
            Track real-time municipal response & cleanup verification
          </Text>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            onPress={() => setFilterStatus('all')}
            style={[
              styles.filterChip,
              filterStatus === 'all' && styles.filterChipActive
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filterStatus === 'all' && styles.filterTextActive
              ]}
            >
              All ({reports.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterStatus('submitted')}
            style={[
              styles.filterChip,
              filterStatus === 'submitted' && styles.filterChipActiveBlue
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filterStatus === 'submitted' && { color: '#60a5fa' }
              ]}
            >
              Submitted
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterStatus('in_progress')}
            style={[
              styles.filterChip,
              filterStatus === 'in_progress' && styles.filterChipActiveOrange
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filterStatus === 'in_progress' && { color: '#fb923c' }
              ]}
            >
              In Progress
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterStatus('resolved')}
            style={[
              styles.filterChip,
              filterStatus === 'resolved' && styles.filterChipActiveGreen
            ]}
          >
            <Text
              style={[
                styles.filterText,
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
          contentContainerStyle={styles.listContent}
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
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No reports match filter</Text>
              <Text style={styles.emptySub}>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
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
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 12.5,
    color: '#94a3b8',
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
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterChipActive: {
    backgroundColor: '#334155',
    borderColor: '#64748b',
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
    color: '#94a3b8',
  },
  filterTextActive: {
    color: '#f8fafc',
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 32,
  },
  emptyCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12.5,
    color: '#64748b',
  }
});
