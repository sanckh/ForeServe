import { Router, Request, Response } from 'express';
import { resolveTenant } from '../middleware/tenant';

const router = Router();

// GET /course?tenant=slug
router.get('/course', resolveTenant, (req: Request, res: Response) => {
  const tenant = (req as any).tenant as import('../types/domain').Tenant;
  const { id, slug, name, logoUrl, colors } = tenant;
  res.json({ id, slug, name, logoUrl, colors });
});

export default router;
