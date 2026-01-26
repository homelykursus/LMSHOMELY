'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Search, Users, Calendar, Clock, CheckCircle, XCircle, RefreshCw, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react'

interface Class {
  id: string
  name: string
  courseId: string
  teacherId: string
  schedule: string
  isActive: boolean
  course?: {
    name: string
  }
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
  totalMeetings: number
  presentMeetings: number
  absentMeetings: number
}

export default function TeacherAttendancePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [classes, setClasses] = useState<Class[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<TeacherAttendanceRecord[]>([])
  const [stats, setStats] = useState<TeacherStats | null>(null)
  const [isClient, setIsClient] = useState(false)
  
  // Tab state
  const [activeTab, setActiveTab] = useState('summary')
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
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

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/teacher/teacher-attendance?type=classes')
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
      const response = await fetch('/api/teacher/teacher-attendance?type=records')
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
      const response = await fetch('/api/teacher/teacher-attendance?type=stats')
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
    const matchesSearch = record.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.meetingTopic.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = selectedClass === 'all' || record.classId === selectedClass
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus
    
    // Date filtering - either date range or single date
    let matchesDate = true
    const recordDate = record.meetingDate.split('T')[0]
    
    if (dateRange.start && dateRange.end) {
      matchesDate = recordDate >= dateRange.start && recordDate <= dateRange.end
    } else {
      matchesDate = selectedDate === '' || recordDate === selectedDate
    }
    
    return matchesSearch && matchesClass && matchesStatus && matchesDate
  })

  // Pagination logic for filtered records
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage)
  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord)

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedClass, selectedStatus, selectedDate, dateRange])

  // Calculate teacher attendance summary
  const getTeacherAttendanceSummary = () => {
    // Filter attendance records based on summary date range
    const filteredAttendanceRecords = attendanceRecords.filter(record => {
      if (summaryDateRange.start && summaryDateRange.end) {
        const recordDate = record.meetingDate.split('T')[0]
        return recordDate >= summaryDateRange.start && recordDate <= summaryDateRange.end
      }
      return true
    })

    // Calculate teacher attendance stats
    const totalMeetings = filteredAttendanceRecords.length
    const presentMeetings = filteredAttendanceRecords.filter(record => record.status === 'present').length
    const absentMeetings = filteredAttendanceRecords.filter(record => record.status === 'absent').length
    
    // Calculate student attendance percentages
    const totalStudentAttendance = filteredAttendanceRecords.reduce((sum, record) => {
      return sum + (record.totalStudentCount > 0 ? (record.studentPresentCount / record.totalStudentCount) * 100 : 0)
    }, 0)
    
    const averageStudentAttendance = totalMeetings > 0 ? totalStudentAttendance / totalMeetings : 0
    
    // Get active classes
    const activeClasses = classes.filter(cls => cls.isActive)
    
    return {
      totalMeetings,
      presentMeetings,
      absentMeetings,
      teacherAttendanceRate: totalMeetings > 0 ? (presentMeetings / totalMeetings) * 100 : 0,
      averageStudentAttendance: Math.round(averageStudentAttendance * 10) / 10,
      activeClasses: activeClasses,
      activeClassesCount: activeClasses.length,
      classesTaught: classes.length
    }
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

  // Pagination component
  const PaginationComponent = () => {
    return (
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
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
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
                  className="h-8 w-8 p-0"
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
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
          <p className="text-gray-600 mt-2">Data absensi guru sedang dimuat</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-600" />
                Absen Guru
              </h1>
              <p className="text-gray-600">Pantau kehadiran Anda dalam mengajar kelas</p>
            </div>
            <Button
              onClick={refreshData}
              variant="outline"
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Pertemuan</p>
                    <p className="text-3xl font-bold">{stats.totalMeetings}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Hadir Hari Ini</p>
                    <p className="text-3xl font-bold">{stats.presentToday}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">Tidak Hadir Hari Ini</p>
                    <p className="text-3xl font-bold">{stats.absentToday}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Rata-rata Kehadiran</p>
                    <p className="text-3xl font-bold">{stats.averageAttendance}%</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-purple-200" />
                </div>
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
                <CardTitle>Ringkasan Absensi Anda & Persentase Kehadiran Siswa</CardTitle>
                <CardDescription>
                  Menampilkan total absensi Anda dan rata-rata persentase kehadiran siswa dalam kelas yang Anda ajar
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
                        <TableHead>Kelas Aktif</TableHead>
                        <TableHead>Total Pertemuan</TableHead>
                        <TableHead>Hadir</TableHead>
                        <TableHead>Tidak Hadir</TableHead>
                        <TableHead>% Kehadiran Guru</TableHead>
                        <TableHead>% Kehadiran Siswa (Rata-rata)</TableHead>
                        <TableHead>Status Kelas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const summary = getTeacherAttendanceSummary();
                        return (
                          <TableRow>
                            <TableCell>
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
                          </TableRow>
                        );
                      })()}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Informasi Filter yang Aktif */}
                {(summaryDateRange.start || summaryDateRange.end) && (
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
                  Menampilkan {currentRecords.length} dari {filteredRecords.length} record absensi Anda
                  {filteredRecords.length > recordsPerPage && ` (Halaman ${currentPage} dari ${totalPages})`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium mb-4">Filter Data</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="search">Cari Kelas atau Topik</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="search"
                          placeholder="Nama kelas atau topik..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
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
                    <div>
                      <Label htmlFor="date">Tanggal</Label>
                      <Input
                        id="date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <Label className="text-sm font-medium">Filter Rentang Tanggal</Label>
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
                          <TableCell className="font-medium">{record.className}</TableCell>
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
                {totalPages > 1 && <PaginationComponent />}
                
                {filteredRecords.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Tidak ada data absensi guru yang ditemukan
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}