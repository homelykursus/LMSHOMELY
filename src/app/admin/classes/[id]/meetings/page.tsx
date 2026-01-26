'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Plus,
  Edit,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  UserX,
  ArrowLeft,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

interface Class {
  id: string;
  name: string;
  description?: string | null;
  totalMeetings: number;
  completedMeetings: number;
  isActive: boolean;
  course: {
    name: string;
    category: string;
  };
  teacher: {
    name: string;
  };
  room: {
    name: string;
  };
  students: Array<{
    id: string;
    student: {
      id: string;
      name: string;
      whatsapp: string;
    };
  }>;
}

interface ClassMeeting {
  id: string;
  meetingNumber: number;
  date: string;
  startTime: string;
  endTime?: string | null;
  topic?: string | null;
  notes?: string | null;
  isCompleted: boolean;
  attendances: Array<{
    id: string;
    status: string;
    notes?: string | null;
    classStudent: {
      student: {
        name: string;
      };
    };
  }>;
}

export default function ClassMeetingsPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;

  const [classData, setClassData] = useState<Class | null>(null);
  const [meetings, setMeetings] = useState<ClassMeeting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState<boolean>(false);
  const [selectedMeeting, setSelectedMeeting] = useState<ClassMeeting | null>(null);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState<boolean>(false);
  
  const [meetingForm, setMeetingForm] = useState({
    meetingNumber: 1,
    date: '',
    startTime: '',
    endTime: '',
    topic: '',
    notes: ''
  });

  useEffect(() => {
    if (classId) {
      fetchClassData();
      fetchMeetings();
    }
  }, [classId]);

  const fetchClassData = async () => {
    try {
      const response = await fetch(`/api/classes/${classId}`);
      const data = await response.json();
      setClassData(data);
      setMeetingForm(prev => ({
        ...prev,
        meetingNumber: data.completedMeetings + 1
      }));
    } catch (error) {
      console.error('Error fetching class data:', error);
      toast.error('Gagal memuat data kelas');
    }
  };

  const fetchMeetings = async () => {
    try {
      const response = await fetch(`/api/classes/${classId}/meetings`);
      const data = await response.json();
      setMeetings(data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast.error('Gagal memuat data pertemuan');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/classes/${classId}/meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingForm),
      });

      if (response.ok) {
        await fetchMeetings();
        await fetchClassData();
        setIsAddMeetingOpen(false);
        resetMeetingForm();
        toast.success('Pertemuan berhasil ditambahkan');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Gagal menambahkan pertemuan');
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast.error('Terjadi kesalahan saat menambahkan pertemuan');
    }
  };

  const handleUpdateAttendance = async (meetingId: string, attendanceData: any) => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}/attendance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceData),
      });

      if (response.ok) {
        await fetchMeetings();
        setIsAttendanceDialogOpen(false);
        toast.success('Absensi berhasil diperbarui');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Gagal memperbarui absensi');
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('Terjadi kesalahan saat memperbarui absensi');
    }
  };

  const resetMeetingForm = () => {
    setMeetingForm({
      meetingNumber: classData ? classData.completedMeetings + 1 : 1,
      date: '',
      startTime: '',
      endTime: '',
      topic: '',
      notes: ''
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge variant="default" className="bg-green-100 text-green-800">Hadir</Badge>;
      case 'absent':
        return <Badge variant="destructive">Tidak Hadir</Badge>;
      case 'late':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Terlambat</Badge>;
      case 'excused':
        return <Badge variant="outline">Izin</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'absent':
        return <UserX className="h-4 w-4 text-red-600" />;
      case 'late':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'excused':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Kelas tidak ditemukan</h2>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pertemuan Kelas</h1>
            <p className="text-gray-600">
              {classData.name} - {classData.course.name}
            </p>
          </div>
        </div>
        
        <Dialog open={isAddMeetingOpen} onOpenChange={setIsAddMeetingOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Pertemuan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Pertemuan Baru</DialogTitle>
              <DialogDescription>
                Tambahkan jadwal pertemuan kelas baru
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meetingNumber">Pertemuan Ke</Label>
                <Input
                  id="meetingNumber"
                  type="number"
                  min="1"
                  value={meetingForm.meetingNumber || ''}
                  onChange={(e) => setMeetingForm({...meetingForm, meetingNumber: parseInt(e.target.value) || 0})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Tanggal</Label>
                <Input
                  id="date"
                  type="date"
                  value={meetingForm.date}
                  onChange={(e) => setMeetingForm({...meetingForm, date: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Waktu Mulai</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={meetingForm.startTime}
                    onChange={(e) => setMeetingForm({...meetingForm, startTime: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">Waktu Selesai</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={meetingForm.endTime}
                    onChange={(e) => setMeetingForm({...meetingForm, endTime: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="topic">Topik/Materi</Label>
                <Input
                  id="topic"
                  value={meetingForm.topic}
                  onChange={(e) => setMeetingForm({...meetingForm, topic: e.target.value})}
                  placeholder="Contoh: Pengenalan HTML"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  value={meetingForm.notes}
                  onChange={(e) => setMeetingForm({...meetingForm, notes: e.target.value})}
                  rows={3}
                  placeholder="Catatan tambahan tentang pertemuan..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddMeetingOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Simpan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pertemuan</p>
                <p className="text-2xl font-bold">{classData.totalMeetings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Selesai</p>
                <p className="text-2xl font-bold">{classData.completedMeetings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tersisa</p>
                <p className="text-2xl font-bold">{classData.totalMeetings - classData.completedMeetings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Siswa</p>
                <p className="text-2xl font-bold">{classData.students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meetings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pertemuan</CardTitle>
          <CardDescription>
            Menampilkan {meetings.length} pertemuan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {meetings.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pertemuan</TableHead>
                    <TableHead>Tanggal & Waktu</TableHead>
                    <TableHead>Topik</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Absensi</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meetings.map((meeting) => (
                    <TableRow key={meeting.id}>
                      <TableCell>
                        <div className="font-medium">Pertemuan {meeting.meetingNumber}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(meeting.date).toLocaleDateString('id-ID')}</div>
                          <div className="text-gray-500">
                            {meeting.startTime} {meeting.endTime && `- ${meeting.endTime}`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {meeting.topic || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={meeting.isCompleted ? "default" : "secondary"}>
                          {meeting.isCompleted ? 'Selesai' : 'Belum'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {meeting.attendances.filter(a => a.status === 'present').length}/{classData.students.length} Hadir
                          </div>
                          <div className="text-xs text-gray-500">
                            {meeting.attendances.filter(a => a.status === 'present').length} hadir, 
                            {meeting.attendances.filter(a => a.status === 'absent').length} tidak hadir
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedMeeting(meeting);
                              setIsAttendanceDialogOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Users className="h-4 w-4 mr-1" />
                            Absensi
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada data pertemuan
              </h3>
              <p className="text-gray-500">
                Tambahkan pertemuan pertama untuk memulai absensi
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Dialog */}
      {selectedMeeting && (
        <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Absensi Pertemuan {selectedMeeting.meetingNumber}</DialogTitle>
              <DialogDescription>
                {new Date(selectedMeeting.date).toLocaleDateString('id-ID')} - {selectedMeeting.topic || 'Tidak ada topik'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Catatan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classData.students.map((classStudent) => {
                      const attendance = selectedMeeting.attendances.find(
                        a => a.classStudent.student.id === classStudent.student.id
                      );
                      
                      return (
                        <TableRow key={classStudent.student.id}>
                          <TableCell className="font-medium">
                            {classStudent.student.name}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={attendance?.status || 'present'}
                              onValueChange={(value) => {
                                const updatedAttendances = selectedMeeting.attendances.map(a =>
                                  a.classStudent.student.id === classStudent.student.id
                                    ? { ...a, status: value }
                                    : a
                                );
                                
                                // If no attendance record exists, create one
                                if (!attendance) {
                                  updatedAttendances.push({
                                    id: '',
                                    status: value,
                                    notes: '',
                                    classStudent: {
                                      student: classStudent.student
                                    }
                                  });
                                }
                                
                                setSelectedMeeting({
                                  ...selectedMeeting,
                                  attendances: updatedAttendances
                                });
                              }}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="present">Hadir</SelectItem>
                                <SelectItem value="absent">Tidak Hadir</SelectItem>
                                <SelectItem value="late">Terlambat</SelectItem>
                                <SelectItem value="excused">Izin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Catatan..."
                              value={attendance?.notes || ''}
                              onChange={(e) => {
                                const updatedAttendances = selectedMeeting.attendances.map(a =>
                                  a.classStudent.student.id === classStudent.student.id
                                    ? { ...a, notes: e.target.value }
                                    : a
                                );
                                
                                // If no attendance record exists, create one
                                if (!attendance) {
                                  updatedAttendances.push({
                                    id: '',
                                    status: 'present',
                                    notes: e.target.value,
                                    classStudent: {
                                      student: classStudent.student
                                    }
                                  });
                                }
                                
                                setSelectedMeeting({
                                  ...selectedMeeting,
                                  attendances: updatedAttendances
                                });
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAttendanceDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  onClick={() => {
                    const attendanceData = {
                      attendances: selectedMeeting.attendances.map(a => ({
                        studentId: a.classStudent.student.id,
                        status: a.status,
                        notes: a.notes
                      }))
                    };
                    handleUpdateAttendance(selectedMeeting.id, attendanceData);
                  }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Simpan Absensi
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}