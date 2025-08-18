import React, { useState } from 'react';
import { Button, TextInput, View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTenant } from '@/contexts/TenantContext';
import { getCourse } from '@/app/lib/api';

export default function CourseSelect() {
  const { tenant, setTenant } = useTenant();
  const [slug, setSlug] = useState<string>(tenant);
  const [info, setInfo] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const load = async () => {
    setLoading(true); setError(undefined);
    try {
      const profile = await getCourse(slug);
      setTenant(slug);
      setInfo(profile);
    } catch (e: any) {
      setError(e?.message || 'Failed to load course');
    } finally { setLoading(false); }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Course Select</ThemedText>
      <TextInput placeholder="tenant slug (e.g., manatee-gc)" style={styles.input} value={slug} onChangeText={setSlug} />
      <View style={styles.row}>
        <Button title="Use Manatee" onPress={() => setSlug('manatee-gc')} />
        <Button title={loading ? 'Loading...' : 'Load Course'} onPress={load} />
      </View>
      {error && <ThemedText style={{ color: 'red' }}>{error}</ThemedText>}
      {info && (
        <View style={styles.card}>
          <ThemedText type="subtitle">{info.name}</ThemedText>
          <ThemedText>Slug: {info.slug}</ThemedText>
          {info.colors?.primary && <ThemedText>Primary: {info.colors.primary}</ThemedText>}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, padding: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 },
  row: { flexDirection: 'row', gap: 12 },
  card: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
});
