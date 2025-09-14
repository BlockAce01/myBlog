'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken, removeAuthToken, isAuthenticated } from '@/lib/data';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsAuth(authenticated);
      setIsLoading(false);

      if (!authenticated) {
        // Clear any invalid tokens
        removeAuthToken();
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    removeAuthToken();
    setIsAuth(false);
    router.push('/admin/login');
  };

  return {
    isAuthenticated: isAuth,
    isLoading,
    logout,
    token: getAuthToken(),
  };
}

export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}
