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
import { 
  GraduationCap, 
  Users, 
  Calendar,
  Phone,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Search,
  FileText,
  Download,
  Award,
  Trophy,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import AddTransactionModal from '@/components/admin/add-transaction-modal';
import PaymentReceipt from '@/components/admin/payment-receipt';

interface Alumni {
  id: string;
  name: string;
  whatsapp: string;
  photo?: string | null;
  courseId: string;
  courseName?: string;
  courseType: string;
  participants: number;
  finalPrice: number;
  discount: number;
  lastEducation?: string;
  status: 'completed' | 'graduated';
  dateOfBirth: string;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  attendanceStats?: {
    attended: number;
    total: number;
  };
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
    };
    joinedAt: string;
  }>;
  payments?: Array<{
    id: string;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
  }>;
}

export default function AlumniManagement() {
  const router = useRouter();
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Payment modal states
  const [selectedAlumniForPayment, setSelectedAlumniForPayment] = useState<Alumni | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  // Receipt modal states
  const [showReceipt, setShowReceipt] = useState<string | null>(null);
  const [lastTransactionId, setLastTransactionId] = useState<string | null>(null);

  const handleViewAlumni = (alumnus: Alumni) => {
    router.push(`/admin/alumni/${alumnus.id}`);
  };

  const handleAddPayment = (alumnus: Alumni) => {
    setSelectedAlumniForPayment(alumnus);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (transactionId?: string) => {
    setIsPaymentModalOpen(false);
    setSelectedAlumniForPayment(null);
    fetchAlumni(); // Refresh data
    toast.success('Pembayaran alumni berhasil dicatat!');
    
    // Show receipt if transaction ID is provided
    if (transactionId) {
      setLastTransactionId(transactionId);
      // Show receipt after a short delay to allow modal to close
      setTimeout(() => {
        setShowReceipt(transactionId);
      }, 500);
    }
  };

  const handlePaymentModalClose = () => {
    setIsPaymentModalOpen(false);
    setSelectedAlumniForPayment(null);
  };

  useEffect(() => {
    fetchAlumni();
    fetchCourses();
  }, []);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterCourse, searchQuery]);

  const fetchAlumni = async () => {
    try {
      console.log('Fetching alumni...');
      const response = await fetch('/api/alumni');
      if (!response.ok) {
        throw new Error('Failed to fetch alumni');
      }
      const data = await response.json();
      console.log('Alumni data received:', data?.length || 0, 'alumni');
      setAlumni(data || []);
    } catch (error) {
      console.error('Error fetching alumni:', error);
      toast.error('Gagal mengambil data alumni');
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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

  const calculateRemainingPayment = (alumnus: Alumni) => {
    // If there are payment records, use the actual remaining amount
    if (alumnus.payments && alumnus.payments.length > 0) {
      const latestPayment = alumnus.payments[0];
      return latestPayment.remainingAmount || 0;
    }
    
    // If no payment record, assume full amount is remaining (finalPrice - discount)
    return alumnus.finalPrice - (alumnus.discount || 0);
  };

  // Filter alumni
  const filteredAlumni = alumni.filter(alumnus => {
    const matchesSearch = alumnus.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alumnus.whatsapp.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = filterCourse === 'all' || alumnus.courseId === filterCourse;
    const matchesStatus = filterStatus === 'all' || alumnus.status === filterStatus;
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAlumni.length / itemsPerPage);
  const paginatedAlumni = filteredAlumni.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = {
    total: alumni.length,
    completed: alumni.filter(a => a.status === 'completed').length,
    graduated: alumni.filter(a => a.status === 'graduated').length,
    totalRevenue: alumni.reduce((sum, a) => sum + a.finalPrice, 0),
    totalOutstanding: alumni.reduce((sum, a) => sum + calculateRemainingPayment(a), 0),
    fullyPaid: alumni.filter(a => calculateRemainingPayment(a) === 0).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Loading...</h2>
          <p className="text-gray-600 mt-2">Data alumni sedang dimuat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-purple-600" />
            Data Alumni
          </h1>
          <p className="text-gray-600">Kelola data siswa yang telah lulus atau menyelesaikan kursus</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/api/alumni/export', '_blank')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Alumni
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Alumni</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Trophy className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Selesai</p>
                <p className="text-3xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Lulus</p>
                <p className="text-3xl font-bold">{stats.graduated}</p>
              </div>
              <Award className="h-8 w-8 text-indigo-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Total Pendapatan</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <BookOpen className="h-8 w-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Total Sisa Bayar</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalOutstanding)}</p>
                <p className="text-red-100 text-xs">{stats.fullyPaid} dari {stats.total} lunas</p>
              </div>
              <XCircle className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Data Alumni
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Cari Alumni</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nama atau WhatsApp"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="graduated">Lulus</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Kursus</label>
              <Select value={filterCourse} onValueChange={setFilterCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kursus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kursus</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Items per halaman</label>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alumni Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Alumni</CardTitle>
          <CardDescription>
            Menampilkan {paginatedAlumni.length} dari {filteredAlumni.length} alumni
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Foto</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Kursus</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Biaya</TableHead>
                  <TableHead>Sisa Bayar</TableHead>
                  <TableHead>Absensi</TableHead>
                  <TableHead>Tanggal Selesai</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAlumni.map((alumnus, index) => {
                  const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                  const remainingPayment = calculateRemainingPayment(alumnus);
                  return (
                    <TableRow key={alumnus.id}>
                      <TableCell className="font-medium text-center">{rowNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          {alumnus.photo ? (
                            <img 
                              src={alumnus.photo} 
                              alt={alumnus.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-purple-600" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{alumnus.name}</TableCell>
                      <TableCell>{alumnus.whatsapp}</TableCell>
                      <TableCell>{alumnus.course?.name || alumnus.courseName}</TableCell>
                      <TableCell>{getCourseTypeBadge(alumnus.courseType)}</TableCell>
                      <TableCell>{getStatusBadge(alumnus.status)}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(alumnus.finalPrice)}</TableCell>
                      <TableCell>
                        <div className="font-medium text-red-600">
                          {formatCurrency(remainingPayment)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-medium">
                          {alumnus.attendanceStats ? 
                            `${alumnus.attendanceStats.attended}/${alumnus.attendanceStats.total}` : 
                            '0/0'
                          }
                        </div>
                        {alumnus.attendanceStats && alumnus.attendanceStats.total > 0 && (
                          <div className="text-xs text-gray-500">
                            {Math.round((alumnus.attendanceStats.attended / alumnus.attendanceStats.total) * 100)}%
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{alumnus.completedAt ? formatDate(alumnus.completedAt) : formatDate(alumnus.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewAlumni(alumnus)}
                            className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {remainingPayment > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddPayment(alumnus)}
                              className="text-green-600 hover:text-green-800 hover:bg-green-50"
                              title="Tambah Pembayaran"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {filteredAlumni.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAlumni.length)} dari {filteredAlumni.length} alumni
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
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
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {filteredAlumni.length === 0 && (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada data alumni</h3>
              <p className="text-gray-500">
                {alumni.length === 0 
                  ? 'Belum ada siswa yang lulus atau menyelesaikan kursus'
                  : 'Tidak ada alumni yang sesuai dengan filter'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {selectedAlumniForPayment && (
        <AddTransactionModal
          paymentId={selectedAlumniForPayment.payments?.[0]?.id || ''}
          remainingAmount={calculateRemainingPayment(selectedAlumniForPayment)}
          isOpen={isPaymentModalOpen}
          onClose={handlePaymentModalClose}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Payment Receipt Modal */}
      {showReceipt && (
        <PaymentReceipt
          transactionId={showReceipt}
          isOpen={!!showReceipt}
          onClose={() => setShowReceipt(null)}
        />
      )}
    </div>
  );
}