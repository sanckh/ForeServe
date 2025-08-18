import React, { useState } from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useCart } from '@/contexts/CartContext';
import { useTenant } from '@/contexts/TenantContext';
import { getOrder } from '@/app/lib/api';

export default function OrdersScreen() {
  const { lastOrderId } = useCart();
  const { tenant } = useTenant();
  const [id, setId] = useState<string>(lastOrderId ?? '');
  const [status, setStatus] = useState<string>('');
  const [claimedBy, setClaimedBy] = useState<string | undefined>();
  const [updatedAt, setUpdatedAt] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    if (!id) { setError('Enter order ID'); return; }
    setLoading(true); setError(undefined);
    try {
      const o = await getOrder(tenant, id);
      setStatus(o.status);
      setClaimedBy(o.claimedBy);
      setUpdatedAt(o.updatedAt);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch');
      setStatus(''); setClaimedBy(undefined); setUpdatedAt(undefined);
    } finally { setLoading(false); }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Order Status</ThemedText>
      <TextInput placeholder="Order ID" value={id} onChangeText={setId} style={styles.input} />
      <View style={{ height: 8 }} />
      <Button title={loading ? 'Fetching...' : 'Fetch Status'} onPress={fetchStatus} />
      {status ? (
        <View style={styles.card}>
          <ThemedText>Status: {status}</ThemedText>
          {claimedBy && <ThemedText>Claimed by: {claimedBy}</ThemedText>}
          {updatedAt && <ThemedText>Updated: {new Date(updatedAt).toLocaleString()}</ThemedText>}
        </View>
      ) : null}
      {error && <ThemedText style={{ color: 'red' }}>{error}</ThemedText>}
      {lastOrderId && <ThemedText>Last placed: {lastOrderId}</ThemedText>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, padding: 16, flex: 1 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 },
  card: { marginTop: 12, padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
});
