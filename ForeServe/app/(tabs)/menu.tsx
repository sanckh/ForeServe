import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTenant } from '@/contexts/TenantContext';
import { useCart } from '@/contexts/CartContext';
import { getMenu, createOrder } from '@/app/lib/api';
import type { MenuItemView } from '@/app/lib/types';
import { useRouter } from 'expo-router';

export default function MenuScreen() {
  const { tenant } = useTenant();
  const { add, toOrderItems, clear, setLastOrderId } = useCart();
  const [items, setItems] = useState<MenuItemView[]>([]);
  const [loading, setLoading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true); setError(undefined);
    try {
      const res = await getMenu(tenant);
      setItems(res.items);
    } catch (e: any) { setError(e?.message || 'Failed to load menu'); }
    finally { setLoading(false); }
  }, [tenant]);

  useEffect(() => { load(); }, [load]);

  const place = async () => {
    setPlacing(true); setError(undefined);
    try {
      const order = await createOrder(tenant, toOrderItems());
      setLastOrderId(order.id);
      clear();
      router.push('/(tabs)/orders');
    } catch (e: any) { setError(e?.message || 'Failed to place order'); }
    finally { setPlacing(false); }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Menu</ThemedText>
      {loading ? <ActivityIndicator /> : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.productId}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <ThemedText type="subtitle">{item.name}</ThemedText>
              <ThemedText>${item.price.toFixed(2)} {item.available ? '' : '(unavailable)'}</ThemedText>
              <Button title="Add" onPress={() => add(item.productId)} disabled={!item.available} />
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
      <View style={styles.footer}>
        <Button title={placing ? 'Placing...' : 'Place Order'} onPress={place} />
      </View>
      {error && <ThemedText style={{ color: 'red' }}>{error}</ThemedText>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, padding: 16, flex: 1 },
  card: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  footer: { paddingVertical: 8 },
});
