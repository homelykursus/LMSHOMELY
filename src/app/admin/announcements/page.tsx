'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { RunningText } from '@/components/ui/running-text';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Megaphone, Plus, Edit, Trash2, Eye, EyeOff, User } from 'lucide-react';
import { toast } from 'sonner';

interface Announcement {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  priority: number;
  targetRole: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isActive: true,
    priority: 1,
    targetRole: 'teacher'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/admin/announcements');
      if (response.ok) {
        const result = await response.json();
        setAnnouncements(result.data || []);
      } else {
        toast.error('Gagal memuat pengumuman');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Terjadi kesalahan saat memuat pengumuman');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingAnnouncement 
        ? `/api/admin/announcements/${editingAnnouncement.id}`
        : '/api/admin/announcements';
      
      const method = editingAnnouncement ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingAnnouncement ? 'Pengumuman berhasil diperbarui' : 'Pengumuman berhasil dibuat');
        setIsDialogOpen(false);
        resetForm();
        fetchAnnouncements();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal menyimpan pengumuman');
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error('Terjadi kesalahan saat menyimpan pengumuman');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Pengumuman berhasil dihapus');
        fetchAnnouncements();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal menghapus pengumuman');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Terjadi kesalahan saat menghapus pengumuman');
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      isActive: announcement.isActive,
      priority: announcement.priority,
      targetRole: announcement.targetRole
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      isActive: true,
      priority: 1,
      targetRole: 'teacher'
    });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner message="Memuat pengumuman..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Pengumuman</h1>
          <p className="text-gray-600">Buat dan kelola pengumuman untuk guru</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Pengumuman
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingAnnouncement ? 'Edit Pengumuman' : 'Tambah Pengumuman Baru'}
              </DialogTitle>
              <DialogDescription>
                Buat pengumuman yang akan ditampilkan di dashboard guru dengan teks berjalan.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Judul Pengumuman</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Masukkan judul pengumuman"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="content">Isi Pengumuman (Teks Berjalan)</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Masukkan isi pengumuman yang akan ditampilkan sebagai teks berjalan"
                    rows={3}
                    required
                  />
                </div>

                {/* Preview */}
                {formData.content && (
                  <div className="grid gap-2">
                    <Label>Preview Teks Berjalan</Label>
                    <div className="bg-blue-50 rounded-lg p-3 overflow-hidden border">
                      <RunningText 
                        text={formData.content}
                        className="text-blue-800 font-medium"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Prioritas</Label>
                    <Select 
                      value={formData.priority.toString()} 
                      onValueChange={(value) => setFormData({ ...formData, priority: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Tertinggi</SelectItem>
                        <SelectItem value="2">2 - Tinggi</SelectItem>
                        <SelectItem value="3">3 - Normal</SelectItem>
                        <SelectItem value="4">4 - Rendah</SelectItem>
                        <SelectItem value="5">5 - Terendah</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="targetRole">Target</Label>
                    <Select 
                      value={formData.targetRole} 
                      onValueChange={(value) => setFormData({ ...formData, targetRole: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teacher">Guru</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="all">Semua</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Aktif (ditampilkan)</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : (editingAnnouncement ? 'Perbarui' : 'Simpan')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Megaphone className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pengumuman</p>
                <p className="text-2xl font-bold">{announcements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pengumuman Aktif</p>
                <p className="text-2xl font-bold">{announcements.filter(a => a.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <EyeOff className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pengumuman Nonaktif</p>
                <p className="text-2xl font-bold">{announcements.filter(a => !a.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Target Guru</p>
                <p className="text-2xl font-bold">{announcements.filter(a => a.targetRole === 'teacher').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-blue-600" />
            Daftar Pengumuman
          </CardTitle>
          <CardDescription>
            Menampilkan {announcements.length} pengumuman yang telah dibuat
          </CardDescription>
        </CardHeader>
        <CardContent>
          {announcements.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Judul</TableHead>
                    <TableHead>Isi Pengumuman</TableHead>
                    <TableHead>Preview</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Prioritas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map((announcement, index) => (
                    <TableRow key={announcement.id}>
                      <TableCell className="font-medium text-center">{index + 1}</TableCell>
                      <TableCell>
                        <div className="font-medium">{announcement.title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm text-gray-600">
                          {announcement.content}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-48 bg-blue-50 rounded p-2 overflow-hidden border border-blue-200">
                          <RunningText 
                            text={announcement.content}
                            className="text-blue-800 text-xs font-medium"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {announcement.targetRole === 'teacher' ? 'Guru' : 
                           announcement.targetRole === 'admin' ? 'Admin' : 'Semua'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {announcement.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={announcement.isActive ? 'default' : 'secondary'}>
                          {announcement.isActive ? (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Aktif
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Nonaktif
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {new Date(announcement.createdAt).toLocaleDateString('id-ID')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(announcement)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Edit Pengumuman"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                title="Hapus Pengumuman"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Pengumuman</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus pengumuman "{announcement.title}"? 
                                  Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(announcement.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Megaphone className="h-16 w-16 mx-auto mb-4 opacity-50 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada pengumuman</h3>
              <p className="text-sm text-gray-500 mb-4">
                Klik "Tambah Pengumuman" untuk membuat pengumuman pertama
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}