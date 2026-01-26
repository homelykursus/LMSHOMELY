'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Receipt,
  DollarSign,
  Calendar,
  User,
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Banknote,
  TrendingUp,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface FinancialRecord {
  id: string;
  paymentId: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  payment: {
    id: string;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
    student: {
      id: string;
      name: string;
      whatsapp: string;
      course: {
        name: string;
        category: string;
      };
    };
  };
}

export default function FinancialRecords() {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Set default filter to current month and year
  const currentDate = new Date();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // 01-12
  const currentYear = currentDate.getFullYear().toString();
  
  const [filterMonth, setFilterMonth] = useState<string>(currentMonth);
  const [filterYear, setFilterYear] = useState<string>(currentYear);
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  useEffect(() => {
    fetchFinancialRecords();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterMonth, filterYear, filterPaymentMethod, filterStatus]);

  const fetchFinancialRecords = async () => {
    try {
      const response = await fetch('/api/financial-records');
      if (!response.ok) {
        throw new Error('Failed to fetch financial records');
      }
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error('Error fetching financial records:', error);
      toast.error('Gagal memuat catatan keuangan');
    } finally {
      setLoading(false);
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

  const filteredRecords = records.filter(record => {
    // Filter by payment date
    let dateMatch = true;
    if (filterMonth !== 'all' || filterYear !== 'all') {
      const paymentDate = new Date(record.paymentDate);
      const recordMonth = paymentDate.getMonth() + 1; // JavaScript months are 0-indexed
      const recordYear = paymentDate.getFullYear();

      if (filterMonth !== 'all' && recordMonth !== parseInt(filterMonth)) {
        dateMatch = false;
      }
      if (filterYear !== 'all' && recordYear !== parseInt(filterYear)) {
        dateMatch = false;
      }
    }

    // Filter by payment method
    const methodMatch = filterPaymentMethod === 'all' || record.paymentMethod === filterPaymentMethod;

    // Filter by payment status
    const statusMatch = filterStatus === 'all' || record.payment.status === filterStatus;

    return dateMatch && methodMatch && statusMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

  // Statistics
  const stats = {
    total: filteredRecords.length,
    totalAmount: filteredRecords.reduce((sum, r) => sum + r.amount, 0),
    cashPayments: filteredRecords.filter(r => r.paymentMethod === 'cash').length,
    transferPayments: filteredRecords.filter(r => r.paymentMethod === 'transfer').length,
    completedPayments: filteredRecords.filter(r => r.payment.status === 'completed').length,
    partialPayments: filteredRecords.filter(r => r.payment.status === 'partial').length
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case 'cash':
        return <Badge className="bg-green-100 text-green-800"><Banknote className="h-3 w-3 mr-1" />Tunai</Badge>;
      case 'transfer':
        return <Badge className="bg-blue-100 text-blue-800"><CreditCard className="h-3 w-3 mr-1" />Transfer</Badge>;
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Menunggu</Badge>;
      case 'partial':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Sebagian</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Lunas</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <LoadingSpinner
        message="Loading..."
        subMessage="Catatan keuangan sedang dimuat"
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Receipt className="h-8 w-8 text-green-600" />
            Catatan Keuangan
          </h1>
          <p className="text-gray-600">History pembayaran dan transaksi keuangan</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={filterMonth} onValueChange={setFilterMonth}>
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

          <Select value={filterYear} onValueChange={setFilterYear}>
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

          <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Metode Bayar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Metode</SelectItem>
              <SelectItem value="cash">Tunai</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Menunggu</SelectItem>
              <SelectItem value="partial">Sebagian</SelectItem>
              <SelectItem value="completed">Lunas</SelectItem>
            </SelectContent>
          </Select>

          {(filterMonth !== currentMonth || filterYear !== currentYear || filterPaymentMethod !== 'all' || filterStatus !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setFilterMonth(currentMonth);
                setFilterYear(currentYear);
                setFilterPaymentMethod('all');
                setFilterStatus('all');
              }}
            >
              Reset Filter
            </Button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className={(filterMonth !== 'all' || filterYear !== 'all') ? 'ring-2 ring-green-500' : ''}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Transaksi</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                {(filterMonth !== 'all' || filterYear !== 'all') && (
                  <p className="text-xs text-green-600">Sesuai Filter</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={(filterMonth !== 'all' || filterYear !== 'all') ? 'ring-2 ring-blue-500' : ''}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pemasukan</p>
                <p className="text-lg font-bold">{formatCurrency(stats.totalAmount)}</p>
                {(filterMonth !== 'all' || filterYear !== 'all') && (
                  <p className="text-xs text-blue-600">Sesuai Filter</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={(filterMonth !== 'all' || filterYear !== 'all') ? 'ring-2 ring-purple-500' : ''}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Banknote className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pembayaran Tunai</p>
                <p className="text-2xl font-bold">{stats.cashPayments}</p>
                {(filterMonth !== 'all' || filterYear !== 'all') && (
                  <p className="text-xs text-purple-600">Sesuai Filter</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={(filterMonth !== 'all' || filterYear !== 'all') ? 'ring-2 ring-orange-500' : ''}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pembayaran Transfer</p>
                <p className="text-2xl font-bold">{stats.transferPayments}</p>
                {(filterMonth !== 'all' || filterYear !== 'all') && (
                  <p className="text-xs text-orange-600">Sesuai Filter</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>History Pembayaran</CardTitle>
          <CardDescription>
            Menampilkan {filteredRecords.length} dari {records.length} transaksi
            {(filterMonth !== 'all' || filterYear !== 'all') && (
              <span className="ml-2">
                (Filter: {filterMonth !== 'all' ? generateMonthOptions().find(m => m.value === filterMonth)?.label : ''} {filterYear !== 'all' ? filterYear : ''})
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">No</TableHead>
                    <TableHead>Tanggal Pembayaran</TableHead>
                    <TableHead>Siswa</TableHead>
                    <TableHead>Kursus</TableHead>
                    <TableHead>Jumlah Bayar</TableHead>
                    <TableHead>Metode Bayar</TableHead>
                    <TableHead>Status Pembayaran</TableHead>
                    <TableHead>Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRecords.map((record, index) => (
                    <TableRow key={record.id}>
                      <TableCell className="text-center font-medium">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {formatDate(record.paymentDate)}
                          </div>
                          <div className="text-gray-500">
                            {new Date(record.paymentDate).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.payment.student.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <User className="h-3 w-3" />
                            {record.payment.student.whatsapp}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.payment.student.course.name}</div>
                          <Badge variant="outline" className="mt-1">
                            {record.payment.student.course.category}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-green-600">
                          {formatCurrency(record.amount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPaymentMethodBadge(record.paymentMethod)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record.payment.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {record.notes || '-'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Tidak ada catatan keuangan
              </h3>
              <p className="text-gray-500">
                {records.length === 0
                  ? 'Belum ada transaksi pembayaran'
                  : 'Tidak ada transaksi yang sesuai dengan filter'
                }
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Menampilkan {startIndex + 1} hingga {Math.min(endIndex, filteredRecords.length)} dari {filteredRecords.length} data</span>
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
    </div>
  );
}