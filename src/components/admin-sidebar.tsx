'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogoutButton } from '@/components/logout-button';
import { useSidebarBadges } from '@/hooks/use-sidebar-badges';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  CreditCard,
  UserCheck,
  Menu, 
  X,
  Home,
  DoorOpen,
  GraduationCap,
  ClipboardCheck,
  Clock,
  Receipt,
  DollarSign,
  Settings,
  Award,
  ChevronDown,
  ChevronRight,
  Database,
  Megaphone,
  Image as ImageIcon,
  MapPin,
  FileText
} from 'lucide-react';

interface SidebarItem {
  title: string;
  href?: string;
  icon: any;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Data Program Kursus',
    href: '/admin/courses',
    icon: BookOpen,
  },
  {
    title: 'Data Siswa',
    href: '/admin/students',
    icon: Users,
  },
  {
    title: 'Data Alumni',
    href: '/admin/alumni',
    icon: GraduationCap,
  },
  {
    title: 'Absen Siswa',
    href: '/admin/attendance',
    icon: ClipboardCheck,
  },
  {
    title: 'Absen Guru',
    href: '/admin/teacher-attendance',
    icon: Clock,
  },
  {
    title: 'Pembayaran Siswa',
    href: '/admin/payments',
    icon: CreditCard,
  },
  {
    title: 'Komisi Guru',
    href: '/admin/teacher-commissions',
    icon: DollarSign,
  },
  {
    title: 'Catatan Keuangan',
    href: '/admin/financial-records',
    icon: Receipt,
  },
  {
    title: 'Cetak Sertifikat',
    href: '/admin/certificates',
    icon: Award,
  },
  {
    title: 'Data Guru',
    href: '/admin/teachers',
    icon: UserCheck,
  },
  {
    title: 'Data Ruang',
    href: '/admin/rooms',
    icon: DoorOpen,
  },
  {
    title: 'Data Kelas',
    href: '/admin/classes',
    icon: GraduationCap,
  },
  {
    title: 'Kelola Pengumuman',
    href: '/admin/announcements',
    icon: Megaphone,
  },
  {
    title: 'Blog',
    href: '/admin/blog',
    icon: FileText,
  },
  {
    title: 'Konten Web',
    icon: Home,
    children: [
      {
        title: 'Hero Web',
        href: '/admin/web-content/hero',
        icon: Home,
      },
      {
        title: 'Fasilitas Kursus',
        href: '/admin/web-content/facilities',
        icon: Award,
      },
      {
        title: 'Testimonial',
        href: '/admin/web-content/testimonials',
        icon: Users,
      },
      {
        title: 'Galeri Foto',
        href: '/admin/web-content/gallery',
        icon: ImageIcon,
      },
      {
        title: 'Lokasi Kami',
        href: '/admin/web-content/location',
        icon: MapPin,
      },
      {
        title: 'Program Kursus',
        href: '/admin/web-content/landing-courses',
        icon: BookOpen,
      },
    ],
  },
  {
    title: 'Pengaturan',
    icon: Settings,
    children: [
      {
        title: 'Backup',
        href: '/admin/settings/backup',
        icon: Database,
      },
      {
        title: 'Akun Pengguna',
        href: '/admin/users',
        icon: Settings,
      },
    ],
  },
];

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { reminderCount, pendingStudentsCount } = useSidebarBadges();
  const pathname = usePathname();

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const isActive = item.href ? pathname === item.href : false;
    const isPaymentPage = item.href === '/admin/payments';
    const isStudentsPage = item.href === '/admin/students';
    const showPaymentBadge = isPaymentPage && reminderCount > 0;
    const showStudentsBadge = isStudentsPage && pendingStudentsCount > 0;

    if (hasChildren) {
      return (
        <div key={item.title}>
          <button
            onClick={() => toggleExpanded(item.title)}
            className={cn(
              "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              level > 0 && "ml-4"
            )}
          >
            <div className="flex items-center space-x-3">
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {isExpanded && (
            <div className="mt-1 space-y-1">
              {item.children?.map(child => renderSidebarItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href!}
        className={cn(
          "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-blue-100 text-blue-700"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
          level > 0 && "ml-4"
        )}
        onClick={() => setIsOpen(false)}
      >
        <div className="flex items-center space-x-3">
          <item.icon className="h-5 w-5" />
          <span>{item.title}</span>
        </div>
        {showPaymentBadge && (
          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-orange-500 rounded-full min-w-[20px] h-5">
            {reminderCount}
          </span>
        )}
        {showStudentsBadge && (
          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[20px] h-5">
            {pendingStudentsCount}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full max-h-screen">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <img 
                src="https://res.cloudinary.com/dzksnkl72/image/upload/v1770305224/logo_innhbv.jpg" 
                alt="Homely Logo" 
                className="h-8 w-8 rounded-md object-cover"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
                <p className="text-xs text-gray-500">Homely Kursus Komputer</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation - Scrollable Area */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <ScrollArea className="h-full">
              <nav className="space-y-2 p-4">
                {sidebarItems.map(item => renderSidebarItem(item))}
              </nav>
            </ScrollArea>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 space-y-2 flex-shrink-0">
            <Link
              href="/"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>Kembali ke Beranda</span>
            </Link>
            
            {/* Logout Button in Sidebar */}
            <div className="px-3">
              <LogoutButton 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 border-0"
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}