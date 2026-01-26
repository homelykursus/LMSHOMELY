'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

export type CommissionType = 'BY_CLASS' | 'BY_STUDENT';

interface CommissionTypeSelectorProps {
  value: CommissionType;
  amount: string;
  onTypeChange: (type: CommissionType) => void;
  onAmountChange: (amount: string) => void;
  disabled?: boolean;
  error?: string;
}

export default function CommissionTypeSelector({
  value,
  amount,
  onTypeChange,
  onAmountChange,
  disabled = false,
  error
}: CommissionTypeSelectorProps) {
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const formatCurrency = (value: string) => {
    // Remove non-numeric characters except for digits
    const numericValue = value.replace(/[^\d]/g, '');
    
    if (!numericValue) return '';
    
    // Format with thousand separators
    return new Intl.NumberFormat('id-ID').format(parseInt(numericValue));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow only numbers and formatting characters during input
    const numericValue = inputValue.replace(/[^\d]/g, '');
    
    // Update with raw numeric value for form state
    onAmountChange(numericValue);
  };

  const getDisplayAmount = () => {
    if (focusedInput === 'amount') {
      // Show raw numeric value when focused for easier editing
      return amount;
    }
    // Show formatted value when not focused
    return formatCurrency(amount);
  };

  const getAmountLabel = () => {
    switch (value) {
      case 'BY_CLASS':
        return 'Komisi per Kelas';
      case 'BY_STUDENT':
        return 'Komisi per Siswa';
      default:
        return 'Jumlah Komisi';
    }
  };

  const getAmountPlaceholder = () => {
    switch (value) {
      case 'BY_CLASS':
        return 'Contoh: 100000';
      case 'BY_STUDENT':
        return 'Contoh: 15000';
      default:
        return 'Masukkan jumlah';
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Tipe Komisi Guru *
        </Label>
        
        <RadioGroup
          value={value}
          onValueChange={(newValue) => onTypeChange(newValue as CommissionType)}
          disabled={disabled}
          className="space-y-3"
        >
          {/* BY_CLASS Option */}
          <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <RadioGroupItem value="BY_CLASS" id="by-class" className="mt-1" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="by-class" className="font-medium cursor-pointer">
                  Komisi per Kelas (Flat Rate)
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Guru menerima komisi tetap untuk setiap pertemuan, tidak peduli berapa jumlah siswa yang hadir.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-gray-600">
                Guru mendapat komisi yang sama setiap pertemuan, terlepas dari jumlah siswa yang hadir.
              </p>
              <p className="text-xs text-blue-600">
                Contoh: Rp 100.000 per pertemuan (konsisten)
              </p>
            </div>
          </div>

          {/* BY_STUDENT Option */}
          <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <RadioGroupItem value="BY_STUDENT" id="by-student" className="mt-1" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="by-student" className="font-medium cursor-pointer">
                  Komisi per Siswa (Variable Rate)
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Komisi guru dihitung berdasarkan jumlah siswa yang hadir (status HADIR atau TERLAMBAT). Siswa dengan status IZIN atau TIDAK_HADIR tidak dihitung.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-gray-600">
                Komisi guru = (jumlah siswa hadir + terlambat) × tarif per siswa.
              </p>
              <p className="text-xs text-blue-600">
                Contoh: 5 siswa hadir × Rp 15.000 = Rp 75.000
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Commission Amount Input */}
      <div className="space-y-2">
        <Label htmlFor="commission-amount" className="text-sm font-medium">
          {getAmountLabel()} *
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
            Rp
          </span>
          <Input
            id="commission-amount"
            type="text"
            value={getDisplayAmount()}
            onChange={handleAmountChange}
            onFocus={() => setFocusedInput('amount')}
            onBlur={() => setFocusedInput(null)}
            placeholder={getAmountPlaceholder()}
            className={`pl-10 ${error ? 'border-red-500 focus:border-red-500' : ''}`}
            disabled={disabled}
            min="0"
            max="10000000"
          />
        </div>
        
        {/* Amount Guidelines */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Maksimal: Rp 10.000.000</p>
          <p>• Hanya siswa dengan status HADIR dan TERLAMBAT yang dihitung untuk komisi</p>
          {value === 'BY_STUDENT' && (
            <p>• Siswa dengan status IZIN atau TIDAK_HADIR tidak mempengaruhi komisi</p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>

      {/* Preview Calculation */}
      {amount && parseInt(amount) > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Preview Perhitungan:</h4>
          <div className="text-sm text-blue-800 space-y-1">
            {value === 'BY_CLASS' ? (
              <>
                <p>• Setiap pertemuan: <span className="font-medium">Rp {formatCurrency(amount)}</span></p>
                <p>• Komisi tidak bergantung pada jumlah siswa yang hadir</p>
              </>
            ) : (
              <>
                <p>• Per siswa yang hadir: <span className="font-medium">Rp {formatCurrency(amount)}</span></p>
                <p>• Contoh: 3 siswa hadir = <span className="font-medium">Rp {formatCurrency((parseInt(amount) * 3).toString())}</span></p>
                <p>• Contoh: 8 siswa hadir = <span className="font-medium">Rp {formatCurrency((parseInt(amount) * 8).toString())}</span></p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}