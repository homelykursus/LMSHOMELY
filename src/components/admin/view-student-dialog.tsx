'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Calendar, 
  Phone, 
  BookOpen, 
  DollarSign, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  MapPin,
  GraduationCap,
  CreditCard,
  Info,
  UserCheck
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  dateOfBirth: string;
  whatsapp: string;
  photo?: string | null;
  courseId: string;
  courseType: string;
  participants: number;
  finalPrice: number;
  discount: number;
  lastEducation?: string | null;
  status: 'pending' | 'confirmed' | 'completed';
  createdAt: string;
  updatedAt: string;
  course: {
    name: string;
    category: string;
    description?: string;
    duration?: number;
  };
}

interface ViewStudentDialogProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ViewStudentDialog({ student, open, onOpenChange }: ViewStudentDialogProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Menunggu Konfirmasi</Badge>;
      case 'confirmed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Dikonfirmasi</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Selesai</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-orange-600" />;
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return age;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            Detail Data Siswa
          </DialogTitle>
          <DialogDescription className="text-base">
            Informasi lengkap data siswa dan pendaftaran kursus
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 py-6">
          {/* Sidebar - Foto & Status */}
          <div className="lg:col-span-1 space-y-4">
            {/* Foto Siswa */}
            <Card className="border-2 border-gray-100">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  {student.photo ? (
                    <div className="relative inline-block">
                      <img
                        src={student.photo}
                        alt={student.name}
                        className="w-32 h-32 object-cover rounded-xl border-4 border-white shadow-lg"
                      />
                      <div className="absolute -bottom-2 -right-2">
                        {getStatusIcon(student.status)}
                      </div>
                    </div>
                  ) : (
                    <div className="relative inline-block">
                      <div className="w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center border-4 border-white shadow-lg">
                        <User className="h-16 w-16 text-gray-400" />
                      </div>
                      <div className="absolute -bottom-2 -right-2">
                        {getStatusIcon(student.status)}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-gray-900">
                      {student.name} ({calculateAge(student.dateOfBirth)})
                    </h3>
                    {getStatusBadge(student.status)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{student.courseType === 'regular' ? 'Reguler' : 'Privat'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="font-bold text-blue-700">{formatCurrency(student.finalPrice)}</span>
                </div>
              </CardContent>
            </Card>

            {/* ID Siswa */}
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">ID Siswa</p>
                  <p className="font-mono text-sm bg-white p-2 rounded border border-gray-200">
                    {student.id.slice(0, 8)}...
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4 space-y-6">
            {/* Data Pribadi */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-1.5 bg-white rounded-lg shadow-sm">
                    <User className="h-5 w-5 text-gray-700" />
                  </div>
                  Data Pribadi
                </CardTitle>
                <CardDescription>Informasi pribadi dan kontak siswa</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="group">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                        Nama Lengkap
                      </label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{student.name}</span>
                      </div>
                    </div>

                    <div className="group">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                        Tanggal Lahir
                      </label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="font-medium">{formatDate(student.dateOfBirth)}</span>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Usia: {calculateAge(student.dateOfBirth)} tahun
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="group">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                        Nomor WhatsApp
                      </label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{student.whatsapp}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="group">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                        Tanggal Pendaftaran
                      </label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{formatDateTime(student.createdAt)}</span>
                      </div>
                    </div>

                    <div className="group">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                        Terakhir Diupdate
                      </label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{formatDateTime(student.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informasi Kursus */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-1.5 bg-white rounded-lg shadow-sm">
                    <BookOpen className="h-5 w-5 text-blue-700" />
                  </div>
                  Informasi Kursus
                </CardTitle>
                <CardDescription>Detail kursus yang diambil siswa</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                        Nama Kursus
                      </label>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="font-bold text-blue-900 mb-2">{student.course.name}</p>
                        <Badge variant="outline" className="bg-white border-blue-300 text-blue-700">
                          {student.course.category}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                        Jenis Kelas
                      </label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {student.courseType === 'regular' ? 'Kelas Reguler' : 'Kelas Privat'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {student.course.duration && (
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                          Durasi Kursus
                        </label>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <div>
                            <span className="font-medium">{student.course.duration} pertemuan</span>
                            <div className="text-xs text-gray-500">({Math.round((student.course.duration * 90) / 60)} jam total)</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                        Rincian Harga
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">Harga Normal</span>
                          <span className="text-sm line-through text-gray-500">
                            {formatCurrency(student.finalPrice + student.discount)}
                          </span>
                        </div>
                        
                        {student.discount > 0 && (
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                            <span className="text-sm font-medium text-green-700">Diskon</span>
                            <span className="text-sm font-bold text-green-600">
                              -{formatCurrency(student.discount)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Payment */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium mb-1">Total Biaya Kursus</p>
                      <p className="text-xs text-blue-200 opacity-90">
                        {student.courseType === 'regular' 
                          ? 'Per orang (Kelas Reguler)' 
                          : 'Per sesi (Kelas Privat)'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">{formatCurrency(student.finalPrice)}</p>
                    </div>
                  </div>
                </div>

                {/* Deskripsi Kursus */}
                {student.course.description && (
                  <div className="mt-6">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
                      Deskripsi Kursus
                    </label>
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {student.course.description}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-6 border-t bg-gray-50 -mx-6 px-6 -mb-6 rounded-b-lg">
          <div className="text-sm text-gray-500">
            Data siswa #{student.id.slice(-6)}
          </div>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="px-6"
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}