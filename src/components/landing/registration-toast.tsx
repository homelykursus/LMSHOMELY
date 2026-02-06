'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  createdAt: Date;
}

interface ToastData {
  id: string;
  name: string;
  timeAgo: string;
  isExiting?: boolean;
}

export default function RegistrationToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const currentIndexRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch students dari API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/landing/recent-students');
        const data = await response.json();
        if (data.students && data.students.length > 0) {
          setStudents(data.students);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, []);

  // Function untuk menghitung waktu relatif
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const registrationDate = new Date(date);
    const diffInMs = now.getTime() - registrationDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Baru Saja';
    } else if (diffInHours < 24) {
      return 'Hari Ini';
    } else if (diffInDays === 1) {
      return '1 Hari Lalu';
    } else if (diffInDays === 2) {
      return '2 Hari Lalu';
    } else if (diffInDays < 7) {
      return `${diffInDays} Hari Lalu`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} Minggu Lalu`;
    } else {
      const months = Math.floor(diffInDays / 30);
      return `${months} Bulan Lalu`;
    }
  };

  // Function untuk mendapatkan warna avatar berdasarkan nama
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Function untuk mendapatkan inisial nama
  const getInitials = (name: string) => {
    const words = name.trim().split(' ').filter(word => word.length > 0);
    if (words.length >= 2) {
      // Ambil huruf pertama dari 2 kata pertama
      return (words[0][0] + words[1][0]).toUpperCase();
    } else if (words.length === 1) {
      // Jika hanya 1 kata, ambil 2 huruf pertama
      return words[0].substring(0, 2).toUpperCase();
    }
    // Fallback jika nama kosong
    return 'U';
  };

  // Show toast dengan timing berbeda untuk mobile dan desktop
  useEffect(() => {
    if (students.length === 0) return;

    const showToast = () => {
      const student = students[currentIndexRef.current];
      const newToast: ToastData = {
        id: `${student.id}-${Date.now()}`,
        name: student.name,
        timeAgo: getTimeAgo(student.createdAt),
        isExiting: false
      };

      setToasts(prev => [...prev, newToast]);

      // Mobile: hilang setelah 1.5 detik, Desktop: hilang setelah 5 detik
      const removeDelay = window.innerWidth < 768 ? 1500 : 5000;
      
      setTimeout(() => {
        // Mark as exiting untuk trigger animasi
        setToasts(prev => prev.map(t => 
          t.id === newToast.id ? { ...t, isExiting: true } : t
        ));
        
        // Remove setelah animasi selesai (300ms)
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== newToast.id));
        }, 300);
      }, removeDelay);

      // Update index untuk siswa berikutnya
      currentIndexRef.current = (currentIndexRef.current + 1) % students.length;
    };

    // Mobile: cycle 4.5 detik (1.5s tampil + 3s jeda)
    // Desktop: cycle 3 detik
    const cycleDelay = window.innerWidth < 768 ? 4500 : 3000;
    
    // Show first toast immediately
    showToast();
    
    // Then repeat with interval
    intervalRef.current = setInterval(showToast, cycleDelay);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [students]);

  const removeToast = (id: string) => {
    // Mark as exiting untuk trigger animasi
    setToasts(prev => prev.map(t => 
      t.id === id ? { ...t, isExiting: true } : t
    ));
    
    // Remove setelah animasi selesai
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 md:top-24 right-4 md:right-6 z-40 space-y-3 max-w-sm">
      {toasts.slice(0, 1).map((toast, index) => { // Mobile: hanya 1 toast
        const student = students.find(s => s.name === toast.name);
        const avatarColor = student ? getAvatarColor(student.name) : 'bg-blue-500';
        const initials = student ? getInitials(student.name) : 'U';

        return (
          <div
            key={toast.id}
            className={`bg-white rounded-xl shadow-2xl border border-gray-100 p-4 hover:shadow-3xl transition-all duration-300 cursor-pointer group md:hidden ${
              toast.isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'
            }`}
            onClick={() => removeToast(toast.id)}
          >
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <div className={`${avatarColor} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md`}>
                {initials}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-semibold text-sm truncate">
                  {toast.name}
                </p>
                <p className="text-gray-600 text-xs mt-0.5">
                  Mendaftar Kursus
                </p>
                <p className="text-blue-600 text-xs font-medium mt-1">
                  {toast.timeAgo}
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeToast(toast.id);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
      
      {/* Desktop: tampilkan semua toast (max 3) */}
      <div className="hidden md:block space-y-3">
        {toasts.slice(0, 3).map((toast, index) => {
          const student = students.find(s => s.name === toast.name);
          const avatarColor = student ? getAvatarColor(student.name) : 'bg-blue-500';
          const initials = student ? getInitials(student.name) : 'U';

          return (
            <div
              key={toast.id}
              className={`bg-white rounded-xl shadow-2xl border border-gray-100 p-4 hover:shadow-3xl transition-all duration-300 cursor-pointer group ${
                toast.isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'
              }`}
              onClick={() => removeToast(toast.id)}
            >
              <div className="flex items-start space-x-3">
                {/* Avatar */}
                <div className={`${avatarColor} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md`}>
                  {initials}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-semibold text-sm truncate">
                    {toast.name}
                  </p>
                  <p className="text-gray-600 text-xs mt-0.5">
                    Mendaftar Kursus
                  </p>
                  <p className="text-blue-600 text-xs font-medium mt-1">
                    {toast.timeAgo}
                  </p>
                </div>

                {/* Close button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeToast(toast.id);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
