'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  DoorOpen, 
  Plus,
  Edit,
  Trash2,
  MapPin,
  Users,
  Building,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';
import AddRoomForm from '@/components/admin/add-room-form';
import EditRoomForm from '@/components/admin/edit-room-form';

interface Room {
  id: string;
  name: string;
  description?: string | null;
  capacity?: number | null;
  floor?: string | null;
  building?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function RoomsManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Gagal memuat data ruangan');
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    const roomName = room?.name || 'ruangan ini';
    
    if (!confirm(`Apakah Anda yakin ingin menghapus ${roomName}?`)) return;

    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchRooms();
        toast.success(`${roomName} berhasil dihapus`);
      } else {
        toast.error('Gagal menghapus ruangan');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Terjadi kesalahan saat menghapus ruangan');
    }
  };

  const handleEditRoom = (room: Room) => {
    setEditRoom(room);
    setIsEditDialogOpen(true);
  };

  const handleRoomUpdated = () => {
    fetchRooms();
    setEditRoom(null);
    setIsEditDialogOpen(false);
  };

  const stats = {
    total: rooms.length,
    active: rooms.filter(r => r.isActive).length,
    inactive: rooms.filter(r => !r.isActive).length,
    totalCapacity: rooms.reduce((sum, r) => sum + (r.capacity || 0), 0)
  };

  if (loading) {
    return (
      <LoadingSpinner 
        message="Loading..."
        subMessage="Data ruangan sedang dimuat"
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Ruang</h1>
          <p className="text-gray-600">Kelola data ruangan kursus</p>
        </div>
        <AddRoomForm onRoomAdded={fetchRooms} />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DoorOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Ruang</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ruang Aktif</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Layers className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ruang Non-Aktif</p>
                <p className="text-2xl font-bold">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Kapasitas</p>
                <p className="text-2xl font-bold">{stats.totalCapacity}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rooms Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Ruangan</CardTitle>
          <CardDescription>
            Menampilkan {rooms.length} ruangan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rooms.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Ruangan</TableHead>
                    <TableHead>Detail</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{room.name}</div>
                          {room.description && (
                            <div className="text-sm text-gray-500">{room.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {room.capacity && (
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-3 w-3" />
                              <span>Kapasitas: {room.capacity} orang</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {room.building && (
                            <div className="flex items-center gap-2 text-sm">
                              <Building className="h-3 w-3" />
                              <span>{room.building}</span>
                            </div>
                          )}
                          {room.floor && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Layers className="h-3 w-3" />
                              <span>Lantai {room.floor}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={room.isActive ? "default" : "secondary"}>
                          {room.isActive ? 'Aktif' : 'Non-Aktif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditRoom(room)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteRoom(room.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
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
              <DoorOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada data ruangan
              </h3>
              <p className="text-gray-500">
                Ruangan yang ditambahkan akan muncul di sini
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Room Dialog */}
      {isEditDialogOpen && editRoom && (
        <EditRoomForm
          room={editRoom}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onRoomUpdated={handleRoomUpdated}
        />
      )}
    </div>
  );
}