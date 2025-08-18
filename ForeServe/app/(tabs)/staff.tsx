import React, { useState } from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTenant } from '@/contexts/TenantContext';
import { useStaff } from '@/contexts/StaffContext';
import { claimOrder, updateOrderStatus } from '@/app/lib/api';

export default function StaffScreen() {
  const { tenant } = useTenant();
  const { token, user, setToken, setUser } = useStaff();
  const [orderId, setOrderId] = useState('');
  const [msg, setMsg] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  const run = async (action: 'claim' | 'accepted' | 'en_route' | 'delivered') => {
    setMsg(undefined); setError(undefined);
    try {
      if (!token) throw new Error('Set staff token');
      if (!orderId) throw new Error('Enter order ID');
      if (action === 'claim') {
        const res = await claimOrder(tenant, orderId, token, user);
        setMsg(`Claimed by ${res.claimedBy ?? 'unknown'}`);
      } else {
        const res = await updateOrderStatus(tenant, orderId, action, token);
        setMsg(`Status: ${res.status}`);
      }
    } catch (e: any) { setError(e?.message || 'Failed'); }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Staff Orders</ThemedText>
      {!token ? (
        <>
          <ThemedText>Enter staff token to enable Staff Mode.</ThemedText>
          <TextInput placeholder="Staff token" value={token} onChangeText={setToken} style={styles.input} />
          <TextInput placeholder="Staff user (optional)" value={user} onChangeText={setUser as any} style={styles.input} />
          <ThemedText>Token is securely saved on device.</ThemedText>
        </>
      ) : (
        <>
          <ThemedText>Signed in {user ? `as ${user}` : ''}</ThemedText>
          <View style={styles.row}>
            <Button title="Sign out" onPress={() => {
              setToken('');
              setUser(undefined);
            }} />
          </View>
          <TextInput placeholder="Order ID" value={orderId} onChangeText={setOrderId} style={styles.input} />
          <View style={styles.row}>
            <Button title="Claim" onPress={() => run('claim')} />
            <Button title="Accepted" onPress={() => run('accepted')} />
            <Button title="En route" onPress={() => run('en_route')} />
            <Button title="Delivered" onPress={() => run('delivered')} />
          </View>
          {msg && <ThemedText>{msg}</ThemedText>}
          {error && <ThemedText style={{ color: 'red' }}>{error}</ThemedText>}
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, padding: 16, flex: 1 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
});
