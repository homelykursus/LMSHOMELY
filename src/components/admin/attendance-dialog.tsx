'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Users, UserCheck, Clock, CheckCircle, Flag, UserX, UserPlus, History } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface Student {
  id: string;
  name: string;
  whatsapp: string;
  dateOfBirth?: string;
}

interface LastAttendance {
  date: string;
  status: string;
  meetingNumber: number;
}

interface ClassData {
  id: string;
  name: string;
  teacher: {
    id: string;
    name: string;
  };
  students: Array<{
    id: string;
    student: Student;
  }>;
}

interface AttendanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classData: ClassData | null;
  onAttendanceSubmitted: () => void;
  showConfirmation?: (options: any) => void; // Optional prop untuk menggunakan confirmation dari parent
}

interface AttendanceRecord {
  studentId: string;
  status: 'HADIR' | 'TIDAK_HADIR' | 'TERLAMBAT' | 'IZIN';
}

interface Teacher {
  id: string;
  name: string;
  specialization?: string;
}

export default function AttendanceDialog({
  isOpen,
  onClose,
  classData,
  onAttendanceSubmitted,
  showConfirmation: parentShowConfirmation,
}: AttendanceDialogProps) {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompletingClass, setIsCompletingClass] = useState(false);
  const [teacherPresent, setTeacherPresent] = useState(true);
  const [isMainTeacherAbsent, setIsMainTeacherAbsent] = useState(false);
  const [substituteTeacherId, setSubstituteTeacherId] = useState<string>('');
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [lastAttendanceData, setLastAttendanceData] = useState<{[key: string]: LastAttendance}>({});
  const [loadingLastAttendance, setLoadingLastAttendance] = useState(false);

  // Confirmation dialog hook - hanya digunakan jika tidak ada dari parent
  const { showConfirmation: localShowConfirmation, ConfirmationDialog } = useConfirmationDialog();
  const showConfirmation = parentShowConfirmation || localShowConfirmation;

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

  // Fetch available teachers
  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const response = await fetch('/api/teachers');
      if (response.ok) {
        const teachers = await response.json();
        // Filter out the main teacher from the list
        const filteredTeachers = teachers.filter((teacher: Teacher) => 
          teacher.id !== classData?.teacher.id
        );
        setAvailableTeachers(filteredTeachers);
      } else {
        toast.error('Gagal memuat data guru');
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Terjadi kesalahan saat memuat data guru');
    } finally {
      setLoadingTeachers(false);
    }
  };

  // Fetch last attendance data for students
  const fetchLastAttendance = async () => {
    if (!classData) return;
    
    setLoadingLastAttendance(true);
    try {
      const studentIds = classData.students.map(s => s.student.id);
      const response = await fetch('/api/attendance/last-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentIds,
          classId: classData.id
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLastAttendanceData(data);
      } else {
        console.error('Failed to fetch last attendance data');
      }
    } catch (error) {
      console.error('Error fetching last attendance:', error);
    } finally {
      setLoadingLastAttendance(false);
    }
  };

  useEffect(() => {
    if (isOpen && classData) {
      console.log('Attendance dialog opened with class data:', classData);
      // Initialize attendance records for all students
      const initialRecords: AttendanceRecord[] = classData.students.map(studentEnrollment => ({
        studentId: studentEnrollment.student.id,
        status: 'TIDAK_HADIR' as const,
      }));
      console.log('Initial attendance records:', initialRecords);
      setAttendanceRecords(initialRecords);
      setTeacherPresent(true);
      setIsMainTeacherAbsent(false);
      setSubstituteTeacherId('');
      
      // Fetch available teachers and last attendance data
      fetchTeachers();
      fetchLastAttendance();
    }
  }, [isOpen, classData]);

  const handleStudentAttendanceChange = (studentId: string, status: 'HADIR' | 'TIDAK_HADIR' | 'TERLAMBAT' | 'IZIN') => {
    setAttendanceRecords(prev =>
      prev.map(record =>
        record.studentId === studentId ? { ...record, status } : record
      )
    );
  };

  const handleSubmitAttendance = async () => {
    if (!classData) return;

    // Check if at least one student is present
    const presentStudents = attendanceRecords.filter(record => record.status === 'HADIR' || record.status === 'TERLAMBAT' || record.status === 'IZIN');
    
    if (presentStudents.length === 0) {
      toast.error('Minimal 1 siswa harus hadir untuk mencatat pertemuan');
      return;
    }

    // Validate substitute teacher selection if main teacher is absent
    if (isMainTeacherAbsent && !substituteTeacherId) {
      toast.error('Pilih guru pengganti terlebih dahulu');
      return;
    }

    // Determine which teacher is actually present
    const actualTeacherId = isMainTeacherAbsent ? substituteTeacherId : classData.teacher.id;
    const actualTeacherPresent = !isMainTeacherAbsent || !!substituteTeacherId;
    
    // Get substitute teacher name for notes
    const substituteTeacher = availableTeachers.find(t => t.id === substituteTeacherId);
    const teacherNotes = isMainTeacherAbsent && substituteTeacher 
      ? `Digantikan oleh ${substituteTeacher.name}` 
      : undefined;

    console.log('Submitting attendance:', {
      classId: classData.id,
      teacherId: actualTeacherId,
      teacherPresent: actualTeacherPresent,
      isMainTeacherAbsent,
      substituteTeacherId,
      teacherNotes,
      attendanceRecords,
      presentStudentsCount: presentStudents.length
    });

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: classData.id,
          teacherId: actualTeacherId,
          teacherPresent: actualTeacherPresent,
          isMainTeacherAbsent,
          mainTeacherId: classData.teacher.id,
          substituteTeacherId: isMainTeacherAbsent ? substituteTeacherId : undefined,
          teacherNotes,
          attendanceRecords,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('Response data:', result);
        
        let successMessage = isMainTeacherAbsent 
          ? `Absensi berhasil dicatat! ${presentStudents.length} siswa hadir. Guru pengganti: ${substituteTeacher?.name}`
          : `Absensi berhasil dicatat! ${presentStudents.length} siswa hadir`;
        
        // Add commission information if available
        if (result.commissionCalculation) {
          const commission = result.commissionCalculation;
          successMessage += `\n\nKomisi Guru: ${commission.breakdown}`;
        }
        
        toast.success(successMessage);
        onAttendanceSubmitted();
        onClose();
      } else {
        let errorMessage = 'Gagal mencatat absensi';
        
        try {
          const error = await response.json();
          console.error('Attendance API error:', JSON.stringify(error, null, 2));
          errorMessage = error.error || error.message || errorMessage;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          const responseText = await response.text();
          console.error('Raw response text:', responseText);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
      console.error('Error type:', typeof error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast.error('Terjadi kesalahan saat mencatat absensi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteClass = async () => {
    if (!classData) return;

    showConfirmation({
      title: 'Selesaikan Kelas',
      description: `Apakah Anda yakin ingin menyelesaikan kelas "${classData.name}"?\n\nKelas yang telah selesai tidak dapat diaktifkan kembali.\nStatus kelas akan berubah menjadi "Selesai".`,
      confirmText: 'Ya, Selesaikan',
      cancelText: 'Batal',
      variant: 'destructive',
      onConfirm: async () => {
        setIsCompletingClass(true);

        try {
          const response = await fetch(`/api/classes/${classData.id}/complete`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            toast.success(`Kelas "${classData.name}" telah diselesaikan!`);
            onAttendanceSubmitted();
            onClose();
          } else {
            const error = await response.json();
            toast.error(error.error || 'Gagal menyelesaikan kelas');
          }
        } catch (error) {
          console.error('Error completing class:', error);
          toast.error('Terjadi kesalahan saat menyelesaikan kelas');
        } finally {
          setIsCompletingClass(false);
        }
      }
    });
  };

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case 'HADIR':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'TIDAK_HADIR':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'TERLAMBAT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IZIN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAttendanceStatusText = (status: string) => {
    switch (status) {
      case 'HADIR':
        return 'Hadir';
      case 'TIDAK_HADIR':
        return 'Tidak Hadir';
      case 'TERLAMBAT':
        return 'Terlambat';
      case 'IZIN':
        return 'Izin';
      default:
        return status;
    }
  };

  const presentCount = attendanceRecords.filter(record => 
    record.status === 'HADIR' || record.status === 'TERLAMBAT' || record.status === 'IZIN'
  ).length;

  if (!classData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Absensi Kelas: {classData.name}
          </DialogTitle>
          <DialogDescription>
            Catat kehadiran siswa untuk pertemuan kali ini
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 flex-1 overflow-y-auto">
          {/* Teacher Attendance */}
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Guru Utama: {classData.teacher.name}</p>
                    <p className="text-sm text-blue-700">
                      {isMainTeacherAbsent ? 'Berhalangan hadir' : 'Status kehadiran otomatis tercatat'}
                    </p>
                  </div>
                </div>
                <Badge className={isMainTeacherAbsent 
                  ? "bg-red-100 text-red-800 border-red-200" 
                  : "bg-green-100 text-green-800 border-green-200"
                }>
                  {isMainTeacherAbsent ? 'Berhalangan' : 'Hadir'}
                </Badge>
              </div>
              
              {/* Toggle for main teacher absence */}
              <div className="flex items-center space-x-3 pt-3 border-t border-blue-200">
                <Switch
                  id="main-teacher-absent"
                  checked={isMainTeacherAbsent}
                  onCheckedChange={setIsMainTeacherAbsent}
                />
                <Label htmlFor="main-teacher-absent" className="text-sm text-blue-800">
                  Guru utama berhalangan hadir
                </Label>
              </div>
            </div>

            {/* Substitute Teacher Selection */}
            {isMainTeacherAbsent && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3 mb-3">
                  <UserPlus className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-900">Guru Pengganti</p>
                    <p className="text-sm text-orange-700">Pilih guru yang akan menggantikan</p>
                  </div>
                </div>
                
                <Select 
                  value={substituteTeacherId} 
                  onValueChange={setSubstituteTeacherId}
                  disabled={loadingTeachers}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder={loadingTeachers ? "Memuat guru..." : "Pilih guru pengganti"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{teacher.name}</span>
                          {teacher.specialization && (
                            <span className="text-xs text-gray-500">{teacher.specialization}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {substituteTeacherId && (
                  <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-800">
                        Guru pengganti: {availableTeachers.find(t => t.id === substituteTeacherId)?.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Attendance Summary */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium">Total Siswa: {classData.students.length}</p>
                  <p className="text-sm text-gray-600">Siswa Hadir: {presentCount}</p>
                </div>
              </div>
              {presentCount > 0 && (
                <div className="text-right">
                  <p className="text-sm text-green-600 font-medium">
                    ✓ Pertemuan akan dicatat
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Student Attendance List */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Data Kehadiran Siswa
            </h4>
            
            <ScrollArea className="h-64 w-full rounded-md border">
              <div className="p-4 space-y-3">
                {classData.students.map((studentEnrollment) => {
                  const student = studentEnrollment.student;
                  const attendance = attendanceRecords.find(r => r.studentId === student.id);
                  const lastAttendance = lastAttendanceData[student.id];
                  
                  return (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {student.name}
                            {(() => {
                              const age = calculateAge(student.dateOfBirth);
                              return age !== null ? (
                                <span className="text-gray-500 font-normal"> ({age})</span>
                              ) : null;
                            })()}
                          </p>
                          <p className="text-xs text-gray-500">{student.whatsapp}</p>
                          {lastAttendance && (
                            <div className="flex items-center gap-1 mt-1">
                              <History className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                Terakhir: {new Date(lastAttendance.date).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })} ({lastAttendance.status})
                              </span>
                            </div>
                          )}
                          {!lastAttendance && !loadingLastAttendance && (
                            <div className="flex items-center gap-1 mt-1">
                              <History className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-400">Belum pernah absen</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {['HADIR', 'TERLAMBAT', 'IZIN', 'TIDAK_HADIR'].map((status) => (
                          <Button
                            key={status}
                            size="sm"
                            variant={attendance?.status === status ? "default" : "outline"}
                            className={`text-xs px-2 py-1 h-7 ${
                              attendance?.status === status 
                                ? getAttendanceStatusColor(status) 
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handleStudentAttendanceChange(
                              student.id, 
                              status as 'HADIR' | 'TIDAK_HADIR' | 'TERLAMBAT' | 'IZIN'
                            )}
                          >
                            {getAttendanceStatusText(status)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-3 pt-4 border-t flex-shrink-0">
            <Button
              variant="destructive"
              onClick={handleCompleteClass}
              disabled={isCompletingClass || isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCompletingClass ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menyelesaikan...
                </>
              ) : (
                <>
                  <Flag className="h-4 w-4 mr-2" />
                  Menyelesaikan Kelas
                </>
              )}
            </Button>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting || isCompletingClass}
              >
                Batal
              </Button>
              <Button
                onClick={handleSubmitAttendance}
                disabled={
                  isSubmitting || 
                  isCompletingClass || 
                  presentCount === 0 || 
                  (isMainTeacherAbsent && !substituteTeacherId)
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Simpan Absensi
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
      
      {/* Confirmation Dialog - hanya render jika tidak ada dari parent */}
      {!parentShowConfirmation && <ConfirmationDialog key="attendance-confirmation" />}
    </Dialog>
  );
}