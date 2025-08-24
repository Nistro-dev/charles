
import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
  className?: string;
  variant?: 'default' | 'destructive' | 'warning';
}

const variantClasses = {
  default: 'bg-red-50 border-red-200 text-red-800',
  destructive: 'bg-red-100 border-red-300 text-red-900',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
};

export function ErrorMessage({ 
  message, 
  onClose, 
  className,
  variant = 'default' 
}: ErrorMessageProps) {
  return (
    <div className={cn(
      'flex items-center p-4 border rounded-md',
      variantClasses[variant],
      className
    )}>
      <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
      <span className="flex-1 text-sm font-medium">{message}</span>
      
      {onClose && (
        <button
          onClick={onClose}
          className="ml-3 flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

interface ErrorPageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorPage({ 
  title = 'Une erreur est survenue', 
  message = 'Impossible de charger le contenu demandé.',
  onRetry 
}: ErrorPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 text-red-400 mb-4">
          <AlertCircle className="h-full w-full" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-6">
          {message}
        </p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Réessayer
          </button>
        )}
      </div>
    </div>
  );
} 