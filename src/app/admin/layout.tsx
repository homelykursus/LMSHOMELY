'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin-sidebar';
import { AdminHeader } from '@/components/admin-header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        
        if (response.ok) {
          const userData = await response.json();
          // Store user data in localStorage for client components
          localStorage.setItem('user', JSON.stringify(userData));
          setIsAuthenticated(true);
        } else {
          // Clear any existing user data
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          
          // Redirect to login if not on login page
          if (pathname !== '/login') {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        
        if (pathname !== '/login') {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner 
          message="Checking authentication..."
          subMessage="Memverifikasi akses Anda"
        />
      </div>
    );
  }

  // If not authenticated, don't render admin layout (will redirect to login)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="lg:ml-64">
        <AdminHeader />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}