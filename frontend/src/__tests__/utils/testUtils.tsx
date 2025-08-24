import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';

// Créer un QueryClient pour les tests
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Wrapper personnalisé pour les tests
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withRouter?: boolean;
  withAuth?: boolean;
  withQueryClient?: boolean;
}

const AllTheProviders: React.FC<{
  children: React.ReactNode;
  withRouter?: boolean;
  withAuth?: boolean;
  withQueryClient?: boolean;
}> = ({ children, withRouter = true, withAuth = true, withQueryClient = true }) => {
  let content = children;

  if (withQueryClient) {
    const queryClient = createTestQueryClient();
    content = <QueryClientProvider client={queryClient}>{content}</QueryClientProvider>;
  }

  if (withAuth) {
    content = <AuthProvider>{content}</AuthProvider>;
  }

  if (withRouter) {
    content = <BrowserRouter>{content}</BrowserRouter>;
  }

  return <>{content}</>;
};

// Fonction de rendu personnalisée
const customRender = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { withRouter = true, withAuth = true, withQueryClient = true, ...renderOptions } = options;

  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders
        withRouter={withRouter}
        withAuth={withAuth}
        withQueryClient={withQueryClient}
      >
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Mock des données de test
export const mockUser = {
  id: 1,
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'user' as const,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockAuthResponse = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  user: mockUser,
};

// Mock des fonctions API
export const mockApi = {
  login: vi.fn(),
  register: vi.fn(),
  me: vi.fn(),
  logout: vi.fn(),
};

// Fonction pour attendre que les requêtes soient terminées
export const waitForLoadingToFinish = () =>
  new Promise(resolve => setTimeout(resolve, 0));

// Fonction pour simuler un délai
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Ré-exporter tout depuis @testing-library/react
export * from '@testing-library/react';
export { customRender as render }; 