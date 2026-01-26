'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Calculator, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ClassMeeting {
  id: string;
  meetingNumber: number;
  date: string;
  calculatedCommission?: number | null;
  commissionBreakdown?: string | null;
  class: {
    commissionType: 'BY_CLASS' | 'BY_STUDENT';
    commissionAmount: number;
    name: string;
  };
}

interface CommissionDisplayProps {
  meeting: ClassMeeting;
  showDetails?: boolean;
  compact?: boolean;
}

export default function CommissionDisplay({ 
  meeting, 
  showDetails = true, 
  compact = false 
}: CommissionDisplayProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCommissionTypeLabel = (type: 'BY_CLASS' | 'BY_STUDENT') => {
    return type === 'BY_CLASS' ? 'Per Kelas' : 'Per Siswa';
  };

  const getCommissionTypeColor = (type: 'BY_CLASS' | 'BY_STUDENT') => {
    return type === 'BY_CLASS' 
      ? 'bg-blue-100 text-blue-800 border-blue-200' 
      : 'bg-green-100 text-green-800 border-green-200';
  };

  const hasCommissionData = meeting.calculatedCommission !== null && meeting.calculatedCommission !== undefined;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-green-600" />
        <div className="text-sm">
          {hasCommissionData ? (
            <span className="font-medium text-green-600">
              {formatCurrency(meeting.calculatedCommission!)}
            </span>
          ) : (
            <span className="text-gray-500">Belum dihitung</span>
          )}
        </div>
        <Badge 
          variant="outline" 
          className={`text-xs ${getCommissionTypeColor(meeting.class.commissionType)}`}
        >
          {getCommissionTypeLabel(meeting.class.commissionType)}
        </Badge>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5 text-green-600" />
          Komisi Guru - Pertemuan {meeting.meetingNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Commission Type */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Tipe Komisi:</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    {meeting.class.commissionType === 'BY_CLASS' 
                      ? 'Komisi tetap per pertemuan, tidak bergantung pada jumlah siswa yang hadir.'
                      : 'Komisi berdasarkan jumlah siswa yang hadir (HADIR + TERLAMBAT).'
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Badge 
            variant="outline" 
            className={getCommissionTypeColor(meeting.class.commissionType)}
          >
            {getCommissionTypeLabel(meeting.class.commissionType)}
          </Badge>
        </div>

        {/* Base Commission Amount */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">
            {meeting.class.commissionType === 'BY_CLASS' ? 'Komisi per Kelas:' : 'Komisi per Siswa:'}
          </span>
          <span className="font-semibold">
            {formatCurrency(meeting.class.commissionAmount)}
          </span>
        </div>

        {/* Calculated Commission */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Komisi Pertemuan Ini:</span>
            <div className="text-right">
              {hasCommissionData ? (
                <div className="font-bold text-lg text-green-600">
                  {formatCurrency(meeting.calculatedCommission!)}
                </div>
              ) : (
                <div className="text-gray-500 italic">
                  Belum dihitung
                </div>
              )}
            </div>
          </div>

          {/* Commission Breakdown */}
          {hasCommissionData && meeting.commissionBreakdown && showDetails && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Calculator className="h-4 w-4 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Rincian Perhitungan:</p>
                  <p className="text-sm text-gray-800">{meeting.commissionBreakdown}</p>
                </div>
              </div>
            </div>
          )}

          {/* No Commission Explanation */}
          {hasCommissionData && meeting.calculatedCommission === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-yellow-800 mb-1">Tidak Ada Komisi:</p>
                  <p className="text-sm text-yellow-700">
                    Tidak ada siswa dengan status HADIR atau TERLAMBAT pada pertemuan ini.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Class Information */}
        {showDetails && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>Kelas: {meeting.class.name}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Tanggal: {new Date(meeting.date).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Summary component for multiple meetings
interface CommissionSummaryProps {
  meetings: ClassMeeting[];
  className?: string;
}

export function CommissionSummary({ meetings, className = '' }: CommissionSummaryProps) {
  const totalCommission = meetings.reduce((sum, meeting) => {
    return sum + (meeting.calculatedCommission || 0);
  }, 0);

  const meetingsWithCommission = meetings.filter(m => 
    m.calculatedCommission !== null && m.calculatedCommission !== undefined
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5 text-green-600" />
          Ringkasan Komisi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Pertemuan</p>
            <p className="text-2xl font-bold">{meetings.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Pertemuan Terhitung</p>
            <p className="text-2xl font-bold text-blue-600">{meetingsWithCommission.length}</p>
          </div>
        </div>
        
        <div className="border-t pt-3">
          <p className="text-sm text-gray-600 mb-1">Total Komisi</p>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(totalCommission)}</p>
        </div>

        {meetingsWithCommission.length > 0 && (
          <div className="text-xs text-gray-500">
            Rata-rata per pertemuan: {formatCurrency(totalCommission / meetingsWithCommission.length)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}