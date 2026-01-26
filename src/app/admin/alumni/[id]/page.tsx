'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  GraduationCap,
  User,
  Phone,
  Calendar,
  BookOpen,
  DollarSign,
  Award,
  MapPin,
  FileText,
  Trophy,
  CheckCircle,
  Users,
  Clock,
  Check,
  X,
  Minus
} from 'lucide-react';
import { toast } from 'sonner';

interface AlumniDetail {
  id: string;
  name: string;
  whatsapp: string;
  photo?: string | null;
  dateOfBirth: string;
  courseId: string;
  courseType: string;
  participants: number;
  finalPrice: number;
  discount: number;
  lastEducation?: string;
  status: 'completed' | 'graduated';
  createdAt: string;
  updatedAt: string;
  course?: {
    id: string;
    name: string;
    category: string;
    description?: string;
    duration?: number;
  };
  classes?: Array<{
    id: string;
    class: {
      id: string;
      name: string;
      schedule: string;
      isActive: boolean;
      totalMeetings: number;
      completedMeetings: number;
    };
    joinedAt: string;
  }>;
  payments?: Array<{
    id: string;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
    paymentMethod?: string;
    completedAt?: string;
    createdAt: string;
  }>;
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

export default function AlumniDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [alumni, setAlumni] = useState<AlumniDetail | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchAlumniDetail(params.id as string);
      fetchAttendance();
    }
  }, [params.id]);

  const fetchAlumniDetail = async (id: string) => {
    try {
      const response = await fetch(`/api/alumni/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch alumni detail');
      }
      const data = await response.json();
      setAlumni(data);
    } catch (error) {
      console.error('Error fetching alumni detail:', error);
      toast.error('Gagal mengambil detail alumni');
      router.push('/admin/alumni');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`/api/alumni/${params.id}/attendance`);
      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data || []);
      } else {
        console.error('Failed to fetch attendance records');
        setAttendanceRecords([]);
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      setAttendanceRecords([]);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Tanggal tidak tersedia';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Tanggal tidak valid';
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Tanggal tidak valid';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      if (!dateString) return 'Waktu tidak tersedia';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Waktu tidak valid';
      return date.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return 'Waktu tidak valid';
    }
  };

  const getAttendanceSymbol = (status: string) => {
    try {
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
    } catch (error) {
      console.error('Error getting attendance symbol:', error);
      return (
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <Minus className="h-4 w-4 text-gray-500" />
        </div>
      );
    }
  };

  const getAttendanceColor = (status: string) => {
    try {
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
    } catch (error) {
      console.error('Error getting attendance color:', error);
      return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Selesai</Badge>;
      case 'graduated':
        return <Badge className="bg-purple-100 text-purple-800">Lulus</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getCourseTypeBadge = (type: string) => {
    switch (type) {
      case 'regular':
        return <Badge variant="outline">Regular</Badge>;
      case 'private':
        return <Badge className="bg-blue-100 text-blue-800">Private</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const calculatePaymentSummary = () => {
    try {
      if (!alumni?.payments || alumni.payments.length === 0) {
        return {
          totalPaid: 0,
          remainingAmount: alumni?.finalPrice || 0,
          isFullyPaid: false
        };
      }

      // Get the latest payment record (should contain the most up-to-date totals)
      const latestPayment = alumni.payments[0]; // Already sorted by createdAt desc in API
      
      return {
        totalPaid: latestPayment.paidAmount || 0,
        remainingAmount: latestPayment.remainingAmount || 0,
        isFullyPaid: (latestPayment.remainingAmount || 0) <= 0
      };
    } catch (error) {
      console.error('Error calculating payment summary:', error);
      return {
        totalPaid: 0,
        remainingAmount: alumni?.finalPrice || 0,
        isFullyPaid: false
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
          <p className="text-gray-600 mt-2">Detail alumni sedang dimuat</p>
        </div>
      </div>
    );
  }

  if (!alumni) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900">Alumni tidak ditemukan</h2>
          <p className="text-gray-600 mt-2">Data alumni yang Anda cari tidak tersedia</p>
          <Button 
            onClick={() => router.push('/admin/alumni')} 
            className="mt-4"
          >
            Kembali ke Data Alumni
          </Button>
        </div>
      </div>
    );
  }

  // Calculate attendance statistics with error handling
  let displayData = [];
  let presentCount = 0;
  let absentCount = 0;
  let excusedCount = 0;
  let totalMeetings = 0;
  let attendanceRate = 0;

  try {
    displayData = attendanceRecords || [];
    presentCount = displayData.filter(r => 
      r && (r.status === 'present' || r.status === 'HADIR')
    ).length;
    absentCount = displayData.filter(r => 
      r && (r.status === 'absent' || r.status === 'TIDAK_HADIR')
    ).length;
    excusedCount = displayData.filter(r => 
      r && (r.status === 'excused' || r.status === 'late' || r.status === 'IZIN' || r.status === 'TERLAMBAT')
    ).length;
    totalMeetings = displayData.length;
    attendanceRate = totalMeetings > 0 ? Math.round((presentCount / totalMeetings) * 100) : 0;
  } catch (error) {
    console.error('Error calculating attendance statistics:', error);
    // Keep default values (all zeros)
  }

  // Calculate payment summary
  const paymentSummary = calculatePaymentSummary();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/admin/alumni')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-purple-600" />
            Detail Alumni
          </h1>
          <p className="text-gray-600">Informasi lengkap alumni {alumni.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {alumni.photo ? (
                <img 
                  src={alumni.photo} 
                  alt={alumni.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-purple-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center border-4 border-purple-200">
                  <User className="h-12 w-12 text-purple-600" />
                </div>
              )}
            </div>
            <CardTitle className="text-xl">{alumni.name}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-2">
              {getStatusBadge(alumni.status)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{alumni.whatsapp}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{formatDate(alumni.dateOfBirth)}</span>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{alumni.lastEducation || 'Tidak diketahui'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Trophy className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Alumni sejak {formatDate(alumni.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Course Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              Informasi Kursus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Nama Kursus</label>
                <p className="text-lg font-semibold">{alumni.course?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Kategori</label>
                <p className="text-lg">{alumni.course?.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Tipe Kursus</label>
                <div className="mt-1">
                  {getCourseTypeBadge(alumni.courseType)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Jumlah Peserta</label>
                <p className="text-lg flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  {alumni.participants} orang
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Durasi Kursus</label>
                <p className="text-lg flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  {alumni.course?.duration || 0} jam
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Tanggal Daftar</label>
                <p className="text-lg">{formatDate(alumni.createdAt)}</p>
              </div>
            </div>

            {alumni.course?.description && (
              <div>
                <label className="text-sm font-medium text-gray-600">Deskripsi Kursus</label>
                <p className="text-gray-700 mt-1">{alumni.course.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Informasi Biaya
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Biaya Kursus</label>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(alumni.finalPrice)}</p>
            </div>
            {alumni.discount > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-600">Diskon</label>
                <p className="text-lg font-semibold text-red-600">-{formatCurrency(alumni.discount)}</p>
              </div>
            )}
            <Separator />
            <div>
              <label className="text-sm font-medium text-gray-600">Total Dibayar</label>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(paymentSummary.totalPaid)}</p>
            </div>
            {paymentSummary.remainingAmount > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-600">Sisa Pembayaran</label>
                <p className="text-lg font-semibold text-orange-600">{formatCurrency(paymentSummary.remainingAmount)}</p>
              </div>
            )}
            {paymentSummary.isFullyPaid && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Pembayaran Lunas</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Class Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Riwayat Kelas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alumni.classes && alumni.classes.length > 0 ? (
              <div className="space-y-4">
                {alumni.classes.map((classEnrollment, index) => (
                  <div key={classEnrollment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{classEnrollment.class.name}</h4>
                      <Badge className={classEnrollment.class.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {classEnrollment.class.isActive ? 'Aktif' : 'Selesai'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Jadwal:</span>
                        <p>{classEnrollment.class.schedule}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Progress:</span>
                        <p>{classEnrollment.class.completedMeetings}/{classEnrollment.class.totalMeetings} pertemuan</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Bergabung:</span>
                        <p>{formatDate(classEnrollment.joinedAt)}</p>
                      </div>
                    </div>
                    {classEnrollment.class.completedMeetings >= classEnrollment.class.totalMeetings && (
                      <div className="mt-2 flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Kelas telah diselesaikan</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada riwayat kelas</h3>
                <p className="text-gray-500">Alumni ini belum terdaftar di kelas manapun</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Riwayat Absensi Terbaru */}
        <Card className="lg:col-span-3">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 bg-white rounded-lg shadow-sm">
                <Calendar className="h-5 w-5 text-purple-700" />
              </div>
              Riwayat Absensi Terbaru
            </CardTitle>
            <CardDescription>
              Rekap kehadiran alumni dari pertemuan pertama hingga terakhir
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
                  Alumni ini belum memiliki catatan kehadiran dalam sistem.
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
                    {displayData.map((record, index) => {
                      try {
                        if (!record || !record.id) {
                          return null;
                        }
                        
                        return (
                          <div
                            key={record.id}
                            className={`p-4 rounded-lg border transition-colors ${getAttendanceColor(record.status || 'unknown')}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {getAttendanceSymbol(record.status || 'unknown')}
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {record.meetingTopic || `Pertemuan ${record.meetingNumber || index + 1}`}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {record.className || 'Kelas tidak diketahui'} • {formatDate(record.meetingDate)}
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
                                   record.status === 'excused' || record.status === 'IZIN' ? 'Izin' : (record.status || 'Tidak diketahui')}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatDateTime(record.recordedAt)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      } catch (renderError) {
                        console.error('Error rendering attendance record:', renderError, record);
                        return (
                          <div key={`error-${index}`} className="p-4 rounded-lg border border-red-200 bg-red-50">
                            <div className="text-sm text-red-600">
                              Error menampilkan data pertemuan #{index + 1}
                            </div>
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}