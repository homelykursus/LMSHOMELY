'use client';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Search, Users, Calendar, Clock, CheckCircle, XCircle, RefreshCw, Edit, Save, ChevronLeft, ChevronRight } from 'lucide-react'

interface Student {
  id: string
  name: string
  studentId: string
  classId: string
  className?: string
  courseId: string
  courseName?: string
  phone?: string
  status: 'active' | 'inactive' | 'graduated'
  joinDate: string
  dateOfBirth?: string
}

interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  classId: string
  className: string
  teacherId?: string
  teacherName?: string
  substituteTeacherId?: string
  substituteTeacherName?: string
  meetingId: string
  meetingDate: string
  meetingTopic: string
  status: 'present' | 'absent' | 'late' | 'excused'
  notes?: string
  recordedAt: string
  recordedBy: string
}

interface AttendanceStats {
  totalStudents: number
  presentToday: number
  absentToday: number
  lateToday: number
  totalMeetings: number
  averageAttendance: number
}

interface Class {
  id: string
  name: string
  courseId: string
  course?: {
    name: string
  }
}

interface Course {
  id: string
  name: string
}

export default function AttendancePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState('students')
  const [searchTerm, setSearchTerm] = useState('')
  const [attendanceSearchTerm, setAttendanceSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [selectedCourse, setSelectedCourse] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [showOnlyWithClass, setShowOnlyWithClass] = useState(true)
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null)
  const [editStatus, setEditStatus] = useState<string>('')
  const [editNotes, setEditNotes] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  
  // Pagination states for students table
  const [studentsCurrentPage, setStudentsCurrentPage] = useState(1)
  const [studentsPageSize, setStudentsPageSize] = useState(10)
  
  // Pagination states for attendance records table
  const [attendanceCurrentPage, setAttendanceCurrentPage] = useState(1)
  const [attendancePageSize, setAttendancePageSize] = useState(10)

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

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      if (response.ok) {
        const data = await response.json()
        // API returns direct array with classes relationship included
        const studentsWithClassInfo = (data || []).map((student: any) => {
          // Find active class from the classes relationship, but also check for completed classes
          const activeClassStudent = student.classes?.find((cs: any) => cs.class.isActive);
          // IMPORTANT: Class is only considered "completed" if it has endDate set (manually completed by teacher)
          // Even if completedMeetings >= totalMeetings, class is NOT auto-completed
          const completedClassStudent = student.classes?.find((cs: any) => 
            !cs.class.isActive && cs.class.endDate !== null
          );
          
          // Prioritize active class, but if no active class, show completed class
          const classStudent = activeClassStudent || completedClassStudent;
          const className = classStudent?.class?.name || 'Belum ada kelas';
          const classId = classStudent?.classId || '';
          
          return {
            ...student,
            classId: classId,
            className: className,
            courseName: student.course?.name || student.courseName || '-',
            classData: classStudent?.class || null
          }
        })
        setStudents(studentsWithClassInfo)
      }
    } catch (error) {
      console.error('Failed to fetch students:', error)
    }
  }

  const fetchAttendanceRecords = async () => {
    try {
      const response = await fetch('/api/attendance')
      if (response.ok) {
        const data = await response.json()
        // API returns { success: true, records: [...] }
        const studentRecords = data.records?.filter((record: any) => record.studentName) || []
        setAttendanceRecords(studentRecords)
      }
    } catch (error) {
      console.error('Failed to fetch attendance records:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/attendance/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
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

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data || [])
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    }
  }

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      // Fetch all data in parallel since students API already includes class info
      await Promise.all([
        fetchStudents(),
        fetchAttendanceRecords(),
        fetchStats(),
        fetchClasses(), // Still needed for filters
        fetchCourses()  // Still needed for filters
      ])
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setIsRefreshing(false)
      setIsLoading(false)
    }
  }

  const handleEditRecord = (record: AttendanceRecord) => {
    setEditingRecord(record)
    setEditStatus(record.status)
    setEditNotes(record.notes || '')
    setIsEditDialogOpen(true)
  }

  const handleUpdateRecord = async () => {
    if (!editingRecord) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/attendance/${editingRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: editStatus,
          notes: editNotes,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update attendance record')
      }

      // Refresh data to show updated record
      await Promise.all([
        fetchAttendanceRecords(),
        fetchStats()
      ])
      setIsEditDialogOpen(false)
      setEditingRecord(null)
      setEditStatus('')
      setEditNotes('')
    } catch (error) {
      console.error('Error updating attendance record:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  useEffect(() => {
    if (isClient) {
      refreshData()
    }
  }, [isClient])

  // Function to get student status based on class data
  const getStudentStatusFromClass = (student: any) => {
    // If student has no class or class name is "Belum ada kelas", show "Belum ada kelas"
    if (!student.classData || student.className === 'Belum ada kelas') {
      return {
        status: 'no-class',
        label: 'Belum ada kelas',
        color: 'bg-gray-100 text-gray-800'
      }
    }

    // Check class completion status
    const classData = student.classData
    
    // IMPORTANT: Class is only "completed" if it has endDate set (manually completed by teacher)
    // Even if completedMeetings >= totalMeetings, class is NOT auto-completed
    // Class remains "ongoing" until teacher manually marks it as complete
    if (!classData.isActive && classData.endDate !== null) {
      return {
        status: 'completed',
        label: 'Kelas Selesai',
        color: 'bg-purple-100 text-purple-800'
      }
    } else if (classData.isActive) {
      return {
        status: 'ongoing',
        label: 'Sedang Berjalan',
        color: 'bg-green-100 text-green-800'
      }
    } else {
      return {
        status: 'inactive',
        label: 'Tidak Aktif',
        color: 'bg-orange-100 text-orange-800'
      }
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = selectedClass === 'all' || student.classId === selectedClass
    const matchesCourse = selectedCourse === 'all' || student.courseId === selectedCourse
    
    // Check if student has a class (has active or completed class enrollment)
    const hasClass = student.classId && student.classId !== '' && student.className !== 'Belum ada kelas'
    const matchesClassFilter = !showOnlyWithClass || hasClass
    
    // Get student status to check if class is completed
    const studentStatus = getStudentStatusFromClass(student)
    
    // Only exclude students if their class is marked as inactive (not just completed meetings)
    // Students should still appear even if they've reached total meetings, unless class is explicitly inactive
    const isActiveOrCompleted = studentStatus.status !== 'inactive'
    
    return matchesSearch && matchesClass && matchesCourse && matchesClassFilter && isActiveOrCompleted
  })

  const filteredAttendance = attendanceRecords.filter(record => {
    const recordDate = new Date(record.meetingDate).toISOString().split('T')[0]
    const matchesDate = selectedDate === '' || recordDate === selectedDate
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus
    
    // Filter by class - need to match classId from attendance record
    const matchesClass = selectedClass === 'all' || record.classId === selectedClass
    
    // Filter by course - need to get course from student data
    const student = students.find(s => s.id === record.studentId)
    const matchesCourse = selectedCourse === 'all' || (student && student.courseId === selectedCourse)
    
    // Search functionality - filter by student name, class name, teacher name, or topic
    const matchesSearch = attendanceSearchTerm === '' || 
      record.studentName.toLowerCase().includes(attendanceSearchTerm.toLowerCase()) ||
      record.className.toLowerCase().includes(attendanceSearchTerm.toLowerCase()) ||
      (record.teacherName && record.teacherName.toLowerCase().includes(attendanceSearchTerm.toLowerCase())) ||
      record.meetingTopic.toLowerCase().includes(attendanceSearchTerm.toLowerCase()) ||
      (record.notes && record.notes.toLowerCase().includes(attendanceSearchTerm.toLowerCase()))
    
    // Show all attendance records regardless of student class completion status
    return matchesDate && matchesStatus && matchesClass && matchesCourse && matchesSearch
  })

  // Pagination logic for students
  const studentsTotalPages = Math.ceil(filteredStudents.length / studentsPageSize)
  const studentsPaginatedData = filteredStudents.slice(
    (studentsCurrentPage - 1) * studentsPageSize,
    studentsCurrentPage * studentsPageSize
  )

  // Pagination logic for attendance records
  const attendanceTotalPages = Math.ceil(filteredAttendance.length / attendancePageSize)
  const attendancePaginatedData = filteredAttendance.slice(
    (attendanceCurrentPage - 1) * attendancePageSize,
    attendanceCurrentPage * attendancePageSize
  )

  // Reset pagination when filters change
  useEffect(() => {
    setStudentsCurrentPage(1)
    setAttendanceCurrentPage(1)
  }, [searchTerm, attendanceSearchTerm, selectedClass, selectedCourse, selectedStatus, selectedDate, showOnlyWithClass])

  const getStudentAttendanceSummary = (studentId: string) => {
    const studentRecords = attendanceRecords.filter(r => r.studentId === studentId)
    const total = studentRecords.length
    const present = studentRecords.filter(r => r.status === 'present').length
    const absent = studentRecords.filter(r => r.status === 'absent').length
    const late = studentRecords.filter(r => r.status === 'late').length
    const excused = studentRecords.filter(r => r.status === 'excused').length
    
    return { total, present, absent, late, excused }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800'
      case 'absent': return 'bg-red-100 text-red-800'
      case 'late': return 'bg-yellow-100 text-yellow-800'
      case 'excused': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present': return 'Hadir'
      case 'absent': return 'Tidak Hadir'
      case 'late': return 'Terlambat'
      case 'excused': return 'Izin'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Pagination component
  const PaginationComponent = ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    pageSize, 
    onPageSizeChange,
    totalItems 
  }: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    pageSize: number
    onPageSizeChange: (size: number) => void
    totalItems: number
  }) => {
    const startItem = (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, totalItems)
    
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Menampilkan {startItem}-{endItem} dari {totalItems} data
          </span>
          <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
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
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber
              if (totalPages <= 5) {
                pageNumber = i + 1
              } else if (currentPage <= 3) {
                pageNumber = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i
              } else {
                pageNumber = currentPage - 2 + i
              }
              
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNumber)}
                  className="h-8 w-8 p-0"
                >
                  {pageNumber}
                </Button>
              )
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Show loading state on server-side or during initial load
  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
          <p className="text-gray-600 mt-2">Data absensi sedang dimuat</p>
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
                <Users className="h-8 w-8 text-blue-600" />
                Absen Siswa
              </h1>
              <p className="text-gray-600">Kelola dan pantau kehadiran siswa</p>
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

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Siswa</p>
                    <p className="text-3xl font-bold">{stats.totalStudents}</p>
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
                    <p className="text-red-100 text-sm">Tidak Hadir</p>
                    <p className="text-3xl font-bold">{stats.absentToday}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">Terlambat</p>
                    <p className="text-3xl font-bold">{stats.lateToday}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Rata-rata Hadir</p>
                    <p className="text-3xl font-bold">{stats.averageAttendance}%</p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters - Shared between both tabs */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filter Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="search">Cari Siswa</Label>
                <Input
                  id="search"
                  placeholder="Nama atau ID siswa"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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
                <Label htmlFor="course">Kursus</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
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
                <Label htmlFor="date">Tanggal</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
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
                    <SelectItem value="late">Terlambat</SelectItem>
                    <SelectItem value="excused">Izin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-attendance"
                  checked={showOnlyWithClass}
                  onCheckedChange={setShowOnlyWithClass}
                />
                <Label htmlFor="show-attendance">Sembunyikan siswa belum masuk kelas</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Students and Attendance History */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Data Siswa
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Riwayat Absensi
            </TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students">

        {/* Students with Attendance Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Data Siswa dan Riwayat Absensi</CardTitle>
            <CardDescription>
              Menampilkan {filteredStudents.length} siswa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>ID Siswa</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Kursus</TableHead>
                    <TableHead>Guru</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Pertemuan</TableHead>
                    <TableHead>Hadir</TableHead>
                    <TableHead>Tidak Hadir</TableHead>
                    <TableHead>Terlambat</TableHead>
                    <TableHead>Izin</TableHead>
                    <TableHead>Kehadiran</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsPaginatedData.map((student, index) => {
                    const attendance = getStudentAttendanceSummary(student.id)
                    const attendanceRate = attendance.total > 0 
                      ? Math.round((attendance.present / attendance.total) * 100) 
                      : 0
                    const rowNumber = (studentsCurrentPage - 1) * studentsPageSize + index + 1
                    const studentStatus = getStudentStatusFromClass(student)
                    const age = calculateAge(student.dateOfBirth)

                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium text-center">{rowNumber}</TableCell>
                        <TableCell className="font-normal">{student.studentId}</TableCell>
                        <TableCell className="font-bold">
                          {student.name}
                          {age !== null && (
                            <span className="text-gray-500 font-normal"> ({age})</span>
                          )}
                        </TableCell>
                        <TableCell>{student.className || student.classId || '-'}</TableCell>
                        <TableCell>{student.courseName || student.courseId}</TableCell>
                        <TableCell>{student.classData?.teacher?.name || '-'}</TableCell>
                        <TableCell>
                          <Badge className={studentStatus.color}>
                            {studentStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{attendance.total}</TableCell>
                        <TableCell className="text-green-600 font-medium">{attendance.present}</TableCell>
                        <TableCell className="text-red-600 font-medium">{attendance.absent}</TableCell>
                        <TableCell className="text-yellow-600 font-medium">{attendance.late}</TableCell>
                        <TableCell className="text-blue-600 font-medium">{attendance.excused}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-2 min-w-[60px]">
                              <div 
                                className={`h-2 rounded-full ${
                                  attendanceRate >= 80 ? 'bg-green-500' :
                                  attendanceRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${attendanceRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{attendanceRate}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination for Students Table */}
            {filteredStudents.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <PaginationComponent
                  currentPage={studentsCurrentPage}
                  totalPages={studentsTotalPages}
                  onPageChange={setStudentsCurrentPage}
                  pageSize={studentsPageSize}
                  onPageSizeChange={setStudentsPageSize}
                  totalItems={filteredStudents.length}
                />
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            {/* Recent Attendance Records */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                <CardTitle>Riwayat Absensi Terbaru</CardTitle>
                <CardDescription>
                  Menampilkan {filteredAttendance.length} record absensi
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari nama siswa, kelas, guru, topik, atau catatan..."
                  value={attendanceSearchTerm}
                  onChange={(e) => setAttendanceSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-80"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Nama Guru</TableHead>
                    <TableHead>Guru Pengganti</TableHead>
                    <TableHead>Topik</TableHead>
                    <TableHead>Status Kehadiran</TableHead>
                    <TableHead>Catatan</TableHead>
                    <TableHead>Dicatat</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendancePaginatedData.map((record, index) => {
                    const rowNumber = (attendanceCurrentPage - 1) * attendancePageSize + index + 1
                    
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium text-center">{rowNumber}</TableCell>
                        <TableCell>{formatDate(record.meetingDate)}</TableCell>
                        <TableCell className="font-medium">{record.studentName}</TableCell>
                        <TableCell>{record.className}</TableCell>
                        <TableCell className="font-medium text-blue-600">
                          {record.teacherName || '-'}
                        </TableCell>
                        <TableCell className="font-medium text-orange-600">
                          {record.substituteTeacherName || '-'}
                        </TableCell>
                        <TableCell>{record.meetingTopic}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(record.status)}>
                            {getStatusLabel(record.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {record.notes || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDateTime(record.recordedAt)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRecord(record)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination for Attendance Records Table */}
            {filteredAttendance.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <PaginationComponent
                  currentPage={attendanceCurrentPage}
                  totalPages={attendanceTotalPages}
                  onPageChange={setAttendanceCurrentPage}
                  pageSize={attendancePageSize}
                  onPageSizeChange={setAttendancePageSize}
                  totalItems={filteredAttendance.length}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Attendance Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Absensi Siswa</DialogTitle>
              <DialogDescription>
                Ubah status dan catatan absensi untuk {editingRecord?.studentName}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Hadir</SelectItem>
                    <SelectItem value="absent">Tidak Hadir</SelectItem>
                    <SelectItem value="late">Terlambat</SelectItem>
                    <SelectItem value="excused">Izin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-notes" className="text-right">
                  Catatan
                </Label>
                <Input
                  id="edit-notes"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="col-span-3"
                  placeholder="Tambahkan catatan..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleUpdateRecord}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}