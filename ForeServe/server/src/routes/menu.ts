import { Router, Request, Response } from 'express';
import { resolveTenant } from '../middleware/tenant';
import { requireStaff } from '../middleware/staffAuth';
import { cms } from '../cms';
import { getMenuForTenant } from '../services/menuService';
import { set86 } from '../store/memory';

const router = Router();

// GET /menu?tenant=slug
router.get('/menu', resolveTenant, async (req: Request, res: Response) => {
  const tenant = (req as any).tenant as import('../types/domain').Tenant;
  const menu = await getMenuForTenant(tenant, cms);
  res.json({ items: menu });
});

// POST /menu/86  { productId: string, is86: boolean }
router.post('/menu/86', resolveTenant, requireStaff, (req: Request, res: Response) => {
  const tenant = (req as any).tenant as import('../types/domain').Tenant;
  const { productId, is86 } = req.body ?? {};
  if (!productId || typeof is86 !== 'boolean') {
    return res.status(400).json({ error: 'Missing productId or is86 (boolean)' });
  }
  set86(tenant.id, productId, is86);
  return res.json({ ok: true });
});

export default router;
