'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { TeacherSidebar } from '@/components/teacher-sidebar';
import { TeacherHeader } from '@/components/teacher-header';
import { AuthTeacher } from '@/lib/auth';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [teacher, setTeacher] = useState<AuthTeacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Skip auth check for login page
  const isLoginPage = pathname === '/teacher/login';

  useEffect(() => {
    if (isLoginPage) {
      setIsLoading(false);
      return;
    }

    checkAuth();
  }, [isLoginPage]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/teacher/auth/me');
      
      if (response.ok) {
        const data = await response.json();
        setTeacher(data.teacher);
      } else {
        router.push('/teacher/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/teacher/login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Memuat..." />
      </div>
    );
  }

  // Login page doesn't need sidebar/header
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Protected pages need authentication
  if (!teacher) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TeacherSidebar />
      <div className="lg:pl-64">
        <TeacherHeader teacher={teacher} />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}