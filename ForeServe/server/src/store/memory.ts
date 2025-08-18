import { MenuItemView, Order, OrderItem, OrderStatus, Tenant, TenantProduct, TenantProductStatus } from '../types/domain';

// In-memory data stores
const tenants: Tenant[] = [];
const tenantProducts: TenantProduct[] = [];
const tenantProductStatuses: TenantProductStatus[] = [];
const orders: Order[] = [];

// Helpers
const now = () => new Date().toISOString();
const genId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

// Tenant ops
export function addTenant(t: Tenant) {
  tenants.push(t);
}

export function getTenantBySlug(slug: string): Tenant | undefined {
  return tenants.find((t) => t.slug === slug);
}

// Tenant product ops
export function setTenantProduct(tp: TenantProduct) {
  const idx = tenantProducts.findIndex((x) => x.tenantId === tp.tenantId && x.productId === tp.productId);
  if (idx >= 0) tenantProducts[idx] = tp;
  else tenantProducts.push(tp);
}

export function getTenantProduct(tenantId: string, productId: string): TenantProduct | undefined {
  return tenantProducts.find((x) => x.tenantId === tenantId && x.productId === productId);
}

export function setTenantProductStatus(s: TenantProductStatus) {
  const idx = tenantProductStatuses.findIndex((x) => x.tenantId === s.tenantId && x.productId === s.productId);
  if (idx >= 0) tenantProductStatuses[idx] = s;
  else tenantProductStatuses.push(s);
}

export function getTenantProductStatus(tenantId: string, productId: string): TenantProductStatus | undefined {
  return tenantProductStatuses.find((x) => x.tenantId === tenantId && x.productId === productId);
}

// Orders
export function createOrder(tenantId: string, items: OrderItem[]): Order {
  const id = genId();
  const placedAt = now();
  const order: Order = {
    id,
    tenantId,
    status: 'placed',
    items,
    placedAt,
    updatedAt: placedAt,
  };
  orders.push(order);
  return order;
}

export function getOrderById(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}

export function listOrdersByTenant(tenantId: string): Order[] {
  return orders.filter((o) => o.tenantId === tenantId);
}

export function claimOrder(id: string, staffUser: string): Order | undefined {
  const o = getOrderById(id);
  if (!o) return undefined;
  if (o.claimedBy && o.claimedBy !== staffUser) return o; // already claimed by someone else
  o.claimedBy = staffUser;
  o.status = o.status === 'placed' ? 'accepted' : o.status;
  o.updatedAt = now();
  return o;
}

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  placed: ['accepted'],
  accepted: ['en_route', 'delivered'],
  en_route: ['delivered'],
  delivered: [],
};

export function updateOrderStatus(id: string, next: OrderStatus): Order | undefined {
  const o = getOrderById(id);
  if (!o) return undefined;
  const allowed = allowedTransitions[o.status] || [];
  if (!allowed.includes(next)) return undefined;
  o.status = next;
  o.updatedAt = now();
  return o;
}

// 86 toggle
export function set86(tenantId: string, productId: string, is86: boolean) {
  const existing = getTenantProductStatus(tenantId, productId);
  setTenantProductStatus({ tenantId, productId, is86 });
  return existing;
}

// Seed helper
export function seedWithTenantAndProducts(args: {
  tenant: Tenant;
  products: Array<{ id: string; slug: string; name: string; description?: string; imageUrl?: string; price: number; active?: boolean; is86?: boolean }>;
}) {
  addTenant(args.tenant);
  for (const p of args.products) {
    setTenantProduct({ tenantId: args.tenant.id, productId: p.id, price: p.price, active: p.active ?? true });
    setTenantProductStatus({ tenantId: args.tenant.id, productId: p.id, is86: p.is86 ?? false });
  }
}

export const _debug = {
  tenants,
  tenantProducts,
  tenantProductStatuses,
  orders,
};
