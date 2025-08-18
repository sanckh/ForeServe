import type { CourseProfile, MenuItemView, Order, OrderItem, OrderStatus } from './types';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let err: any;
    try { err = await res.json(); } catch {}
    throw new Error(err?.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getCourse(tenant: string): Promise<CourseProfile> {
  const res = await fetch(`${API_URL}/course?tenant=${encodeURIComponent(tenant)}`);
  return handle<CourseProfile>(res);
}

export async function getMenu(tenant: string): Promise<{ items: MenuItemView[] }> {
  const res = await fetch(`${API_URL}/menu?tenant=${encodeURIComponent(tenant)}`);
  return handle<{ items: MenuItemView[] }>(res);
}

export async function createOrder(tenant: string, items: OrderItem[]): Promise<Order> {
  const res = await fetch(`${API_URL}/orders?tenant=${encodeURIComponent(tenant)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  return handle<Order>(res);
}

export async function claimOrder(tenant: string, id: string, token: string, staffUser?: string): Promise<Order> {
  const res = await fetch(`${API_URL}/orders/${encodeURIComponent(id)}/claim?tenant=${encodeURIComponent(tenant)}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      ...(staffUser ? { 'X-Staff-User': staffUser } : {}),
    },
  });
  return handle<Order>(res);
}

export async function updateOrderStatus(tenant: string, id: string, status: OrderStatus, token: string): Promise<Order> {
  const res = await fetch(`${API_URL}/orders/${encodeURIComponent(id)}/status?tenant=${encodeURIComponent(tenant)}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handle<Order>(res);
}

export async function toggle86(tenant: string, productId: string, is86: boolean, token: string): Promise<{ ok: true }> {
  const res = await fetch(`${API_URL}/menu/86?tenant=${encodeURIComponent(tenant)}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, is86 }),
  });
  return handle<{ ok: true }>(res);
}

export async function getOrder(tenant: string, id: string): Promise<Order> {
  const res = await fetch(`${API_URL}/orders/${encodeURIComponent(id)}?tenant=${encodeURIComponent(tenant)}`);
  return handle<Order>(res);
}
