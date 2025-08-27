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

interface UseAuthOptions {
  onSuccess?: (message: string, description?: string) => void;
  onError?: (message: string, description?: string) => void;
}

export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Get user from localStorage on mount and validate token
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Try to validate the token by calling /me endpoint
          const response = await authAPI.me();
          const user = response.user;
          
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Update localStorage with fresh user data
          localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
          // Clear invalid data
          localStorage.clear();
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
    };

    initializeAuth();
  }, []);

  // Query to get current user (for refresh scenarios)
  const { data: currentUser } = useQuery({
    queryKey: ['user'],
    queryFn: authAPI.me,
    enabled: authState.isAuthenticated && !authState.user,
    retry: false,
  });

  // Update auth state when current user changes
  useEffect(() => {
    if (currentUser && authState.isAuthenticated) {
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
      if (!data.accessToken || !data.user) {
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
      
      // Afficher la notification de succès
      onSuccess?.('Connexion réussie', `Bienvenue ${data.user.firstName} !`);
      
      navigate('/dashboard');
    },
    onError: (error: any) => {
      // Afficher la notification d'erreur
      onError?.('Erreur de connexion', error.message || 'Identifiants incorrects');
      throw error;
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
      
      // Afficher la notification de succès
      onSuccess?.('Inscription réussie', `Compte créé pour ${data.user.firstName} !`);
      
      navigate('/dashboard');
    },
    onError: (error: any) => {
      // Afficher la notification d'erreur
      onError?.('Erreur d\'inscription', error.message || 'Impossible de créer le compte');
      throw error;
    }
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
    
    // Afficher la notification de succès
    onSuccess?.('Déconnexion réussie', 'Vous avez été déconnecté avec succès');
    
    // Délai pour que la notification s'affiche avant la navigation
    setTimeout(() => {
      navigate('/login');
    }, 500);
  }, [queryClient, onSuccess, navigate]);

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token to refresh');
    }

    try {
      // Call /me endpoint to validate current token
      const response = await authAPI.me();
      if (response.user) {
        setAuthState(prev => ({
          ...prev,
          user: response.user,
        }));
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    } catch (error) {
      // If refresh fails, logout the user
      logout();
      throw error;
    }
  }, [logout]);

  return {
    ...authState,
    login,
    register,
    logout,
    refreshToken,
  };
} 