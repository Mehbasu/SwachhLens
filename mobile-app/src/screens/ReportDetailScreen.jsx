import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useReports } from '../context/ReportsContext';
import StatusBadge from '../components/StatusBadge';
import { categoriesConfig, volumeConfig } from '../data/mockData';

export default function ReportDetailScreen({ route, navigation }) {
  const { reportId } = route.params || {};
  const { reports } = useReports();

  const report = reports.find((r) => r.id === reportId) || reports[0];

  const categoryInfo = categoriesConfig[report?.category] || { label: report?.category };
  const volumeInfo = volumeConfig[report?.volume] || { label: report?.volume };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  const defaultTimeline = [
    { step: "Submitted via App", time: formatDate(report?.timestamp), done: true },
    { step: "Acknowledged by Control Room", time: "Aug 13, 10:22 AM", done: true },
    { step: "In Progress (Crew Dispatched)", time: report?.status !== 'submitted' ? "Aug 13, 11:00 AM" : "Pending", done: report?.status !== 'submitted' },
    { step: "Resolved & Verified", time: report?.status === 'resolved' ? "Aug 13, 02:15 PM" : "Pending", done: report?.status === 'resolved' }
  ];

  const timelineSteps = report?.timeline || defaultTimeline;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Top Navigation Bar */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{report?.id}</Text>
        <StatusBadge status={report?.status} size="small" />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo Header */}
        <View style={styles.imageCard}>
          <Image
            source={{ uri: report?.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.aiBadgeOverlay}>
            <Text style={styles.aiBadgeText}>
              🤖 AI Confidence: {report?.ai_confidence || 94}%
            </Text>
          </View>
        </View>

        {/* Primary Metadata Box */}
        <View style={styles.metaCard}>
          <Text style={[styles.categoryTitle, { color: categoryInfo.color || '#38bdf8' }]}>
            {categoryInfo.label}
          </Text>

          <View style={styles.chipRow}>
            <View style={styles.infoChip}>
              <Text style={styles.chipLabel}>Volume:</Text>
              <Text style={styles.chipValue}>{volumeInfo.label}</Text>
            </View>

            <View style={styles.infoChip}>
              <Text style={styles.chipLabel}>Status:</Text>
              <Text style={styles.chipValue}>{report?.status?.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Location details */}
          <View style={styles.detailRow}>
            <Text style={styles.icon}>📍</Text>
            <View style={styles.detailTextCol}>
              <Text style={styles.detailTitle}>Location & Address</Text>
              <Text style={styles.detailBody}>{report?.address}</Text>
              <Text style={styles.coordsText}>
                GPS: {report?.gps?.lat?.toFixed(4)}° N, {report?.gps?.lng?.toFixed(4)}° E
              </Text>
            </View>
          </View>

          {/* Timestamp */}
          <View style={styles.detailRow}>
            <Text style={styles.icon}>📅</Text>
            <View style={styles.detailTextCol}>
              <Text style={styles.detailTitle}>Reported Date & Time</Text>
              <Text style={styles.detailBody}>{formatDate(report?.timestamp)}</Text>
            </View>
          </View>

          {/* Comment */}
          {report?.comment ? (
            <View style={styles.detailRow}>
              <Text style={styles.icon}>💬</Text>
              <View style={styles.detailTextCol}>
                <Text style={styles.detailTitle}>Citizen Remark</Text>
                <Text style={styles.commentBody}>"{report?.comment}"</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Status Timeline Progress */}
        <Text style={styles.sectionHeader}>Resolution Progress Tracker</Text>
        <View style={styles.timelineCard}>
          {timelineSteps.map((item, index) => {
            const isLast = index === timelineSteps.length - 1;
            return (
              <View key={index} style={styles.timelineRow}>
                <View style={styles.timelineLeftCol}>
                  <View
                    style={[
                      styles.stepDot,
                      item.done && styles.stepDotDone
                    ]}
                  >
                    <Text style={styles.stepDotText}>{item.done ? '✓' : index + 1}</Text>
                  </View>
                  {!isLast && (
                    <View
                      style={[
                        styles.timelineLine,
                        item.done && styles.timelineLineDone
                      ]}
                    />
                  )}
                </View>

                <View style={styles.timelineRightCol}>
                  <Text
                    style={[
                      styles.stepTitle,
                      item.done && styles.stepTitleDone
                    ]}
                  >
                    {item.step}
                  </Text>
                  <Text style={styles.stepTime}>{item.time}</Text>
                </View>
              </View>
            );
          })}
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
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backBtn: {
    paddingVertical: 4,
    paddingRight: 10,
  },
  backBtnText: {
    color: '#38bdf8',
    fontWeight: '700',
    fontSize: 14,
  },
  navTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f8fafc',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  imageCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 230,
  },
  aiBadgeOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#0f172ae0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b98150',
  },
  aiBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#34d399',
  },
  metaCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipLabel: {
    fontSize: 11.5,
    color: '#64748b',
    marginRight: 4,
  },
  chipValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#f8fafc',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  icon: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 2,
  },
  detailTextCol: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailBody: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#f8fafc',
  },
  coordsText: {
    fontSize: 11,
    color: '#38bdf8',
    marginTop: 2,
  },
  commentBody: {
    fontSize: 13,
    color: '#cbd5e1',
    fontStyle: 'italic',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 12,
  },
  timelineCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineLeftCol: {
    alignItems: 'center',
    marginRight: 14,
    width: 24,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotDone: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  stepDotText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
    backgroundColor: '#334155',
    marginVertical: 4,
  },
  timelineLineDone: {
    backgroundColor: '#10b981',
  },
  timelineRightCol: {
    flex: 1,
    paddingBottom: 16,
  },
  stepTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 2,
  },
  stepTitleDone: {
    color: '#f8fafc',
    fontWeight: '700',
  },
  stepTime: {
    fontSize: 11,
    color: '#94a3b8',
  }
});
