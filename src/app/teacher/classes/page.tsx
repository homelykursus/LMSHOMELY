'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users,
  UserCheck,
  BookOpen,
  Clock,
  Calendar,
  Eye,
  CheckCircle,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import AttendanceDialog from '@/components/admin/attendance-dialog';

interface Class {
  id: string;
  name: string;
  description?: string | null;
  maxStudents: number;
  commissionType: string;
  commissionAmount: number;
  schedule: string;
  startDate: string;
  endDate: string;
  totalMeetings: number;
  completedMeetings: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  course: {
    id: string;
    name: string;
    category: string;
  };
  teacher: {
    id: string;
    name: string;
    education: string;
    specialization?: string | null;
    status: string;
  };
  room: {
    id: string;
    name: string;
    building?: string | null;
    floor?: string | null;
  };
  students: Array<{
    id: string;
    joinedAt: string;
    student: {
      id: string;
      name: string;
      whatsapp: string;
      dateOfBirth?: string | null;
      lastEducation?: string | null;
      gender?: string | null;
    };
  }>;
}

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [attendanceClass, setAttendanceClass] = useState<Class | null>(null);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [viewClass, setViewClass] = useState<Class | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<string>('waiting');
  
  // Search and pagination states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [waitingPage, setWaitingPage] = useState<number>(1);
  const [activePage, setActivePage] = useState<number>(1);
  const [completedPage, setCompletedPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string | null | undefined): number | null => {
    if (!dateOfBirth) return null;
    
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      
      // Check if the date is valid
      if (isNaN(birthDate.getTime())) return null;
      
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      // Adjust age if birthday hasn't occurred this year
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age >= 0 ? age : null;
    } catch (error) {
      console.error('Error calculating age:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/teacher/classes');
      const data = await response.json();

      if (response.ok) {
        setClasses(data);
      } else {
        toast.error(data.error || 'Gagal memuat data kelas');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Terjadi kesalahan saat memuat data kelas');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceDisabledState = (classData: Class) => {
    if (!classData.teacher) {
      return {
        disabled: true,
        title: 'Guru belum ditambahkan'
      };
    }
    
    if (classData.teacher.status !== 'active') {
      return {
        disabled: true,
        title: 'Guru sedang tidak aktif - silakan hubungi admin'
      };
    }
    
    return {
      disabled: false,
      title: ''
    };
  };

  const handleAttendanceClick = (classData: Class) => {
    // Validasi apakah guru sudah ditambahkan
    if (!classData.teacher) {
      toast.error('Guru belum ditambahkan! Silakan hubungi admin.');
      return;
    }
    
    // Validasi apakah guru masih aktif
    if (classData.teacher.status !== 'active') {
      toast.error('Guru sedang tidak aktif! Silakan hubungi admin.');
      return;
    }
    
    setAttendanceClass(classData);
    setIsAttendanceDialogOpen(true);
  };

  const handleAttendanceSubmitted = () => {
    fetchClasses();
    setAttendanceClass(null);
    setIsAttendanceDialogOpen(false);
  };

  const handleViewClass = (classData: Class) => {
    setViewClass(classData);
    setIsViewDialogOpen(true);
  };

  const handleCompleteClass = async (classData: Class) => {
    const remaining = classData.totalMeetings - classData.completedMeetings;
    const confirmMessage = remaining > 0
      ? `Apakah Anda yakin ingin menyelesaikan kelas "${classData.name}"? 
    
${remaining} pertemuan tersisa akan ditandai sebagai selesai.`
      : `Apakah Anda yakin ingin menyelesaikan kelas "${classData.name}"?`;

    if (!confirm(confirmMessage)) return;

    try {
      const response = await fetch(`/api/classes/${classData.id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await fetchClasses();
        toast.success(`Kelas "${classData.name}" berhasil diselesaikan!`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Gagal menyelesaikan kelas');
      }
    } catch (error) {
      console.error('Error completing class:', error);
      toast.error('Terjadi kesalahan saat menyelesaikan kelas');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getClassStatus = (classData: Class) => {
    const currentStudents = classData.students.length;
    const maxStudents = classData.maxStudents;
    const completedMeetings = classData.completedMeetings;

    // Jika absensi sudah berjalan minimal 1 kali
    if (completedMeetings > 0) {
      return {
        label: 'Sedang Berjalan',
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800 border-green-200'
      };
    }

    // Jika kuota siswa sudah penuh
    if (currentStudents >= maxStudents) {
      return {
        label: 'Penuh',
        variant: 'default' as const,
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      };
    }

    // Jika kuota siswa belum penuh
    return {
      label: 'Menunggu',
      variant: 'secondary' as const,
      className: 'bg-orange-100 text-orange-800 border-orange-200'
    };
  };

  const stats = {
    total: classes.length,
    waiting: classes.filter(c => !c.endDate && c.completedMeetings === 0).length,
    active: classes.filter(c => !c.endDate && c.completedMeetings > 0).length,
    completed: classes.filter(c => c.endDate !== null).length,
    totalStudents: classes.reduce((sum, c) => sum + c.students.length, 0),
    waitingStudents: classes
      .filter(c => !c.endDate && c.completedMeetings === 0) // Kelas menunggu
      .reduce((sum, c) => sum + c.students.length, 0), // Jumlah siswa di kelas menunggu
    activeStudents: classes
      .filter(c => !c.endDate && c.completedMeetings > 0) // Kelas sedang berjalan
      .reduce((sum, c) => sum + c.students.length, 0), // Jumlah siswa di kelas berjalan
    totalCommission: classes.reduce((sum, c) => sum + c.commissionAmount, 0),
    availableQuota: classes
      .filter(c => !c.endDate) // Kelas menunggu + kelas sedang berjalan (yang belum selesai)
      .reduce((sum, c) => sum + (c.maxStudents - c.students.length), 0) // Jumlah kuota tersisa
  };

  // Filter classes into three categories with search functionality
  const filteredClasses = classes.filter(classData => 
    classData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classData.course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (classData.teacher?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    classData.room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classData.schedule.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const waitingClasses = filteredClasses.filter(c => 
    !c.endDate && c.completedMeetings === 0 // Kelas menunggu: belum selesai dan belum ada pertemuan
  );
  const activeAndOngoingClasses = filteredClasses.filter(c => 
    !c.endDate && c.completedMeetings > 0 // Kelas aktif: belum selesai tapi sudah ada pertemuan
  );
  const completedClasses = filteredClasses.filter(c => 
    c.endDate !== null // Kelas selesai adalah yang sudah di-mark selesai (endDate terisi)
  );

  // Pagination logic
  const waitingTotalPages = Math.ceil(waitingClasses.length / itemsPerPage);
  const activeTotalPages = Math.ceil(activeAndOngoingClasses.length / itemsPerPage);
  const completedTotalPages = Math.ceil(completedClasses.length / itemsPerPage);

  const waitingPaginatedClasses = waitingClasses.slice(
    (waitingPage - 1) * itemsPerPage,
    waitingPage * itemsPerPage
  );

  const activePaginatedClasses = activeAndOngoingClasses.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const completedPaginatedClasses = completedClasses.slice(
    (completedPage - 1) * itemsPerPage,
    completedPage * itemsPerPage
  );

  // Reset pagination when search changes
  useEffect(() => {
    setWaitingPage(1);
    setActivePage(1);
    setCompletedPage(1);
  }, [searchTerm]);

  if (loading) {
    return (
      <LoadingSpinner 
        message="Loading..."
        subMessage="Data kelas sedang dimuat"
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Kelas</h1>
          <p className="text-gray-600">Kelola kelas pembelajaran dan jadwal</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Kelas Menunggu</p>
                <p className="text-2xl font-bold">{stats.waiting}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Kelas Sedang Berjalan</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Siswa</p>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-2xl font-bold">{stats.waitingStudents}</p>
                    <p className="text-xs text-gray-500">menunggu</p>
                  </div>
                  <div className="text-gray-300">+</div>
                  <div>
                    <p className="text-2xl font-bold">{stats.activeStudents}</p>
                    <p className="text-xs text-gray-500">berjalan</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Kuota Kelas</p>
                <p className="text-2xl font-bold">{stats.availableQuota}</p>
                <p className="text-xs text-gray-500">siswa tersisa (menunggu + berjalan)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Field */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="Cari kelas berdasarkan nama, program, guru, ruangan, atau jadwal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Classes Tabs - Mobile Responsive with Horizontal Scroll */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="relative">
          <TabsList className="w-full h-auto p-1 bg-gray-100 rounded-lg">
            <div className="flex w-full overflow-x-auto scrollbar-hide">
              <div className="flex space-x-1 min-w-full sm:min-w-0">
                <TabsTrigger 
                  value="waiting" 
                  className="flex-shrink-0 min-w-[140px] sm:min-w-[160px] h-12 px-4 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap touch-manipulation flex items-center justify-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  <span className="hidden xs:inline">Kelas Menunggu</span>
                  <span className="xs:hidden">Menunggu</span>
                  <span className="ml-1">({stats.waiting})</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="active" 
                  className="flex-shrink-0 min-w-[140px] sm:min-w-[160px] h-12 px-4 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap touch-manipulation flex items-center justify-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden xs:inline">Kelas Berjalan</span>
                  <span className="xs:hidden">Berjalan</span>
                  <span className="ml-1">({stats.active})</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="completed" 
                  className="flex-shrink-0 min-w-[140px] sm:min-w-[160px] h-12 px-4 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap touch-manipulation flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span className="hidden xs:inline">Kelas Selesai</span>
                  <span className="xs:hidden">Selesai</span>
                  <span className="ml-1">({stats.completed})</span>
                </TabsTrigger>
              </div>
            </div>
          </TabsList>
          
          {/* Scroll indicator for mobile */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-100 to-transparent pointer-events-none sm:hidden" />
        </div>

        {/* Waiting Classes Tab */}
        <TabsContent value="waiting">
          <Card>
            <CardHeader>
              <CardTitle>Kelas Menunggu</CardTitle>
              <CardDescription>
                Menampilkan {waitingPaginatedClasses.length} dari {waitingClasses.length} kelas yang menunggu untuk dimulai
              </CardDescription>
            </CardHeader>
            <CardContent>
              {waitingPaginatedClasses.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">No</TableHead>
                        <TableHead>Nama Kelas</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Ruangan</TableHead>
                        <TableHead>Jadwal</TableHead>
                        <TableHead>Pertemuan</TableHead>
                        <TableHead>Siswa</TableHead>
                        <TableHead>Komisi</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {waitingPaginatedClasses.map((classData, index) => (
                        <TableRow key={classData.id}>
                          <TableCell className="font-medium">
                            {(waitingPage - 1) * itemsPerPage + index + 1}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{classData.name}</div>
                              {classData.description && (
                                <div className="text-sm text-gray-500">{classData.description}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{classData.course.name}</div>
                              <Badge variant="outline" className="mt-1">
                                {classData.course.category}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{classData.room.name}</div>
                              <div className="text-sm text-gray-500">
                                {classData.room.building && `Gedung ${classData.room.building}`}
                                {classData.room.building && classData.room.floor && ', '}
                                {classData.room.floor && `Lantai ${classData.room.floor}`}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                <span>{classData.schedule}</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Belum dimulai
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">
                                {classData.completedMeetings}/{classData.totalMeetings}
                              </div>
                              <div className="text-xs text-gray-500">
                                {classData.totalMeetings} pertemuan
                              </div>
                              <div className="mt-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAttendanceClick(classData)}
                                  className="text-xs h-7 px-2"
                                  disabled={getAttendanceDisabledState(classData).disabled}
                                  title={getAttendanceDisabledState(classData).title}
                                >
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Mulai Absensi
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{classData.students.length}/{classData.maxStudents}</div>
                              <div className="text-xs text-gray-500">
                                {classData.maxStudents - classData.students.length} tersisa
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-green-600">
                              {formatCurrency(classData.commissionAmount)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {classData.commissionType === 'BY_CLASS' ? 'Per Kelas' : 'Per Siswa'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const status = getClassStatus(classData);
                              return (
                                <Badge variant={status.variant} className={status.className}>
                                  {status.label}
                                </Badge>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewClass(classData)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {!classData.endDate && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCompleteClass(classData)}
                                  className="text-green-600 hover:text-green-700"
                                  title="Menyelesaikan Kelas"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Tidak ada kelas yang menunggu
                  </h3>
                  <p className="text-gray-500">
                    Kelas yang belum dimulai akan muncul di sini
                  </p>
                </div>
              )}
              
              {/* Pagination for Waiting Classes */}
              {waitingTotalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Menampilkan {((waitingPage - 1) * itemsPerPage) + 1} hingga {Math.min(waitingPage * itemsPerPage, waitingClasses.length)} dari {waitingClasses.length} kelas
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWaitingPage(waitingPage - 1)}
                      disabled={waitingPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Sebelumnya
                    </Button>
                    <span className="text-sm font-medium">
                      Halaman {waitingPage} dari {waitingTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWaitingPage(waitingPage + 1)}
                      disabled={waitingPage === waitingTotalPages}
                    >
                      Selanjutnya
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Classes Tab */}
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Kelas Sedang Berjalan</CardTitle>
              <CardDescription>
                Menampilkan {activePaginatedClasses.length} dari {activeAndOngoingClasses.length} kelas yang sedang berjalan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activePaginatedClasses.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">No</TableHead>
                        <TableHead>Nama Kelas</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Ruangan</TableHead>
                        <TableHead>Jadwal</TableHead>
                        <TableHead>Pertemuan</TableHead>
                        <TableHead>Siswa</TableHead>
                        <TableHead>Komisi</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activePaginatedClasses.map((classData, index) => (
                        <TableRow key={classData.id}>
                          <TableCell className="font-medium">
                            {(activePage - 1) * itemsPerPage + index + 1}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{classData.name}</div>
                              {classData.description && (
                                <div className="text-sm text-gray-500">{classData.description}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{classData.course.name}</div>
                              <Badge variant="outline" className="mt-1">
                                {classData.course.category}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{classData.room.name}</div>
                              <div className="text-sm text-gray-500">
                                {classData.room.building && `Gedung ${classData.room.building}`}
                                {classData.room.building && classData.room.floor && ', '}
                                {classData.room.floor && `Lantai ${classData.room.floor}`}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                <span>{classData.schedule}</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {classData.startDate 
                                  ? new Date(classData.startDate).toLocaleDateString('id-ID')
                                  : 'Belum dimulai'
                                } - {classData.endDate 
                                  ? new Date(classData.endDate).toLocaleDateString('id-ID')
                                  : 'Belum selesai'
                                }
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">
                                {classData.completedMeetings}/{classData.totalMeetings}
                              </div>
                              <div className="text-xs text-gray-500">
                                {classData.completedMeetings > classData.totalMeetings 
                                  ? `Tambah ${classData.completedMeetings - classData.totalMeetings} pertemuan`
                                  : `${classData.totalMeetings - classData.completedMeetings} tersisa`
                                }
                              </div>
                              <div className="mt-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAttendanceClick(classData)}
                                  className="text-xs h-7 px-2"
                                  disabled={getAttendanceDisabledState(classData).disabled}
                                  title={getAttendanceDisabledState(classData).title}
                                >
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Absensi
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{classData.students.length}/{classData.maxStudents}</div>
                              <div className="text-xs text-gray-500">
                                {classData.maxStudents - classData.students.length} tersisa
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-green-600">
                              {formatCurrency(classData.commissionAmount)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {classData.commissionType === 'BY_CLASS' ? 'Per Kelas' : 'Per Siswa'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const status = getClassStatus(classData);
                              return (
                                <Badge variant={status.variant} className={status.className}>
                                  {status.label}
                                </Badge>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewClass(classData)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {!classData.endDate && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCompleteClass(classData)}
                                  className="text-green-600 hover:text-green-700"
                                  title="Menyelesaikan Kelas"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Tidak ada kelas yang sedang berjalan
                  </h3>
                  <p className="text-gray-500">
                    Kelas yang sedang berjalan akan muncul di sini
                  </p>
                </div>
              )}
              
              {/* Pagination for Active Classes */}
              {activeTotalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Menampilkan {((activePage - 1) * itemsPerPage) + 1} hingga {Math.min(activePage * itemsPerPage, activeAndOngoingClasses.length)} dari {activeAndOngoingClasses.length} kelas
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActivePage(activePage - 1)}
                      disabled={activePage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Sebelumnya
                    </Button>
                    <span className="text-sm font-medium">
                      Halaman {activePage} dari {activeTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActivePage(activePage + 1)}
                      disabled={activePage === activeTotalPages}
                    >
                      Selanjutnya
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed Classes Tab */}
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Kelas Selesai</CardTitle>
              <CardDescription>
                Menampilkan {completedPaginatedClasses.length} dari {completedClasses.length} kelas yang telah selesai
              </CardDescription>
            </CardHeader>
            <CardContent>
              {completedPaginatedClasses.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">No</TableHead>
                        <TableHead>Nama Kelas</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Ruangan</TableHead>
                        <TableHead>Jadwal</TableHead>
                        <TableHead>Pertemuan</TableHead>
                        <TableHead>Siswa</TableHead>
                        <TableHead>Komisi</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedPaginatedClasses.map((classData, index) => (
                        <TableRow key={classData.id}>
                          <TableCell className="font-medium">
                            {(completedPage - 1) * itemsPerPage + index + 1}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{classData.name}</div>
                              {classData.description && (
                                <div className="text-sm text-gray-500">{classData.description}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{classData.course.name}</div>
                              <Badge variant="outline" className="mt-1">
                                {classData.course.category}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{classData.room.name}</div>
                              <div className="text-sm text-gray-500">
                                {classData.room.building && `Gedung ${classData.room.building}`}
                                {classData.room.building && classData.room.floor && ', '}
                                {classData.room.floor && `Lantai ${classData.room.floor}`}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                <span>{classData.schedule}</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {classData.startDate 
                                  ? new Date(classData.startDate).toLocaleDateString('id-ID')
                                  : 'Belum dimulai'
                                } - {classData.endDate 
                                  ? new Date(classData.endDate).toLocaleDateString('id-ID')
                                  : 'Belum selesai'
                                }
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">
                                {classData.completedMeetings}/{classData.totalMeetings}
                              </div>
                              <div className="text-xs text-gray-500">
                                Selesai
                              </div>
                              <div className="mt-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAttendanceClick(classData)}
                                  className="text-xs h-7 px-2"
                                  disabled={true}
                                >
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Absensi
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{classData.students.length}/{classData.maxStudents}</div>
                              <div className="text-xs text-gray-500">
                                {classData.maxStudents - classData.students.length} tersisa
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-green-600">
                              {formatCurrency(classData.commissionAmount)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {classData.commissionType === 'BY_CLASS' ? 'Per Kelas' : 'Per Siswa'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                              Selesai
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewClass(classData)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Tidak ada kelas yang selesai
                  </h3>
                  <p className="text-gray-500">
                    Kelas yang telah selesai akan muncul di sini
                  </p>
                </div>
              )}
              
              {/* Pagination for Completed Classes */}
              {completedTotalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Menampilkan {((completedPage - 1) * itemsPerPage) + 1} hingga {Math.min(completedPage * itemsPerPage, completedClasses.length)} dari {completedClasses.length} kelas
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCompletedPage(completedPage - 1)}
                      disabled={completedPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Sebelumnya
                    </Button>
                    <span className="text-sm font-medium">
                      Halaman {completedPage} dari {completedTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCompletedPage(completedPage + 1)}
                      disabled={completedPage === completedTotalPages}
                    >
                      Selanjutnya
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Attendance Dialog */}
      {isAttendanceDialogOpen && attendanceClass && (
        <AttendanceDialog
          isOpen={isAttendanceDialogOpen}
          onClose={() => setIsAttendanceDialogOpen(false)}
          classData={attendanceClass}
          onAttendanceSubmitted={handleAttendanceSubmitted}
        />
      )}

      {/* View Class Dialog */}
      {isViewDialogOpen && viewClass && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-7xl w-[95vw] max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Detail Kelas
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Class Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informasi Kelas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nama Kelas</label>
                      <p className="font-semibold">{viewClass.name}</p>
                      {viewClass.description && (
                        <p className="text-sm text-gray-600 mt-1">{viewClass.description}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Program</label>
                      <p className="font-semibold">{viewClass.course.name}</p>
                      <Badge variant="outline" className="mt-1">
                        {viewClass.course.category}
                      </Badge>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Guru</label>
                      {viewClass.teacher ? (
                        <>
                          <p className="font-semibold">{viewClass.teacher.name}</p>
                          <p className="text-sm text-gray-600">{viewClass.teacher.education}</p>
                          {viewClass.teacher.specialization && (
                            <p className="text-xs text-blue-600">{viewClass.teacher.specialization}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Belum ada guru</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Ruangan</label>
                      <p className="font-semibold">{viewClass.room.name}</p>
                      <p className="text-sm text-gray-600">
                        {viewClass.room.building && `Gedung ${viewClass.room.building}`}
                        {viewClass.room.building && viewClass.room.floor && ', '}
                        {viewClass.room.floor && `Lantai ${viewClass.room.floor}`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Jadwal & Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Jadwal</label>
                      <p className="font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {viewClass.schedule}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Periode</label>
                      <p className="text-sm">
                        {viewClass.startDate 
                          ? new Date(viewClass.startDate).toLocaleDateString('id-ID')
                          : 'Belum dimulai'
                        } - {viewClass.endDate 
                          ? new Date(viewClass.endDate).toLocaleDateString('id-ID')
                          : 'Belum selesai'
                        }
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Progress Pertemuan</label>
                      <div className="mt-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{viewClass.completedMeetings}/{viewClass.totalMeetings} Pertemuan</span>
                          <span className="text-sm text-green-600 font-semibold">
                            {viewClass.endDate ? '100% Selesai' : `${Math.round((viewClass.completedMeetings / viewClass.totalMeetings) * 100)}%`}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{
                              width: viewClass.endDate 
                                ? '100%' 
                                : `${Math.min((viewClass.completedMeetings / viewClass.totalMeetings) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Komisi Guru</label>
                      <p className="font-semibold">{formatCurrency(viewClass.commissionAmount)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {viewClass.commissionType === 'BY_CLASS' ? 'Komisi per Kelas' : 'Komisi per Siswa'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      {(() => {
                        const status = getClassStatus(viewClass);
                        return (
                          <Badge variant={status.variant} className={status.className}>
                            {status.label}
                          </Badge>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Students List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Data Siswa ({viewClass.students.length} Siswa)
                  </CardTitle>
                  <CardDescription>
                    Daftar siswa yang mengikuti kelas ini
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {viewClass.students.length > 0 ? (
                    <div className="overflow-x-auto -mx-6 px-6">
                      <div className="min-w-full inline-block align-middle">
                        <Table className="min-w-full">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12 min-w-[3rem]">No</TableHead>
                              <TableHead className="min-w-[12rem]">Nama Siswa</TableHead>
                              <TableHead className="min-w-[5rem]">Usia</TableHead>
                              <TableHead className="min-w-[7rem]">Jenis Kelamin</TableHead>
                              <TableHead className="min-w-[8rem]">Pendidikan</TableHead>
                              <TableHead className="min-w-[8rem]">WhatsApp</TableHead>
                              <TableHead className="min-w-[8rem]">Tanggal Bergabung</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {viewClass.students.map((studentClass, index) => {
                              const age = calculateAge(studentClass.student.dateOfBirth);
                              return (
                                <TableRow key={studentClass.id}>
                                  <TableCell className="font-medium">{index + 1}</TableCell>
                                  <TableCell className="font-medium">{studentClass.student.name}</TableCell>
                                  <TableCell>
                                    {age !== null ? `${age} tahun` : '-'}
                                  </TableCell>
                                  <TableCell>
                                    {studentClass.student.gender === 'male' || studentClass.student.gender === 'MALE' ? 'Laki-laki' : 
                                     studentClass.student.gender === 'female' || studentClass.student.gender === 'FEMALE' ? 'Perempuan' : '-'}
                                  </TableCell>
                                  <TableCell>
                                    {studentClass.student.lastEducation || '-'}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm">{studentClass.student.whatsapp}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {new Date(studentClass.joinedAt).toLocaleDateString('id-ID')}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Tidak ada siswa
                      </h3>
                      <p className="text-gray-500">
                        Tidak ada siswa yang terdaftar dalam kelas ini
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}