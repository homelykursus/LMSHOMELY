'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Search, Users, Calendar, Clock, CheckCircle, XCircle, RefreshCw, UserCheck, Eye } from 'lucide-react'

interface Teacher {
  id: string
  name: string
  education: string
  photo?: string
  specialization?: string
  status: string
  courses?: {
    course: {
      id: string
      name: string
      category: string
    }
    isMain: boolean
  }[]
}

interface Class {
  id: string
  name: string
  courseId: string
  teacherId: string
  schedule: string
  isActive: boolean
}

interface TeacherAttendanceRecord {
  id: string
  teacherId: string
  teacherName: string
  classId: string
  className: string
  meetingId: string
  meetingDate: string
  meetingTopic: string
  status: 'present' | 'absent'
  studentPresentCount: number
  totalStudentCount: number
  recordedAt: string
  schedule: string
}

interface TeacherStats {
  totalTeachers: number
  presentToday: number
  absentToday: number
  averageAttendance: number
}

export default function TeacherAttendancePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<TeacherAttendanceRecord[]>([])
  const [stats, setStats] = useState<TeacherStats | null>(null)
  const [isClient, setIsClient] = useState(false)
  
  // Tab state
  const [activeTab, setActiveTab] = useState('summary')
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState('all')
  const [selectedClass, setSelectedClass] = useState('all')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  })
  
  // Filter untuk tabel Ringkasan Absensi Guru
  const [summaryDateRange, setSummaryDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  })

  // Pagination untuk tabel Riwayat Absensi Guru
  const [currentPage, setCurrentPage] = useState(1)
  const recordsPerPage = 10

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/teachers')
      if (response.ok) {
        const data = await response.json()
        setTeachers(data || [])
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes')
      if (response.ok) {
        const data = await response.json()
        setClasses(data || [])
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error)
    }
  }

  const fetchTeacherAttendance = async () => {
    try {
      const response = await fetch('/api/teacher-attendance')
      if (response.ok) {
        const data = await response.json()
        setAttendanceRecords(data.records || [])
      }
    } catch (error) {
      console.error('Failed to fetch teacher attendance:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/teacher-attendance/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch teacher attendance stats:', error)
    }
  }

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        fetchTeachers(),
        fetchClasses(),
        fetchTeacherAttendance(),
        fetchStats()
      ])
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setIsRefreshing(false)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isClient) {
      refreshData()
    }
  }, [isClient])

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.className.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTeacher = selectedTeacher === 'all' || record.teacherId === selectedTeacher
    const matchesClass = selectedClass === 'all' || record.classId === selectedClass
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus
    
    // Date filtering - either date range or single date
    let matchesDate = true
    // Extract date directly from ISO string to avoid timezone issues
    const recordDate = record.meetingDate.split('T')[0]
    
    if (dateRange.start && dateRange.end) {
      // Use date range if both dates are provided
      matchesDate = recordDate >= dateRange.start && recordDate <= dateRange.end
    } else {
      // Use single date filter if no date range
      matchesDate = selectedDate === '' || recordDate === selectedDate
    }
    
    return matchesSearch && matchesTeacher && matchesClass && matchesStatus && matchesDate
  })

  // Pagination logic for filtered records
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage)
  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord)

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedTeacher, selectedClass, selectedStatus, selectedDate, dateRange])

  // Calculate teacher attendance summary with student percentages
  const getTeacherAttendanceSummary = () => {
    // Filter attendance records based on summary date range
    const filteredAttendanceRecords = attendanceRecords.filter(record => {
      if (summaryDateRange.start && summaryDateRange.end) {
        // Extract date directly from ISO string to avoid timezone issues
        const recordDate = record.meetingDate.split('T')[0]
        return recordDate >= summaryDateRange.start && recordDate <= summaryDateRange.end
      }
      return true // If no date range is set, include all records
    })

    // Filter out inactive teachers
    const activeTeachers = teachers.filter(teacher => teacher.status !== 'inactive')

    const summary = activeTeachers.map(teacher => {
      const teacherRecords = filteredAttendanceRecords.filter(record => record.teacherId === teacher.id)
      
      // Calculate teacher attendance stats
      const totalMeetings = teacherRecords.length
      const presentMeetings = teacherRecords.filter(record => record.status === 'present').length
      const absentMeetings = teacherRecords.filter(record => record.status === 'absent').length
      
      // Calculate student attendance percentages for this teacher
      const totalStudentAttendance = teacherRecords.reduce((sum, record) => {
        return sum + (record.totalStudentCount > 0 ? (record.studentPresentCount / record.totalStudentCount) * 100 : 0)
      }, 0)
      
      const averageStudentAttendance = totalMeetings > 0 ? totalStudentAttendance / totalMeetings : 0
      
      // Get classes taught by this teacher
      const teacherClasses = classes.filter(cls => cls.teacherId === teacher.id)
      const activeClasses = teacherClasses.filter(cls => cls.isActive)
      
      return {
        teacherId: teacher.id,
        teacherName: teacher.name,
        education: teacher.education,
        photo: teacher.photo,
        courses: teacher.courses || [],
        activeClasses: activeClasses, // Add active classes data
        totalMeetings,
        presentMeetings,
        absentMeetings,
        teacherAttendanceRate: totalMeetings > 0 ? (presentMeetings / totalMeetings) * 100 : 0,
        averageStudentAttendance: Math.round(averageStudentAttendance * 10) / 10, // Round to 1 decimal place
        classesTaught: teacherClasses.length,
        activeClassesCount: activeClasses.length
      }
    })
    
    // Sort by teacher attendance rate (highest first)
    return summary.sort((a, b) => b.teacherAttendanceRate - a.teacherAttendanceRate)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800'
      case 'absent':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present':
        return 'Hadir'
      case 'absent':
        return 'Tidak Hadir'
      default:
        return status
    }
  }

  // Helper functions for the new summary table
  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 font-medium'
    if (rate >= 75) return 'text-yellow-600 font-medium'
    return 'text-red-600 font-medium'
  }

  const getAttendanceRateBadge = (rate: number) => {
    if (rate >= 90) return 'bg-green-100 text-green-800'
    if (rate >= 75) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  if (!isClient || isLoading) {
    return (
      <LoadingSpinner 
        message="Loading..."
        subMessage="Data absensi guru sedang dimuat"
      />
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Absen Guru</h1>
          <p className="text-gray-600">Kelola data absensi guru berdasarkan absensi kelas</p>
        </div>
        <Button
          onClick={refreshData}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Guru</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hadir Hari Ini</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.presentToday}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tidak Hadir Hari Ini</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.absentToday}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata Kehadiran</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageAttendance}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Teacher Attendance Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Ringkasan Absensi
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Riwayat Absensi
          </TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Absensi Guru & Persentase Kehadiran Siswa</CardTitle>
              <CardDescription>
                Menampilkan total absensi setiap guru dan rata-rata persentase kehadiran siswa dalam kelas mereka
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filter Range Tanggal untuk Ringkasan */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <Label htmlFor="summary-start-date">Tanggal Mulai</Label>
                    <Input
                      id="summary-start-date"
                      type="date"
                      value={summaryDateRange.start}
                      onChange={(e) => setSummaryDateRange(prev => ({ ...prev, start: e.target.value }))}
                      placeholder="Pilih tanggal mulai"
                    />
                  </div>
                  <div>
                    <Label htmlFor="summary-end-date">Tanggal Selesai</Label>
                    <Input
                      id="summary-end-date"
                      type="date"
                      value={summaryDateRange.end}
                      onChange={(e) => setSummaryDateRange(prev => ({ ...prev, end: e.target.value }))}
                      placeholder="Pilih tanggal selesai"
                      min={summaryDateRange.start}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSummaryDateRange({ start: '', end: '' })}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reset
                    </Button>
                    {(summaryDateRange.start || summaryDateRange.end) && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {summaryDateRange.start && summaryDateRange.end 
                            ? `${formatDate(summaryDateRange.start)} - ${formatDate(summaryDateRange.end)}`
                            : summaryDateRange.start 
                            ? `Dari ${formatDate(summaryDateRange.start)}`
                            : `Sampai ${formatDate(summaryDateRange.end)}`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-center">No</TableHead>
                      <TableHead>Foto</TableHead>
                      <TableHead>Nama Guru</TableHead>
                      <TableHead>Pendidikan</TableHead>
                      <TableHead>Kelas Aktif</TableHead>
                      <TableHead>Total Pertemuan</TableHead>
                      <TableHead>Hadir</TableHead>
                      <TableHead>Tidak Hadir</TableHead>
                      <TableHead>% Kehadiran Guru</TableHead>
                      <TableHead>% Kehadiran Siswa (Rata-rata)</TableHead>
                      <TableHead>Kelas Aktif</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getTeacherAttendanceSummary().map((summary, index) => (
                      <TableRow key={summary.teacherId}>
                        <TableCell className="text-center font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {summary.photo ? (
                              <img 
                                src={summary.photo} 
                                alt={summary.teacherName}
                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                onError={(e) => {
                                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(summary.teacherName)}&background=6366f1&color=fff&size=40`
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  {summary.teacherName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{summary.teacherName}</TableCell>
                        <TableCell className="text-sm">{summary.education}</TableCell>
                        <TableCell className="text-sm">
                          {summary.activeClasses.length > 0 ? (
                            <div className="space-y-1">
                              {summary.activeClasses.map((cls) => (
                                <Badge 
                                  key={cls.id} 
                                  variant="default"
                                  className="text-xs mr-1 mb-1 bg-green-100 text-green-800 border-green-300"
                                >
                                  {cls.name}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">Tidak ada kelas aktif</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">{summary.totalMeetings}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-green-600 font-medium">{summary.presentMeetings}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-red-600 font-medium">{summary.absentMeetings}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getAttendanceRateBadge(summary.teacherAttendanceRate)}>
                            {summary.teacherAttendanceRate.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  summary.averageStudentAttendance >= 90 ? 'bg-green-500' :
                                  summary.averageStudentAttendance >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${summary.averageStudentAttendance}%` }}
                              ></div>
                            </div>
                            <span className={getAttendanceRateColor(summary.averageStudentAttendance)}>
                              {summary.averageStudentAttendance}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">
                            {summary.activeClassesCount}/{summary.classesTaught}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = `/admin/teachers/${summary.teacherId}`}
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {getTeacherAttendanceSummary().length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {summaryDateRange.start || summaryDateRange.end 
                    ? 'Tidak ada data absensi guru dalam rentang tanggal yang dipilih'
                    : 'Belum ada data absensi guru untuk ditampilkan'
                  }
                </div>
              )}
              
              {/* Informasi Filter yang Aktif */}
              {(summaryDateRange.start || summaryDateRange.end) && getTeacherAttendanceSummary().length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-blue-800">
                      <span className="font-medium">Filter Aktif:</span>{' '}
                      {summaryDateRange.start && summaryDateRange.end 
                        ? `Rentang tanggal ${formatDate(summaryDateRange.start)} hingga ${formatDate(summaryDateRange.end)}`
                        : summaryDateRange.start 
                        ? `Dari tanggal ${formatDate(summaryDateRange.start)}`
                        : `Sampai tanggal ${formatDate(summaryDateRange.end)}`
                      }
                    </div>
                    <div className="text-sm text-blue-600 font-medium">
                      {getTeacherAttendanceSummary().length} guru ditemukan
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Absensi Guru</CardTitle>
              <CardDescription>
                Menampilkan {currentRecords.length} dari {filteredRecords.length} record absensi guru 
                {filteredRecords.length > recordsPerPage && ` (Halaman ${currentPage} dari ${totalPages})`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium mb-4">Filter Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="search">Cari Guru atau Kelas</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Nama guru atau kelas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="teacher">Guru</Label>
                    <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih guru" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Guru</SelectItem>
                        {teachers.filter(teacher => teacher.status !== 'inactive').map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="class">Kelas</Label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kelas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Kelas</SelectItem>
                        {classes.map((classItem) => (
                          <SelectItem key={classItem.id} value={classItem.id}>
                            {classItem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="present">Hadir</SelectItem>
                        <SelectItem value="absent">Tidak Hadir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <Label className="text-sm font-medium">Filter Tanggal</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <div>
                      <Label htmlFor="dateStart">Tanggal Mulai</Label>
                      <Input
                        id="dateStart"
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateEnd">Tanggal Selesai</Label>
                      <Input
                        id="dateEnd"
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setDateRange({ start: '', end: '' })
                          setSelectedDate(new Date().toISOString().split('T')[0])
                        }}
                        className="w-full"
                      >
                        Reset Tanggal
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Nama Guru</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>Jadwal</TableHead>
                      <TableHead>Topik</TableHead>
                      <TableHead>Siswa Hadir</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Dicatat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{formatDate(record.meetingDate)}</TableCell>
                        <TableCell className="font-medium">{record.teacherName}</TableCell>
                        <TableCell>{record.className}</TableCell>
                        <TableCell className="text-sm">{record.schedule}</TableCell>
                        <TableCell>{record.meetingTopic}</TableCell>
                        <TableCell>
                          <div className="text-center">
                            <span className="font-medium">{record.studentPresentCount}</span>
                            <span className="text-gray-500">/{record.totalStudentCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(record.status)}>
                            {getStatusLabel(record.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDateTime(record.recordedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Menampilkan {indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, filteredRecords.length)} dari {filteredRecords.length} record
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
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
                            className="w-8 h-8 p-0"
                            onClick={() => setCurrentPage(pageNumber)}
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
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
