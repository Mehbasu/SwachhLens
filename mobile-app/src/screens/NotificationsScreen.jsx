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

export default function NotificationsScreen({ navigation }) {
  const { notifications, markNotificationRead } = useReports();

  const handlePress = (notif) => {
    markNotificationRead(notif.id);
    if (notif.report_id) {
      navigation.navigate('ReportDetail', { reportId: notif.report_id });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Notifications 🔔</Text>
          <Text style={styles.subtitle}>
            Real-time updates on your submitted reports & eco rewards
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🔕</Text>
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySub}>
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
                  styles.card,
                  notif.unread && styles.cardUnread
                ]}
              >
                <View style={styles.iconCircle}>
                  <Text style={styles.notifIcon}>
                    {notif.type === 'resolved' ? '🎉' : notif.type === 'in_progress' ? '🚚' : notif.type === 'reward' ? '⭐' : '📋'}
                  </Text>
                </View>

                <View style={styles.detailsCol}>
                  <View style={styles.rowTop}>
                    <Text style={styles.notifTitle}>{notif.title}</Text>
                    {notif.unread && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notifMessage}>{notif.message}</Text>
                  <Text style={styles.timestamp}>{notif.timestamp}</Text>
                </View>
              </TouchableOpacity>
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
    marginBottom: 16,
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
  listContent: {
    paddingBottom: 32,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardUnread: {
    borderColor: '#10b981',
    backgroundColor: '#1e293b',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#334155',
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
    color: '#f8fafc',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  notifMessage: {
    fontSize: 12.5,
    color: '#cbd5e1',
    lineHeight: 18,
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
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
