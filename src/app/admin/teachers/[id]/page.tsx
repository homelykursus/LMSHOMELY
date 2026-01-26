'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  ArrowLeft,
  User,
  Phone,
  Calendar,
  BookOpen,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  GraduationCap,
  Award,
  MapPin,
  Check,
  X,
  Minus
} from 'lucide-react';
import { toast } from 'sonner';

interface TeacherDetail {
  id: string;
  name: string;
  education: string;
  phone?: string;
  photo?: string | null;
  specialization?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  courses?: {
    course: {
      id: string;
      name: string;
      category: string;
    };
    isMain: boolean;
  }[];
}

interface ClassDetail {
  id: string;
  name: string;
  schedule: string;
  isActive: boolean;
  totalMeetings: number;
  completedMeetings: number;
  startDate?: string;
  endDate?: string;
  course: {
    name: string;
    category: string;
  };
  students: {
    student: {
      id: string;
      name: string;
    };
  }[];
}

interface AttendanceRecord {
  id: string;
  meetingDate: string;
  meetingTopic: string;
  meetingNumber: number;
  status: 'present' | 'absent' | 'HADIR' | 'TIDAK_HADIR';
  notes?: string;
  recordedAt: string;
  className: string;
  studentPresentCount: number;
  totalStudentCount: number;
}

export default function TeacherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [teacher, setTeacher] = useState<TeacherDetail | null>(null);
  const [classes, setClasses] = useState<ClassDetail[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchTeacherDetail();
      fetchTeacherClasses();
      fetchTeacherAttendance();
      fetchTeacherMeetings();
    }
  }, [params.id]);

  const fetchTeacherDetail = async () => {
    try {
      const response = await fetch(`/api/teachers/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setTeacher(data);
      } else {
        console.error('Teacher not found');
        toast.error('Guru tidak ditemukan');
        router.push('/admin/teacher-attendance');
      }
    } catch (error) {
      console.error('Error fetching teacher:', error);
      toast.error('Gagal mengambil data guru');
      router.push('/admin/teacher-attendance');
    }
  };

  const fetchTeacherClasses = async () => {
    try {
      const response = await fetch(`/api/classes?teacherId=${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setClasses(data || []);
      }
    } catch (error) {
      console.error('Error fetching teacher classes:', error);
    }
  };

  const fetchTeacherAttendance = async () => {
    try {
      const response = await fetch(`/api/teacher-attendance?teacherId=${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data.records || []);
      }
    } catch (error) {
      console.error('Error fetching teacher attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherMeetings = async () => {
    try {
      // Fetch meetings for all classes taught by this teacher
      const classesResponse = await fetch(`/api/classes?teacherId=${params.id}`);
      if (classesResponse.ok) {
        const classesData = await classesResponse.json();
        
        // Fetch meetings for each class
        const allMeetings = [];
        for (const classItem of classesData) {
          try {
            const meetingsResponse = await fetch(`/api/classes/${classItem.id}/meetings`);
            if (meetingsResponse.ok) {
              const meetingsData = await meetingsResponse.json();
              allMeetings.push(...meetingsData);
            }
          } catch (error) {
            console.error(`Error fetching meetings for class ${classItem.id}:`, error);
          }
        }
        
        setMeetings(allMeetings);
      }
    } catch (error) {
      console.error('Error fetching teacher meetings:', error);
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
      return 'Waktu tidak valid';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Tidak Aktif</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
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
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  // Calculate statistics
  const activeClasses = classes.filter(cls => cls.isActive);
  const completedClasses = classes.filter(cls => !cls.isActive);
  const totalStudents = classes.reduce((sum, cls) => sum + cls.students.length, 0);
  
  const presentCount = attendanceRecords.filter(r => 
    r.status === 'present' || r.status === 'HADIR'
  ).length;
  const absentCount = attendanceRecords.filter(r => 
    r.status === 'absent' || r.status === 'TIDAK_HADIR'
  ).length;
  const totalMeetings = attendanceRecords.length;
  const attendanceRate = totalMeetings > 0 ? Math.round((presentCount / totalMeetings) * 100) : 0;

  // Calculate total commission from meetings
  const totalCommission = meetings.reduce((sum, meeting) => {
    return sum + (meeting.calculatedCommission || 0);
  }, 0);

  if (loading) {
    return (
      <LoadingSpinner 
        message="Loading..."
        subMessage="Detail guru sedang dimuat"
      />
    );
  }

  if (!teacher) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Guru tidak ditemukan</h1>
          <Button onClick={() => router.push('/admin/teacher-attendance')}>
            Kembali ke Absen Guru
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/admin/teacher-attendance')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <User className="h-8 w-8 text-blue-600" />
            Detail Guru
          </h1>
          <p className="text-gray-600">Informasi lengkap guru {teacher.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {teacher.photo ? (
                <img 
                  src={teacher.photo} 
                  alt={teacher.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-200">
                  <User className="h-12 w-12 text-blue-600" />
                </div>
              )}
            </div>
            <CardTitle className="text-xl">{teacher.name}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-2">
              {getStatusBadge(teacher.status)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{teacher.education}</span>
            </div>
            {teacher.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{teacher.phone}</span>
              </div>
            )}
            {teacher.specialization && (
              <div className="flex items-center gap-3">
                <Award className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{teacher.specialization}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Bergabung {formatDate(teacher.createdAt)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{classes.length}</div>
              <div className="text-sm text-gray-600">Total Kelas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{activeClasses.length}</div>
              <div className="text-sm text-gray-600">Kelas Aktif</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{totalStudents}</div>
              <div className="text-sm text-gray-600">Total Siswa</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{attendanceRate}%</div>
              <div className="text-sm text-gray-600">Kehadiran</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {formatCurrency(totalCommission)}
              </div>
              <div className="text-sm text-gray-600">Total Komisi</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="classes" className="mt-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="classes">Kelas</TabsTrigger>
          <TabsTrigger value="attendance">Riwayat Absensi</TabsTrigger>
        </TabsList>

        {/* Classes Tab */}
        <TabsContent value="classes" className="space-y-6">
          {/* Active Classes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                Kelas Aktif ({activeClasses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeClasses.length > 0 ? (
                <div className="space-y-4">
                  {activeClasses.map((classItem) => (
                    <div key={classItem.id} className="border rounded-lg p-4 bg-green-50 border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-green-900">{classItem.name}</h4>
                        <Badge className="bg-green-100 text-green-800">Aktif</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Kursus:</span>
                          <p className="font-medium">{classItem.course.name}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Jadwal:</span>
                          <p className="font-medium">{classItem.schedule}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Progress:</span>
                          <p className="font-medium">{classItem.completedMeetings}/{classItem.totalMeetings} pertemuan</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Siswa:</span>
                          <p className="font-medium">{classItem.students.length} orang</p>
                        </div>
                      </div>
                      {classItem.startDate && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span>Dimulai: {formatDate(classItem.startDate)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada kelas aktif</h3>
                  <p className="text-gray-500">Guru ini belum memiliki kelas yang sedang berjalan</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completed Classes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                Kelas Selesai ({completedClasses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completedClasses.length > 0 ? (
                <div className="space-y-4">
                  {completedClasses.map((classItem) => (
                    <div key={classItem.id} className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-blue-900">{classItem.name}</h4>
                        <Badge className="bg-blue-100 text-blue-800">Selesai</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Kursus:</span>
                          <p className="font-medium">{classItem.course.name}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Jadwal:</span>
                          <p className="font-medium">{classItem.schedule}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Pertemuan:</span>
                          <p className="font-medium">{classItem.completedMeetings}/{classItem.totalMeetings} selesai</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Siswa:</span>
                          <p className="font-medium">{classItem.students.length} orang</p>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600 flex gap-4">
                        {classItem.startDate && (
                          <span>Dimulai: {formatDate(classItem.startDate)}</span>
                        )}
                        {classItem.endDate && (
                          <span>Selesai: {formatDate(classItem.endDate)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada kelas selesai</h3>
                  <p className="text-gray-500">Guru ini belum menyelesaikan kelas apapun</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Riwayat Absensi Guru
              </CardTitle>
              <CardDescription>
                Rekap kehadiran guru dari pertemuan pertama hingga terakhir
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceRecords.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Belum Ada Data Absensi
                  </h3>
                  <p className="text-gray-500">
                    Guru ini belum memiliki catatan kehadiran dalam sistem.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-700">{presentCount}</div>
                      <div className="text-xs text-green-600 font-medium">Hadir</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-700">{absentCount}</div>
                      <div className="text-xs text-red-600 font-medium">Tidak Hadir</div>
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
                      </div>
                    </div>
                    
                    {/* Attendance List */}
                    <div className="space-y-2">
                      {attendanceRecords.map((record, index) => (
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
                                <div className="text-xs text-gray-500 mt-1">
                                  Siswa hadir: {record.studentPresentCount}/{record.totalStudentCount}
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
                                {record.status === 'present' || record.status === 'HADIR' ? 'Hadir' : 'Tidak Hadir'}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}