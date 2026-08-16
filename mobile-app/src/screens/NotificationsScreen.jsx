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
import { useTheme } from '../contexts/ThemeContext';

export default function NotificationsScreen({ navigation }) {
  const { notifications, markNotificationRead } = useReports();
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const currentStyles = styles(isDark);

  const handlePress = (notif) => {
    markNotificationRead(notif.id);
    if (notif.report_id) {
      navigation.navigate('ReportDetail', { reportId: notif.report_id });
    }
  };

  return (
    <SafeAreaView style={currentStyles.safeArea}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#0f172a" : "#f1f5f9"} />
      <View style={currentStyles.container}>
        <View style={currentStyles.header}>
          <Text style={currentStyles.title}>Notifications 🔔</Text>
          <Text style={currentStyles.subtitle}>
            Real-time updates on your submitted reports & eco rewards
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={currentStyles.listContent}
        >
          {notifications.length === 0 ? (
            <View style={currentStyles.emptyCard}>
              <Text style={currentStyles.emptyIcon}>🔕</Text>
              <Text style={currentStyles.emptyTitle}>No notifications yet</Text>
              <Text style={currentStyles.emptySub}>
                Updates on your reported waste issues will appear here.
              </Text>
            </View>
          ) : (
            notifications.map((notif) => (
              <TouchableOpacity
                key={notif.id}
                activeOpacity={0.75}
                onPress={() => handlePress(notif)}
                style={[
                  currentStyles.card,
                  notif.unread && currentStyles.cardUnread
                ]}
              >
                <View style={currentStyles.iconCircle}>
                  <Text style={currentStyles.notifIcon}>
                    {notif.type === 'resolved' ? '🎉' : notif.type === 'in_progress' ? '🚚' : notif.type === 'reward' ? '⭐' : '📋'}
                  </Text>
                </View>

                <View style={currentStyles.detailsCol}>
                  <View style={currentStyles.rowTop}>
                    <Text style={currentStyles.notifTitle}>{notif.title}</Text>
                    {notif.unread && <View style={currentStyles.unreadDot} />}
                  </View>
                  <Text style={currentStyles.notifMessage}>{notif.message}</Text>
                  <Text style={currentStyles.timestamp}>{notif.timestamp}</Text>
                </View>
              </TouchableOpacity>
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
    marginBottom: 16,
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
  listContent: {
    paddingBottom: 32,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e2e8f0',
  },
  cardUnread: {
    borderColor: '#10b981',
    backgroundColor: isDark ? '#1e293b' : '#f0fdf4',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e2e8f0',
  },
  notifIcon: {
    fontSize: 20,
  },
  detailsCol: {
    flex: 1,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: isDark ? '#f8fafc' : '#0f172a',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  notifMessage: {
    fontSize: 12.5,
    color: isDark ? '#cbd5e1' : '#475569',
    lineHeight: 18,
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 11,
    color: isDark ? '#64748b' : '#94a3b8',
    fontWeight: '500',
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
