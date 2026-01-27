'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AuthTeacher } from '@/lib/auth';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface TeacherHeaderProps {
  teacher: AuthTeacher;
}

interface TeacherProfile {
  id: string;
  name: string;
  whatsapp: string;
  photo?: string;
}

export function TeacherHeader({ teacher }: TeacherHeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchTeacherProfile();
  }, []);

  const fetchTeacherProfile = async () => {
    try {
      const response = await fetch('/api/teacher/profile');
      if (response.ok) {
        const result = await response.json();
        setTeacherProfile(result.teacher);
      }
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      const response = await fetch('/api/teacher/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Logout berhasil');
        router.push('/teacher/login');
      } else {
        toast.error('Gagal logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Terjadi kesalahan saat logout');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const displayName = teacherProfile?.name || teacher.name;
  const displayWhatsapp = teacherProfile?.whatsapp || teacher.whatsapp;
  const photoUrl = teacherProfile?.photo;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Left side - could add breadcrumbs or page title here */}
          <div className="flex items-center">
            <h1 className="text-lg font-semibold text-gray-900 lg:hidden">
              Portal Guru
            </h1>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            {/* Teacher info */}
            <div className="hidden md:flex md:items-center md:space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">{displayWhatsapp}</p>
              </div>
            </div>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={photoUrl} alt={displayName} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {displayWhatsapp}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}