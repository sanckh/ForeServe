import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { OrderItem } from '@/app/lib/types';

interface CartState {
  items: Record<string, number>; // productId -> qty
  add: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
  toOrderItems: () => OrderItem[];
  lastOrderId?: string;
  setLastOrderId: (id?: string) => void;
}

const CartCtx = createContext<CartState | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Record<string, number>>({});
  const [lastOrderId, setLastOrderId] = useState<string | undefined>();

  const add = useCallback((productId: string) => setItems((prev) => ({ ...prev, [productId]: (prev[productId] ?? 0) + 1 })), []);
  const remove = useCallback((productId: string) => setItems((prev) => {
    const qty = (prev[productId] ?? 0) - 1;
    const next = { ...prev };
    if (qty <= 0) delete next[productId];
    else next[productId] = qty;
    return next;
  }), []);
  const clear = useCallback(() => setItems({}), []);

  const toOrderItems = useCallback((): OrderItem[] => Object.entries(items).map(([productId, qty]) => ({ productId, qty })), [items]);

  const value = useMemo(
    () => ({ items, add, remove, clear, toOrderItems, lastOrderId, setLastOrderId }),
    [items, add, remove, clear, toOrderItems, lastOrderId]
  );
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
