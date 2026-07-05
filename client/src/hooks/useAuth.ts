/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { User, UserProfile } from '../types';
import { authService } from '../services/api';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('attrisense_token');
      if (token) {
        const profile = await authService.getProfile();
        setUser(profile);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err: any) {
      console.error('Session restored error:', err);
      localStorage.removeItem('attrisense_token');
      localStorage.removeItem('attrisense_current_user');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.login({ email, password });
      const profile = await authService.getProfile();
      setUser(profile);
      setIsAuthenticated(true);
      return result.user;
    } catch (err: any) {
      setError(err.message || 'Login failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, name: string, password?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.signup({ email, name, password });
      const profile = await authService.getProfile();
      setUser(profile);
      setIsAuthenticated(true);
      return result.user;
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (err: any) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    setError(null);
    try {
      const updated = await authService.updateProfile(profileData);
      setUser(updated);
      return updated;
    } catch (err: any) {
      setError(err.message || 'Profile update failed.');
      throw err;
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    updateProfile,
    refreshProfile: checkAuth,
  };
}
