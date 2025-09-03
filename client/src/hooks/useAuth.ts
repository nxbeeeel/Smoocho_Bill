import { useState, useCallback } from 'react';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { LoginCredentials } from '../types';

export interface AuthHookReturn {
  isAuthenticated: boolean;
  user: any;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateProfile: (updates: any) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
}

export const useAuth = (): AuthHookReturn => {
  const { user, isAuthenticated, isLoading, setLoading } = useAuthStore();
  const [localLoading, setLocalLoading] = useState(false);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        setLocalLoading(true);
        setLoading(true);
        await authService.login(credentials);
      } finally {
        setLocalLoading(false);
        setLoading(false);
      }
    },
    [setLoading]
  );

  const logout = useCallback(() => {
    authService.logout();
  }, []);

  const refreshToken = useCallback(async () => {
    return await authService.refreshToken();
  }, []);

  const updateProfile = useCallback(async (updates: any) => {
    try {
      setLocalLoading(true);
      await authService.updateProfile(updates);
    } finally {
      setLocalLoading(false);
    }
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      try {
        setLocalLoading(true);
        await authService.changePassword(currentPassword, newPassword);
      } finally {
        setLocalLoading(false);
      }
    },
    []
  );

  return {
    isAuthenticated,
    user,
    isLoading: isLoading || localLoading,
    login,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
  };
};
