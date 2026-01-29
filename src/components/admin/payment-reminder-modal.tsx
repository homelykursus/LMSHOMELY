'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, MessageCircle, Phone, X } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  studentDateOfBirth?: string | null; // Tambahkan tanggal lahir untuk menghitung usia
  courseName: string;
  remainingAmount: number;
  whatsappNumber: string;
  paymentId: string;
  onReminderDismissed?: () => void;
}

export default function PaymentReminderModal({
  isOpen,
  onClose,
  studentName,
  studentDateOfBirth,
  courseName,
  remainingAmount,
  whatsappNumber,
  paymentId,
  onReminderDismissed
}: PaymentReminderModalProps) {
  const [copying, setCopying] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  // Function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string | null | undefined): number | null => {
    if (!dateOfBirth) return null;
    
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      
      // Check if the date is valid
      if (isNaN(birthDate.getTime())) return null;
      
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      // Adjust age if birthday hasn't occurred this year
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age >= 0 ? age : null;
    } catch (error) {
      console.error('Error calculating age:', error);
      return null;
    }
  };

  const age = calculateAge(studentDateOfBirth);
  const displayName = age !== null ? `${studentName} (${age})` : studentName;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const reminderText = `Halo kak,

Mohon maaf Izin Mengingatkan untuk Sisa Pembayaran Kursus

Kak *${displayName}*
Program *${courseName}*
masih tersisa *${formatCurrency(remainingAmount)}* ya kak. 🙏

Untuk Pembayaran bisa melalui Transfer atau Cash ya kak 🙏

Terimakasih kak 😊

_by Admin_`;

  const dismissReminder = async () => {
    try {
      const response = await fetch('/api/payments/dismiss-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: paymentId,
          dismissedBy: 'admin'
        }),
      });

      if (response.ok) {
        console.log('Reminder dismissed successfully');
        onReminderDismissed?.();
        return true;
      } else {
        const errorData = await response.json();
        console.error('Failed to dismiss reminder:', errorData);
        throw new Error(errorData.error || 'Failed to dismiss reminder');
      }
    } catch (error) {
      console.error('Error dismissing reminder:', error);
      throw error;
    }
  };

  const handleCopyText = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(reminderText);
      toast.success('Teks berhasil disalin ke clipboard');
      
      // Dismiss reminder after successful copy
      try {
        await dismissReminder();
      } catch (dismissError) {
        console.error('Failed to dismiss reminder after copy:', dismissError);
        // Don't fail the copy operation if dismiss fails
      }
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Failed to copy text:', error);
      toast.error('Gagal menyalin teks');
    } finally {
      setCopying(false);
    }
  };

  const handleSendWhatsApp = async () => {
    setSendingWhatsApp(true);
    try {
      // Clean phone number (remove non-digits and ensure it starts with 62)
      let cleanNumber = whatsappNumber.replace(/\D/g, '');
      
      // Convert 08xxx to 628xxx
      if (cleanNumber.startsWith('08')) {
        cleanNumber = '62' + cleanNumber.substring(1);
      }
      
      // Ensure it starts with 62
      if (!cleanNumber.startsWith('62')) {
        cleanNumber = '62' + cleanNumber;
      }

      // Encode the message for URL
      const encodedMessage = encodeURIComponent(reminderText);
      
      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
      
      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');
      
      toast.success('Membuka WhatsApp...');
      
      // Dismiss reminder after successful WhatsApp open
      try {
        await dismissReminder();
      } catch (dismissError) {
        console.error('Failed to dismiss reminder after WhatsApp:', dismissError);
        // Don't fail the WhatsApp operation if dismiss fails
      }
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      toast.error('Gagal membuka WhatsApp');
    } finally {
      setSendingWhatsApp(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-orange-600" />
            Reminder Pembayaran
          </DialogTitle>
          <DialogDescription>
            Template pesan reminder untuk {displayName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Student Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Siswa:</span>
              <span className="font-semibold">{displayName}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Program:</span>
              <span className="text-sm">{courseName}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Sisa Bayar:</span>
              <Badge variant="destructive" className="bg-red-100 text-red-800">
                {formatCurrency(remainingAmount)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">WhatsApp:</span>
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-gray-500" />
                <span className="text-sm">{whatsappNumber}</span>
              </div>
            </div>
          </div>

          {/* Message Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Template Pesan:</label>
            <div className="bg-white border rounded-lg p-3 max-h-48 overflow-y-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                {reminderText}
              </pre>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCopyText}
              disabled={copying}
              className="flex-1"
            >
              {copying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Menyalin...
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Salin Teks
                </>
              )}
            </Button>
            
            <Button
              onClick={handleSendWhatsApp}
              disabled={sendingWhatsApp}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {sendingWhatsApp ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Mengirim...
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Kirim WhatsApp
                </>
              )}
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full"
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}