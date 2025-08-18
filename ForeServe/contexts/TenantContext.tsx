import React, { createContext, useContext, useState } from 'react';

interface TenantState {
  tenant: string;
  setTenant: (slug: string) => void;
}

const TenantCtx = createContext<TenantState | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<string>('manatee-gc');
  return <TenantCtx.Provider value={{ tenant, setTenant }}>{children}</TenantCtx.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantCtx);
  if (!ctx) throw new Error('useTenant must be used within TenantProvider');
  return ctx;
}
