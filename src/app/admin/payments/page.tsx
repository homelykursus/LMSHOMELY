'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  CreditCard,
  DollarSign,
  Calendar,
  User,
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Eye,
  Download,
  TrendingUp,
  Users,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import AddTransactionModal from '@/components/admin/add-transaction-modal';
import PaymentReceipt from '@/components/admin/payment-receipt';
import PaymentReminderModal from '@/components/admin/payment-reminder-modal';
import PaymentDismissHistory from '@/components/admin/payment-dismiss-history';

interface Payment {
  id: string;
  studentId: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  paymentMethod?: string;
  notes?: string;
  dueDate?: string;
  completedAt?: string;
  reminderDismissedAt?: string | null;
  reminderDismissedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    name: string;
    whatsapp: string;
    lastEducation?: string | null;
    discount?: number | null;
    photo?: string | null;
    status: string; // Tambahkan status siswa
    createdAt: string; // Tanggal pendaftaran siswa
    courseType?: string; // Tambahkan courseType
    dateOfBirth?: string | null; // Tambahkan tanggal lahir untuk menghitung usia
    course: {
      name: string;
      category: string;
    };
  };
  transactions: PaymentTransaction[];
}

interface PaymentTransaction {
  id: string;
  paymentId: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
}

export default function PaymentsManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [showAddTransaction, setShowAddTransaction] = useState<boolean>(false);
  const [attendanceData, setAttendanceData] = useState<{[key: string]: number}>({});
  const [reminderData, setReminderData] = useState<{[key: string]: any}>({});
  const [reminderCount, setReminderCount] = useState<number>(0);
  const [showReminderModal, setShowReminderModal] = useState<boolean>(false);
  const [selectedReminderPayment, setSelectedReminderPayment] = useState<Payment | null>(null);

  useEffect(() => {
    fetchPayments();
    fetchAttendanceData();
    fetchReminderData();
  }, []);

  const fetchReminderData = async () => {
    try {
      const response = await fetch('/api/payments/reminder-logic');
      if (response.ok) {
        const data = await response.json();
        console.log('Reminder data received:', data);
        
        // Convert array to object for easy lookup
        const reminderMap = data.reduce((acc: any, item: any) => {
          acc[item.studentId] = item;
          return acc;
        }, {});
        
        setReminderData(reminderMap);
        
        // Count how many students need reminders
        const needReminder = data.filter((item: any) => item.shouldShowReminder).length;
        setReminderCount(needReminder);
      } else {
        console.error('Failed to fetch reminder data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching reminder data:', error);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      // Fetch total meeting counts for all students
      const response = await fetch('/api/attendance/student-counts');
      if (response.ok) {
        const data = await response.json();
        console.log('Total meeting data received:', data);
        setAttendanceData(data);
      } else {
        console.error('Failed to fetch meeting data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching meeting data:', error);
    }
  };

  // Generate options for month and year filters
  const generateMonthOptions = (): { value: string; label: string }[] => {
    const months = [
      { value: '01', label: 'Januari' },
      { value: '02', label: 'Februari' },
      { value: '03', label: 'Maret' },
      { value: '04', label: 'April' },
      { value: '05', label: 'Mei' },
      { value: '06', label: 'Juni' },
      { value: '07', label: 'Juli' },
      { value: '08', label: 'Agustus' },
      { value: '09', label: 'September' },
      { value: '10', label: 'Oktober' },
      { value: '11', label: 'November' },
      { value: '12', label: 'Desember' }
    ];
    return months;
  };

  const generateYearOptions = (): { value: string; label: string }[] => {
    const currentYear = new Date().getFullYear();
    const years: { value: string; label: string }[] = [];
    for (let year = currentYear; year >= currentYear - 5; year--) {
      years.push({ value: year.toString(), label: year.toString() });
    }
    return years;
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments?t=' + Date.now()); // Add timestamp to prevent caching
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Gagal memuat data pembayaran');
    } finally {
      setLoading(false);
    }
  };

  // Function to determine if payment reminder should be shown
  const shouldShowPaymentReminder = (payment: Payment): boolean => {
    // Use the new reminder data from API
    const reminderInfo = reminderData[payment.studentId];
    
    if (!reminderInfo) {
      console.log(`No reminder data found for student ${payment.studentId}`);
      return false;
    }
    
    console.log(`Reminder check for ${payment.student.name}:`, reminderInfo);
    return reminderInfo.shouldShowReminder;
  };

  const filteredPayments = payments.filter(payment => {
    // Search functionality
    const searchMatch = searchQuery === '' || 
      payment.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.student.whatsapp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.student.course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.student.course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.student.lastEducation && payment.student.lastEducation.toLowerCase().includes(searchQuery.toLowerCase())) ||
      payment.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.student.courseType && payment.student.courseType.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filter by status (including reminder filter)
    let statusMatch = true;
    if (filterStatus === 'reminder') {
      statusMatch = shouldShowPaymentReminder(payment);
    } else if (filterStatus !== 'all') {
      statusMatch = payment.status === filterStatus;
    }

    // Filter by registration date (student.createdAt)
    let dateMatch = true;
    if (filterMonth || filterYear) {
      const registrationDate = new Date(payment.student.createdAt);
      const paymentMonth = registrationDate.getMonth() + 1; // JavaScript months are 0-indexed
      const paymentYear = registrationDate.getFullYear();

      if (filterMonth && paymentMonth !== parseInt(filterMonth)) {
        dateMatch = false;
      }
      if (filterYear && paymentYear !== parseInt(filterYear)) {
        dateMatch = false;
      }
    }

    return searchMatch && statusMatch && dateMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterMonth, filterYear, searchQuery]);

  const stats = {
    total: filteredPayments.length,
    pending: filteredPayments.filter(p => p.status === 'pending').length,
    partial: filteredPayments.filter(p => p.status === 'partial').length,
    completed: filteredPayments.filter(p => p.status === 'completed').length,
    totalRevenue: filteredPayments.reduce((sum, p) => sum + p.paidAmount, 0),
    totalPending: filteredPayments.reduce((sum, p) => sum + p.remainingAmount, 0),
    needReminder: filteredPayments.filter(p => shouldShowPaymentReminder(p)).length
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Menunggu</Badge>;
      case 'partial':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Sebagian</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Lunas</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Terlambat</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleViewDetails = (payment: Payment) => {
    console.log('Opening payment details for:', payment.id);
    setSelectedPayment(payment);
    setShowDetails(true);
  };

  const handleReminderClick = (payment: Payment) => {
    console.log('Opening reminder modal for:', payment.student.name);
    setSelectedReminderPayment(payment);
    setShowReminderModal(true);
  };

  const handleAddPayment = (payment: Payment) => {
    console.log('Opening add payment for:', payment.id);
    setSelectedPayment(payment);
    setShowAddTransaction(true);
  };

  if (loading) {
    return (
      <LoadingSpinner
        message="Loading..."
        subMessage="Data pembayaran sedang dimuat"
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pembayaran Siswa</h1>
          <p className="text-gray-600">Kelola pembayaran dan angsuran siswa</p>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[280px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari nama siswa, WhatsApp, kursus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-2">
            <Select value={filterMonth || 'all'} onValueChange={(value) => setFilterMonth(value === 'all' ? '' : value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Bulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Bulan</SelectItem>
                {generateMonthOptions().map(month => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterYear || 'all'} onValueChange={(value) => setFilterYear(value === 'all' ? '' : value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tahun</SelectItem>
                {generateYearOptions().map(year => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="reminder">Perlu Ingatkan</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="partial">Sebagian</SelectItem>
                <SelectItem value="completed">Lunas</SelectItem>
                <SelectItem value="overdue">Terlambat</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || filterMonth || filterYear || filterStatus !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setFilterMonth('');
                  setFilterYear('');
                  setFilterStatus('all');
                }}
                className="whitespace-nowrap"
              >
                Reset Filter
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className={(filterMonth || filterYear) ? 'ring-2 ring-blue-500' : ''}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pembayaran</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                {(filterMonth || filterYear) && (
                  <p className="text-xs text-blue-600">Sesuai Filter</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={(filterMonth || filterYear) ? 'ring-2 ring-green-500' : ''}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pemasukan</p>
                <p className="text-lg font-bold">{formatCurrency(stats.totalRevenue)}</p>
                {(filterMonth || filterYear) && (
                  <p className="text-xs text-green-600">Sesuai Filter</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={(filterMonth || filterYear) ? 'ring-2 ring-orange-500' : ''}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Menunggu Bayar</p>
                <p className="text-lg font-bold">{formatCurrency(stats.totalPending)}</p>
                {(filterMonth || filterYear) && (
                  <p className="text-xs text-orange-600">Sesuai Filter</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={(filterMonth || filterYear) ? 'ring-2 ring-purple-500' : ''}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sudah Lunas</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
                {(filterMonth || filterYear) && (
                  <p className="text-xs text-purple-600">Sesuai Filter</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={(filterMonth || filterYear) ? 'ring-2 ring-orange-500' : filterStatus === 'reminder' ? 'ring-2 ring-orange-500 bg-orange-50' : ''}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Perlu di Ingatkan</p>
                <p className="text-2xl font-bold">{stats.needReminder}</p>
                {filterStatus === 'reminder' && (
                  <p className="text-xs text-orange-600">Filter Aktif</p>
                )}
                {(filterMonth || filterYear) && (
                  <p className="text-xs text-orange-600">Sesuai Filter</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pembayaran</CardTitle>
          <CardDescription>
            {searchQuery ? (
              <>
                Menampilkan {filteredPayments.length} hasil pencarian dari {payments.length} pembayaran
                <span className="ml-2 text-blue-600">untuk "{searchQuery}"</span>
              </>
            ) : filterStatus === 'reminder' ? (
              <>
                Menampilkan {filteredPayments.length} siswa yang perlu diingatkan dari {payments.length} pembayaran
              </>
            ) : (
              <>
                Menampilkan {filteredPayments.length} dari {payments.length} pembayaran
              </>
            )}
            {(filterMonth || filterYear) && (
              <span className="ml-2">
                (Filter: {filterMonth ? generateMonthOptions().find(m => m.value === filterMonth)?.label : ''} {filterYear || ''})
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">No</TableHead>
                    <TableHead>Siswa</TableHead>
                    <TableHead>Kursus</TableHead>
                    <TableHead>Tanggal Daftar</TableHead>
                    <TableHead>Biaya Kursus</TableHead>
                    <TableHead>Sudah Dibayar</TableHead>
                    <TableHead>Sisa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Ingatkan Bayar</TableHead>
                    <TableHead className="text-center min-w-[120px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPayments.map((payment, index) => (
                    <TableRow key={payment.id}>
                      <TableCell className="text-center font-medium">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {/* Foto Siswa */}
                          <div className="flex-shrink-0">
                            {payment.student.photo ? (
                              <img
                                src={payment.student.photo}
                                alt={payment.student.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-500" />
                              </div>
                            )}
                          </div>

                          {/* Data Siswa */}
                          <div className="min-w-0">
                            <div className="font-medium truncate">{payment.student.name}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <User className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{payment.student.whatsapp}</span>
                            </div>
                            {payment.student.lastEducation && (
                              <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                                <BookOpen className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{payment.student.lastEducation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.student.course.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <BookOpen className="h-3 w-3" />
                            {payment.student.courseType === 'regular' ? 'Reguler' : 'Privat'}
                          </div>
                          <Badge variant="outline" className="mt-1">
                            {payment.student.course.category}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {new Date(payment.student.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-gray-500">
                            {new Date(payment.student.createdAt).toLocaleDateString('id-ID', {
                              weekday: 'short'
                            })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {payment.student.discount && payment.student.discount > 0 ? (
                            <div>
                              {/* Harga asli dengan coret */}
                              <div className="text-sm text-gray-400 line-through">
                                {formatCurrency(payment.totalAmount + payment.student.discount)}
                              </div>
                              {/* Harga setelah diskon */}
                              <div className="font-medium text-green-600">
                                {formatCurrency(payment.totalAmount)}
                              </div>
                              {/* Jumlah diskon */}
                              <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                <span className="truncate">Diskon: {formatCurrency(payment.student.discount)}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="font-medium">
                              {formatCurrency(payment.totalAmount)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-green-600">
                          {formatCurrency(payment.paidAmount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-red-600">
                          {formatCurrency(payment.remainingAmount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(payment.status)}
                          {getStatusBadge(payment.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          {shouldShowPaymentReminder(payment) && (
                            <Badge 
                              variant="destructive" 
                              className="bg-orange-100 text-orange-800 border-orange-300 cursor-pointer hover:bg-orange-200 transition-colors"
                              onClick={() => handleReminderClick(payment)}
                            >
                              Ingatkan
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-2 min-w-[120px]">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(payment)}
                            className="hover:bg-blue-50 hover:border-blue-300 px-3 py-2"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {payment.status !== 'completed' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleAddPayment(payment)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2"
                              title="Tambah Pembayaran"
                            >
                              <Plus className="h-4 w-4" />
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
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? (
                  `Tidak ditemukan hasil untuk "${searchQuery}"`
                ) : filterStatus === 'all' ? (
                  'Belum ada data pembayaran'
                ) : filterStatus === 'reminder' ? (
                  'Tidak ada siswa yang perlu diingatkan'
                ) : (
                  `Tidak ada pembayaran dengan status "${filterStatus}"`
                )}
              </h3>
              <p className="text-gray-500">
                {searchQuery ? (
                  'Coba gunakan kata kunci yang berbeda atau periksa ejaan'
                ) : filterStatus === 'all' ? (
                  'Data pembayaran akan muncul di sini'
                ) : filterStatus === 'reminder' ? (
                  'Semua siswa sudah up-to-date dengan pembayaran mereka'
                ) : (
                  'Coba ubah filter status untuk melihat pembayaran lain'
                )}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                  className="mt-4"
                >
                  <X className="h-4 w-4 mr-2" />
                  Hapus Pencarian
                </Button>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Menampilkan {startIndex + 1} hingga {Math.min(endIndex, filteredPayments.length)} dari {filteredPayments.length} data</span>
              </div>
              <div className="flex items-center space-x-2">
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(parseInt(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNumber)}
                          className="h-8 w-8 p-0"
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Modal */}
      {showDetails && selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          onUpdate={() => {
            fetchPayments();
            fetchReminderData();
          }}
        />
      )}

      {/* Add Transaction Modal */}
      {showAddTransaction && selectedPayment && (
        <AddTransactionModal
          paymentId={selectedPayment.id}
          remainingAmount={selectedPayment.remainingAmount}
          isOpen={showAddTransaction}
          onClose={() => setShowAddTransaction(false)}
          onSuccess={(transactionId) => {
            setShowAddTransaction(false);
            fetchPayments();
            fetchReminderData(); // Refresh reminder data after payment
            // Receipt will be available in transaction history
          }}
        />
      )}

      {/* Payment Reminder Modal */}
      {showReminderModal && selectedReminderPayment && (
        <PaymentReminderModal
          isOpen={showReminderModal}
          onClose={() => setShowReminderModal(false)}
          studentName={selectedReminderPayment.student.name}
          studentDateOfBirth={selectedReminderPayment.student.dateOfBirth}
          courseName={selectedReminderPayment.student.course.name}
          remainingAmount={selectedReminderPayment.remainingAmount}
          whatsappNumber={selectedReminderPayment.student.whatsapp}
          paymentId={selectedReminderPayment.id}
          onReminderDismissed={() => {
            console.log('Reminder dismissed, refreshing data...');
            fetchReminderData();
          }}
        />
      )}
    </div>
  );
}

// Payment Details Modal Component
function PaymentDetailsModal({
  payment,
  isOpen,
  onClose,
  onUpdate
}: {
  payment: Payment;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showReceipt, setShowReceipt] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Menunggu</Badge>;
      case 'partial':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Sebagian</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Lunas</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Terlambat</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handlePrintReceipt = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Detail Pembayaran - ${payment.student.name}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: white;
            color: black;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .header h1 { 
            color: #333; 
            margin: 0;
            font-size: 24px;
          }
          .header p { 
            margin: 5px 0; 
            color: #666;
          }
          .info-section { 
            margin: 20px 0; 
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
          .info-section h3 {
            margin-top: 0;
            color: #333;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
          }
          .info-row { 
            display: flex; 
            justify-content: space-between; 
            margin: 8px 0;
            padding: 5px 0;
          }
          .info-label { 
            font-weight: bold; 
            color: #555;
          }
          .info-value { 
            color: #333;
          }
          .transaction-item {
            border: 1px solid #eee;
            margin: 10px 0;
            padding: 15px;
            border-radius: 5px;
            background: #f9f9f9;
          }
          .total-section {
            background: #f0f8ff;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
          }
          .status-completed { background: #d4edda; color: #155724; }
          .status-partial { background: #cce7ff; color: #004085; }
          .status-pending { background: #fff3cd; color: #856404; }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DETAIL PEMBAYARAN SISWA</h1>
          <p>Homely Kursus Komputer</p>
          <p>Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}</p>
        </div>

        <div class="info-section">
          <h3>Informasi Siswa</h3>
          <div class="info-row">
            <span class="info-label">Nama:</span>
            <span class="info-value">${payment.student.name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">WhatsApp:</span>
            <span class="info-value">${payment.student.whatsapp}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Tanggal Daftar:</span>
            <span class="info-value">${new Date(payment.student.createdAt).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })}</span>
          </div>
          ${payment.student.lastEducation ? `
          <div class="info-row">
            <span class="info-label">Pendidikan Terakhir:</span>
            <span class="info-value">${payment.student.lastEducation}</span>
          </div>
          ` : ''}
        </div>

        <div class="info-section">
          <h3>Informasi Kursus</h3>
          <div class="info-row">
            <span class="info-label">Nama Kursus:</span>
            <span class="info-value">${payment.student.course.name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Jenis Kursus:</span>
            <span class="info-value">${payment.student.courseType === 'regular' ? 'Reguler' : 'Privat'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Kategori:</span>
            <span class="info-value">${payment.student.course.category}</span>
          </div>
        </div>

        <div class="total-section">
          <h3>Ringkasan Pembayaran</h3>
          <div class="info-row">
            <span class="info-label">Total Biaya Kursus:</span>
            <span class="info-value">${formatCurrency(payment.totalAmount)}</span>
          </div>
          ${payment.student.discount && payment.student.discount > 0 ? `
          <div class="info-row">
            <span class="info-label">Diskon:</span>
            <span class="info-value">${formatCurrency(payment.student.discount)}</span>
          </div>
          ` : ''}
          <div class="info-row">
            <span class="info-label">Sudah Dibayar:</span>
            <span class="info-value" style="color: green; font-weight: bold;">${formatCurrency(payment.paidAmount)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Sisa Pembayaran:</span>
            <span class="info-value" style="color: red; font-weight: bold;">${formatCurrency(payment.remainingAmount)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status:</span>
            <span class="info-value">
              <span class="status-badge status-${payment.status}">
                ${payment.status === 'completed' ? 'Lunas' :
        payment.status === 'partial' ? 'Sebagian' :
          payment.status === 'pending' ? 'Menunggu' : payment.status}
              </span>
            </span>
          </div>
        </div>

        ${payment.transactions.length > 0 ? `
        <div class="info-section">
          <h3>Riwayat Pembayaran (${payment.transactions.length} transaksi)</h3>
          ${payment.transactions.map((transaction, index) => `
            <div class="transaction-item">
              <div class="info-row">
                <span class="info-label">Pembayaran #${index + 1}:</span>
                <span class="info-value" style="font-weight: bold;">${formatCurrency(transaction.amount)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Tanggal:</span>
                <span class="info-value">${new Date(transaction.paymentDate).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Metode:</span>
                <span class="info-value">${transaction.paymentMethod}</span>
              </div>
              ${transaction.notes ? `
              <div class="info-row">
                <span class="info-label">Catatan:</span>
                <span class="info-value">${transaction.notes}</span>
              </div>
              ` : ''}
              ${transaction.createdBy ? `
              <div class="info-row">
                <span class="info-label">Dicatat oleh:</span>
                <span class="info-value">${transaction.createdBy}</span>
              </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        ` : `
        <div class="info-section">
          <h3>Riwayat Pembayaran</h3>
          <p style="text-align: center; color: #666; font-style: italic;">Belum ada riwayat pembayaran</p>
        </div>
        `}

        <div class="footer">
          <p>Dokumen ini dicetak secara otomatis dari sistem Homely Kursus Komputer</p>
          <p>Untuk informasi lebih lanjut, hubungi admin kursus</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Eye className="h-6 w-6 text-blue-600" />
              Detail Pembayaran Siswa
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handlePrintReceipt}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Cetak Detail
              </Button>
              <Button variant="outline" onClick={onClose}>
                Tutup
              </Button>
            </div>
          </div>

          {/* Payment Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Informasi Siswa */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Informasi Siswa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  {/* Foto Siswa */}
                  <div className="flex-shrink-0">
                    {payment.student.photo ? (
                      <img
                        src={payment.student.photo}
                        alt={payment.student.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Nama Siswa */}
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold truncate">{payment.student.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{payment.student.whatsapp}</p>
                  </div>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tanggal Daftar:</span>
                    <span className="text-sm font-medium">
                      {new Date(payment.student.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  {payment.student.lastEducation && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pendidikan:</span>
                      <span className="text-sm font-medium">{payment.student.lastEducation}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Informasi Kursus */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  Informasi Kursus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-lg">{payment.student.course.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {payment.student.courseType === 'regular' ? 'Kursus Reguler' : 'Kursus Privat'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {payment.student.course.category}
                    </Badge>
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Jenis Kursus:</span>
                      <span className="font-medium">
                        {payment.student.courseType === 'regular' ? 'Reguler' : 'Privat'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ringkasan Pembayaran */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  Ringkasan Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Biaya:</span>
                    <span className="font-semibold">{formatCurrency(payment.totalAmount)}</span>
                  </div>

                  {payment.student.discount && payment.student.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Diskon:</span>
                      <span className="font-medium text-green-600">-{formatCurrency(payment.student.discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm text-gray-600">Sudah Dibayar:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(payment.paidAmount)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sisa Pembayaran:</span>
                    <span className="font-semibold text-red-600">{formatCurrency(payment.remainingAmount)}</span>
                  </div>

                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-sm text-gray-600">Status:</span>
                    {getStatusBadge(payment.status)}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress Pembayaran</span>
                      <span>{Math.round((payment.paidAmount / payment.totalAmount) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(payment.paidAmount / payment.totalAmount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dismiss History */}
          {payment.reminderDismissedAt && (
            <div className="mb-6">
              <PaymentDismissHistory
                reminderDismissedAt={payment.reminderDismissedAt}
                reminderDismissedBy={payment.reminderDismissedBy}
              />
            </div>
          )}

          {/* Transactions */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-orange-600" />
                  Riwayat Pembayaran
                  {payment.transactions.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {payment.transactions.length} transaksi
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {payment.status !== 'completed' && (
                    <Button
                      onClick={() => setShowAddTransaction(true)}
                      data-add-payment
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Pembayaran
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {payment.transactions.length > 0 ? (
                <div className="space-y-4">
                  {payment.transactions.map((transaction, index) => (
                    <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                            </div>
                            <div>
                              <div className="font-semibold text-lg text-green-600">
                                {formatCurrency(transaction.amount)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(transaction.paymentDate).toLocaleDateString('id-ID', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">
                                <span className="text-gray-600">Metode:</span>
                                <span className="font-medium ml-1">{transaction.paymentMethod}</span>
                              </span>
                            </div>

                            {transaction.createdBy && (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">
                                  <span className="text-gray-600">Dicatat oleh:</span>
                                  <span className="font-medium ml-1">{transaction.createdBy}</span>
                                </span>
                              </div>
                            )}
                          </div>

                          {transaction.notes && (
                            <div className="mt-3 p-2 bg-yellow-50 border-l-4 border-yellow-200 rounded">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="text-sm text-gray-600">Catatan:</span>
                                  <p className="text-sm text-gray-700 mt-1">{transaction.notes}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowReceipt(transaction.id)}
                            className="hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Receipt className="h-4 w-4 mr-2" />
                            Bukti
                          </Button>
                          <div className="text-xs text-gray-500 text-center">
                            {new Date(transaction.createdAt).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Summary */}
                  <div className="border-t pt-4 mt-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3">Ringkasan Transaksi</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{payment.transactions.length}</div>
                          <div className="text-gray-600">Total Transaksi</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{formatCurrency(payment.paidAmount)}</div>
                          <div className="text-gray-600">Total Dibayar</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{formatCurrency(payment.remainingAmount)}</div>
                          <div className="text-gray-600">Sisa Pembayaran</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada riwayat pembayaran</h3>
                  <p className="text-gray-500 mb-4">Siswa belum melakukan pembayaran apapun</p>
                  {payment.status !== 'completed' && (
                    <Button
                      onClick={() => setShowAddTransaction(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Pembayaran Pertama
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddTransaction && (
        <AddTransactionModal
          paymentId={payment.id}
          remainingAmount={payment.remainingAmount}
          isOpen={showAddTransaction}
          onClose={() => setShowAddTransaction(false)}
          onSuccess={(transactionId) => {
            setShowAddTransaction(false);
            onUpdate();
            // Note: Receipt functionality would need to be handled by parent component
          }}
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