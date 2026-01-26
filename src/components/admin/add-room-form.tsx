'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface AddRoomFormProps {
  onRoomAdded: () => void;
}

export default function AddRoomForm({ onRoomAdded }: AddRoomFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: '',
    floor: '',
    building: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      capacity: '',
      floor: '',
      building: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nama ruangan wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          floor: formData.floor.trim() || null,
          building: formData.building.trim() || null
        }),
      });

      if (response.ok) {
        toast.success('Ruangan berhasil ditambahkan');
        resetForm();
        setIsOpen(false);
        onRoomAdded();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Gagal menambahkan ruangan');
      }
    } catch (error) {
      console.error('Error adding room:', error);
      toast.error('Terjadi kesalahan saat menambahkan ruangan');
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Ruangan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Ruangan Baru</DialogTitle>
          <DialogDescription>
            Masukkan data ruangan yang akan ditambahkan
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Ruangan *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Contoh: Lab Komputer 1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Deskripsi ruangan (opsional)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Kapasitas</Label>
            <Input
              id="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => handleInputChange('capacity', e.target.value)}
              placeholder="Contoh: 30"
              min="1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="building">Gedung</Label>
              <Input
                id="building"
                value={formData.building}
                onChange={(e) => handleInputChange('building', e.target.value)}
                placeholder="Contoh: A"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="floor">Lantai</Label>
              <Input
                id="floor"
                value={formData.floor}
                onChange={(e) => handleInputChange('floor', e.target.value)}
                placeholder="Contoh: 1"
              />
            </div>
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