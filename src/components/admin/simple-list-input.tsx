'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';

interface SimpleListInputProps {
  label: string;
  icon: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  borderColor?: string;
  bgColor?: string;
  textColor?: string;
}

export function SimpleListInput({ 
  label, 
  icon, 
  value, 
  onChange, 
  placeholder = 'Masukkan item',
  borderColor = 'border-green-200',
  bgColor = 'bg-green-50',
  textColor = 'text-green-900'
}: SimpleListInputProps) {
  // Ensure value is always an array
  const safeValue = Array.isArray(value) ? value : [];

  const addItem = () => {
    onChange([...safeValue, '']);
  };

  const removeItem = (index: number) => {
    const newValue = safeValue.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const updateItem = (index: number, text: string) => {
    const newValue = [...safeValue];
    newValue[index] = text;
    onChange(newValue);
  };

  return (
    <div className={`space-y-4 p-4 border-2 ${borderColor} rounded-lg ${bgColor}`}>
      <div className="flex items-center justify-between">
        <Label className={`text-base font-semibold ${textColor}`}>{icon} {label}</Label>
        <Button type="button" size="sm" onClick={addItem} className="flex items-center gap-1">
          <Plus className="w-4 h-4" />
          Tambah
        </Button>
      </div>

      {safeValue.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">Belum ada item. Klik "Tambah" untuk menambahkan.</p>
      ) : (
        <div className="space-y-2">
          {safeValue.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600 w-6">{index + 1}.</span>
              <Input
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-white"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => removeItem(index)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
