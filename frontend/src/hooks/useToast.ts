import { useState, useCallback } from 'react';

export type ToastVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    // Durée par défaut selon le type de toast
    let defaultDuration = 4000; // 4 secondes par défaut
    if (toast.variant === 'success') defaultDuration = 3000; // 3 secondes pour les succès
    if (toast.variant === 'destructive') defaultDuration = 5000; // 5 secondes pour les erreurs
    if (toast.variant === 'warning') defaultDuration = 4500; // 4.5 secondes pour les avertissements
    if (toast.variant === 'info') defaultDuration = 3500; // 3.5 secondes pour les infos
    
    const newToast: Toast = {
      id,
      duration: toast.duration || defaultDuration,
      variant: 'default',
      ...toast,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, [removeToast]);

  const success = useCallback((title: string, description?: string) => {
    return addToast({ title, description, variant: 'success' });
  }, [addToast]);

  const error = useCallback((title: string, description?: string) => {
    return addToast({ title, description, variant: 'destructive' });
  }, [addToast]);

  const warning = useCallback((title: string, description?: string) => {
    return addToast({ title, description, variant: 'warning' });
  }, [addToast]);

  const info = useCallback((title: string, description?: string) => {
    return addToast({ title, description, variant: 'info' });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
