'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import CommissionTypeSelector, { type CommissionType } from '@/components/admin/commission-type-selector';

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
}

interface AddClassFormProps {
  onClassAdded: () => void;
}

export default function AddClassForm({ onClassAdded }: AddClassFormProps) {
  const [isOpen, setIsOpen] = useState(false);
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
    commissionType: 'BY_CLASS' as CommissionType,
    commissionAmount: '',
    schedule: '',
    totalMeetings: ''
  });

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
      setCourses(data);
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
      // Hanya tampilkan siswa yang sudah dikonfirmasi atau selesai
      // Exclude: pending (tidak aktif), graduated, inactive, cancelled
      setStudents(data.filter((student: Student) => 
        student.status === 'confirmed' || student.status === 'completed'
      ));
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      courseId: '',
      teacherId: '',
      roomId: '',
      maxStudents: '',
      commissionType: 'BY_CLASS' as CommissionType,
      commissionAmount: '',
      schedule: '',
      totalMeetings: ''
    });
    setSelectedStudents([]);
    setSearchTerm('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.courseId || !formData.roomId || 
        !formData.maxStudents || !formData.commissionType || !formData.commissionAmount || 
        !formData.schedule || !formData.totalMeetings) {
      toast.error('Semua field wajib diisi (kecuali Guru Pengajar)');
      return;
    }

    // Validate commission amount
    const commissionAmountNum = parseInt(formData.commissionAmount);
    if (isNaN(commissionAmountNum) || commissionAmountNum <= 0) {
      toast.error('Jumlah komisi harus berupa angka positif');
      return;
    }

    if (commissionAmountNum > 10000000) {
      toast.error('Jumlah komisi tidak boleh melebihi Rp 10.000.000');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
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
          commissionAmount: commissionAmountNum,
          schedule: formData.schedule.trim(),
          startDate: null, // Will be set automatically on first attendance
          endDate: null, // Will be set automatically when class is completed
          totalMeetings: parseInt(formData.totalMeetings),
          studentIds: selectedStudents
        }),
      });

      if (response.ok) {
        toast.success('Kelas berhasil ditambahkan');
        resetForm();
        setIsOpen(false);
        onClassAdded();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Gagal menambahkan kelas');
      }
    } catch (error) {
      console.error('Error adding class:', error);
      toast.error('Terjadi kesalahan saat menambahkan kelas');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCommissionTypeChange = (type: CommissionType) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kelas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Kelas Baru</DialogTitle>
          <DialogDescription>
            Masukkan data kelas pembelajaran yang akan dibuat
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Kelas *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Contoh: Kelas Pemrograman Web A"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxStudents">Kapasitas Maksimal *</Label>
              <Input
                id="maxStudents"
                type="number"
                value={formData.maxStudents}
                onChange={(e) => handleInputChange('maxStudents', e.target.value)}
                placeholder="Contoh: 20"
                min="1"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Deskripsi kelas (opsional)"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courseId">Program Kursus *</Label>
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
              <Label htmlFor="teacherId">Guru Pengajar (Opsional)</Label>
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
            <Label htmlFor="roomId">Ruangan *</Label>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalMeetings">Jumlah Pertemuan *</Label>
              <Input
                id="totalMeetings"
                type="number"
                value={formData.totalMeetings}
                onChange={(e) => handleInputChange('totalMeetings', e.target.value)}
                placeholder="Contoh: 8"
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule">Jadwal *</Label>
              <Input
                id="schedule"
                value={formData.schedule}
                onChange={(e) => handleInputChange('schedule', e.target.value)}
                placeholder="Contoh: Senin, 09:00-11:00"
                required
              />
            </div>
          </div>

          {/* Commission Type Selector */}
          <CommissionTypeSelector
            value={formData.commissionType}
            amount={formData.commissionAmount}
            onTypeChange={handleCommissionTypeChange}
            onAmountChange={handleCommissionAmountChange}
            disabled={loading}
          />

          <div className="space-y-2 p-3 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Catatan:</strong> Tanggal mulai kelas akan terinput otomatis saat absensi pertama dilakukan, 
              dan tanggal selesai akan terinput otomatis saat kelas diselesaikan.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Siswa (Opsional)</Label>
              <span className="text-xs text-gray-500">
                {students.length} siswa tersedia
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari nama siswa, program kursus, atau status kelas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
              {filteredStudents.length > 0 ? (
                <>
                  {searchTerm && (
                    <div className="text-xs text-gray-500 mb-2 pb-2 border-b">
                      Menampilkan {filteredStudents.length} dari {students.length} siswa
                    </div>
                  )}
                  <div className="space-y-1">
                    {filteredStudents.map((student) => (
                    <div key={student.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-md">
                      <Checkbox
                        id={student.id}
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={(checked) => handleStudentToggle(student.id, checked as boolean)}
                        className="mt-1"
                      />
                      <Label htmlFor={student.id} className="text-sm cursor-pointer flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{student.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            student.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            student.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            student.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {student.status === 'confirmed' ? 'Terkonfirmasi' :
                             student.status === 'completed' ? 'Selesai' :
                             student.status === 'pending' ? 'Menunggu' :
                             student.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Program: {student.courseName || student.course?.name || 'Tidak diketahui'}
                        </div>
                        <div className={`text-xs font-medium mt-1 ${
                          student.className && student.className !== 'Belum ada kelas' 
                            ? 'text-blue-600' 
                            : 'text-orange-600'
                        }`}>
                          {student.className && student.className !== 'Belum ada kelas' 
                            ? `Kelas: ${student.className}` 
                            : 'Belum masuk kelas'
                          }
                        </div>
                      </Label>
                    </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  {searchTerm ? 'Tidak ada siswa yang cocok dengan pencarian' : 'Tidak ada siswa yang tersedia'}
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
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}