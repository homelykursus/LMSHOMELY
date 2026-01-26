'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserCheck, 
  Clock,
  DollarSign,
  Calendar,
  Phone,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  User,
  Edit,
  Filter,
  Eye,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import AddTeacherForm from '@/components/admin/add-teacher-form';
import EditTeacherForm from '@/components/admin/edit-teacher-form';

interface Teacher {
  id: string;
  name: string;
  dateOfBirth: string;
  whatsapp: string;
  photo?: string | null;
  education: string;
  specialization?: string | null;
  experience?: number | null;
  address?: string | null;
  joinDate: string;
  status: 'active' | 'inactive' | 'leave';
  salary?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  courses: {
    id: string;
    isMain: boolean;
    course: {
      id: string;
      name: string;
      category: string;
    };
  }[];
}

export default function TeachersManagement() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterEducation, setFilterEducation] = useState<string>('all');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('active');

  useEffect(() => {
    fetchTeachers();
    fetchCourses();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/teachers');
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const deleteTeacher = async (teacherId: string) => {
    // Find teacher name for confirmation message
    const teacher = teachers.find(t => t.id === teacherId);
    const teacherName = teacher?.name || 'guru ini';
    
    if (!confirm(`Apakah Anda yakin ingin menghapus data ${teacherName}?`)) return;

    try {
      const response = await fetch(`/api/teachers?id=${teacherId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTeachers();
      } else {
        console.error('Failed to delete teacher');
      }
    } catch (error) {
      console.error('Error deleting teacher:', error);
    }
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setEditTeacher(teacher);
    setIsEditDialogOpen(true);
  };

  const handleViewTeacher = (teacher: Teacher) => {
    router.push(`/admin/teachers/${teacher.id}`);
  };

  const handleTeacherUpdated = () => {
    fetchTeachers();
    setEditTeacher(null);
    setIsEditDialogOpen(false);
  };

  const filteredTeachers = teachers.filter(teacher => {
    // Filter by education
    if (filterEducation !== 'all' && teacher.education !== filterEducation) {
      return false;
    }
    
    // Filter by course
    if (filterCourse !== 'all') {
      const hasCourse = teacher.courses.some(tc => tc.course.id === filterCourse);
      if (!hasCourse) {
        return false;
      }
    }
    
    return true;
  });

  // Separate teachers by status
  const activeTeachers = filteredTeachers.filter(t => t.status === 'active');
  const inactiveTeachers = filteredTeachers.filter(t => t.status !== 'active');

  const stats = {
    total: teachers.length,
    active: teachers.filter(t => t.status === 'active').length,
    inactive: teachers.filter(t => t.status === 'inactive').length,
    leave: teachers.filter(t => t.status === 'leave').length,
    totalSalary: teachers
      .filter(t => t.status === 'active' && t.salary)
      .reduce((sum, t) => sum + (t.salary || 0), 0),
    // Filtered stats for current view
    filteredActive: activeTeachers.length,
    filteredInactive: inactiveTeachers.length
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Aktif</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Tidak Aktif</Badge>;
      case 'leave':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Cuti</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case 'leave':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
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

  const renderTeacherTable = (teachersList: Teacher[], tabType: 'active' | 'inactive') => {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">No</TableHead>
              <TableHead>Data Guru</TableHead>
              <TableHead>Pendidikan & Pengalaman</TableHead>
              <TableHead>Program Kursus</TableHead>
              <TableHead>Tanggal Bergabung</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachersList.map((teacher, index) => (
              <TableRow key={teacher.id}>
                <TableCell className="text-center font-medium">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {/* Foto Guru */}
                    <div className="flex-shrink-0">
                      {teacher.photo ? (
                        <img
                          src={teacher.photo}
                          alt={teacher.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    
                    {/* Data Guru */}
                    <div className="min-w-0">
                      <div className="font-medium truncate">{teacher.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{new Date(teacher.dateOfBirth).toLocaleDateString('id-ID')} ({calculateAge(teacher.dateOfBirth)} tahun)</span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{teacher.whatsapp}</span>
                      </div>
                      {teacher.specialization && (
                        <div className="text-sm text-blue-600 flex items-center gap-2">
                          <Briefcase className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{teacher.specialization}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      {teacher.education}
                    </div>
                    {teacher.experience && (
                      <div className="text-sm text-gray-500">
                        {teacher.experience} tahun pengalaman
                      </div>
                    )}
                    {teacher.salary && (
                      <div className="text-sm text-green-600 font-medium">
                        {formatCurrency(teacher.salary)}/bulan
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    {teacher.courses.length > 0 ? (
                      <div className="space-y-1">
                        {teacher.courses.map((tc) => (
                          <div key={tc.id} className="flex items-center gap-2">
                            <Badge variant="outline" className={tc.isMain ? "bg-blue-50 border-blue-300 text-blue-700" : ""}>
                              {tc.course.name}
                              {tc.isMain && " (Utama)"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Belum ada program</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span>{new Date(teacher.joinDate).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(teacher.status)}
                    {getStatusBadge(teacher.status)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {/* Tombol View - Prioritas */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewTeacher(teacher)}
                      className="text-green-600 hover:text-green-700"
                      title="Lihat Detail Guru"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {/* Tombol Edit */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditTeacher(teacher)}
                      className="text-blue-600 hover:text-blue-700"
                      title="Edit Data Guru"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    {/* Tombol Delete */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteTeacher(teacher.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Hapus Data Guru"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  if (loading) {
    return (
      <LoadingSpinner 
        message="Loading..."
        subMessage="Data guru sedang dimuat"
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Guru</h1>
          <p className="text-gray-600">Kelola data guru dan instruktur kursus</p>
        </div>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          <AddTeacherForm onTeacherAdded={fetchTeachers} />
          
          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Filter className="h-4 w-4 text-gray-500" />
            
            {/* Filter by Education */}
            <Select value={filterEducation} onValueChange={setFilterEducation}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Pendidikan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Pendidikan</SelectItem>
                <SelectItem value="SMA">SMA</SelectItem>
                <SelectItem value="S1">S1</SelectItem>
                <SelectItem value="S2">S2</SelectItem>
                <SelectItem value="S3">S3</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Filter by Course */}
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Program Kursus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Program</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Clear Filters Button */}
            {(filterEducation !== 'all' || filterCourse !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterEducation('all');
                  setFilterCourse('all');
                }}
                className="text-xs"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Guru</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktif</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tidak Aktif</p>
                <p className="text-2xl font-bold">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cuti</p>
                <p className="text-2xl font-bold">{stats.leave}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Gaji</p>
                <p className="text-lg font-bold">{formatCurrency(stats.totalSalary)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teachers Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Guru Aktif ({stats.filteredActive})
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Guru Tidak Aktif ({stats.filteredInactive})
          </TabsTrigger>
        </TabsList>

        {/* Active Teachers Tab */}
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                Guru Aktif
              </CardTitle>
              <CardDescription>
                Menampilkan {activeTeachers.length} guru aktif
                {(filterEducation !== 'all' || filterCourse !== 'all') && (
                  <span className="text-blue-600 ml-2">
                    (Filter aktif)
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeTeachers.length > 0 ? (
                renderTeacherTable(activeTeachers, 'active')
              ) : (
                <div className="text-center py-12">
                  <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {filterEducation === 'all' && filterCourse === 'all' 
                      ? 'Belum ada guru aktif' 
                      : `Tidak ada guru aktif dengan filter yang dipilih`}
                  </h3>
                  <p className="text-gray-500">
                    {filterEducation === 'all' && filterCourse === 'all'
                      ? 'Guru aktif akan muncul di sini'
                      : 'Coba ubah filter untuk melihat guru aktif lain'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inactive Teachers Tab */}
        <TabsContent value="inactive">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-gray-600" />
                Guru Tidak Aktif
              </CardTitle>
              <CardDescription>
                Menampilkan {inactiveTeachers.length} guru tidak aktif (termasuk yang cuti)
                {(filterEducation !== 'all' || filterCourse !== 'all') && (
                  <span className="text-blue-600 ml-2">
                    (Filter aktif)
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inactiveTeachers.length > 0 ? (
                renderTeacherTable(inactiveTeachers, 'inactive')
              ) : (
                <div className="text-center py-12">
                  <XCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {filterEducation === 'all' && filterCourse === 'all' 
                      ? 'Tidak ada guru tidak aktif' 
                      : `Tidak ada guru tidak aktif dengan filter yang dipilih`}
                  </h3>
                  <p className="text-gray-500">
                    {filterEducation === 'all' && filterCourse === 'all'
                      ? 'Guru yang tidak aktif atau cuti akan muncul di sini'
                      : 'Coba ubah filter untuk melihat guru tidak aktif lain'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Teacher Dialog */}
      <EditTeacherForm
        teacher={editTeacher}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onTeacherUpdated={handleTeacherUpdated}
      />
    </div>
  );
}