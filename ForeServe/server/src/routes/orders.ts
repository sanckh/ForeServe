import { Router, Request, Response } from 'express';
import { resolveTenant } from '../middleware/tenant';
import { requireStaff } from '../middleware/staffAuth';
import { claimOrder, createOrder, getOrderById, updateOrderStatus } from '../store/memory';
import { OrderItem, OrderStatus } from '../types/domain';

const router = Router();

// POST /orders  { items: [{ productId, qty }] }
router.post('/orders', resolveTenant, (req: Request, res: Response) => {
  const tenant = (req as any).tenant as import('../types/domain').Tenant;
  const items = (req.body?.items ?? []) as OrderItem[];
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Missing items' });
  }
  for (const it of items) {
    if (!it?.productId || typeof it.qty !== 'number' || it.qty <= 0) {
      return res.status(400).json({ error: 'Invalid item: productId and positive qty required' });
    }
  }
  const order = createOrder(tenant.id, items);
  return res.status(201).json(order);
});

// POST /orders/:id/claim
router.post('/orders/:id/claim', resolveTenant, requireStaff, (req: Request, res: Response) => {
  const id = req.params.id;
  const staff = (req as any).staffUser as string;
  const order = claimOrder(id, staff);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  return res.json(order);
});

// POST /orders/:id/status { status }
router.post('/orders/:id/status', resolveTenant, requireStaff, (req: Request, res: Response) => {
  const id = req.params.id;
  const status = req.body?.status as OrderStatus | undefined;
  if (!status) return res.status(400).json({ error: 'Missing status' });
  const order = updateOrderStatus(id, status);
  if (!order) return res.status(400).json({ error: 'Invalid transition or order not found' });
  return res.json(order);
});

// GET /orders/:id
router.get('/orders/:id', resolveTenant, (req: Request, res: Response) => {
  const tenant = (req as any).tenant as import('../types/domain').Tenant;
  const id = req.params.id;
  const order = getOrderById(id);
  if (!order || order.tenantId !== tenant.id) return res.status(404).json({ error: 'Order not found' });
  return res.json(order);
});

export default router;
