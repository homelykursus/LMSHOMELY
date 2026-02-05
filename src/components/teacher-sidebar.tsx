'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Clock,
  BookOpen,
  DollarSign,
  Menu,
  X
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/teacher/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Absen Siswa',
    href: '/teacher/student-attendance',
    icon: Users,
  },
  {
    name: 'Absen Guru',
    href: '/teacher/teacher-attendance',
    icon: Clock,
  },
  {
    name: 'Data Kelas',
    href: '/teacher/classes',
    icon: BookOpen,
  },
  {
    name: 'Komisi Guru',
    href: '/teacher/commissions',
    icon: DollarSign,
  },
];

export function TeacherSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full max-h-screen">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center flex-col">
              <div className="flex items-center">
                <img 
                  src="https://res.cloudinary.com/dzksnkl72/image/upload/v1770305224/logo_innhbv.jpg" 
                  alt="Homely Logo" 
                  className="h-8 w-8 rounded object-cover"
                />
                <span className="ml-2 text-xl font-bold text-gray-900">Portal Guru</span>
              </div>
              <span className="text-xs text-gray-600 mt-1">Homely Kursus Komputer</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            <nav className="mt-5 px-2">
              <div className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                        isActive
                          ? 'bg-blue-100 text-blue-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon
                        className={cn(
                          'mr-3 h-5 w-5 flex-shrink-0',
                          isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        )}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white shadow-lg">
          <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-200">
            <div className="flex items-center flex-col">
              <div className="flex items-center">
                <img 
                  src="https://res.cloudinary.com/dzksnkl72/image/upload/v1770305224/logo_innhbv.jpg" 
                  alt="Homely Logo" 
                  className="h-8 w-8 rounded object-cover"
                />
                <span className="ml-2 text-xl font-bold text-gray-900">Portal Guru</span>
              </div>
              <span className="text-xs text-gray-600 mt-1">Homely Kursus Komputer</span>
            </div>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4">
              <div className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                        isActive
                          ? 'bg-blue-100 text-blue-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'mr-3 h-5 w-5 flex-shrink-0',
                          isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        )}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 shadow-lg hover:bg-gray-50 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </>
  );
}