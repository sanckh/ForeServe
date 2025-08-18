import { Request, Response, NextFunction } from 'express';

function extractToken(req: Request): string | null {
  const hdr = req.header('authorization') || req.header('x-staff-token');
  if (!hdr) return null;
  if (hdr.toLowerCase().startsWith('bearer ')) return hdr.slice(7);
  return hdr;
}

export function requireStaff(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.STAFF_TOKEN || 'changeme';
  const token = extractToken(req);
  if (!token || token !== expected) {
    return res.status(401).json({ error: 'Unauthorized (staff)' });
  }
  (req as any).staffUser = req.header('x-staff-user') || 'staff';
  return next();
}
