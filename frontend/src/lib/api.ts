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
    // Only redirect on 401 if we're not already on login/register pages
    if (error.response?.status === 401 && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      console.log('🔍 Sending login request with credentials:', credentials);
      
      const response = await api.post('/api/auth/login', credentials);
      console.log('🔍 Login API full response:', response);
      console.log('🔍 Login API response.data:', response.data);
      console.log('🔍 Login API response.data type:', typeof response.data);
      console.log('🔍 Login API response.data keys:', Object.keys(response.data));
      console.log('🔍 Login API response.data.success:', response.data.success);
      console.log('🔍 Login API response.data.data:', response.data.data);
      console.log('🔍 Login API response.data.message:', response.data.message);
      
      // Extraire les données de la réponse API
      if (response.data.success && response.data.data) {
        console.log('✅ Returning response.data.data:', response.data.data);
        return response.data.data;
      } else {
        console.error('❌ Invalid response structure:', response.data);
        throw new Error(response.data.message || 'Réponse invalide du serveur');
      }
    } catch (error: any) {
      console.error('❌ Login API error:', error);
      console.error('❌ Login API error.response:', error.response);
      console.error('❌ Login API error.response?.data:', error.response?.data);
      
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