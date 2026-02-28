'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart, PieChart, Pie, Cell, LabelList } from 'recharts';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  BarChart3,
  Users2,
  UserCheck,
  PieChart as PieChartIcon
} from 'lucide-react';

interface DashboardStats {
  totalCourses: number;
  activeCourses: number;
  totalStudents: number;
  pendingStudents: number;
  confirmedStudents: number;
  totalRevenue: number;
  recentStudents: any[];
  // Registration statistics by period
  periodStats: {
    totalRegistrations: number;
    pendingRegistrations: number;
    confirmedRegistrations: number;
    completedRegistrations: number;
    totalRevenue: number;
    monthlyGrowth: number;
  };
}

export default function AdminDashboard() {
  // Get current date for default filters
  const currentDate = new Date();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const currentYear = currentDate.getFullYear().toString();

  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    activeCourses: 0,
    totalStudents: 0,
    pendingStudents: 0,
    confirmedStudents: 0,
    totalRevenue: 0,
    recentStudents: [],
    periodStats: {
      totalRegistrations: 0,
      pendingRegistrations: 0,
      confirmedRegistrations: 0,
      completedRegistrations: 0,
      totalRevenue: 0,
      monthlyGrowth: 0
    }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [filterMonth, setFilterMonth] = useState<string>(currentMonth);
  const [filterYear, setFilterYear] = useState<string>(currentYear);
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');
  const [chartPeriod, setChartPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [filteredStats, setFilteredStats] = useState({
    totalStudents: 0,
    pendingStudents: 0,
    confirmedStudents: 0,
    totalRevenue: 0
  });
  const [referralData, setReferralData] = useState<any[]>([]);
  const [referralSummary, setReferralSummary] = useState<any>(null);
  const [genderData, setGenderData] = useState<any[]>([]);
  const [genderSummary, setGenderSummary] = useState<any>(null);
  const [courseData, setCourseData] = useState<any[]>([]);
  const [courseSummary, setCourseSummary] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
    fetchReferralData();
    fetchGenderData();
    fetchCourseData();
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchReferralData();
    fetchGenderData();
    fetchCourseData();
  }, [filterMonth, filterYear]);

  useEffect(() => {
    generateChartData();
  }, [chartPeriod, filterYear, filterMonth]);

  // Generate options for month and year filters
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
    const years = [];
    for (let year = currentYear; year >= currentYear - 5; year--) {
      years.push({ value: year.toString(), label: year.toString() });
    }
    return years;
  };

  const generateChartData = async () => {
    try {
      // Fetch all students for chart data
      const studentsResponse = await fetch('/api/students');
      const allStudents = await studentsResponse.json();
      
      // Check if both month and year filters are applied - show daily view
      if (filterMonth && filterYear) {
        console.log(`Generating daily data for ${filterMonth}/${filterYear}`);
        
        // Get number of days in the selected month
        const year = parseInt(filterYear);
        const month = parseInt(filterMonth);
        const daysInMonth = new Date(year, month, 0).getDate();
        
        // Generate daily data for the selected month
        const dailyData = [];
        for (let day = 1; day <= daysInMonth; day++) {
          const dayStr = day.toString().padStart(2, '0');
          const dateStr = `${year}-${filterMonth}-${dayStr}`;
          
          // Filter students for this specific day
          const dayStudents = allStudents.filter((student: any) => {
            const registrationDate = new Date(student.createdAt);
            const studentDateStr = registrationDate.toISOString().split('T')[0]; // YYYY-MM-DD format
            
            return studentDateStr === dateStr;
          });
          
          // Only count confirmed students (including alumni as confirmed registrations)
          const confirmedStudents = dayStudents.filter((s: any) => 
            s.status === 'confirmed' || s.status === 'active' || s.status === 'approved' ||
            s.status === 'completed' || s.status === 'graduated' || s.status === 'finished'
          );
          
          dailyData.push({
            name: `${dayStr}`,
            fullDate: dateStr,
            confirmed: confirmedStudents.length,
          });
        }
        
        setChartData(dailyData);
        return;
      }
      
      if (chartPeriod === 'monthly') {
        // Generate monthly data for the selected year
        const currentYear = filterYear || new Date().getFullYear().toString();
        const months = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        
        const monthlyData = months.map((month, index) => {
          const monthNum = (index + 1).toString().padStart(2, '0');
          
          // Filter students for this month and year
          const monthStudents = allStudents.filter((student: any) => {
            const registrationDate = new Date(student.createdAt);
            const studentMonth = (registrationDate.getMonth() + 1).toString().padStart(2, '0');
            const studentYear = registrationDate.getFullYear().toString();
            
            return studentMonth === monthNum && studentYear === currentYear;
          });
          
          // Only count confirmed students (including alumni as confirmed registrations)
          const confirmedStudents = monthStudents.filter((s: any) => 
            s.status === 'confirmed' || s.status === 'active' || s.status === 'approved' ||
            s.status === 'completed' || s.status === 'graduated' || s.status === 'finished'
          );
          
          return {
            name: month,
            confirmed: confirmedStudents.length,
          };
        });
        
        setChartData(monthlyData);
      } else {
        // Generate yearly data from 2022 to current year
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = 2022; year <= currentYear; year++) {
          years.push(year.toString());
        }
        
        const yearlyData = years.map(year => {
          // Filter students for this year
          const yearStudents = allStudents.filter((student: any) => {
            const registrationDate = new Date(student.createdAt);
            const studentYear = registrationDate.getFullYear().toString();
            return studentYear === year;
          });
          
          // Only count confirmed students (including alumni as confirmed registrations)
          const confirmedStudents = yearStudents.filter((s: any) => 
            s.status === 'confirmed' || s.status === 'active' || s.status === 'approved' ||
            s.status === 'completed' || s.status === 'graduated' || s.status === 'finished'
          );
          
          return {
            name: year,
            confirmed: confirmedStudents.length,
          };
        });
        
        setChartData(yearlyData);
      }
    } catch (error) {
      console.error('Error generating chart data:', error);
      setChartData([]);
    }
  };

  const fetchCourseData = async () => {
    try {
      const params = new URLSearchParams();
      if (filterMonth) params.append('month', filterMonth);
      if (filterYear) params.append('year', filterYear);
      
      const response = await fetch(`/api/admin/course-stats?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setCourseData(result.data);
        setCourseSummary(result.summary);
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
      setCourseData([]);
      setCourseSummary(null);
    }
  };

  const fetchGenderData = async () => {
    try {
      const params = new URLSearchParams();
      if (filterMonth) params.append('month', filterMonth);
      if (filterYear) params.append('year', filterYear);
      
      const response = await fetch(`/api/admin/gender-stats?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setGenderData(result.data);
        setGenderSummary(result.summary);
      }
    } catch (error) {
      console.error('Error fetching gender data:', error);
      setGenderData([]);
      setGenderSummary(null);
    }
  };

  const fetchReferralData = async () => {
    try {
      const params = new URLSearchParams();
      if (filterMonth) params.append('month', filterMonth);
      if (filterYear) params.append('year', filterYear);
      
      const response = await fetch(`/api/admin/referral-stats?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setReferralData(result.data);
        setReferralSummary(result.summary);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
      setReferralData([]);
      setReferralSummary(null);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch courses
      const coursesResponse = await fetch('/api/courses');
      const courses = await coursesResponse.json();
      
      // Fetch students
      const studentsResponse = await fetch('/api/students');
      const students = await studentsResponse.json();

      // Filter students by period if filters are applied
      let filteredStudents = students;
      if (filterMonth || filterYear) {
        filteredStudents = students.filter((student: any) => {
          const registrationDate = new Date(student.createdAt);
          const studentMonth = (registrationDate.getMonth() + 1).toString().padStart(2, '0');
          const studentYear = registrationDate.getFullYear().toString();
          
          const monthMatch = !filterMonth || studentMonth === filterMonth;
          const yearMatch = !filterYear || studentYear === filterYear;
          
          return monthMatch && yearMatch;
        });
      }

      // Calculate filtered statistics with correct status mapping
      const newFilteredStats = {
        totalStudents: filteredStudents.length,
        pendingStudents: filteredStudents.filter((s: any) => 
          s.status === 'pending' || s.status === 'inactive' || s.status === 'waiting'
        ).length,
        confirmedStudents: filteredStudents.filter((s: any) => 
          s.status === 'confirmed' || s.status === 'active' || s.status === 'approved'
        ).length,
        totalRevenue: filteredStudents
          .filter((s: any) => s.status !== 'inactive')
          .reduce((sum: number, student: any) => sum + student.finalPrice, 0)
      };
      
      setFilteredStats(newFilteredStats);

      // Calculate period statistics with correct status mapping
      const periodStats = {
        totalRegistrations: filteredStudents.length,
        pendingRegistrations: filteredStudents.filter((s: any) => 
          s.status === 'pending' || s.status === 'inactive' || s.status === 'waiting'
        ).length,
        confirmedRegistrations: filteredStudents.filter((s: any) => 
          s.status === 'confirmed' || s.status === 'active' || s.status === 'approved'
        ).length,
        completedRegistrations: filteredStudents.filter((s: any) => 
          s.status === 'completed' || s.status === 'graduated' || s.status === 'finished'
        ).length,
        totalRevenue: filteredStudents
          .filter((s: any) => s.status !== 'inactive')
          .reduce((sum: number, student: any) => sum + student.finalPrice, 0),
        monthlyGrowth: 0 // Will be calculated below
      };

      // Calculate monthly growth (compare with previous month)
      if (filterMonth && filterYear) {
        const currentDate = new Date();
        const currentFilterMonth = filterMonth || (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const currentFilterYear = filterYear || currentDate.getFullYear().toString();
        
        // Get previous month
        const prevMonth = currentFilterMonth === '01' ? '12' : (parseInt(currentFilterMonth) - 1).toString().padStart(2, '0');
        const prevYear = currentFilterMonth === '01' ? (parseInt(currentFilterYear) - 1).toString() : currentFilterYear;
        
        const prevMonthStudents = students.filter((student: any) => {
          const registrationDate = new Date(student.createdAt);
          const studentMonth = (registrationDate.getMonth() + 1).toString().padStart(2, '0');
          const studentYear = registrationDate.getFullYear().toString();
          return studentMonth === prevMonth && studentYear === prevYear;
        });
        
        const currentMonthCount = filteredStudents.length;
        const prevMonthCount = prevMonthStudents.length;
        
        if (prevMonthCount > 0) {
          periodStats.monthlyGrowth = Math.round(((currentMonthCount - prevMonthCount) / prevMonthCount) * 100);
        } else if (currentMonthCount > 0) {
          periodStats.monthlyGrowth = 100; // First month with registrations
        }
      }

      const totalRevenue = students
        .filter((s: any) => s.status !== 'inactive')
        .reduce((sum: number, student: any) => sum + student.finalPrice, 0);
      const recentStudents = students.slice(0, 5);

      setStats({
        totalCourses: courses.length,
        activeCourses: courses.filter((c: any) => c.isActive).length,
        totalStudents: students.length,
        pendingStudents: students.filter((s: any) => 
          s.status === 'pending' || s.status === 'inactive' || s.status === 'waiting'
        ).length,
        confirmedStudents: students.filter((s: any) => 
          s.status === 'confirmed' || s.status === 'active' || s.status === 'approved'
        ).length,
        totalRevenue,
        recentStudents,
        periodStats
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingSpinner 
        message="Loading..."
        subMessage="Data dashboard sedang dimuat"
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Ringkasan data kursus dan siswa</p>
          </div>
          
          {/* Period Filter */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter Periode:</span>
            
            <Select value={filterMonth || 'all'} onValueChange={(value) => setFilterMonth(value === 'all' ? '' : value)}>
              <SelectTrigger className="w-32">
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
              <SelectTrigger className="w-28">
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
            
            {(filterMonth || filterYear) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterMonth('');
                  setFilterYear('');
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
        
        {/* Period Info */}
        {(filterMonth || filterYear) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              📊 Menampilkan statistik pendaftaran untuk periode: 
              <span className="font-semibold">
                {filterMonth && ` ${generateMonthOptions().find(m => m.value === filterMonth)?.label}`}
                {filterMonth && filterYear && ','}
                {filterYear && ` ${filterYear}`}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Kursus</p>
                <p className="text-2xl font-bold">{stats.totalCourses}</p>
                <p className="text-xs text-green-600">
                  {stats.activeCourses} aktif
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={(filterMonth || filterYear) ? 'ring-2 ring-blue-500' : ''}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Siswa</p>
                <p className="text-2xl font-bold">{filteredStats.totalStudents}</p>
                <p className="text-xs text-blue-600">
                  {filteredStats.confirmedStudents} dikonfirmasi
                </p>
                {(filterMonth || filterYear) && (
                  <p className="text-xs text-blue-500 mt-1">Periode ini</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={(filterMonth || filterYear) ? 'ring-2 ring-orange-500' : ''}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Menunggu Konfirmasi</p>
                <p className="text-2xl font-bold">{filteredStats.pendingStudents}</p>
                <p className="text-xs text-orange-600">
                  Perlu diproses
                </p>
                {(filterMonth || filterYear) && (
                  <p className="text-xs text-orange-500 mt-1">Periode ini</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={(filterMonth || filterYear) ? 'ring-2 ring-purple-500' : ''}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Perkiraan Pendapatan</p>
                <p className="text-2xl font-bold">Rp {filteredStats.totalRevenue.toLocaleString('id-ID')}</p>
                <p className="text-xs text-green-600">
                  Dari siswa aktif
                </p>
                {(filterMonth || filterYear) && (
                  <p className="text-xs text-purple-500 mt-1">Periode ini</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registration Statistics by Period */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Statistik Siswa Dikonfirmasi {
                  filterMonth && filterYear 
                    ? 'Harian' 
                    : chartPeriod === 'monthly' ? 'Bulanan' : 'Tahunan'
                }
              </CardTitle>
              <CardDescription>
                {filterMonth && filterYear 
                  ? `Data siswa yang dikonfirmasi per hari untuk ${generateMonthOptions().find(m => m.value === filterMonth)?.label} ${filterYear} (termasuk alumni)`
                  : chartPeriod === 'monthly' 
                    ? `Data siswa yang dikonfirmasi per bulan untuk tahun ${filterYear || new Date().getFullYear()} (termasuk alumni)`
                    : 'Data siswa yang dikonfirmasi per tahun dari 2022 hingga sekarang (termasuk alumni)'
                }
              </CardDescription>
            </div>
            
            {/* Chart Type Selector */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Periode:</span>
                <Select value={chartPeriod} onValueChange={(value: 'monthly' | 'yearly') => setChartPeriod(value)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Bulanan</SelectItem>
                    <SelectItem value="yearly">Tahunan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Tipe:</span>
                <Select value={chartType} onValueChange={(value: 'bar' | 'line' | 'area') => setChartType(value)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Batang</SelectItem>
                    <SelectItem value="line">Garis</SelectItem>
                    <SelectItem value="area">Area</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="space-y-6">
              {/* Main Chart */}
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart data={chartData} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        angle={chartPeriod === 'monthly' ? -45 : 0}
                        textAnchor={chartPeriod === 'monthly' ? 'end' : 'center'}
                        height={chartPeriod === 'monthly' ? 80 : 40}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Bar dataKey="confirmed" name="Siswa Dikonfirmasi" fill="#10B981" radius={[4, 4, 0, 0]}>
                        <LabelList 
                          dataKey="confirmed" 
                          position="top" 
                          style={{ 
                            fontSize: '12px', 
                            fontWeight: 'bold', 
                            fill: '#065F46' 
                          }} 
                        />
                      </Bar>
                    </BarChart>
                  ) : chartType === 'line' ? (
                    <LineChart data={chartData} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        angle={chartPeriod === 'monthly' ? -45 : 0}
                        textAnchor={chartPeriod === 'monthly' ? 'end' : 'center'}
                        height={chartPeriod === 'monthly' ? 80 : 40}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="confirmed" 
                        name="Siswa Dikonfirmasi"
                        stroke="#10B981" 
                        strokeWidth={3}
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 7 }}
                      >
                        <LabelList 
                          dataKey="confirmed" 
                          position="top" 
                          offset={10}
                          style={{ 
                            fontSize: '12px', 
                            fontWeight: 'bold', 
                            fill: '#065F46' 
                          }} 
                        />
                      </Line>
                    </LineChart>
                  ) : (
                    <AreaChart data={chartData} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        angle={chartPeriod === 'monthly' ? -45 : 0}
                        textAnchor={chartPeriod === 'monthly' ? 'end' : 'center'}
                        height={chartPeriod === 'monthly' ? 80 : 40}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="confirmed" 
                        name="Siswa Dikonfirmasi"
                        stroke="#10B981" 
                        fill="#10B981" 
                        fillOpacity={0.4}
                      >
                        <LabelList 
                          dataKey="confirmed" 
                          position="top" 
                          offset={5}
                          style={{ 
                            fontSize: '12px', 
                            fontWeight: 'bold', 
                            fill: '#065F46' 
                          }} 
                        />
                      </Area>
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {chartData.reduce((sum, item) => sum + (item.confirmed || 0), 0)}
                  </div>
                  <div className="text-sm text-green-800">
                    Total Siswa Dikonfirmasi {
                      filterMonth && filterYear 
                        ? `${generateMonthOptions().find(m => m.value === filterMonth)?.label} ${filterYear}`
                        : chartPeriod === 'monthly' ? 'Tahun Ini' : '2022-Sekarang'
                    }
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    Termasuk alumni yang telah lulus
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {chartData.length > 0 ? Math.round(chartData.reduce((sum, item) => sum + (item.confirmed || 0), 0) / chartData.filter(item => item.confirmed > 0).length || 1) : 0}
                  </div>
                  <div className="text-sm text-blue-800">
                    Rata-rata per {
                      filterMonth && filterYear 
                        ? 'Hari' 
                        : chartPeriod === 'monthly' ? 'Bulan' : 'Tahun'
                    }
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Pendaftaran yang dikonfirmasi
                  </div>
                </div>
              </div>








            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50 text-gray-400" />
              <p className="text-gray-500 text-lg">
                Belum ada data pendaftaran
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Data akan muncul ketika ada siswa yang mendaftar
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Gender Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users2 className="h-5 w-5" />
              Distribusi Gender
            </CardTitle>
            <CardDescription>
              {genderSummary?.period?.monthName && genderSummary?.period?.year 
                ? `${genderSummary.period.monthName} ${genderSummary.period.year}`
                : genderSummary?.period?.year 
                ? `Tahun ${genderSummary.period.year}`
                : 'Semua data'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {genderData.length > 0 ? (
              <div className="space-y-4">
                {/* Pie Chart */}
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percentage }) => `${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {genderData.map((entry, index) => {
                          const colors = [
                            '#3B82F6', // Laki-laki (Blue)
                            '#EC4899', // Perempuan (Pink)
                            '#6B7280'  // Tidak Diketahui (Gray)
                          ];
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={colors[index % colors.length]} 
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb'
                        }}
                        formatter={(value: number, name: string) => [
                          `${value} siswa`,
                          name
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {genderSummary?.maleCount || 0}
                    </div>
                    <div className="text-xs text-blue-800">Laki-laki</div>
                  </div>
                  <div className="text-center p-2 bg-pink-50 rounded-lg">
                    <div className="text-lg font-bold text-pink-600">
                      {genderSummary?.femaleCount || 0}
                    </div>
                    <div className="text-xs text-pink-800">Perempuan</div>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-1">
                  {genderData.map((entry, index) => {
                    const colors = [
                      '#3B82F6', // Laki-laki (Blue)
                      '#EC4899', // Perempuan (Pink)
                      '#6B7280'  // Tidak Diketahui (Gray)
                    ];
                    return (
                      <div key={entry.name} className="flex items-center gap-2 text-xs">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <span className="font-medium">{entry.name}:</span>
                        <span className="text-gray-600">{entry.percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users2 className="h-12 w-12 mx-auto mb-2 opacity-50 text-gray-400" />
                <p className="text-gray-500 text-sm">Belum ada data gender</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Distribusi Kursus
            </CardTitle>
            <CardDescription>
              {courseSummary?.period?.monthName && courseSummary?.period?.year 
                ? `${courseSummary.period.monthName} ${courseSummary.period.year}`
                : courseSummary?.period?.year 
                ? `Tahun ${courseSummary.period.year}`
                : 'Semua data'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {courseData.length > 0 ? (
              <div className="space-y-4">
                {/* Pie Chart */}
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={courseData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percentage }) => `${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {courseData.map((entry, index) => {
                          const colors = [
                            '#10B981', // Green
                            '#F59E0B', // Amber
                            '#EF4444', // Red
                            '#8B5CF6', // Purple
                            '#06B6D4', // Cyan
                            '#84CC16', // Lime
                            '#F97316', // Orange
                            '#EC4899'  // Pink
                          ];
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={colors[index % colors.length]} 
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb'
                        }}
                        formatter={(value: number, name: string) => [
                          `${value} siswa`,
                          name
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Course */}
                {courseSummary?.topCourse && (
                  <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-center">
                      <div className="text-xs text-green-600 font-medium">Terpopuler</div>
                      <div className="text-sm font-bold text-green-900 truncate">
                        {courseSummary.topCourse.name}
                      </div>
                      <div className="text-xs text-green-700">
                        {courseSummary.topCourse.count} siswa ({courseSummary.topCourse.percentage}%)
                      </div>
                    </div>
                  </div>
                )}

                {/* Legend */}
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {courseData.slice(0, 5).map((entry, index) => {
                    const colors = [
                      '#10B981', // Green
                      '#F59E0B', // Amber
                      '#EF4444', // Red
                      '#8B5CF6', // Purple
                      '#06B6D4'  // Cyan
                    ];
                    return (
                      <div key={entry.name} className="flex items-center gap-2 text-xs">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <span className="font-medium truncate flex-1">{entry.name}:</span>
                        <span className="text-gray-600">{entry.percentage}%</span>
                      </div>
                    );
                  })}
                  {courseData.length > 5 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{courseData.length - 5} kursus lainnya
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50 text-gray-400" />
                <p className="text-gray-500 text-sm">Belum ada data kursus</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Referral Source Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Sumber Referral
            </CardTitle>
            <CardDescription>
              {referralSummary?.period?.monthName && referralSummary?.period?.year 
                ? `${referralSummary.period.monthName} ${referralSummary.period.year}`
                : referralSummary?.period?.year 
                ? `Tahun ${referralSummary.period.year}`
                : 'Semua data'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {referralData.length > 0 ? (
              <div className="space-y-4">
                {/* Pie Chart */}
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={referralData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percentage }) => `${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {referralData.map((entry, index) => {
                          const colors = [
                            '#E91E63', // Instagram (Pink)
                            '#1877F2', // Facebook (Blue)
                            '#4285F4', // Google (Blue)
                            '#000000', // TikTok (Black)
                            '#10B981', // Dari Teman (Green)
                            '#6B7280'  // Lainnya (Gray)
                          ];
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={colors[index % colors.length]} 
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb'
                        }}
                        formatter={(value: number, name: string) => [
                          `${value} siswa`,
                          name
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Source */}
                {referralSummary?.topSource && (
                  <div className="p-2 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-center">
                      <div className="text-xs text-purple-600 font-medium">Terpopuler</div>
                      <div className="text-sm font-bold text-purple-900 truncate">
                        {referralSummary.topSource.name}
                      </div>
                      <div className="text-xs text-purple-700">
                        {referralSummary.topSource.count} siswa ({referralSummary.topSource.percentage}%)
                      </div>
                    </div>
                  </div>
                )}

                {/* Legend */}
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {referralData.slice(0, 5).map((entry, index) => {
                    const colors = [
                      '#E91E63', // Instagram (Pink)
                      '#1877F2', // Facebook (Blue)
                      '#4285F4', // Google (Blue)
                      '#000000', // TikTok (Black)
                      '#10B981'  // Dari Teman (Green)
                    ];
                    return (
                      <div key={entry.name} className="flex items-center gap-2 text-xs">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <span className="font-medium truncate flex-1">{entry.name}:</span>
                        <span className="text-gray-600">{entry.percentage}%</span>
                      </div>
                    );
                  })}
                  {referralData.length > 5 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{referralData.length - 5} sumber lainnya
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <PieChartIcon className="h-12 w-12 mx-auto mb-2 opacity-50 text-gray-400" />
                <p className="text-gray-500 text-sm">Belum ada data referral</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}