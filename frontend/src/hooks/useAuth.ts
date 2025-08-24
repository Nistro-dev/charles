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
    
    console.log('🔍 Debug localStorage:', { token: token?.substring(0, 20) + '...', userStr });
    
    // Nettoyer le localStorage si les données sont corrompues
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('✅ User parsed successfully:', user);
        // Vérifier que l'utilisateur a les propriétés requises
        if (user && typeof user === 'object' && user.id && user.email) {
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          throw new Error('Invalid user data structure');
        }
      } catch (error) {
        console.error('❌ Error parsing user from localStorage:', error);
        console.error('Raw userStr:', userStr);
        // Nettoyer complètement le localStorage
        localStorage.clear();
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } else if (token && !userStr) {
      // Token présent mais pas d'utilisateur: rester authentifié et charger /me
      setAuthState({
        user: null,
        isAuthenticated: true,
        isLoading: true,
      });
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
      // currentUser can be either a User object or an object containing { user: User }
      const userFromResponse = (currentUser as any).user ?? currentUser;
      setAuthState(prev => ({
        ...prev,
        user: userFromResponse as any,
        isLoading: false,
      }));
      localStorage.setItem('user', JSON.stringify(userFromResponse));
    }
  }, [currentUser, authState.isAuthenticated]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      console.log('🔍 Login success data:', data);
      
      if (!data.accessToken || !data.user) {
        console.error('❌ Missing accessToken or user in response');
        throw new Error('Réponse invalide du serveur');
      }
      
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
    onError: (error) => {
      console.error('❌ Login mutation error:', error);
    }
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
    // Nettoyer complètement le localStorage
    localStorage.clear();

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