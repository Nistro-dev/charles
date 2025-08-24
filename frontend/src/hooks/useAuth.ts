import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/lib/api';
import { User, LoginRequest, RegisterRequest } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface UseAuthReturn extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Get user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } else {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  // Query to get current user
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: authAPI.me,
    enabled: authState.isAuthenticated,
    retry: false,
  });

  // Update auth state when current user changes
  useEffect(() => {
    if (currentUser && authState.isAuthenticated) {
      setAuthState(prev => ({
        ...prev,
                  user: currentUser as any,
        isLoading: false,
      }));
              localStorage.setItem('user', JSON.stringify(currentUser));
    }
  }, [currentUser, authState.isAuthenticated]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setAuthState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });

      queryClient.invalidateQueries({ queryKey: ['user'] });
      navigate('/dashboard');
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: (data) => {
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setAuthState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });

      queryClient.invalidateQueries({ queryKey: ['user'] });
      navigate('/dashboard');
    },
  });

  // Login function
  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    try {
      await loginMutation.mutateAsync(credentials);
    } catch (error) {
      // Re-throw the error so it can be handled by the form
      throw error;
    }
  }, [loginMutation]);

  // Register function
  const register = useCallback(async (userData: RegisterRequest): Promise<void> => {
    try {
      await registerMutation.mutateAsync(userData);
    } catch (error) {
      // Re-throw the error so it can be handled by the form
      throw error;
    }
  }, [registerMutation]);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    queryClient.clear();
    navigate('/login');
  }, [navigate, queryClient]);

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token to refresh');
    }

    try {
      // In a real app, you would call a refresh token endpoint
      // For now, we'll just validate the current token
      const response = await authAPI.me();
      if (response.user) {
        setAuthState(prev => ({
          ...prev,
          user: response.user,
        }));
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    } catch (error) {
      logout();
      throw error;
    }
  }, [logout]);

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading || isLoadingUser,
    login,
    register,
    logout,
    refreshToken,
  };
} 