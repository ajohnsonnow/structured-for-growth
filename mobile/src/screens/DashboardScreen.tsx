/**
 * @file DashboardScreen.tsx — Home dashboard for the mobile app
 */

import { api } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

export function DashboardScreen() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/api/dashboard/summary'),
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      accessible
      accessibilityRole="scrollbar"
    >
      <Text style={styles.greeting} accessibilityRole="header">
        Welcome back
      </Text>

      <View style={styles.cardGrid}>
        <StatCard label="Templates" value={data?.templateCount ?? '—'} />
        <StatCard label="Compliance" value={data?.complianceScore ? `${data.complianceScore}%` : '—'} />
        <StatCard label="Evidence" value={data?.evidenceCount ?? '—'} />
        <StatCard label="Pending" value={data?.pendingActions ?? '—'} />
      </View>

      <Text style={styles.sectionTitle} accessibilityRole="header">
        Recent Activity
      </Text>

      {data?.recentActivity?.map((item: any, i: number) => (
        <View key={i} style={styles.activityRow} accessible accessibilityLabel={`${item.action} — ${item.timestamp}`}>
          <Text style={styles.activityText}>{item.action}</Text>
          <Text style={styles.activityTime}>{item.timestamp}</Text>
        </View>
      ))}

      {!data?.recentActivity?.length && !isLoading && (
        <Text style={styles.emptyText}>No recent activity</Text>
      )}
    </ScrollView>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Pressable
      style={styles.statCard}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
    >
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16 },
  greeting: { fontSize: 24, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 48,
  },
  statValue: { fontSize: 28, fontWeight: '700', color: '#2563eb' },
  statLabel: { fontSize: 14, color: '#64748b', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 12 },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    minHeight: 48,
  },
  activityText: { fontSize: 15, color: '#334155', flex: 1 },
  activityTime: { fontSize: 13, color: '#94a3b8' },
  emptyText: { fontSize: 15, color: '#94a3b8', textAlign: 'center', marginTop: 24 },
});
