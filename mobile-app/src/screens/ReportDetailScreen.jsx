import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReports } from '../contexts/ReportsContext';
import { useTheme } from '../contexts/ThemeContext';
import StatusBadge from '../components/StatusBadge';
import { categoriesConfig, volumeConfig } from '../data/mockData';

export default function ReportDetailScreen({ route, navigation }) {
  const { reportId } = route.params || {};
  const { reports } = useReports();
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const currentStyles = styles(isDark);

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
    <SafeAreaView style={currentStyles.safeArea}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#0f172a" : "#f1f5f9"} />
      
      {/* Top Navigation Bar */}
      <View style={currentStyles.navHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={currentStyles.backBtn}
        >
          <Text style={currentStyles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={currentStyles.navTitle}>{report?.id}</Text>
        <StatusBadge status={report?.status} size="small" />
      </View>

      <ScrollView
        contentContainerStyle={currentStyles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo Header */}
        <View style={currentStyles.imageCard}>
          <Image
            source={{ uri: report?.image_url }}
            style={currentStyles.image}
            resizeMode="cover"
          />
          <View style={currentStyles.aiBadgeOverlay}>
            <Text style={currentStyles.aiBadgeText}>
              🤖 AI Confidence: {report?.ai_confidence || 94}%
            </Text>
          </View>
        </View>

        {/* Primary Metadata Box */}
        <View style={currentStyles.metaCard}>
          <Text style={[currentStyles.categoryTitle, { color: categoryInfo.color || '#38bdf8' }]}>
            {categoryInfo.label}
          </Text>

          <View style={currentStyles.chipRow}>
            <View style={currentStyles.infoChip}>
              <Text style={currentStyles.chipLabel}>Volume:</Text>
              <Text style={currentStyles.chipValue}>{volumeInfo.label}</Text>
            </View>

            <View style={currentStyles.infoChip}>
              <Text style={currentStyles.chipLabel}>Status:</Text>
              <Text style={currentStyles.chipValue}>{report?.status?.toUpperCase()}</Text>
            </View>
          </View>

          <View style={currentStyles.divider} />

          {/* Location details */}
          <View style={currentStyles.detailRow}>
            <Text style={currentStyles.icon}>📍</Text>
            <View style={currentStyles.detailTextCol}>
              <Text style={currentStyles.detailTitle}>Location & Address</Text>
              <Text style={currentStyles.detailBody}>{report?.address}</Text>
              <Text style={currentStyles.coordsText}>
                GPS: {report?.gps?.lat?.toFixed(4)}° N, {report?.gps?.lng?.toFixed(4)}° E
              </Text>
            </View>
          </View>

          {/* Timestamp */}
          <View style={currentStyles.detailRow}>
            <Text style={currentStyles.icon}>📅</Text>
            <View style={currentStyles.detailTextCol}>
              <Text style={currentStyles.detailTitle}>Reported Date & Time</Text>
              <Text style={currentStyles.detailBody}>{formatDate(report?.timestamp)}</Text>
            </View>
          </View>

          {/* Comment */}
          {report?.comment ? (
            <View style={currentStyles.detailRow}>
              <Text style={currentStyles.icon}>💬</Text>
              <View style={currentStyles.detailTextCol}>
                <Text style={currentStyles.detailTitle}>Citizen Remark</Text>
                <Text style={currentStyles.commentBody}>"{report?.comment}"</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Status Timeline Progress */}
        <Text style={currentStyles.sectionHeader}>Resolution Progress Tracker</Text>
        <View style={currentStyles.timelineCard}>
          {timelineSteps.map((item, index) => {
            const isLast = index === timelineSteps.length - 1;
            return (
              <View key={index} style={currentStyles.timelineRow}>
                <View style={currentStyles.timelineLeftCol}>
                  <View
                    style={[
                      currentStyles.stepDot,
                      item.done && currentStyles.stepDotDone
                    ]}
                  >
                    <Text style={currentStyles.stepDotText}>{item.done ? '✓' : index + 1}</Text>
                  </View>
                  {!isLast && (
                    <View
                      style={[
                        currentStyles.timelineLine,
                        item.done && currentStyles.timelineLineDone
                      ]}
                    />
                  )}
                </View>

                <View style={currentStyles.timelineRightCol}>
                  <Text
                    style={[
                      currentStyles.stepTitle,
                      item.done && currentStyles.stepTitleDone
                    ]}
                  >
                    {item.step}
                  </Text>
                  <Text style={currentStyles.stepTime}>{item.time}</Text>
                </View>
              </View>
            );
          })}
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
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#334155' : '#e2e8f0',
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
    color: isDark ? '#f8fafc' : '#0f172a',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  imageCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e2e8f0',
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
    backgroundColor: isDark ? '#0f172ae0' : '#ffffffd9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b98150',
  },
  aiBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: isDark ? '#34d399' : '#059669',
  },
  metaCard: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e2e8f0',
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
    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e2e8f0',
  },
  chipLabel: {
    fontSize: 11.5,
    color: isDark ? '#64748b' : '#94a3b8',
    marginRight: 4,
  },
  chipValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: isDark ? '#f8fafc' : '#0f172a',
  },
  divider: {
    height: 1,
    backgroundColor: isDark ? '#334155' : '#e2e8f0',
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
    color: isDark ? '#64748b' : '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailBody: {
    fontSize: 13.5,
    fontWeight: '600',
    color: isDark ? '#f8fafc' : '#0f172a',
  },
  coordsText: {
    fontSize: 11,
    color: '#38bdf8',
    marginTop: 2,
  },
  commentBody: {
    fontSize: 13,
    color: isDark ? '#cbd5e1' : '#475569',
    fontStyle: 'italic',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: isDark ? '#f8fafc' : '#0f172a',
    marginBottom: 12,
  },
  timelineCard: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e2e8f0',
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
    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
    borderWidth: 2,
    borderColor: isDark ? '#475569' : '#cbd5e1',
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
    backgroundColor: isDark ? '#334155' : '#e2e8f0',
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
    color: isDark ? '#64748b' : '#94a3b8',
    marginBottom: 2,
  },
  stepTitleDone: {
    color: isDark ? '#f8fafc' : '#0f172a',
    fontWeight: '700',
  },
  stepTime: {
    fontSize: 11,
    color: isDark ? '#94a3b8' : '#64748b',
  }
});
