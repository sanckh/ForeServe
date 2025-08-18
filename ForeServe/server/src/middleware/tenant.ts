import { Request, Response, NextFunction } from 'express';
import { getTenantBySlug } from '../store/memory';
import { Tenant } from '../types/domain';

export function resolveTenant(req: Request, res: Response, next: NextFunction) {
  const slug = (req.query.tenant as string) || (req.header('x-tenant') as string);
  if (!slug) return res.status(400).json({ error: 'Missing tenant slug. Provide ?tenant=slug or X-Tenant header.' });
  const tenant = getTenantBySlug(slug);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  (req as any).tenant = tenant as Tenant;
  next();
}
