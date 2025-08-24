
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { useForm } from '@/hooks/useForm';
import { useAuthContext } from '@/contexts/AuthContext';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Eye } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().min(1, 'Email requis').email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis').min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login, isAuthenticated } = useAuthContext();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  const form = useForm<LoginForm>({
    schema: loginSchema,
    mode: 'onChange',
  });

  const handleSubmit = async (data: LoginForm) => {
    await login(data);
  };

  return (
    <Layout showHeader={false}>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Connexion</CardTitle>
              <CardDescription className="text-center">
                Connectez-vous à votre compte Thales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmitWithError(handleSubmit)} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    {...(form as any).register('email')}
                  />
                  {(form as any).formState.errors.email && (
                    <p className="text-sm text-red-600">{(form as any).formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pr-10"
                      {...(form as any).register('password')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => {
                        const input = document.getElementById('password') as HTMLInputElement;
                        if (input) {
                          input.type = input.type === 'password' ? 'text' : 'password';
                        }
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  {(form as any).formState.errors.password && (
                    <p className="text-sm text-red-600">{(form as any).formState.errors.password.message}</p>
                  )}
                </div>

                {form.submitError && (
                  <ErrorMessage 
                    message={form.submitError} 
                    onClose={form.clearSubmitError}
                  />
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.isSubmitting || !(form as any).formState.isValid}
                >
                  {form.isSubmitting ? 'Connexion...' : 'Se connecter'}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Pas encore de compte ?{' '}
                  <Link to="/register" className="text-blue-600 hover:text-blue-500">
                    S'inscrire
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
} 