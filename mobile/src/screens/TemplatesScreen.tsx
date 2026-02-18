/**
 * @file TemplatesScreen.tsx — Browse and search templates
 */
import { api } from '@/services/api';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

export function TemplatesScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.get('/api/templates'),
  });
  const navigation = useNavigation<any>();

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={data ?? []}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate('TemplateDetail', { id: item.id })}
          accessibilityRole="button"
          accessibilityLabel={`${item.name} template`}
        >
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        </Pressable>
      )}
      ListEmptyComponent={
        !isLoading ? <Text style={styles.empty}>No templates found</Text> : null
      }
    />
  );
}

/**
 * @file TemplateDetailScreen.tsx — View template detail
 */
export function TemplateDetailScreen({ route }: any) {
  const { id } = route.params;
  const { data, isLoading } = useQuery({
    queryKey: ['template', id],
    queryFn: () => api.get(`/api/templates/${id}`),
  });

  if (isLoading) return <View style={styles.center}><Text>Loading…</Text></View>;

  return (
    <View style={styles.detail}>
      <Text style={styles.detailTitle} accessibilityRole="header">{data?.name}</Text>
      <Text style={styles.detailBody}>{data?.content || data?.description}</Text>
    </View>
  );
}

/**
 * @file ComplianceScreen.tsx — Compliance framework overview
 */
export function ComplianceScreen() {
  const { data } = useQuery({
    queryKey: ['compliance-summary'],
    queryFn: () => api.get('/api/compliance/summary'),
  });

  return (
    <View style={styles.container}>
      <Text style={styles.heading} accessibilityRole="header">Compliance Overview</Text>
      {data?.frameworks?.map((fw: any) => (
        <View key={fw.id} style={styles.fwRow} accessible accessibilityLabel={`${fw.name}: ${fw.score}%`}>
          <Text style={styles.fwName}>{fw.name}</Text>
          <Text style={styles.fwScore}>{fw.score}%</Text>
        </View>
      ))}
    </View>
  );
}

/**
 * @file SettingsScreen.tsx — App settings
 */
export function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading} accessibilityRole="header">Settings</Text>
      <Text style={styles.settingLabel}>Version 1.0.0</Text>
    </View>
  );
}

/**
 * @file DocumentCaptureScreen.tsx — Camera OCR placeholder (P5.3.5)
 */
export function DocumentCaptureScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.heading} accessibilityRole="header">Document Scanner</Text>
      <Text style={styles.settingLabel}>Camera OCR integration coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  list: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    minHeight: 48,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  cardDesc: { fontSize: 14, color: '#64748b', marginTop: 4 },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  detail: { flex: 1, backgroundColor: '#fff', padding: 20 },
  detailTitle: { fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
  detailBody: { fontSize: 15, color: '#334155', lineHeight: 24 },
  heading: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
  fwRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
    minHeight: 48,
  },
  fwName: { fontSize: 15, color: '#334155' },
  fwScore: { fontSize: 15, fontWeight: '700', color: '#2563eb' },
  settingLabel: { fontSize: 15, color: '#64748b' },
});
