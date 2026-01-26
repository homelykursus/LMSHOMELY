'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Receipt, Download, Calendar, User, CreditCard, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

interface PaymentReceiptProps {
  transactionId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ReceiptData {
  receiptNumber: string;
  transactionDate: string;
  studentName: string;
  courseName: string;
  courseType: string;
  amount: number;
  paymentMethod: string;
  totalAmount: number; // Total biaya kursus
  totalPaid: number;
  remainingAmount: number;
  status: string;
  notes?: string;
}

export default function PaymentReceipt({
  transactionId,
  isOpen,
  onClose
}: PaymentReceiptProps) {
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const fetchReceiptData = async () => {
    if (!transactionId) return;

    setLoading(true);
    try {
      const response = await fetch('/api/payments/receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId }),
      });

      if (response.ok) {
        const data = await response.json();
        setReceiptData(data);
      } else {
        toast.error('Gagal menggenerate bukti pembayaran');
      }
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('Terjadi kesalahan saat generate bukti pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!receiptData) {
      console.error('Missing receiptData');
      return;
    }

    console.log('handleDownload called - generating PDF...');
    setDownloading(true);
    
    try {
      // Create new PDF document
      const pdf = new jsPDF();
      
      // Set font
      pdf.setFont('helvetica');
      
      // Header
      pdf.setFontSize(20);
      pdf.setTextColor(37, 99, 235); // Blue color
      pdf.text('BUKTI PEMBAYARAN', 105, 30, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Homely Kursus Komputer', 105, 40, { align: 'center' });
      pdf.text(`No. ${receiptData.receiptNumber}`, 105, 50, { align: 'center' });
      
      // Line separator
      pdf.setLineWidth(0.5);
      pdf.setDrawColor(37, 99, 235);
      pdf.line(20, 60, 190, 60);
      
      // Content
      let yPos = 80;
      const leftMargin = 25;
      const rightMargin = 185;
      
      // Date
      pdf.setFontSize(11);
      pdf.text('Tanggal:', leftMargin, yPos);
      pdf.text(new Date(receiptData.transactionDate).toLocaleDateString('id-ID'), rightMargin, yPos, { align: 'right' });
      yPos += 10;
      
      // Student
      pdf.text('Siswa:', leftMargin, yPos);
      pdf.text(receiptData.studentName, rightMargin, yPos, { align: 'right' });
      yPos += 10;
      
      // Course
      pdf.text('Kursus:', leftMargin, yPos);
      pdf.text(receiptData.courseName, rightMargin, yPos, { align: 'right' });
      yPos += 10;
      
      // Course Type
      pdf.text('Jenis Kelas:', leftMargin, yPos);
      pdf.text(receiptData.courseType === 'regular' ? 'Kelas Reguler' : 'Kelas Privat', rightMargin, yPos, { align: 'right' });
      yPos += 10;
      
      // Total Course Cost
      pdf.text('Total Biaya Kursus:', leftMargin, yPos);
      pdf.text(`Rp ${receiptData.totalAmount.toLocaleString('id-ID')}`, rightMargin, yPos, { align: 'right' });
      yPos += 10;
      
      // Payment Method
      pdf.text('Metode Pembayaran:', leftMargin, yPos);
      pdf.text(receiptData.paymentMethod, rightMargin, yPos, { align: 'right' });
      yPos += 20;
      
      // Payment Details Box
      pdf.setFillColor(239, 246, 255); // Light blue background
      pdf.rect(20, yPos - 5, 170, 40, 'F');
      
      pdf.setFontSize(12);
      pdf.setTextColor(22, 163, 74); // Green color
      pdf.text('Jumlah Pembayaran:', leftMargin, yPos + 5);
      pdf.text(`Rp ${receiptData.amount.toLocaleString('id-ID')}`, rightMargin, yPos + 5, { align: 'right' });
      
      pdf.setFontSize(10);
      pdf.setTextColor(75, 85, 99); // Gray color
      pdf.text('Total Sudah Dibayar:', leftMargin, yPos + 15);
      pdf.text(`Rp ${receiptData.totalPaid.toLocaleString('id-ID')}`, rightMargin, yPos + 15, { align: 'right' });
      
      pdf.text('Sisa Pembayaran:', leftMargin, yPos + 25);
      pdf.text(`Rp ${receiptData.remainingAmount.toLocaleString('id-ID')}`, rightMargin, yPos + 25, { align: 'right' });
      
      yPos += 50;
      
      // Status
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      const statusText = receiptData.status === 'completed' ? 'Lunas' : receiptData.status === 'partial' ? 'Sebagian' : 'Menunggu';
      const statusColor = receiptData.status === 'completed' ? [22, 101, 52] : receiptData.status === 'partial' ? [30, 64, 175] : [146, 64, 14];
      
      pdf.text('Status:', 105 - 20, yPos, { align: 'center' });
      pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      pdf.text(statusText, 105 + 20, yPos, { align: 'center' });
      
      yPos += 30;
      
      // Footer
      pdf.setFontSize(9);
      pdf.setTextColor(107, 114, 128); // Gray color
      pdf.text('Terima kasih telah melakukan pembayaran', 105, yPos, { align: 'center' });
      pdf.text('Simpan bukti pembayaran ini sebagai arsip', 105, yPos + 8, { align: 'center' });
      pdf.text(`Generated on ${new Date().toLocaleString('id-ID')}`, 105, yPos + 16, { align: 'center' });
      
      // Generate filename
      const date = new Date(receiptData.transactionDate).toLocaleDateString('id-ID').replace(/\//g, '-');
      const studentName = receiptData.studentName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      const filename = `Bukti_Pembayaran_${studentName}_${date}.pdf`;
      
      console.log('Generated filename:', filename);
      
      // Save PDF
      pdf.save(filename);
      
      console.log('PDF download completed successfully');
      toast.success('Bukti pembayaran berhasil diunduh sebagai PDF');

    } catch (error) {
      console.error('Error in handleDownload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Gagal menggenerate PDF: ' + errorMessage);
    } finally {
      setDownloading(false);
    }
  };

  // Fetch receipt data when modal opens
  React.useEffect(() => {
    if (isOpen && transactionId) {
      fetchReceiptData();
    }
  }, [isOpen, transactionId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Bukti Pembayaran
          </DialogTitle>
          <DialogDescription>
            Preview dan unduh bukti pembayaran
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : receiptData ? (
          <div className="space-y-4">
            {/* Receipt Preview - This will be captured as image */}
            <div 
              ref={receiptRef}
              data-receipt="true"
              className="bg-white p-6 border-2 border-gray-200 rounded-lg shadow-sm"
              style={{ fontFamily: 'Arial, sans-serif', minWidth: '400px' }}
            >
              {/* Header */}
              <div className="text-center mb-6 pb-4 border-b-2 border-blue-600">
                <h1 className="text-2xl font-bold text-blue-600 mb-2">BUKTI PEMBAYARAN</h1>
                <p className="text-gray-600 font-medium">Homely Kursus Komputer</p>
                <p className="text-sm text-gray-500">No. {receiptData.receiptNumber}</p>
              </div>
              
              {/* Info Section */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="flex items-center gap-2 font-medium text-gray-700">
                    <Calendar className="h-4 w-4" />
                    Tanggal:
                  </span>
                  <span className="text-gray-600">{new Date(receiptData.transactionDate).toLocaleDateString('id-ID')}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="flex items-center gap-2 font-medium text-gray-700">
                    <User className="h-4 w-4" />
                    Siswa:
                  </span>
                  <span className="font-medium text-gray-800">{receiptData.studentName}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="flex items-center gap-2 font-medium text-gray-700">
                    <BookOpen className="h-4 w-4" />
                    Kursus:
                  </span>
                  <span className="text-gray-600">{receiptData.courseName}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="flex items-center gap-2 font-medium text-gray-700">
                    <BookOpen className="h-4 w-4" />
                    Total Biaya Kursus:
                  </span>
                  <span className="font-medium text-gray-800">{formatCurrency(receiptData.totalAmount)}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="flex items-center gap-2 font-medium text-gray-700">
                    <CreditCard className="h-4 w-4" />
                    Metode:
                  </span>
                  <span className="text-gray-600">{receiptData.paymentMethod}</span>
                </div>
              </div>
              
              {/* Total Section */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-lg">
                    <span className="font-medium">Jumlah:</span>
                    <span className="font-bold text-green-600">{formatCurrency(receiptData.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Total Dibayar:</span>
                    <span>{formatCurrency(receiptData.totalPaid)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Sisa:</span>
                    <span>{formatCurrency(receiptData.remainingAmount)}</span>
                  </div>
                </div>
              </div>
              
              {/* Status */}
              <div className="text-center mb-6">
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                  receiptData.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : receiptData.status === 'partial'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {receiptData.status === 'completed' ? 'Lunas' : receiptData.status === 'partial' ? 'Sebagian' : 'Menunggu'}
                </div>
              </div>
              
              {/* Footer */}
              <div className="text-center pt-4 border-t border-gray-200 text-sm text-gray-500">
                <p className="mb-1">Terima kasih telah melakukan pembayaran</p>
                <p className="mb-1">Simpan bukti pembayaran ini sebagai arsip</p>
                <p>Generated on {new Date().toLocaleString('id-ID')}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Tutup
              </Button>
              <Button onClick={() => {
                console.log('Download button clicked');
                handleDownload();
              }} disabled={downloading}>
                {downloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Mengunduh...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Unduh PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Gagal memuat data bukti pembayaran
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}