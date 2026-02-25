'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import CommissionTypeSelector from '@/components/admin/commission-type-selector';

interface Course {
  id: string;
  name: string;
  category: string;
}

interface Teacher {
  id: string;
  name: string;
  education: string;
  specialization?: string;
  status: string;
}

interface Room {
  id: string;
  name: string;
  building?: string;
  floor?: string;
  isActive: boolean;
}

interface Student {
  id: string;
  name: string;
  whatsapp: string;
  status: string;
  courseName?: string;
  course?: {
    name: string;
    category: string;
  };
  className?: string;
  classes?: any[];
}

interface ClassStudent {
  id: string;
  joinedAt: string;
  student: {
    id: string;
    name: string;
    whatsapp: string;
  };
}

interface Class {
  id: string;
  name: string;
  description?: string | null;
  maxStudents: number;
  commissionType: string;
  commissionAmount: number;
  schedule: string;
  startDate: string | null;
  endDate: string | null;
  totalMeetings: number;
  completedMeetings: number;
  isActive: boolean;
  course: {
    id: string;
    name: string;
    category: string;
  };
  teacher?: {
    id: string;
    name: string;
    education: string;
    specialization?: string | null;
  } | null;
  room: {
    id: string;
    name: string;
    building?: string | null;
    floor?: string | null;
  };
  students: ClassStudent[];
}

interface EditClassFormProps {
  classData: Class;
  isOpen: boolean;
  onClose: () => void;
  onClassUpdated: () => void;
}

export default function EditClassForm({ classData, isOpen, onClose, onClassUpdated }: EditClassFormProps) {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    courseId: '',
    teacherId: '',
    roomId: '',
    maxStudents: '',
    commissionType: 'BY_CLASS',
    commissionAmount: '',
    schedule: '',
    totalMeetings: ''
  });

  useEffect(() => {
    if (classData) {
      setFormData({
        name: classData.name,
        description: classData.description || '',
        courseId: classData.course.id,
        teacherId: classData.teacher?.id || '',
        roomId: classData.room.id,
        maxStudents: classData.maxStudents.toString(),
        commissionType: classData.commissionType || 'BY_CLASS',
        commissionAmount: classData.commissionAmount?.toString() || '0',
        schedule: classData.schedule,
        totalMeetings: classData.totalMeetings?.toString() || '0'
      });
      setSelectedStudents(classData.students.map(cs => cs.student.id));
    }
  }, [classData]);

  useEffect(() => {
    if (isOpen) {
      fetchCourses();
      fetchTeachers();
      fetchRooms();
      fetchStudents();
    }
  }, [isOpen]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(data.filter((course: Course) => course.isActive));
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/teachers');
      const data = await response.json();
      setTeachers(data.filter((teacher: Teacher) => teacher.status === 'active'));
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      const data = await response.json();
      setRooms(data.filter((room: Room) => room.isActive));
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      
      // Filter out students from completed classes and only include active/confirmed students
      const eligibleStudents = data.filter((student: Student) => {
        // Check if student has completed any class (must have endDate set)
        // IMPORTANT: Class is only completed when manually marked with endDate
        const hasCompletedClass = student.classes?.some(cs => 
          cs.class.endDate !== null
        );
        
        // Exclude students who have completed classes
        if (hasCompletedClass) {
          return false;
        }
        
        // Include only active or confirmed students
        return student.status === 'confirmed' || student.status === 'active' || student.status === 'completed';
      });
      
      setStudents(eligibleStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.courseId || !formData.roomId || 
        !formData.maxStudents || !formData.commissionAmount || !formData.schedule || !formData.totalMeetings) {
      toast.error('Semua field wajib diisi (kecuali Guru Pengajar)');
      return;
    }

    const totalMeetingsNum = parseInt(formData.totalMeetings);
    if (totalMeetingsNum < 1) {
      toast.error('Jumlah pertemuan minimal 1');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/classes/${classData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          courseId: formData.courseId,
          teacherId: formData.teacherId || null,
          roomId: formData.roomId,
          maxStudents: parseInt(formData.maxStudents),
          commissionType: formData.commissionType,
          commissionAmount: parseInt(formData.commissionAmount),
          schedule: formData.schedule.trim(),
          totalMeetings: totalMeetingsNum,
          studentIds: selectedStudents
        }),
      });

      if (response.ok) {
        toast.success('Data kelas berhasil diperbarui');
        onClose();
        onClassUpdated();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Gagal memperbarui kelas');
      }
    } catch (error) {
      console.error('Error updating class:', error);
      toast.error('Terjadi kesalahan saat memperbarui kelas');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCommissionTypeChange = (type: 'BY_CLASS' | 'BY_STUDENT') => {
    setFormData(prev => ({
      ...prev,
      commissionType: type
    }));
  };

  const handleCommissionAmountChange = (amount: string) => {
    setFormData(prev => ({
      ...prev,
      commissionAmount: amount
    }));
  };

  const handleStudentToggle = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     student.course?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (student.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (student.className === 'Belum ada kelas' && 'belum masuk kelas'.includes(searchTerm.toLowerCase())))
  );

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Kelas</DialogTitle>
          <DialogDescription>
            Perbarui data kelas pembelajaran
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama Kelas *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Contoh: Kelas Pemrograman Web A"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-maxStudents">Kapasitas Maksimal *</Label>
              <Input
                id="edit-maxStudents"
                type="number"
                value={formData.maxStudents}
                onChange={(e) => handleInputChange('maxStudents', e.target.value)}
                placeholder="Contoh: 20"
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-totalMeetings">Jumlah Pertemuan *</Label>
              <Input
                id="edit-totalMeetings"
                type="number"
                value={formData.totalMeetings}
                onChange={(e) => handleInputChange('totalMeetings', e.target.value)}
                placeholder="Contoh: 12"
                min="1"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Deskripsi</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Deskripsi kelas (opsional)"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-courseId">Program Kursus *</Label>
              <Select value={formData.courseId} onValueChange={(value) => handleInputChange('courseId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih program kursus" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name} - {course.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-teacherId">Guru Pengajar (Opsional)</Label>
              <Select value={formData.teacherId} onValueChange={(value) => handleInputChange('teacherId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih guru" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name} - {teacher.education}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-roomId">Ruangan *</Label>
            <Select value={formData.roomId} onValueChange={(value) => handleInputChange('roomId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih ruangan" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name} {room.building && `(Gedung ${room.building})`} {room.floor && `Lantai ${room.floor}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Commission Type Selector */}
          <div className="space-y-2">
            <CommissionTypeSelector
              value={formData.commissionType as 'BY_CLASS' | 'BY_STUDENT'}
              amount={formData.commissionAmount}
              onTypeChange={handleCommissionTypeChange}
              onAmountChange={handleCommissionAmountChange}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-schedule">Jadwal *</Label>
              <Input
                id="edit-schedule"
                value={formData.schedule}
                onChange={(e) => handleInputChange('schedule', e.target.value)}
                placeholder="Contoh: Senin, 09:00-11:00"
                required
              />
            </div>
          </div>

          <div className="space-y-2 p-3 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Catatan:</strong> Tanggal mulai kelas akan terinput otomatis saat absensi pertama dilakukan, 
              dan tanggal selesai akan terinput otomatis saat kelas diselesaikan.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Siswa (Opsional)</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari nama siswa, program kursus, atau status kelas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
              {filteredStudents.length > 0 ? (
                <div className="space-y-2">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={`edit-${student.id}`}
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={(checked) => handleStudentToggle(student.id, checked as boolean)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label htmlFor={`edit-${student.id}`} className="text-sm cursor-pointer font-medium">
                          {student.name}
                        </Label>
                        <div className="text-xs text-gray-500 mt-1">
                          Program: {student.courseName || student.course?.name || 'Tidak diketahui'}
                        </div>
                        <div className={`text-xs font-medium ${
                          student.className && student.className !== 'Belum ada kelas' 
                            ? 'text-blue-600' 
                            : 'text-red-600'
                        }`}>
                          {student.className && student.className !== 'Belum ada kelas' 
                            ? `Kelas: ${student.className}` 
                            : 'Belum masuk kelas'
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  {searchTerm ? 'Tidak ada siswa yang cocok dengan pencarian' : 
                   loading ? 'Memuat data siswa...' : 'Tidak ada siswa yang tersedia'}
                </p>
              )}
            </div>
            {selectedStudents.length > 0 && (
              <p className="text-sm text-blue-600">{selectedStudents.length} siswa dipilih</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}