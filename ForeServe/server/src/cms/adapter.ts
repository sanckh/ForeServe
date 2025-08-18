import { Tenant } from '../types/domain';

export interface CmsItem {
  id: string;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface CmsAdapter {
  getMenu(tenant: Tenant): Promise<CmsItem[]>;
}

export class InMemoryCmsAdapter implements CmsAdapter {
  private data: Record<string, CmsItem[]> = {};

  seed(tenantSlug: string, items: CmsItem[]) {
    this.data[tenantSlug] = items;
  }

  async getMenu(tenant: Tenant): Promise<CmsItem[]> {
    return this.data[tenant.slug] ?? [];
  }
}
