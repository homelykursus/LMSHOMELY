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
  status: 'present' | 'absent' | 'late' | 'excused' | 'HADIR' | 'TIDAK_HADIR' | 'TERLAMBAT' | 'IZIN';
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

  const updateStudentStatus = async (newStatus: string) => {
    if (!student) return;
    
    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchStudent();
      }
    } catch (error) {
      console.error('Error updating student status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const deleteStudent = async () => {
    if (!student) return;
    
    if (!confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) return;

    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/students');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Menunggu Konfirmasi</Badge>;
      case 'confirmed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Dikonfirmasi</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Selesai</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-orange-600" />;
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return age;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
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
      case 'HADIR':
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="h-4 w-4 text-green-700" />
          </div>
        );
      case 'absent':
      case 'TIDAK_HADIR':
        return (
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <X className="h-4 w-4 text-red-700" />
          </div>
        );
      case 'late':
      case 'excused':
      case 'TERLAMBAT':
      case 'IZIN':
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
      case 'HADIR':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'absent':
      case 'TIDAK_HADIR':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'excused':
      case 'late':
      case 'IZIN':
      case 'TERLAMBAT':
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
  const presentCount = displayData.filter(r => 
    r.status === 'present' || r.status === 'HADIR'
  ).length;
  const absentCount = displayData.filter(r => 
    r.status === 'absent' || r.status === 'TIDAK_HADIR'
  ).length;
  const excusedCount = displayData.filter(r => 
    r.status === 'excused' || r.status === 'late' || r.status === 'IZIN' || r.status === 'TERLAMBAT'
  ).length;
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
        
        <div className="flex items-center gap-3">
          {student.status === 'pending' && (
            <Button
              onClick={() => updateStudentStatus('confirmed')}
              disabled={updatingStatus}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Konfirmasi
            </Button>
          )}
          
          {student.status === 'confirmed' && (
            <Button
              onClick={() => updateStudentStatus('completed')}
              disabled={updatingStatus}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Selesai
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/students/edit/${student.id}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          
          {student.status === 'completed' && (
            <Button
              variant="destructive"
              onClick={deleteStudent}
              disabled={updatingStatus}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 py-6">
        {/* Sidebar - Foto & Status */}
        <div className="lg:col-span-1 space-y-4">
          {/* Foto Siswa */}
          <Card className="border-2 border-gray-100">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                {student.photo ? (
                  <div className="relative inline-block">
                    <img
                      src={student.photo}
                      alt={student.name}
                      className="w-32 h-32 object-cover rounded-xl border-4 border-white shadow-lg"
                    />
                    <div className="absolute -bottom-2 -right-2">
                      {getStatusIcon(student.status)}
                    </div>
                  </div>
                ) : (
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center border-4 border-white shadow-lg">
                      <User className="h-16 w-16 text-gray-400" />
                    </div>
                    <div className="absolute -bottom-2 -right-2">
                      {getStatusIcon(student.status)}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-gray-900">{student.name}</h3>
                  {getStatusBadge(student.status)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ID Siswa */}
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">ID Siswa</p>
                <p className="font-mono text-sm bg-white p-2 rounded border border-gray-200">
                  {student.id.slice(0, 8)}...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-4 space-y-6">
          {/* Data Pribadi */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 bg-white rounded-lg shadow-sm">
                  <User className="h-5 w-5 text-gray-700" />
                </div>
                Data Pribadi
              </CardTitle>
              <CardDescription>Informasi pribadi dan kontak siswa</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="group">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                      Nama Lengkap
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{student.name}</span>
                    </div>
                  </div>

                  <div className="group">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                      Tanggal Lahir
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="font-medium">{formatDate(student.dateOfBirth)}</span>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Usia: {calculateAge(student.dateOfBirth)} tahun
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="group">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                      Nomor WhatsApp
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{student.whatsapp}</span>
                    </div>
                  </div>

                  <div className="group">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                      Pendidikan Terakhir
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                      <GraduationCap className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">
                        {student.lastEducation || 'Tidak ada data'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="group">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                      Tanggal Pendaftaran
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{formatDateTime(student.createdAt)}</span>
                    </div>
                  </div>

                  <div className="group">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                      Terakhir Diupdate
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{formatDateTime(student.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informasi Kursus */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 bg-white rounded-lg shadow-sm">
                  <BookOpen className="h-5 w-5 text-blue-700" />
                </div>
                Informasi Kursus
              </CardTitle>
              <CardDescription>Detail kursus yang diambil siswa</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                      Nama Kursus
                    </label>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="font-bold text-blue-900 mb-2">{student.course.name}</p>
                      <Badge variant="outline" className="bg-white border-blue-300 text-blue-700">
                        {student.course.category}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                      Jenis Kelas
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">
                        {student.courseType === 'regular' ? 'Kelas Reguler' : 'Kelas Privat'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {student.course.duration && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                        Durasi Kursus
                      </label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="font-medium">{student.course.duration} pertemuan</span>
                          <div className="text-xs text-gray-500">({Math.round((student.course.duration * 90) / 60)} jam total)</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                      Rincian Harga
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Harga Normal</span>
                        <span className="text-sm line-through text-gray-500">
                          {formatCurrency(student.finalPrice + student.discount)}
                        </span>
                      </div>
                      
                      {student.discount > 0 && (
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                          <span className="text-sm font-medium text-green-700">Diskon</span>
                          <span className="text-sm font-bold text-green-600">
                            -{formatCurrency(student.discount)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Payment */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-1">Total Biaya Kursus</p>
                    <p className="text-xs text-blue-200 opacity-90">
                      {student.courseType === 'regular' 
                        ? 'Per orang (Kelas Reguler)' 
                        : 'Per sesi (Kelas Privat)'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">{formatCurrency(student.finalPrice)}</p>
                  </div>
                </div>
              </div>

              {/* Deskripsi Kursus */}
              {student.course.description && (
                <div className="mt-6">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
                    Deskripsi Kursus
                  </label>
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {student.course.description}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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
                                {record.status === 'present' || record.status === 'HADIR' ? 'Hadir' : 
                                 record.status === 'absent' || record.status === 'TIDAK_HADIR' ? 'Tidak Hadir' : 
                                 record.status === 'late' || record.status === 'TERLAMBAT' ? 'Terlambat' : 
                                 record.status === 'excused' || record.status === 'IZIN' ? 'Izin' : record.status}
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
      </div>
    </div>
  );
}