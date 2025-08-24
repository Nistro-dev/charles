import React from 'react';
import { Header } from './Header';
import { User } from '@/types';

interface LayoutProps {
  children: React.ReactNode;
  user?: User | null;
  showHeader?: boolean;
}

export function Layout({ children, user, showHeader = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {showHeader && <Header user={user} />}
      
      <main className={showHeader ? 'max-w-7xl mx-auto py-6 sm:px-6 lg:px-8' : ''}>
        <div className={showHeader ? 'px-4 py-6 sm:px-0' : ''}>
          {children}
        </div>
      </main>
    </div>
  );
} 