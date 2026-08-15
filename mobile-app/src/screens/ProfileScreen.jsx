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

export default function ProfileScreen() {
  const { getStats } = useReports();
  const stats = getStats();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Citizen Profile 👤</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>RK</Text>
          </View>

          <Text style={styles.name}>Ramesh Kumar</Text>
          <Text style={styles.ward}>Resident • Ward 14 (Boring Road), Patna</Text>

          <View style={styles.badgeChip}>
            <Text style={styles.badgeText}>🌿 Level 4 Civic Sanitation Champion</Text>
          </View>
        </View>

        {/* Eco Stats Breakdown */}
        <Text style={styles.sectionTitle}>Impact & Achievements</Text>
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>⭐ Total Eco Points Earned</Text>
            <Text style={styles.statValHighlight}>{stats.ecoPoints} Pts</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>📸 Total Waste Reports Filed</Text>
            <Text style={styles.statVal}>{stats.total}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>✅ Verified Cleanups Completed</Text>
            <Text style={styles.statVal}>{stats.resolved}</Text>
          </View>
        </View>

        {/* Municipal Info & Helpline */}
        <Text style={styles.sectionTitle}>Municipal Support & Contact</Text>
        <View style={styles.infoCard}>
          <TouchableOpacity style={styles.actionRow}>
            <Text style={styles.actionIcon}>📞</Text>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Patna Municipal Helpline</Text>
              <Text style={styles.actionSub}>Toll-Free: 155304 / 1800-345-6194</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow}>
            <Text style={styles.actionIcon}>🏛️</Text>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Swachh Bharat Urban Portal</Text>
              <Text style={styles.actionSub}>Integrated Civic Redressal Cell</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow}>
            <Text style={styles.actionIcon}>⚙️</Text>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>App Preferences & Permissions</Text>
              <Text style={styles.actionSub}>Camera, GPS Geotagging & Language</Text>
            </View>
          </TouchableOpacity>
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
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 16,
    marginTop: 8,
  },
  profileCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#10b98120',
    borderWidth: 2,
    borderColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#34d399',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 4,
  },
  ward: {
    fontSize: 12.5,
    color: '#94a3b8',
    marginBottom: 12,
  },
  badgeChip: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#10b98150',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34d399',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 12,
  },
  statsCard: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  statValHighlight: {
    fontSize: 15,
    fontWeight: '800',
    color: '#34d399',
  },
  statVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f8fafc',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
  },
  infoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  actionIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  actionTextCol: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 2,
  },
  actionSub: {
    fontSize: 11.5,
    color: '#64748b',
  }
});
