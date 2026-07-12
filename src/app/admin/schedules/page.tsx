'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Edit, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface Schedule {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export default function SchedulesManagement() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    isActive: true
  });

  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog();

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/schedules');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Gagal memuat data jadwal');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Nama jadwal wajib diisi');
      return;
    }

    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Jadwal berhasil ditambahkan');
        setIsAddDialogOpen(false);
        setFormData({ name: '', isActive: true });
        fetchSchedules();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Gagal menambahkan jadwal');
      }
    } catch (error) {
      console.error('Error adding schedule:', error);
      toast.error('Terjadi kesalahan saat menambahkan jadwal');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchedule) return;
    if (!formData.name.trim()) {
      toast.error('Nama jadwal wajib diisi');
      return;
    }

    try {
      const response = await fetch(`/api/schedules/${currentSchedule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Jadwal berhasil diperbarui');
        setIsEditDialogOpen(false);
        fetchSchedules();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Gagal memperbarui jadwal');
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Terjadi kesalahan saat memperbarui jadwal');
    }
  };

  const handleDelete = (id: string, name: string) => {
    showConfirmation({
      title: 'Hapus Jadwal',
      description: `Apakah Anda yakin ingin menghapus jadwal "${name}"? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/schedules/${id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            toast.success('Jadwal berhasil dihapus');
            fetchSchedules();
          } else {
            const data = await response.json();
            toast.error(data.error || 'Gagal menghapus jadwal');
          }
        } catch (error) {
          console.error('Error deleting schedule:', error);
          toast.error('Terjadi kesalahan saat menghapus jadwal');
        }
      }
    });
  };

  const openEditDialog = (schedule: Schedule) => {
    setCurrentSchedule(schedule);
    setFormData({
      name: schedule.name,
      isActive: schedule.isActive
    });
    setIsEditDialogOpen(true);
  };

  const filteredSchedules = schedules.filter(schedule => 
    schedule.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Master Jadwal</h1>
          <p className="text-gray-500 mt-1">Kelola daftar pilihan jadwal untuk kelas</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setFormData({ name: '', isActive: true });
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Tambah Jadwal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Jadwal Baru</DialogTitle>
              <DialogDescription>
                Tambahkan pilihan jadwal baru yang akan muncul di form pendaftaran kelas.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Jadwal <span className="text-red-500">*</span></Label>
                <Input 
                  id="name" 
                  placeholder="Contoh: Senin, Rabu, Jumat 08:00 - 09:30" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label>Status Aktif</Label>
                  <p className="text-sm text-gray-500">
                    Jadwal akan muncul di pilihan jika aktif
                  </p>
                </div>
                <Switch 
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="button" variant="outline" className="mr-2" onClick={() => setIsAddDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">Simpan</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Jadwal</DialogTitle>
            <DialogDescription>
              Ubah informasi jadwal ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama Jadwal <span className="text-red-500">*</span></Label>
              <Input 
                id="edit-name" 
                placeholder="Contoh: Senin, Rabu, Jumat 08:00 - 09:30" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label>Status Aktif</Label>
                <p className="text-sm text-gray-500">
                  Jadwal akan muncul di pilihan jika aktif
                </p>
              </div>
              <Switch 
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" className="mr-2" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan Perubahan</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Daftar Jadwal</CardTitle>
              <CardDescription>Menampilkan {filteredSchedules.length} jadwal yang terdaftar</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Cari jadwal..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Belum ada jadwal</h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm ? 'Tidak ada jadwal yang cocok dengan pencarian Anda.' : 'Silakan tambahkan jadwal baru untuk kelas.'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">No</TableHead>
                    <TableHead>Nama Jadwal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchedules.map((schedule, index) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="font-medium">{schedule.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {schedule.isActive ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">
                            <CheckCircle className="w-3 h-3 mr-1" /> Aktif
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500 bg-gray-100">
                            <XCircle className="w-3 h-3 mr-1" /> Nonaktif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openEditDialog(schedule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDelete(schedule.id, schedule.name)}
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
          )}
        </CardContent>
      </Card>

      <ConfirmationDialog />
    </div>
  );
}
