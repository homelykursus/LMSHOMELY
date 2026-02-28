'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
  Users2,
  UserX,
  ChevronLeft,
  ChevronRight,
  Search,
  FileText,
  Download,
  Upload,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import AddStudentForm from '@/components/admin/add-student-form';
import EditStudentForm from '@/components/admin/edit-student-form';
import { useConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface Student {
  id: string;
  name: string;
  studentId: string;
  classId: string;
  className?: string;
  courseId: string;
  courseName?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'graduated';
  joinDate: string;
  referralSource?: string;
  notes?: string;
  // Legacy fields for backward compatibility
  dateOfBirth?: string;
  whatsapp?: string;
  photo?: string | null;
  courseType?: string;
  participants?: number;
  finalPrice?: number;
  discount?: number;
  lastEducation?: string | null;
  createdAt?: string;
  updatedAt?: string;
  course?: {
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
      endDate: string | null;
    };
    joinedAt: string;
  }>;
}

export default function StudentsManagement() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Set default filter to show all data
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  
  // Import states
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  // Confirmation dialog hook
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog();

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterCourse, filterMonth, filterYear, searchQuery]);

  const fetchStudents = async () => {
    try {
      console.log('Fetching students...');
      const response = await fetch('/api/students');
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      const data = await response.json();
      console.log('Students data received:', data?.length || 0, 'students');
      // API now returns direct array instead of { students: [...] }
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Gagal mengambil data siswa');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      console.log('Fetching courses...');
      const response = await fetch('/api/courses');
      const data = await response.json();
      console.log('Courses data received:', data?.length || 0, 'courses');
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const generateMonthYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 5; year--) {
      years.push(year.toString());
    }
    return years;
  };

  const currentYear = new Date().getFullYear().toString();
  const currentMonth = (new Date().getMonth() + 1).toString();

  // Import functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.error('Hanya file Excel (.xlsx, .xls) yang diperbolehkan');
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 10MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Pilih file Excel terlebih dahulu');
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/students/import', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(`Berhasil mengimpor ${result.result.successCount} siswa!`);
        setImportDialogOpen(false);
        setSelectedFile(null);
        fetchStudents(); // Refresh data
      } else {
        // Show validation errors
        if (result.result?.errorCount > 0) {
          toast.error(`Ditemukan ${result.result?.errorCount || 'beberapa'} error dalam file. Periksa format data Anda.`);
        } else {
          toast.error(result.message || 'Gagal mengimpor data');
        }
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Terjadi kesalahan saat mengimpor data');
    } finally {
      setImporting(false);
    }
  };

  const updateStudentStatus = async (studentId: string, newStatus: string) => {
    setUpdatingStatus(studentId);
    try {
      // Map normalized status to database status
      const statusMap: { [key: string]: string } = {
        'active': 'confirmed',
        'inactive': 'pending',
        'graduated': 'completed'
      };
      
      const dbStatus = statusMap[newStatus] || newStatus;
      
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: dbStatus }),
      });

      if (response.ok) {
        await fetchStudents();
        // Show success message based on status
        const statusMessages = {
          'active': 'Siswa berhasil diaktifkan!',
          'graduated': 'Status siswa berhasil diperbarui menjadi lulus!'
        };
        toast.success(statusMessages[newStatus as keyof typeof statusMessages] || 'Status berhasil diperbarui!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Gagal memperbarui status siswa');
      }
    } catch (error) {
      console.error('Error updating student status:', error);
      toast.error('Terjadi kesalahan saat memperbarui status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const deleteStudent = async (studentId: string) => {
    // Find student name for confirmation message
    const student = students.find(s => s.id === studentId);
    const studentName = student?.name || 'siswa ini';
    
    showConfirmation({
      title: 'Hapus Data Siswa',
      description: `Apakah Anda yakin ingin menghapus data ${studentName}? Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait siswa tersebut.`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/students?id=${studentId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            await fetchStudents();
            toast.success(`Data ${studentName} berhasil dihapus`);
          } else {
            console.error('Failed to delete student');
            toast.error('Gagal menghapus data siswa');
          }
        } catch (error) {
          console.error('Error deleting student:', error);
          toast.error('Terjadi kesalahan saat menghapus data siswa');
        }
      }
    });
  };

  const handleEditStudent = (student: Student) => {
    setEditStudent(student);
    setIsEditDialogOpen(true);
  };

  const handleViewStudent = (student: Student) => {
    router.push(`/admin/students/${student.id}`);
  };

  const handleStudentUpdated = () => {
    fetchStudents();
    setEditStudent(null);
    setIsEditDialogOpen(false);
  };

  const getClassStatus = (student: Student) => {
    // Get the effective status based on class completion
    const effectiveStatus = getStudentStatusBasedOnClassCompletion(student);
    
    // If student is graduated, show "Kelas Selesai"
    if (effectiveStatus === 'graduated') {
      // Find the completed class to show its name (must have endDate)
      const completedClass = student.classes?.find(cs => 
        cs.class.endDate !== null
      );
      
      return {
        status: 'class-completed',
        className: completedClass ? `${completedClass.class.name} (Selesai)` : 'Kelas Selesai',
        schedule: completedClass?.class.schedule || null
      };
    }
    
    // Cari kelas aktif yang diikuti siswa
    const activeClasses = student.classes?.filter(cs => cs.class.isActive) || [];
    
    if (activeClasses.length > 0) {
      // Jika siswa masuk kelas aktif, tampilkan nama kelas
      return {
        status: 'in-class',
        className: activeClasses[0].class.name,
        schedule: activeClasses[0].class.schedule
      };
    } else {
      // Jika tidak ada kelas aktif
      return {
        status: 'not-in-class',
        className: 'Belum Masuk Kelas',
        schedule: null
      };
    }
  };

  const getClassStatusBadge = (student: Student) => {
    const classStatus = getClassStatus(student);
    
    if (classStatus.status === 'in-class') {
      return (
        <div>
          <Badge variant="default" className="bg-green-100 text-green-800 mb-1">
            {classStatus.className}
          </Badge>
          {classStatus.schedule && (
            <div className="text-xs text-gray-500">
              {classStatus.schedule}
            </div>
          )}
        </div>
      );
    } else if (classStatus.status === 'class-completed') {
      return (
        <div>
          <Badge variant="default" className="bg-blue-100 text-blue-800 mb-1">
            {classStatus.className}
          </Badge>
          {classStatus.schedule && (
            <div className="text-xs text-gray-500">
              {classStatus.schedule}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
          Belum Masuk Kelas
        </Badge>
      );
    }
  };

  // Function to check if student should be graduated based on class completion
  const getStudentStatusBasedOnClassCompletion = (student: Student) => {
    // Check if student has any completed class (must have endDate set)
    // IMPORTANT: Class is only completed when manually marked with endDate
    // Even if completedMeetings >= totalMeetings, class is still ONGOING
    const completedClass = student.classes?.find(cs => 
      cs.class.endDate !== null
    );
    
    // If student has completed a class, they should be graduated
    if (completedClass) {
      return 'graduated';
    }
    
    // Otherwise, return their current status
    return student.status;
  };

  // Normalize status function for consistent filtering
  const normalizeStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return 'inactive';
      case 'confirmed':
        return 'active';
      case 'completed':
        return 'graduated';
      default:
        return status;
    }
  };

  const filteredStudents = students.filter(student => {
    // Search functionality
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      const searchFields = [
        student.name?.toLowerCase() || '',
        student.studentId?.toLowerCase() || '',
        student.whatsapp?.toLowerCase() || '',
        student.phone?.toLowerCase() || '',
        student.course?.name?.toLowerCase() || '',
        student.courseName?.toLowerCase() || '',
        student.lastEducation?.toLowerCase() || '',
        student.className?.toLowerCase() || ''
      ];
      
      if (!searchFields.some(field => field.includes(query))) {
        return false;
      }
    }
    
    // Get the effective status based on class completion
    const effectiveStatus = getStudentStatusBasedOnClassCompletion(student);
    
    // Normalize status for filtering
    const normalizedEffectiveStatus = normalizeStatus(effectiveStatus);
    
    // Filter by status (including class status)
    if (filterStatus !== 'all') {
      if (filterStatus === 'not-in-class' || filterStatus === 'in-class' || filterStatus === 'class-completed') {
        // Filter by class status
        const classStatus = getClassStatus(student);
        if (classStatus.status !== filterStatus) {
          return false;
        }
      } else {
        // Filter by student status (active, inactive, graduated) - use normalized effective status
        if (normalizedEffectiveStatus !== filterStatus) {
          return false;
        }
      }
    }
    
    // Filter by course
    if (filterCourse !== 'all' && student.courseId !== filterCourse) {
      return false;
    }
    
    // Filter by year
    if (filterYear !== 'all') {
      try {
        const studentYear = new Date(student.joinDate).getFullYear().toString();
        if (studentYear !== filterYear) {
          return false;
        }
      } catch (error) {
        console.error('Invalid date for student:', student.id, student.joinDate);
        return false;
      }
    }
    
    // Filter by month
    if (filterMonth !== 'all') {
      try {
        const studentMonth = new Date(student.joinDate).getMonth() + 1;
        const filterMonthNum = parseInt(filterMonth);
        if (studentMonth !== filterMonthNum) {
          return false;
        }
      } catch (error) {
        console.error('Invalid date for student:', student.id, student.joinDate);
        return false;
      }
    }
    
    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  const stats = {
    total: filteredStudents.length,
    inactive: filteredStudents.filter(s => {
      const effectiveStatus = getStudentStatusBasedOnClassCompletion(s);
      return normalizeStatus(effectiveStatus) === 'inactive';
    }).length,
    active: filteredStudents.filter(s => {
      const effectiveStatus = getStudentStatusBasedOnClassCompletion(s);
      return normalizeStatus(effectiveStatus) === 'active';
    }).length,
    graduated: filteredStudents.filter(s => {
      const effectiveStatus = getStudentStatusBasedOnClassCompletion(s);
      return normalizeStatus(effectiveStatus) === 'graduated';
    }).length,
    inClass: filteredStudents.filter(s => getClassStatus(s).status === 'in-class').length,
    notInClass: filteredStudents.filter(s => getClassStatus(s).status === 'not-in-class').length,
    classCompleted: filteredStudents.filter(s => getClassStatus(s).status === 'class-completed').length,
    totalRevenue: filteredStudents
      .filter(s => {
        const effectiveStatus = getStudentStatusBasedOnClassCompletion(s);
        const normalizedStatus = normalizeStatus(effectiveStatus);
        return normalizedStatus === 'active' || normalizedStatus === 'graduated';
      })
      .reduce((sum, s) => sum + (s.finalPrice || 0), 0)
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'inactive':
      case 'pending':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Tidak Aktif</Badge>;
      case 'active':
      case 'confirmed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Aktif</Badge>;
      case 'graduated':
      case 'completed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Lulus</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'inactive':
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'active':
      case 'confirmed':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'graduated':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

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

  if (loading) {
    return (
      <LoadingSpinner 
        message="Loading..."
        subMessage="Data siswa sedang dimuat"
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Siswa</h1>
          <p className="text-gray-600">Kelola data siswa yang terdaftar</p>
        </div>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <AddStudentForm onStudentAdded={fetchStudents} />
          
          {/* Import/Export Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/api/students/template', '_blank')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Template
            </Button>
            
            {/* Import Dialog */}
            <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Data Siswa</DialogTitle>
                  <DialogDescription>
                    Upload file Excel untuk mengimpor data siswa dalam jumlah besar
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="file-upload">Pilih File Excel</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                    />
                    {selectedFile && (
                      <div className="text-sm text-green-600">
                        File terpilih: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    )}
                  </div>

                  {/* Instructions */}
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Petunjuk:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Download template Excel terlebih dahulu</li>
                      <li>• Isi data sesuai format yang disediakan</li>
                      <li>• Pastikan semua field wajib terisi</li>
                      <li>• Maksimal ukuran file 10MB</li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setImportDialogOpen(false);
                        setSelectedFile(null);
                      }}
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={handleImport}
                      disabled={!selectedFile || importing}
                    >
                      {importing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Mengimpor...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Import Data
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/api/students/export', '_blank')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
          
          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Filter className="h-4 w-4 text-gray-500" />
            
            {/* Filter by Status */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="graduated">Lulus</SelectItem>
                <SelectItem value="not-in-class">Belum Masuk Kelas</SelectItem>
                <SelectItem value="in-class">Sudah Masuk Kelas</SelectItem>
                <SelectItem value="class-completed">Kelas Selesai</SelectItem>
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
            
            {/* Filter by Month */}
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Bulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Bulan</SelectItem>
                <SelectItem value="1">Januari</SelectItem>
                <SelectItem value="2">Februari</SelectItem>
                <SelectItem value="3">Maret</SelectItem>
                <SelectItem value="4">April</SelectItem>
                <SelectItem value="5">Mei</SelectItem>
                <SelectItem value="6">Juni</SelectItem>
                <SelectItem value="7">Juli</SelectItem>
                <SelectItem value="8">Agustus</SelectItem>
                <SelectItem value="9">September</SelectItem>
                <SelectItem value="10">Oktober</SelectItem>
                <SelectItem value="11">November</SelectItem>
                <SelectItem value="12">Desember</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Filter by Year */}
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tahun</SelectItem>
                {generateMonthYearOptions().map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Clear Filters Button */}
            {(filterStatus !== 'all' || filterCourse !== 'all' || filterMonth !== 'all' || filterYear !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterStatus('all');
                  setFilterCourse('all');
                  setFilterMonth('all');
                  setFilterYear('all');
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Siswa</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
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
              <CheckCircle className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lulus</p>
                <p className="text-2xl font-bold">{stats.graduated}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Perkiraan Pendapatan</p>
                <p className="text-lg font-bold">Rp {stats.totalRevenue.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users2 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sudah Masuk Kelas</p>
                <p className="text-2xl font-bold">{stats.inClass}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserX className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Belum Masuk Kelas</p>
                <p className="text-2xl font-bold">{stats.notInClass}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Kelas Selesai</p>
                <p className="text-2xl font-bold">{stats.classCompleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Siswa</CardTitle>
          <CardDescription>
            Menampilkan {paginatedStudents.length} dari {filteredStudents.length} siswa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>ID Siswa</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Program Kursus</TableHead>
                  <TableHead>Biaya Kursus</TableHead>
                  <TableHead>Tanggal Bergabung</TableHead>
                  <TableHead>Tau dari mana?</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStudents.map((student, index) => {
                  const rowNumber = (currentPage - 1) * itemsPerPage + index + 1
                  // Use the effective status based on class completion
                  const effectiveStatus = getStudentStatusBasedOnClassCompletion(student);
                  const displayStatus = normalizeStatus(effectiveStatus);
                  
                  // Calculate age
                  const age = calculateAge(student.dateOfBirth);

                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium text-center">{rowNumber}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {student.photo && (
                            <img 
                              src={student.photo} 
                              alt={student.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">
                              {student.name}
                              {age !== null && (
                                <span className="text-gray-500 font-normal"> ({age})</span>
                              )}
                            </div>
                            {student.phone && (
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {student.phone}
                              </div>
                            )}
                            {student.lastEducation && (
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                {student.lastEducation}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell>
                        {getClassStatusBadge(student)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{student.courseName || student.courseId}</div>
                          {student.course?.category && (
                            <div className="text-sm text-gray-500">{student.course.category}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-green-600">
                            Rp {(student.finalPrice || 0).toLocaleString('id-ID')}
                          </div>
                          {student.discount && student.discount > 0 && (
                            <div className="text-xs space-y-1">
                              <div className="text-red-500 line-through">
                                Rp {(student.finalPrice + student.discount).toLocaleString('id-ID')}
                              </div>
                              <div className="text-orange-600 font-medium">
                                Diskon: Rp {student.discount.toLocaleString('id-ID')}
                              </div>
                            </div>
                          )}
                          {student.courseType && (
                            <div className="text-xs text-gray-500 italic">
                              {student.courseType === 'regular' ? 'Reguler' : 'Privat'}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {(() => {
                            try {
                              return new Date(student.joinDate).toLocaleDateString('id-ID');
                            } catch (error) {
                              console.error('Invalid date for student:', student.id, student.joinDate);
                              return 'Tanggal tidak valid';
                            }
                          })()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {student.referralSource || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-xs">
                          {student.notes ? (
                            <div className="truncate" title={student.notes}>
                              {student.notes}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(displayStatus)}
                          {getStatusBadge(displayStatus)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewStudent(student)}
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStudent(student)}
                            title="Edit Data"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {displayStatus === 'inactive' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateStudentStatus(student.id, 'active')}
                              className="text-green-600 hover:text-green-700"
                              disabled={updatingStatus === student.id}
                              title="Konfirmasi Data Siswa"
                            >
                              {updatingStatus === student.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteStudent(student.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Hapus Data"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Menampilkan {startIndex + 1} hingga {Math.min(endIndex, filteredStudents.length)} dari {filteredStudents.length} siswa
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Student Dialog */}
      {editStudent && (
        <EditStudentForm
          student={editStudent}
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsEditDialogOpen(false);
              setEditStudent(null);
            }
          }}
          onStudentUpdated={handleStudentUpdated}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog />
    </div>
  );
}