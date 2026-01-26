'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface LogoutButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function LogoutButton({ 
  variant = 'outline', 
  size = 'sm', 
  className = '',
  showIcon = true,
  children 
}: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        // Clear user data from localStorage
        localStorage.removeItem('user');
        
        toast.success('Berhasil keluar dari sistem');
        
        // Redirect to login page
        router.push('/login');
      } else {
        toast.error('Gagal keluar dari sistem');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Terjadi kesalahan saat keluar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 ${className}`}
          disabled={loading}
        >
          {showIcon && <LogOut className="h-4 w-4 mr-2" />}
          {children || (loading ? 'Keluar...' : 'Keluar')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Konfirmasi Keluar</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin keluar dari sistem admin? Anda perlu login kembali untuk mengakses halaman admin.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogout}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Keluar...
              </div>
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Ya, Keluar
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}