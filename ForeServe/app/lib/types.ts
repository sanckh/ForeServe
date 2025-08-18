export interface CourseProfile {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  colors?: { primary?: string; secondary?: string };
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
  available: boolean;
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
  placedAt: string;
  updatedAt: string;
  claimedBy?: string;
}
