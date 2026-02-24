'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

interface SoftwareItem {
  name: string;
  icon: string;
  description: string;
}

interface SoftwareInputProps {
  value: SoftwareItem[];
  onChange: (value: SoftwareItem[]) => void;
}

export function SoftwareInput({ value, onChange }: SoftwareInputProps) {
  // Ensure value is always an array
  const safeValue = Array.isArray(value) ? value : [];

  const addSoftware = () => {
    onChange([...safeValue, { name: '', icon: '', description: '' }]);
  };

  const removeSoftware = (index: number) => {
    const newValue = safeValue.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const updateSoftware = (index: number, field: keyof SoftwareItem, text: string) => {
    const newValue = [...safeValue];
    newValue[index][field] = text;
    onChange(newValue);
  };

  return (
    <div className="space-y-4 p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold text-orange-900">💻 Software</Label>
        <Button type="button" size="sm" onClick={addSoftware} className="flex items-center gap-1">
          <Plus className="w-4 h-4" />
          Tambah Software
        </Button>
      </div>

      {safeValue.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">Belum ada software. Klik "Tambah Software" untuk menambahkan.</p>
      ) : (
        <div className="space-y-4">
          {safeValue.map((software, index) => (
            <div key={index} className="p-4 bg-white rounded-lg border border-orange-200 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Software {index + 1}</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => removeSoftware(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Nama Software</Label>
                <Input
                  value={software.name}
                  onChange={(e) => updateSoftware(index, 'name', e.target.value)}
                  placeholder="Contoh: Microsoft Word"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Icon URL</Label>
                <Input
                  value={software.icon}
                  onChange={(e) => updateSoftware(index, 'icon', e.target.value)}
                  placeholder="https://example.com/icon.png"
                />
                <p className="text-xs text-gray-500">URL gambar icon software</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Deskripsi</Label>
                <Textarea
                  value={software.description}
                  onChange={(e) => updateSoftware(index, 'description', e.target.value)}
                  placeholder="Deskripsi singkat tentang software ini"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
