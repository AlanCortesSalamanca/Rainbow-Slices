import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { authClient, isAuthConfigured } from './authClient';
import type { AuthContextValue } from './auth.types';
import { setApiAccessToken, setUnauthorizedHandler } from '../services/apiClient';

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await authClient.auth.signOut();
      window.location.assign('/login');
    });

    if (!isAuthConfigured) {
      setLoading(false);
      return () => {
        setUnauthorizedHandler(null);
      };
    }

    authClient.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setApiAccessToken(data.session?.access_token ?? null);
      })
      .finally(() => setLoading(false));

    const { data: listener } = authClient.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setApiAccessToken(nextSession?.access_token ?? null);
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
      setUnauthorizedHandler(null);
    };
  }, []);

  async function login(email: string, password: string) {
    if (!isAuthConfigured) {
      throw new Error('Supabase Auth no está configurado en frontend/.env');
    }

    const { data, error } = await authClient.auth.signInWithPassword({ email, password });

    if (error) {
      throw new Error(error.message);
    }

    setSession(data.session);
    setUser(data.user);
    setApiAccessToken(data.session?.access_token ?? null);
  }

  async function logout() {
    await authClient.auth.signOut();
    setSession(null);
    setUser(null);
    setApiAccessToken(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      accessToken: session?.access_token ?? null,
      loading,
      login,
      logout
    }),
    [loading, session, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return value;
}
