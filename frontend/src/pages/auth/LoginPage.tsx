
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { useForm } from '@/hooks/useForm';
import { useAuth } from '@/hooks/useAuth';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { PasswordInput } from '@/components/ui/password-input';

const loginSchema = z.object({
  email: z.string().min(1, 'Email requis').email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis').min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuth();
  
  const form = useForm<LoginForm>({
    schema: loginSchema,
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
              <form onSubmit={form.handleSubmitWithError(handleSubmit)} className="space-y-4">
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

                <PasswordInput
                  id="password"
                  label="Mot de passe"
                  placeholder="••••••••"
                  error={(form as any).formState.errors.password?.message}
                  {...(form as any).register('password')}
                />

                {form.submitError && (
                  <ErrorMessage 
                    message={form.submitError} 
                    onClose={form.clearSubmitError}
                  />
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.isSubmitting}
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