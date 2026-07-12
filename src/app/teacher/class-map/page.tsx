'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Map, Users, BookOpen, Clock, Filter, X, DoorOpen } from 'lucide-react';
import { toast } from 'sonner';

interface Class {
  id: string;
  name: string;
  schedule: string;
  roomId: string;
  room: { id: string, name: string };
  teacherId: string | null;
  teacher: { id: string, name: string } | null;
  isActive: boolean;
  students: any[];
  maxStudents: number;
  totalMeetings: number;
  completedMeetings: number;
  startDate: string | null;
  endDate: string | null;
  meetings?: { date: string }[];
}

interface Teacher {
  id: string;
  name: string;
}

interface Room {
  id: string;
  name: string;
}

const determineClassStatus = (classItem: Class): 'WAITING' | 'ONGOING' | 'COMPLETED' => {
  if (classItem.endDate) {
    return 'COMPLETED';
  }
  if (classItem.startDate && classItem.completedMeetings > 0) {
    return 'ONGOING';
  }
  return 'WAITING';
};

const calculateDaysDifference = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    
    // Use Asia/Jakarta explicitly for calendar date comparison
    const getJakartaTime = (d: Date) => {
      const str = d.toLocaleDateString('en-US', { timeZone: 'Asia/Jakarta' });
      return new Date(str).getTime();
    };
    
    const diffInTime = getJakartaTime(now) - getJakartaTime(date);
    return Math.floor(diffInTime / (1000 * 60 * 60 * 24));
  } catch (e) {
    return 0;
  }
};

const getTimeAgo = (dateString: string) => {
  const diffInDays = calculateDaysDifference(dateString);
  
  if (diffInDays === 0) return 'Hari ini';
  if (diffInDays === 1) return 'Kemarin';
  if (diffInDays < 0) return 'Hari ini';
  return `${diffInDays} hari lalu`;
};

const getTimeColor = (dateString: string) => {
  const diffInDays = calculateDaysDifference(dateString);
  
  if (diffInDays < 7) return 'text-green-600';
  if (diffInDays <= 30) return 'text-amber-600';
  return 'text-red-600';
};

const formatTeacherName = (name: string) => {
  if (!name) return '';
  return name.split(' ')[0];
};

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const TIME_SLOTS = [
  "08:00 - 09:30",
  "10:00 - 11:30",
  "12:00 - 13:30",
  "14:00 - 15:30",
  "16:00 - 17:30",
  "18:00 - 19:30",
  "20:00 - 21:30"
];

// Helper to check if a class schedule string matches a day and time slot
const classMatchesSlot = (schedule: string, day: string, timeSlot: string) => {
  if (!schedule) return false;
  
  const normalizedSchedule = schedule.toLowerCase();
  const normalizedDay = day.toLowerCase();
  
  // Create variants of time slot to handle minor formatting differences
  // e.g., "08:00 - 09:30" -> "08:00-09:30", "08.00 - 09.30", "08.00-09.30"
  const timeVariants = [
    timeSlot,
    timeSlot.replace(/\s/g, ''),
    timeSlot.replace(/:/g, '.'),
    timeSlot.replace(/\s/g, '').replace(/:/g, '.')
  ];
  
  const hasDay = normalizedSchedule.includes(normalizedDay);
  const hasTime = timeVariants.some(variant => normalizedSchedule.includes(variant.toLowerCase()));
  
  return hasDay && hasTime;
};

export default function ClassMap() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    Promise.all([
      fetchClasses(),
      fetchRooms()
    ]).finally(() => setLoading(false));
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/teacher/classes');
      if (!response.ok) throw new Error('Failed to fetch classes');
      const data = await response.json();
      const activeClasses = data.filter((c: Class) => c.isActive);
      setClasses(activeClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Gagal memuat peta kelas');
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      if (!response.ok) throw new Error('Failed to fetch rooms');
      const data = await response.json();
      setRooms(data.filter((r: any) => r.isActive));
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  // Apply filters
  const teacherAndRoomFilteredClasses = classes.filter(c => {
    const matchRoom = selectedRoom === 'all' || c.room.id === selectedRoom;
    return matchRoom;
  });

  const ongoingCount = teacherAndRoomFilteredClasses.filter(c => determineClassStatus(c) === 'ONGOING').length;
  const waitingCount = teacherAndRoomFilteredClasses.filter(c => determineClassStatus(c) === 'WAITING').length;

  const filteredClasses = teacherAndRoomFilteredClasses.filter(c => {
    const classStatus = determineClassStatus(c);
    const matchStatus = selectedStatus === 'all' || classStatus === selectedStatus;
    return matchStatus;
  });

  // Build the matrix using filteredClasses
  const matrix: Record<string, Record<string, Class[]>> = {};
  TIME_SLOTS.forEach(time => {
    matrix[time] = {};
    DAYS.forEach(day => {
      matrix[time][day] = [];
    });
  });

  // Unmapped classes (don't fit the strict matrix)
  const unmappedClasses: Class[] = [];

  filteredClasses.forEach(c => {
    let isMapped = false;
    TIME_SLOTS.forEach(time => {
      DAYS.forEach(day => {
        if (classMatchesSlot(c.schedule, day, time)) {
          matrix[time][day].push(c);
          isMapped = true;
        }
      });
    });

    if (!isMapped) {
      unmappedClasses.push(c);
    }
  });

  // Sort classes so ONGOING is at the top, WAITING at the bottom
  const sortClasses = (a: Class, b: Class) => {
    const aStatus = determineClassStatus(a);
    const bStatus = determineClassStatus(b);
    if (aStatus === bStatus) return 0;
    if (aStatus === 'ONGOING') return -1;
    if (bStatus === 'ONGOING') return 1;
    return 0;
  };

  TIME_SLOTS.forEach(time => {
    DAYS.forEach(day => {
      matrix[time][day].sort(sortClasses);
    });
  });
  
  unmappedClasses.sort(sortClasses);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Peta Kelas</h1>
          <p className="text-gray-500 mt-1">Jadwal mingguan kelas yang sedang aktif</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2 w-full sm:w-[200px]">
              <label className="text-sm font-medium flex items-center">
                <Filter className="w-4 h-4 mr-2 text-gray-500" />
                Filter by Status
              </label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="ONGOING">Berjalan</SelectItem>
                  <SelectItem value="WAITING">Menunggu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 w-full sm:w-[200px]">
              <label className="text-sm font-medium flex items-center">
                <DoorOpen className="w-4 h-4 mr-2 text-gray-500" />
                Filter by Ruang
              </label>
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Ruangan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Ruangan</SelectItem>
                  {rooms.map(room => (
                    <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(selectedRoom !== 'all' || selectedStatus !== 'all') && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSelectedRoom('all');
                  setSelectedStatus('all');
                }}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Reset Filter
              </Button>
            )}

            <div className="w-full sm:w-auto sm:ml-auto flex gap-4 text-sm justify-between sm:justify-end">
              <div className="flex-1 sm:flex-none flex flex-col justify-center items-center px-4 py-1.5 bg-blue-50 border border-blue-200 rounded-md min-w-[100px] shadow-sm">
                <span className="text-blue-700 font-medium text-[10px] uppercase tracking-wider">Berjalan</span>
                <span className="text-2xl font-bold text-blue-900 leading-none mt-1">{ongoingCount}</span>
              </div>
              <div className="flex-1 sm:flex-none flex flex-col justify-center items-center px-4 py-1.5 bg-amber-50 border border-amber-200 rounded-md min-w-[100px] shadow-sm">
                <span className="text-amber-700 font-medium text-[10px] uppercase tracking-wider">Menunggu</span>
                <span className="text-2xl font-bold text-amber-900 leading-none mt-1">{waitingCount}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white rounded-lg border shadow-sm">
        <table className="w-full text-sm text-left relative">
          <thead className="bg-pink-500 text-white sticky top-0 z-20 shadow-sm">
            <tr>
              <th className="px-4 py-3 border-b border-pink-600 border-r w-[120px] font-semibold sticky left-0 top-0 bg-pink-500 z-30 text-center shadow-[1px_0_0_0_#db2777,0_1px_0_0_#db2777]">
                <Clock className="w-4 h-4 inline-block mr-2 text-pink-100" />
                Waktu
              </th>
              {DAYS.map(day => (
                <th key={day} className="px-4 py-3 border-b border-pink-600 border-r font-semibold text-center min-w-[200px] bg-pink-500 shadow-[0_1px_0_0_#db2777]">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((time, index) => (
              <tr 
                key={time} 
                className={`group/row border-b last:border-b-0 hover:bg-pink-200 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-pink-100'}`}
              >
                <td className={`px-4 py-3 border-r font-medium text-center sticky left-0 z-10 ${index % 2 === 0 ? 'bg-white' : 'bg-pink-100'} group-hover/row:bg-pink-200 transition-colors`}>
                  {time}
                </td>
                {DAYS.map(day => (
                  <td key={`${time}-${day}`} className="p-2 border-r align-top relative group">
                    <div className="flex flex-col gap-2 min-h-[80px]">
                      {matrix[time][day].length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xs italic">
                          <span>Kosong</span>
                          <span className="text-[10px] mt-1 opacity-70">{time}</span>
                        </div>
                      ) : (
                        matrix[time][day].map(c => {
                          const isWaiting = determineClassStatus(c) === 'WAITING';
                          return (
                            <div 
                              key={c.id} 
                              className={`${isWaiting ? 'bg-amber-50 border-amber-200 hover:border-amber-300' : 'bg-blue-50 border-blue-200 hover:border-blue-300'} border rounded-md p-2 shadow-sm flex flex-col gap-1 transition-colors`}
                            >
                              <div className={`font-semibold text-sm leading-tight ${isWaiting ? 'text-amber-900' : 'text-blue-900'}`}>
                                {c.name}
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <div className={`text-xs flex items-center ${isWaiting ? 'text-amber-700' : 'text-blue-700'}`} title={c.room.name}>
                                  <DoorOpen className="w-3 h-3 mr-1" />
                                  {c.room.name}
                                </div>
                                {c.teacher && (
                                  <div className={`text-xs text-gray-600 flex items-center border-l pl-3 ${isWaiting ? 'border-amber-200' : 'border-blue-200'}`} title={c.teacher.name}>
                                    <Users className="w-3 h-3 mr-1" />
                                    {formatTeacherName(c.teacher.name)}
                                  </div>
                                )}
                              </div>
                              <div className={`text-[10px] text-gray-500 flex items-center justify-between mt-2 pt-2 border-t ${isWaiting ? 'border-amber-200' : 'border-blue-200'}`}>
                                <div className="flex gap-2">
                                  <span className="flex items-center" title="Siswa">
                                    <Users className="w-3 h-3 mr-1" /> {c.students?.length || 0}/{c.maxStudents}
                                  </span>
                                  <span className="flex items-center" title="Pertemuan">
                                    <BookOpen className="w-3 h-3 mr-1" /> {c.completedMeetings || 0}/{c.totalMeetings}
                                  </span>
                                </div>
                                {!isWaiting && c.meetings && c.meetings.length > 0 && (
                                  <span suppressHydrationWarning className={`flex items-center font-medium ${getTimeColor(c.meetings[0].date)}`} title="Terakhir Pertemuan">
                                    <Clock className="w-3 h-3 mr-1" /> {getTimeAgo(c.meetings[0].date)}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {unmappedClasses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-orange-500" />
              Kelas Lainnya (Jadwal Fleksibel / Format Berbeda)
            </CardTitle>
            <CardDescription>
              Daftar kelas yang jadwalnya tidak sesuai dengan slot matriks utama di atas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {unmappedClasses.map(c => {
                const isWaiting = determineClassStatus(c) === 'WAITING';
                return (
                  <div 
                    key={c.id} 
                    className={`${isWaiting ? 'bg-amber-50 border-amber-200 hover:border-amber-300' : 'bg-gray-50 hover:border-gray-300'} border rounded-md p-3 flex flex-col gap-2 transition-colors shadow-sm`}
                  >
                    <div className={`font-semibold ${isWaiting ? 'text-amber-900' : ''}`}>{c.name}</div>
                    <Badge variant={isWaiting ? "outline" : "secondary"} className={`w-fit ${isWaiting ? 'border-amber-300 text-amber-800' : ''}`}>{c.schedule}</Badge>
                    <div className="flex items-center gap-3 mt-1">
                      <div className={`text-xs flex items-center ${isWaiting ? 'text-amber-700' : 'text-blue-700'}`} title={c.room.name}>
                        <DoorOpen className="w-3 h-3 mr-1" />
                        {c.room.name}
                      </div>
                      {c.teacher && (
                        <div className={`text-xs text-gray-600 flex items-center border-l pl-3 ${isWaiting ? 'border-amber-200' : 'border-blue-200'}`} title={c.teacher.name}>
                          <Users className="w-3 h-3 mr-1" />
                          {formatTeacherName(c.teacher.name)}
                        </div>
                      )}
                    </div>
                    <div className={`text-[10px] text-gray-500 flex items-center justify-between mt-2 pt-2 border-t ${isWaiting ? 'border-amber-200' : 'border-blue-200'}`}>
                      <div className="flex gap-2">
                        <span className="flex items-center" title="Siswa">
                          <Users className="w-3 h-3 mr-1" /> {c.students?.length || 0}/{c.maxStudents}
                        </span>
                        <span className="flex items-center" title="Pertemuan">
                          <BookOpen className="w-3 h-3 mr-1" /> {c.completedMeetings || 0}/{c.totalMeetings}
                        </span>
                      </div>
                      {!isWaiting && c.meetings && c.meetings.length > 0 && (
                        <span className={`flex items-center font-medium ${getTimeColor(c.meetings[0].date)}`} title="Terakhir Pertemuan">
                          <Clock className="w-3 h-3 mr-1" /> {getTimeAgo(c.meetings[0].date)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
