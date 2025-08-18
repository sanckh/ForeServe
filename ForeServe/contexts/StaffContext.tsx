import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

interface StaffState {
  token: string;
  user?: string;
  setToken: (t: string) => void;
  setUser: (u?: string) => void;
  signOut: () => void;
}

const StaffCtx = createContext<StaffState | undefined>(undefined);

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string>('');
  const [user, setUserState] = useState<string | undefined>();

  const TOKEN_KEY = 'staff_token';
  const USER_KEY = 'staff_user';

  useEffect(() => {
    (async () => {
      try {
        const [t, u] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          SecureStore.getItemAsync(USER_KEY),
        ]);
        if (t) setTokenState(t);
        if (u) setUserState(u);
      } catch {}
    })();
  }, []);

  const setToken = (t: string) => {
    setTokenState(t);
    if (t && t.length > 0) SecureStore.setItemAsync(TOKEN_KEY, t);
    else SecureStore.deleteItemAsync(TOKEN_KEY);
  };

  const setUser = (u?: string) => {
    setUserState(u);
    if (u && u.length > 0) SecureStore.setItemAsync(USER_KEY, u);
    else SecureStore.deleteItemAsync(USER_KEY);
  };

  const signOut = () => {
    setToken('');
    setUser(undefined);
  };

  return <StaffCtx.Provider value={{ token, user, setToken, setUser, signOut }}>{children}</StaffCtx.Provider>;
}

export function useStaff() {
  const ctx = useContext(StaffCtx);
  if (!ctx) throw new Error('useStaff must be used within StaffProvider');
  return ctx;
}
