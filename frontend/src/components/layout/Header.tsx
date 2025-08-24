
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types';

interface HeaderProps {
  user?: User | null;
}

export function Header({ user }: HeaderProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Thales</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-700 hidden md:block">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                
                <div className="hidden md:flex items-center space-x-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                    {user.role}
                  </span>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                >
                  Déconnexion
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 