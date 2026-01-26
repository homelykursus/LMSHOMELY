'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Calendar, 
  Phone, 
  BookOpen, 
  DollarSign, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  ArrowLeft,
  Edit,
  Trash2,
  Check,
  X,
  Minus
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  dateOfBirth: string;
  whatsapp: string;
  photo?: string | null;
  courseId: string;
  courseType: string;
  participants: number;
  finalPrice: number;
  discount: number;
  lastEducation?: string | null;
  status: 'pending' | 'confirmed' | 'completed';
  createdAt: string;
  updatedAt: string;
  course: {
    name: string;
    category: string;
    description?: string;
    duration?: number;
  };
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  className: string;
  meetingId: string;
  meetingDate: string;
  meetingTopic: string;
  meetingNumber: number;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  recordedAt: string;
  // Legacy format for compatibility
  date: string;
  meeting: {
    id: string;
    classId: string;
    date: string;
    topic: string;
    meetingNumber: number;
  };
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchStudent();
      fetchAttendance();
    }
  }, [params.id]);

  const fetchStudent = async () => {
    try {
      const response = await fetch(`/api/students/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setStudent(data);
      } else {
        console.error('Student not found');
        router.push('/admin/students');
      }
    } catch (error) {
      console.error('Error fetching student:', error);
      router.push('/admin/students');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`/api/students/${params.id}/attendance`);
      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data || []);
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAttendanceSymbol = (status: string) => {
    switch (status) {
      case 'present':
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="h-4 w-4 text-green-700" />
          </div>
        );
      case 'absent':
        return (
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <X className="h-4 w-4 text-red-700" />
          </div>
        );
      case 'late':
      case 'excused':
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
            <Minus className="h-4 w-4 text-yellow-700" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <Minus className="h-4 w-4 text-gray-500" />
          </div>
        );
    }
  };

  const getAttendanceColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'absent':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'excused':
      case 'late':
        return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Siswa tidak ditemukan</h1>
          <Button onClick={() => router.push('/admin/students')}>
            Kembali ke Daftar Siswa
          </Button>
        </div>
      </div>
    );
  }

  // Calculate attendance statistics
  const displayData = attendanceRecords;
  const presentCount = displayData.filter(r => r.status === 'present').length;
  const absentCount = displayData.filter(r => r.status === 'absent').length;
  const excusedCount = displayData.filter(r => r.status === 'excused' || r.status === 'late').length;
  const totalMeetings = displayData.length;
  const attendanceRate = totalMeetings > 0 ? Math.round((presentCount / totalMeetings) * 100) : 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/students')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detail Data Siswa</h1>
            <p className="text-gray-600">Informasi lengkap data siswa dan riwayat absensi</p>
          </div>
        </div>
      </div>

      {/* Riwayat Absensi Terbaru */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 bg-white rounded-lg shadow-sm">
              <Calendar className="h-5 w-5 text-purple-700" />
            </div>
            Riwayat Absensi Terbaru
          </CardTitle>
          <CardDescription>
            Rekap kehadiran siswa dari pertemuan pertama hingga terakhir
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {displayData.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum Ada Data Absensi
              </h3>
              <p className="text-gray-500">
                Siswa ini belum memiliki catatan kehadiran dalam sistem.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-700">{presentCount}</div>
                  <div className="text-xs text-green-600 font-medium">Hadir</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-700">{absentCount}</div>
                  <div className="text-xs text-red-600 font-medium">Tidak Hadir</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-700">{excusedCount}</div>
                  <div className="text-xs text-yellow-600 font-medium">Izin</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-700">{totalMeetings}</div>
                  <div className="text-xs text-blue-600 font-medium">Total Pertemuan</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-700">{attendanceRate}%</div>
                  <div className="text-xs text-purple-600 font-medium">Tingkat Kehadiran</div>
                </div>
              </div>

              {/* Detailed Attendance Records */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Detail Pertemuan</h3>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-green-100 border border-green-300"></div>
                      <span className="text-gray-600">Hadir</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-100 border border-red-300"></div>
                      <span className="text-gray-600">Tidak Hadir</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-300"></div>
                      <span className="text-gray-600">Izin/Terlambat</span>
                    </div>
                  </div>
                </div>
                
                {/* Attendance List */}
                <div className="space-y-2">
                  {displayData.map((record, index) => (
                    <div
                      key={record.id}
                      className={`p-4 rounded-lg border transition-colors ${getAttendanceColor(record.status)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getAttendanceSymbol(record.status)}
                          <div>
                            <div className="font-medium text-gray-900">
                              {record.meetingTopic || `Pertemuan ${record.meetingNumber || index + 1}`}
                            </div>
                            <div className="text-sm text-gray-600">
                              {record.className} • {formatDate(record.meetingDate)}
                            </div>
                            {record.notes && (
                              <div className="text-xs text-gray-500 mt-1">
                                Catatan: {record.notes}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {record.status === 'present' ? 'Hadir' : 
                             record.status === 'absent' ? 'Tidak Hadir' : 
                             record.status === 'late' ? 'Terlambat' : 'Izin'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDateTime(record.recordedAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}