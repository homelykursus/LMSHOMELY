'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Room {
  id: string;
  name: string;
  description?: string | null;
  capacity?: number | null;
  floor?: string | null;
  building?: string | null;
  isActive: boolean;
}

interface EditRoomFormProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
  onRoomUpdated: () => void;
}

export default function EditRoomForm({ room, isOpen, onClose, onRoomUpdated }: EditRoomFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: '',
    floor: '',
    building: '',
    isActive: true
  });

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name,
        description: room.description || '',
        capacity: room.capacity?.toString() || '',
        floor: room.floor || '',
        building: room.building || '',
        isActive: room.isActive
      });
    }
  }, [room]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nama ruangan wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/rooms/${room.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          floor: formData.floor.trim() || null,
          building: formData.building.trim() || null,
          isActive: formData.isActive
        }),
      });

      if (response.ok) {
        toast.success('Data ruangan berhasil diperbarui');
        onClose();
        onRoomUpdated();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Gagal memperbarui ruangan');
      }
    } catch (error) {
      console.error('Error updating room:', error);
      toast.error('Terjadi kesalahan saat memperbarui ruangan');
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

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Ruangan</DialogTitle>
          <DialogDescription>
            Perbarui data ruangan yang ada
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nama Ruangan *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Contoh: Lab Komputer 1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Deskripsi</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Deskripsi ruangan (opsional)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-capacity">Kapasitas</Label>
            <Input
              id="edit-capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => handleInputChange('capacity', e.target.value)}
              placeholder="Contoh: 30"
              min="1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-building">Gedung</Label>
              <Input
                id="edit-building"
                value={formData.building}
                onChange={(e) => handleInputChange('building', e.target.value)}
                placeholder="Contoh: A"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-floor">Lantai</Label>
              <Input
                id="edit-floor"
                value={formData.floor}
                onChange={(e) => handleInputChange('floor', e.target.value)}
                placeholder="Contoh: 1"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="edit-isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
            />
            <Label htmlFor="edit-isActive">Ruangan Aktif</Label>
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