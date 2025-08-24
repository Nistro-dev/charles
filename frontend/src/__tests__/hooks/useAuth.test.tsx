import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { mockUser, mockAuthResponse } from '../utils/testUtils';
import { authAPI } from '@/lib/api';

// Mock de l'API
vi.mock('@/lib/api', () => ({
  authAPI: {
    login: vi.fn(),
    register: vi.fn(),
    me: vi.fn(),
  },
}));

describe('useAuth', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('login', () => {
    it('should login successfully', async () => {
      const mockLogin = authAPI.login as jest.MockedFunction<typeof authAPI.login>;
      mockLogin.mockResolvedValue(mockAuthResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      await result.current.login(loginData);

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(mockLogin).toHaveBeenCalledWith(loginData);
    });

    it('should handle login error', async () => {
      const mockLogin = authAPI.login as jest.MockedFunction<typeof authAPI.login>;
      const error = new Error('Invalid credentials');
      mockLogin.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), { wrapper });

      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await result.current.login(loginData);

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
      });

      expect(mockLogin).toHaveBeenCalledWith(loginData);
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const mockRegister = authAPI.register as jest.MockedFunction<typeof authAPI.register>;
      mockRegister.mockResolvedValue(mockAuthResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      const registerData = {
        email: 'newuser@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'New',
        lastName: 'User',
        role: 'user' as const,
      };

      await result.current.register(registerData);

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(mockRegister).toHaveBeenCalledWith(registerData);
    });

    it('should handle registration error', async () => {
      const mockRegister = authAPI.register as jest.MockedFunction<typeof authAPI.register>;
      const error = new Error('Email already exists');
      mockRegister.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), { wrapper });

      const registerData = {
        email: 'existing@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'Existing',
        lastName: 'User',
        role: 'user' as const,
      };

      await result.current.register(registerData);

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
      });

      expect(mockRegister).toHaveBeenCalledWith(registerData);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Simuler un utilisateur connecté
      queryClient.setQueryData(['auth', 'user'], mockUser);

      await result.current.logout();

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
      });
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no user', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should return true when user exists', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Simuler un utilisateur connecté
      queryClient.setQueryData(['auth', 'user'], mockUser);

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });
  });

  describe('loading states', () => {
    it('should show loading during login', async () => {
      const mockLogin = authAPI.login as jest.MockedFunction<typeof authAPI.login>;
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise(resolve => {
        resolveLogin = resolve;
      });
      mockLogin.mockReturnValue(loginPromise);

      const { result } = renderHook(() => useAuth(), { wrapper });

      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const loginPromiseResult = result.current.login(loginData);

      // Le login devrait être en cours
      expect(result.current.isLoading).toBe(true);

      // Résoudre le login
      resolveLogin!(mockAuthResponse);
      await loginPromiseResult;

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
}); 