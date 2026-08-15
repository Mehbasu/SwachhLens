import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import StatusBadge from './StatusBadge';
import { categoriesConfig, volumeConfig } from '../data/mockData';

export default function ReportCard({ report, onPress }) {
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
      style={styles.card}
    >
      <Image
        source={{ uri: report.image_url }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      
      <View style={styles.details}>
        <View style={styles.headerRow}>
          <Text
            numberOfLines={1}
            style={[styles.categoryLabel, { color: categoryInfo.color }]}
          >
            {categoryInfo.label}
          </Text>
          <StatusBadge status={report.status} size="small" />
        </View>

        <Text numberOfLines={1} style={styles.address}>
          📍 {report.address}
        </Text>

        {report.comment ? (
          <Text numberOfLines={1} style={styles.comment}>
            "{report.comment}"
          </Text>
        ) : null}

        <View style={styles.footerRow}>
          <Text style={styles.timestamp}>{formatDate(report.timestamp)}</Text>
          <View style={styles.volumeChip}>
            <Text style={styles.volumeText}>{volumeInfo.label.split(' ')[0]}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
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
    backgroundColor: '#0f172a',
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
    color: '#cbd5e1',
    fontWeight: '500',
    marginBottom: 2,
  },
  comment: {
    fontSize: 11.5,
    color: '#94a3b8',
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
    color: '#64748b',
    fontWeight: '500',
  },
  volumeChip: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  volumeText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  }
});
