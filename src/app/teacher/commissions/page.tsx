'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';

interface Meeting {
  meetingId: string;
  meetingNumber: number;
  date: string;
  topic?: string;
  class: {
    id: string;
    name: string;
    commissionType: string;
    commissionAmount: number;
    course: {
      name: string;
      category: string;
    };
    room: {
      name: string;
    };
  };
  attendingStudents: number;
  calculatedCommission: number;
  commissionBreakdown: string;
  isSubstitute: boolean;
}

interface TeacherCommission {
  teacher: {
    id: string;
    name: string;
    whatsapp: string;
  };
  totalCommission: number;
  totalMeetings: number;
  totalStudents: number;
  classes: string[];
  meetings: Meeting[];
  byClassMeetings: number;
  byStudentMeetings: number;
  substituteMeetings: number;
  averageStudentsPerMeeting: number;
}

interface CommissionData {
  commissions: TeacherCommission;
  summary: {
    totalCommissions: number;
    totalMeetings: number;
    totalStudents: number;
    averageCommissionPerMeeting: number;
  };
  period: {
    startDate?: string;
    endDate?: string;
    month?: number;
    year?: number;
  };
}

export default function TeacherCommissionsPage() {
  const [data, setData] = useState<CommissionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Initialize with current month and year
  const currentDate = new Date();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const currentYear = currentDate.getFullYear().toString();
  
  const [filterMonth, setFilterMonth] = useState<string>(currentMonth);
  const [filterYear, setFilterYear] = useState<string>(currentYear);
  const [expandedDetails, setExpandedDetails] = useState<boolean>(false);

  useEffect(() => {
    fetchCommissionData();
  }, []);

  useEffect(() => {
    fetchCommissionData();
  }, [filterMonth, filterYear]);

  const fetchCommissionData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filterMonth) {
        params.append('month', filterMonth);
      }
      if (filterYear) {
        params.append('year', filterYear);
      }

      const response = await fetch(`/api/teacher/commissions?${params.toString()}`);
      const commissionData = await response.json();
      
      if (response.ok) {
        setData(commissionData);
      } else {
        toast.error(commissionData.error || 'Gagal memuat data komisi');
      }
    } catch (error) {
      console.error('Error fetching commission data:', error);
      toast.error('Gagal memuat data komisi guru');
    } finally {
      setLoading(false);
    }
  };

  const generateMonthOptions = () => {
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

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years: Array<{ value: string; label: string }> = [];
    for (let year = currentYear; year >= currentYear - 3; year--) {
      years.push({ value: year.toString(), label: year.toString() });
    }
    return years;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    return `${dateStr}, ${timeStr}`;
  };

  const resetFilters = () => {
    const currentDate = new Date();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = currentDate.getFullYear().toString();
    
    setFilterMonth(currentMonth);
    setFilterYear(currentYear);
  };

  if (loading) {
    return (
      <LoadingSpinner
        message="Loading..."
        subMessage="Data komisi guru sedang dimuat"
      />
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Gagal Memuat Data</h3>
          <p className="text-gray-500">Terjadi kesalahan saat memuat data komisi guru</p>
          <Button onClick={fetchCommissionData} className="mt-4">
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Komisi Guru</h1>
          <p className="text-gray-600">Riwayat komisi dan perhitungan berdasarkan pertemuan</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Month Filter */}
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

          {/* Year Filter */}
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

          {(() => {
            const currentDate = new Date();
            const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
            const currentYear = currentDate.getFullYear().toString();
            
            return (filterMonth !== currentMonth || filterYear !== currentYear) && (
              <Button variant="outline" onClick={resetFilters}>
                Reset Filter
              </Button>
            );
          })()}
        </div>
      </div>

      {/* Period Info */}
      <div className="p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          📊 Menampilkan data komisi untuk periode: 
          <span className="font-semibold">
            {filterMonth && ` ${generateMonthOptions().find(m => m.value === filterMonth)?.label}`}
            {filterMonth && filterYear && ','}
            {filterYear && ` ${filterYear}`}
          </span>
          {(() => {
            const currentDate = new Date();
            const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
            const currentYear = currentDate.getFullYear().toString();
            
            return (filterMonth === currentMonth && filterYear === currentYear) && (
              <span className="ml-2 text-blue-600">(Bulan Ini)</span>
            );
          })()}
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Komisi</p>
                <p className="text-2xl font-bold">{formatCurrency(data.summary.totalCommissions)}</p>
                <p className="text-xs text-green-600">Periode ini</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pertemuan</p>
                <p className="text-2xl font-bold">{data.summary.totalMeetings}</p>
                <p className="text-xs text-purple-600">Pertemuan selesai</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Siswa Hadir</p>
                <p className="text-2xl font-bold">{data.summary.totalStudents}</p>
                <p className="text-xs text-blue-600">Kehadiran siswa</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rata-rata per Pertemuan</p>
                <p className="text-2xl font-bold">{formatCurrency(data.summary.averageCommissionPerMeeting)}</p>
                <p className="text-xs text-orange-600">Per pertemuan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teacher Commission Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Detail Komisi</CardTitle>
              <CardDescription>
                Rincian komisi berdasarkan pertemuan yang telah dilakukan
              </CardDescription>
            </div>
            <Avatar className="w-12 h-12">
              <AvatarImage src="" alt={data.commissions.teacher.name} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {data.commissions.teacher.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
        <CardContent>
          {data.commissions.totalMeetings > 0 ? (
            <div className="space-y-6">
              {/* Teacher Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-semibold text-blue-600">
                    {data.commissions.byClassMeetings}
                  </div>
                  <div className="text-sm text-blue-800">Pertemuan BY_CLASS</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-semibold text-green-600">
                    {data.commissions.byStudentMeetings}
                  </div>
                  <div className="text-sm text-green-800">Pertemuan BY_STUDENT</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-semibold text-purple-600">
                    {data.commissions.substituteMeetings}
                  </div>
                  <div className="text-sm text-purple-800">Sebagai Pengganti</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg font-semibold text-orange-600">
                    {data.commissions.averageStudentsPerMeeting}
                  </div>
                  <div className="text-sm text-orange-800">Rata-rata Siswa</div>
                </div>
              </div>

              {/* Toggle Details Button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setExpandedDetails(!expandedDetails)}
                >
                  {expandedDetails ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Sembunyikan Detail
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Lihat Detail Pertemuan
                    </>
                  )}
                </Button>
              </div>

              {/* Meetings Detail Table */}
              {expandedDetails && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Kelas</TableHead>
                        <TableHead>Pertemuan</TableHead>
                        <TableHead>Siswa Hadir</TableHead>
                        <TableHead>Tipe Komisi</TableHead>
                        <TableHead>Komisi</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.commissions.meetings.map((meeting) => (
                        <TableRow key={meeting.meetingId}>
                          <TableCell>
                            <div className="text-sm">
                              {formatDateTime(meeting.date)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{meeting.class.name}</div>
                              <div className="text-sm text-gray-500">
                                {meeting.class.course.name} • {meeting.class.room.name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              Pertemuan {meeting.meetingNumber}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1 text-gray-400" />
                              {meeting.attendingStudents}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={meeting.class.commissionType === 'BY_CLASS' ? 'default' : 'secondary'}
                            >
                              {meeting.class.commissionType === 'BY_CLASS' ? 'Per Kelas' : 'Per Siswa'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-green-600">
                              {formatCurrency(meeting.calculatedCommission)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {meeting.isSubstitute && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                                Pengganti
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada data komisi
              </h3>
              <p className="text-gray-500">
                Data komisi akan muncul setelah ada pertemuan yang selesai pada periode yang dipilih
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}