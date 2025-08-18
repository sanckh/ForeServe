import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import coursesRouter from './routes/courses';
import menuRouter from './routes/menu';
import ordersRouter from './routes/orders';
import { cms } from './cms';
import { seedWithTenantAndProducts } from './store/memory';

const app = express();

// Config
const PORT = Number(process.env.PORT) || 4000;
const CORS_ORIGIN = (process.env.CORS_ORIGIN || '*').trim();

// Middleware
const allowAll = CORS_ORIGIN === '*';
const parsedOrigins = allowAll
  ? '*'
  : CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean);

app.use(
  cors({
    origin: allowAll ? '*' : parsedOrigins,
    credentials: allowAll ? false : true,
  })
);
app.use(express.json());
app.use(morgan('dev'));

// Seed in-memory data (MVP)
(() => {
  const tenant = {
    id: 't_manatee',
    slug: 'manatee-gc',
    name: 'Manatee Golf Club',
    logoUrl: '',
    colors: { primary: '#1e90ff', secondary: '#0f172a' },
  };

  // Seed CMS items
  cms.seed(tenant.slug, [
    { id: 'p_101', slug: 'cold-brew', name: 'Cold Brew Coffee', description: 'Strong and smooth', imageUrl: '' },
    { id: 'p_102', slug: 'club-sandwich', name: 'Club Sandwich', description: 'Turkey, bacon, lettuce, tomato', imageUrl: '' },
    { id: 'p_103', slug: 'gatorade', name: 'Gatorade', description: 'Thirst quencher', imageUrl: '' },
  ]);

  // Map tenant-specific flags and pricing
  seedWithTenantAndProducts({
    tenant,
    products: [
      { id: 'p_101', slug: 'cold-brew', name: 'Cold Brew Coffee', price: 5.0, active: true },
      { id: 'p_102', slug: 'club-sandwich', name: 'Club Sandwich', price: 9.5, active: true },
      { id: 'p_103', slug: 'gatorade', name: 'Gatorade', price: 4.0, active: true },
    ],
  });
})();

// Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'foreserve-api', timestamp: new Date().toISOString() });
});

app.post('/api/echo', (req: Request, res: Response) => {
  res.json({ youSent: req.body });
});

// App routers
app.use('/api', coursesRouter);
app.use('/api', menuRouter);
app.use('/api', ordersRouter);

// 404 handler
app.use((_: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(err?.status || 500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
