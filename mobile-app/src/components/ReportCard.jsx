import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import StatusBadge from './StatusBadge';
import { categoriesConfig, volumeConfig } from '../data/mockData';

export default function ReportCard({ report, onPress }) {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const currentStyles = styles(isDark);
  const categoryInfo = categoriesConfig[report.category] || {
    label: report.category,
    color: '#94a3b8'
  };

  const volumeInfo = volumeConfig[report.volume] || { label: report.volume };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={currentStyles.card}
    >
      <Image
        source={{ uri: report.image_url }}
        style={currentStyles.thumbnail}
        resizeMode="cover"
      />
      
      <View style={currentStyles.details}>
        <View style={currentStyles.headerRow}>
          <Text
            numberOfLines={1}
            style={[currentStyles.categoryLabel, { color: categoryInfo.color }]}
          >
            {categoryInfo.label}
          </Text>
          <StatusBadge status={report.status} size="small" />
        </View>

        <Text numberOfLines={1} style={currentStyles.address}>
          📍 {report.address}
        </Text>

        {report.comment ? (
          <Text numberOfLines={1} style={currentStyles.comment}>
            "{report.comment}"
          </Text>
        ) : null}

        <View style={currentStyles.footerRow}>
          <Text style={currentStyles.timestamp}>{formatDate(report.timestamp)}</Text>
          <View style={currentStyles.volumeChip}>
            <Text style={currentStyles.volumeText}>{volumeInfo.label.split(' ')[0]}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = (isDark) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  thumbnail: {
    width: 84,
    height: 84,
    borderRadius: 12,
    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
  },
  details: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 6,
  },
  address: {
    fontSize: 12,
    color: isDark ? '#cbd5e1' : '#475569',
    fontWeight: '500',
    marginBottom: 2,
  },
  comment: {
    fontSize: 11.5,
    color: isDark ? '#94a3b8' : '#64748b',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 11,
    color: isDark ? '#64748b' : '#94a3b8',
    fontWeight: '500',
  },
  volumeChip: {
    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e2e8f0',
  },
  volumeText: {
    fontSize: 10,
    color: isDark ? '#94a3b8' : '#64748b',
    fontWeight: '600',
  }
});
