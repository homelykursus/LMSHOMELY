'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, AlertTriangle } from 'lucide-react';

interface PaymentDismissHistoryProps {
  reminderDismissedAt?: string | null;
  reminderDismissedBy?: string | null;
}

export default function PaymentDismissHistory({
  reminderDismissedAt,
  reminderDismissedBy
}: PaymentDismissHistoryProps) {
  if (!reminderDismissedAt) {
    return null;
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const dismissedDate = formatDateTime(reminderDismissedAt);

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-orange-800">
          <AlertTriangle className="h-4 w-4" />
          Status Reminder
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-orange-700">Status:</span>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Dismissed
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-orange-700 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Tanggal:
            </span>
            <span className="text-sm font-medium text-orange-900">
              {dismissedDate.date} • {dismissedDate.time}
            </span>
          </div>
          
          {reminderDismissedBy && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-orange-700 flex items-center gap-1">
                <User className="h-3 w-3" />
                Oleh:
              </span>
              <span className="text-sm font-medium text-orange-900 capitalize">
                {reminderDismissedBy}
              </span>
            </div>
          )}
          
          <div className="mt-3 p-2 bg-orange-100 rounded text-xs text-orange-800">
            💡 Reminder akan muncul lagi setelah 3 pertemuan berikutnya
          </div>
        </div>
      </CardContent>
    </Card>
  );
}