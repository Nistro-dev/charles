import axios from 'axios';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath.includes('/login') || currentPath.includes('/register');
      
      // Only redirect if we're not already on an auth page
      if (!isAuthPage) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      
      // Extraire les données de la réponse API
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Réponse invalide du serveur');
      }
    } catch (error: any) {
      // Extract error message from backend response
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Erreur de connexion';
      throw new Error(errorMessage);
    }
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post('/api/auth/register', userData);
      
      // Extraire les données de la réponse API
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Réponse invalide du serveur');
      }
    } catch (error: any) {
      // Extract error message from backend response
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Erreur d\'inscription';
      throw new Error(errorMessage);
    }
  },

  me: async (): Promise<{ user: User }> => {
    try {
      const response = await api.get('/api/auth/me');
      
      // Extraire les données de la réponse API
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Réponse invalide du serveur');
      }
    } catch (error: any) {
      // Extract error message from backend response
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Erreur de récupération du profil';
      throw new Error(errorMessage);
    }
  },
};

export default api; 