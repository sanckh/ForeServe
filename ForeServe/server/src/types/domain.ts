export type Role = 'golfer' | 'cart' | 'admin' | 'maintenance';

export interface Tenant {
  id: string;
  slug: string; // e.g., manatee-gc
  name: string;
  logoUrl?: string;
  colors?: {
    primary?: string;
    secondary?: string;
  };
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface TenantProduct {
  tenantId: string;
  productId: string;
  price: number; // in minor units or number; keep number for MVP
  active: boolean;
}

export interface TenantProductStatus {
  tenantId: string;
  productId: string;
  is86: boolean;
}

export type OrderStatus = 'placed' | 'accepted' | 'en_route' | 'delivered';

export interface OrderItem {
  productId: string;
  qty: number;
}

export interface Order {
  id: string;
  tenantId: string;
  status: OrderStatus;
  items: OrderItem[];
  placedAt: string; // ISO
  updatedAt: string; // ISO
  claimedBy?: string; // staff username
}

export interface MenuItemView {
  productId: string;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  active: boolean;
  is86: boolean;
  available: boolean; // derived from active && !is86
}
