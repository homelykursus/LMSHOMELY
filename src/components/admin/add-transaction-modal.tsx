'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface AddTransactionModalProps {
  paymentId: string;
  remainingAmount: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transactionId?: string) => void;
}

export default function AddTransactionModal({
  paymentId,
  remainingAmount,
  isOpen,
  onClose,
  onSuccess
}: AddTransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: '',
    notes: '',
    createdBy: 'Admin'
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const validateForm = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Jumlah pembayaran harus lebih dari 0');
      return false;
    }

    if (parseFloat(formData.amount) > remainingAmount) {
      toast.error(`Jumlah pembayaran tidak boleh melebihi ${formatCurrency(remainingAmount)}`);
      return false;
    }

    if (!formData.paymentMethod) {
      toast.error('Metode pembayaran harus dipilih');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/payments/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          amount: parseInt(formData.amount) || 0,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
          createdBy: formData.createdBy
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Reset dismiss status after successful payment
        try {
          await fetch('/api/payments/reset-dismiss', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentId
            }),
          });
          console.log('Dismiss status reset after payment');
        } catch (resetError) {
          console.error('Error resetting dismiss status:', resetError);
          // Don't fail the whole transaction if reset fails
        }

        toast.success('Pembayaran berhasil dicatat!');
        setFormData({
          amount: '',
          paymentMethod: '',
          notes: '',
          createdBy: 'Admin'
        });
        onSuccess(result.id); // Pass transaction ID to callback
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal mencatat pembayaran');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Terjadi kesalahan saat mencatat pembayaran');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto sm:w-full">
        <DialogHeader>
          <DialogTitle>Tambah Pembayaran</DialogTitle>
          <DialogDescription>
            Catat pembayaran angsuran siswa
          </DialogDescription>
        </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Remaining Amount Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    <span className="text-sm sm:text-base font-medium text-blue-900">Sisa Pembayaran:</span>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-blue-900">
                    {formatCurrency(remainingAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">Jumlah Pembayaran *</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Masukkan jumlah pembayaran"
                  className="pl-10 text-base"
                  min={1}
                  max={remainingAmount}
                  required
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-500">
                Maksimal: {formatCurrency(remainingAmount)}
              </p>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-sm font-medium">Metode Pembayaran *</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
              >
                <SelectTrigger className="text-base">
                  <SelectValue placeholder="Pilih metode pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Tunai</SelectItem>
                  <SelectItem value="transfer">Transfer Bank</SelectItem>
                  <SelectItem value="ewallet">E-Wallet</SelectItem>
                  <SelectItem value="debit">Kartu Debit</SelectItem>
                  <SelectItem value="credit">Kartu Kredit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">Catatan</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Tambahkan catatan pembayaran (opsional)"
                rows={3}
                className="text-base resize-none"
              />
            </div>

            {/* Payment Preview */}
            {formData.amount && parseFloat(formData.amount) > 0 && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-3 sm:p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm">Jumlah Pembayaran:</span>
                      <span className="text-sm sm:text-base font-medium">
                        {formatCurrency(parseInt(formData.amount) || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm">Sisa Setelah Bayar:</span>
                      <span className="text-sm sm:text-base font-medium text-green-600">
                        {formatCurrency(remainingAmount - (parseInt(formData.amount) || 0))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="w-full sm:w-auto min-h-[44px] text-base sm:text-sm"
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full sm:w-auto min-h-[44px] text-base sm:text-sm"
              >
                {loading ? 'Menyimpan...' : 'Simpan Pembayaran'}
              </Button>
            </div>
          </form>
      </DialogContent>
    </Dialog>
  );
}