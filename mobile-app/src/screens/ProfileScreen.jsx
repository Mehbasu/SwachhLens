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
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { useTheme } from '../contexts/ThemeContext';

export default function ProfileScreen() {
  const { getStats } = useReports();
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const stats = getStats();

  const currentStyles = styles(isDark);

  return (
    <SafeAreaView style={currentStyles.safeArea}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#0f172a" : "#f1f5f9"} />
      <ScrollView
        contentContainerStyle={currentStyles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={currentStyles.title}>Citizen Profile 👤</Text>

        {/* Profile Card */}
        <View style={currentStyles.profileCard}>
          <View style={currentStyles.avatarCircle}>
            <Text style={currentStyles.avatarText}>RK</Text>
          </View>

          <Text style={currentStyles.name}>Ramesh Kumar</Text>
          <Text style={currentStyles.ward}>Resident • Ward 14 (Boring Road), Patna</Text>

          <View style={currentStyles.badgeChip}>
            <Text style={currentStyles.badgeText}>🌿 Level 4 Civic Sanitation Champion</Text>
          </View>
        </View>

        {/* Eco Stats Breakdown */}
        <Text style={currentStyles.sectionTitle}>Impact & Achievements</Text>
        <View style={currentStyles.statsCard}>
          <View style={currentStyles.statRow}>
            <Text style={currentStyles.statLabel}>⭐ Total Eco Points Earned</Text>
            <Text style={currentStyles.statValHighlight}>{stats.ecoPoints} Pts</Text>
          </View>
          <View style={currentStyles.divider} />
          <View style={currentStyles.statRow}>
            <Text style={currentStyles.statLabel}>📸 Total Waste Reports Filed</Text>
            <Text style={currentStyles.statVal}>{stats.total}</Text>
          </View>
          <View style={currentStyles.divider} />
          <View style={currentStyles.statRow}>
            <Text style={currentStyles.statLabel}>✅ Verified Cleanups Completed</Text>
            <Text style={currentStyles.statVal}>{stats.resolved}</Text>
          </View>
        </View>

        {/* Municipal Info & Helpline */}
        <Text style={currentStyles.sectionTitle}>Municipal Support & Contact</Text>
        <View style={currentStyles.infoCard}>
          <TouchableOpacity style={currentStyles.actionRow}>
            <Text style={currentStyles.actionIcon}>📞</Text>
            <View style={currentStyles.actionTextCol}>
              <Text style={currentStyles.actionTitle}>Patna Municipal Helpline</Text>
              <Text style={currentStyles.actionSub}>Toll-Free: 155304 / 1800-345-6194</Text>
            </View>
          </TouchableOpacity>

          <View style={currentStyles.divider} />

          <TouchableOpacity style={currentStyles.actionRow}>
            <Text style={currentStyles.actionIcon}>🏛️</Text>
            <View style={currentStyles.actionTextCol}>
              <Text style={currentStyles.actionTitle}>Swachh Bharat Urban Portal</Text>
              <Text style={currentStyles.actionSub}>Integrated Civic Redressal Cell</Text>
            </View>
          </TouchableOpacity>

          <View style={currentStyles.divider} />

          <View style={currentStyles.actionRow}>
            <Text style={currentStyles.actionIcon}>⚙️</Text>
            <View style={currentStyles.actionTextCol}>
              <Text style={currentStyles.actionTitle}>Display Theme</Text>
              <Text style={currentStyles.actionSub}>Light, Dark, or System default</Text>
            </View>
            <ThemeSwitcher />
          </View>
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
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: isDark ? '#f8fafc' : '#0f172a',
    marginBottom: 16,
    marginTop: 8,
  },
  profileCard: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e2e8f0',
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
    color: isDark ? '#f8fafc' : '#0f172a',
    marginBottom: 4,
  },
  ward: {
    fontSize: 12.5,
    color: isDark ? '#94a3b8' : '#64748b',
    marginBottom: 12,
  },
  badgeChip: {
    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
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
    color: isDark ? '#f8fafc' : '#0f172a',
    marginBottom: 12,
  },
  statsCard: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e2e8f0',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 13,
    color: isDark ? '#cbd5e1' : '#475569',
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
    color: isDark ? '#f8fafc' : '#0f172a',
  },
  divider: {
    height: 1,
    backgroundColor: isDark ? '#334155' : '#e2e8f0',
  },
  infoCard: {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#e2e8f0',
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
    marginRight: 8,
  },
  actionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: isDark ? '#f8fafc' : '#0f172a',
    marginBottom: 2,
  },
  actionSub: {
    fontSize: 11.5,
    color: isDark ? '#64748b' : '#94a3b8',
  }
});
