'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/logout-button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  LogOut, 
  Settings,
  Shield,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function AdminHeader() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Get user info from localStorage (set during login)
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Super Admin
          </Badge>
        );
      case 'admin':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        );
      default:
        return <Badge variant="secondary" className="text-xs">{role}</Badge>;
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'AD';
    
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user || !user.name) {
    return null;
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* This space can be used for breadcrumbs or page title in the future */}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Logout Button */}
          <LogoutButton />
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-auto px-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-medium">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-900">{user.name || 'Admin'}</span>
                    <div className="flex items-center space-x-1">
                      {getRoleBadge(user.role)}
                    </div>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name || 'Admin'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => router.push('/admin/users')}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Kelola Akun</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 p-0">
                <div className="w-full px-2 py-1.5">
                  <LogoutButton 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-red-600 hover:bg-transparent hover:text-red-700 border-0 p-0 h-auto"
                    showIcon={true}
                  />
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}