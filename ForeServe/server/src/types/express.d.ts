import type { Tenant } from './domain';

declare global {
  namespace Express {
    // Augment Request with our custom fields
    interface Request {
      tenant?: Tenant;
      staffUser?: string;
    }
  }
}

export {};
