import { CmsAdapter } from '../cms/adapter';
import { MenuItemView, Tenant } from '../types/domain';
import { getTenantProduct, getTenantProductStatus } from '../store/memory';

export async function getMenuForTenant(tenant: Tenant, cms: CmsAdapter): Promise<MenuItemView[]> {
  const items = await cms.getMenu(tenant);
  return items.map((item) => {
    const tp = getTenantProduct(tenant.id, item.id);
    const st = getTenantProductStatus(tenant.id, item.id);
    const active = tp?.active ?? false;
    const is86 = st?.is86 ?? false;
    const price = tp?.price ?? 0;
    return {
      productId: item.id,
      slug: item.slug,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      price,
      active,
      is86,
      available: active && !is86,
    } satisfies MenuItemView;
  });
}
