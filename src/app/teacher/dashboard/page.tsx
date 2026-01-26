'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Users,
  BookOpen,
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  Award,
  CheckCircle
} from 'lucide-react';

interface DashboardStats {
  totalClasses: number;
  totalStudents: number;
  totalMeetings: number;
  totalCommission: number;
  thisMonthMeetings: number;
  thisMonthCommission: number;
  attendanceRate: number;
}

export default function TeacherDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/teacher/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Failed to fetch dashboard stats');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner message="Memuat dashboard..." />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Gagal memuat data dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Guru</h1>
        <p className="text-gray-600">Selamat datang! Berikut ringkasan aktivitas mengajar Anda.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Classes */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Kelas</p>
                <p className="text-2xl font-bold">{stats.totalClasses}</p>
                <p className="text-xs text-blue-600">Kelas aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Students */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Siswa</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
                <p className="text-xs text-green-600">Siswa aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Meetings */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pertemuan</p>
                <p className="text-2xl font-bold">{stats.totalMeetings}</p>
                <p className="text-xs text-purple-600">Pertemuan selesai</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Commission */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Komisi</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalCommission)}</p>
                <p className="text-xs text-orange-600">Semua periode</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* This Month Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performa Bulan Ini</CardTitle>
            <CardDescription>
              Ringkasan aktivitas mengajar bulan ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pertemuan Bulan Ini</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.thisMonthMeetings}</p>
                  <p className="text-sm text-gray-500">pertemuan selesai</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Komisi Bulan Ini</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.thisMonthCommission)}</p>
                  <p className="text-sm text-gray-500">dari {stats.thisMonthMeetings} pertemuan</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Tingkat Kehadiran</CardTitle>
            <CardDescription>
              Rata-rata kehadiran siswa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-green-500"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${stats.attendanceRate}, 100`}
                    strokeLinecap="round"
                    fill="transparent"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.attendanceRate}%</div>
                    <div className="text-xs text-gray-500">Kehadiran</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm text-gray-600">Tingkat kehadiran baik</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
          <CardDescription>
            Akses fitur yang sering digunakan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/teacher/student-attendance"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-blue-900">Absen Siswa</p>
                <p className="text-sm text-blue-600">Catat kehadiran siswa</p>
              </div>
            </a>

            <a
              href="/teacher/teacher-attendance"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Clock className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-green-900">Absen Guru</p>
                <p className="text-sm text-green-600">Catat kehadiran Anda</p>
              </div>
            </a>

            <a
              href="/teacher/classes"
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <BookOpen className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-purple-900">Data Kelas</p>
                <p className="text-sm text-purple-600">Lihat kelas Anda</p>
              </div>
            </a>

            <a
              href="/teacher/commissions"
              className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <Award className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="font-medium text-orange-900">Komisi</p>
                <p className="text-sm text-orange-600">Lihat komisi Anda</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}