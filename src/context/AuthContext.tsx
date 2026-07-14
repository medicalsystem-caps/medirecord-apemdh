'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/lib/types';
import { getCurrentUserAction, loginAction, logoutAction } from '@/app/actions/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = async () => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUserAction();
      setUser(currentUser);
      
      // If user is authenticated but needs password change, redirect to /change-password
      if (currentUser?.mustChangePassword && pathname !== '/change-password') {
        router.push('/change-password');
      }
    } catch (err) {
      console.error('Error refreshing session:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const login = async (email: string, password: string): Promise<string | null> => {
    setLoading(true);
    const result = await loginAction(email, password);
    if (result.success && result.user) {
      setUser(result.user);
      if (result.user.mustChangePassword) {
        router.push('/change-password');
      } else {
        router.push('/dashboard');
      }
      setLoading(false);
      return null; // No error
    } else {
      setLoading(false);
      return result.error || 'Authentication failed.';
    }
  };

  const logout = async () => {
    setLoading(true);
    await logoutAction();
    setUser(null);
    setLoading(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
