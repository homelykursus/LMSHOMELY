'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Calendar, Phone, Users, BookOpen, Camera, X, Edit, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface Course {
  id: string;
  name: string;
  category: string;
  pricing: {
    courseType: string;
    basePrice: number;
    discountRate?: number;
  }[];
}

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
  course: {
    name: string;
    category: string;
  };
  classes: Array<{
    id: string;
    class: {
      id: string;
      name: string;
      schedule: string;
      isActive: boolean;
    };
    joinedAt: string;
  }>;
}

interface EditStudentFormProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudentUpdated: () => void;
}

export default function EditStudentForm({ student, open, onOpenChange, onStudentUpdated }: EditStudentFormProps) {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    whatsapp: '',
    courseId: '',
    courseType: 'regular',
    participants: 1,
    discount: 0,
    lastEducation: ''
  });
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      fetchCourses();
    }
  }, [open]);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        dateOfBirth: student.dateOfBirth,
        whatsapp: student.whatsapp,
        courseId: student.courseId,
        courseType: student.courseType,
        participants: student.participants,
        discount: student.discount,
        lastEducation: student.lastEducation || ''
      });
      setPhotoPreview(student.photo || null);
    }
  }, [student]);

  useEffect(() => {
    calculatePrice();
  }, [formData.courseId, formData.courseType, formData.participants, formData.discount, courses]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Gagal memuat data kursus');
    }
  };

  const calculatePrice = () => {
    if (!formData.courseId || !formData.courseType) {
      setCalculatedPrice(null);
      return;
    }

    const course = courses.find(c => c.id === formData.courseId);
    if (!course) return;

    const pricing = course.pricing.find(p => p.courseType === formData.courseType);
    if (!pricing) return;

    let basePrice = pricing.basePrice;
    let discount = 0;

    // Diskon untuk lebih dari 1 peserta
    if (formData.participants > 1) {
      discount = Math.min((formData.participants - 1) * 5, 20); // Maksimal 20%
    }

    // Diskon tambahan jika ada di pricing
    if (pricing.discountRate) {
      discount = Math.max(discount, pricing.discountRate);
    }

    let finalPrice = Math.round(basePrice * (1 - discount / 100));
    
    // Apply nominal discount
    finalPrice = Math.max(0, finalPrice - formData.discount);
    
    setCalculatedPrice(finalPrice);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Import image compression utility
      const { ImageCompressor } = await import('@/lib/image-compression');
      
      // Validate image
      const validation = ImageCompressor.validateImage(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }

      try {
        // Check if compression is needed
        const shouldCompress = ImageCompressor.shouldCompress(file);
        let finalFile = file;

        if (shouldCompress) {
          toast.info('Mengompres gambar untuk optimasi...');
          
          // Compress image for production compatibility
          finalFile = await ImageCompressor.compressImage(file, {
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 0.8,
            maxSizeKB: 2048 // 2MB limit for Vercel
          });

          const originalSize = ImageCompressor.formatFileSize(file.size);
          const compressedSize = ImageCompressor.formatFileSize(finalFile.size);
          
          toast.success(`Gambar dikompres: ${originalSize} → ${compressedSize}`);
        }

        setSelectedPhoto(finalFile);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setPhotoPreview(e.target?.result as string);
        };
        reader.readAsDataURL(finalFile);
        
      } catch (error) {
        console.error('Error processing image:', error);
        toast.error('Gagal memproses gambar');
      }
    }
  };

  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Nama lengkap harus diisi');
      return false;
    }

    if (!formData.dateOfBirth) {
      toast.error('Tanggal lahir harus diisi');
      return false;
    }

    // Validasi umur minimal 12 tahun
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    const age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    
    if (age < 12) {
      toast.error('Usia minimal 12 tahun');
      return false;
    }

    if (!formData.whatsapp) {
      toast.error('Nomor WhatsApp harus diisi');
      return false;
    }

    // Validasi format WhatsApp (08xx-xxxx-xxxx)
    const whatsappRegex = /^08\d{2}-\d{4}-\d{4}$/;
    if (!whatsappRegex.test(formData.whatsapp)) {
      toast.error('Format WhatsApp: 08xx-xxxx-xxxx');
      return false;
    }

    if (!formData.courseId) {
      toast.error('Kursus harus dipilih');
      return false;
    }

    if (formData.participants < 1 || formData.participants > 10) {
      toast.error('Jumlah peserta antara 1-10');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (calculatedPrice === null) {
      toast.error('Gagal menghitung harga');
      return;
    }

    if (!student) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });
      
      // Add photo if selected
      if (selectedPhoto) {
        formDataToSend.append('photo', selectedPhoto);
      }
      
      // Add final price
      formDataToSend.append('finalPrice', calculatedPrice.toString());

      const response = await fetch(`/api/students/${student.id}`, {
        method: 'PUT',
        body: formDataToSend,
      });

      if (response.ok) {
        toast.success('Data siswa berhasil diperbarui!');
        onOpenChange(false);
        onStudentUpdated();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal memperbarui data siswa');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Terjadi kesalahan saat memperbarui data');
    } finally {
      setLoading(false);
    }
  };

  const selectedCourse = courses.find(c => c.id === formData.courseId);
  const coursePricing = selectedCourse?.pricing.find(p => p.courseType === formData.courseType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data Siswa</DialogTitle>
          <DialogDescription>
            Perbarui data lengkap siswa untuk pendaftaran kursus
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Data Pribadi */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Pribadi</CardTitle>
              <CardDescription>Informasi pribadi siswa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Foto */}
              <div>
                <Label htmlFor="photo">Foto Siswa</Label>
                <div className="mt-2">
                  {photoPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={photoPreview}
                        alt="Preview foto siswa"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={removePhoto}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                         onClick={() => fileInputRef.current?.click()}>
                      <div className="text-center">
                        <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-xs text-gray-500">Upload Foto</p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Format: JPG, PNG, WebP (Maks. 5MB)
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Tanggal Lahir *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <Label htmlFor="whatsapp">Nomor WhatsApp *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, ''); // Hapus semua non-digit
                      if (value.length > 0) {
                        // Format: 08xx-xxxx-xxxx
                        if (value.length <= 4) {
                          value = value;
                        } else if (value.length <= 8) {
                          value = `${value.slice(0, 4)}-${value.slice(4)}`;
                        } else {
                          value = `${value.slice(0, 4)}-${value.slice(4, 8)}-${value.slice(8, 12)}`;
                        }
                      }
                      setFormData({ ...formData, whatsapp: value });
                    }}
                    placeholder="08xx-xxxx-xxxx"
                    className="pl-10"
                    maxLength={13} // 08xx-xxxx-xxxx = 13 karakter
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Format: 08xx-xxxx-xxxx</p>
              </div>

              <div>
                <Label htmlFor="lastEducation">Pendidikan Terakhir</Label>
                <Select
                  value={formData.lastEducation}
                  onValueChange={(value) => setFormData({ ...formData, lastEducation: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih pendidikan terakhir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SD / Sederajat">SD / Sederajat</SelectItem>
                    <SelectItem value="SMP / Sederajat">SMP / Sederajat</SelectItem>
                    <SelectItem value="SMA / Sederajat">SMA / Sederajat</SelectItem>
                    <SelectItem value="S1 / Sederajat">S1 / Sederajat</SelectItem>
                    <SelectItem value="S2 / Sederajat">S2 / Sederajat</SelectItem>
                    <SelectItem value="S3 / Sederajat">S3 / Sederajat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Data Kursus */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Kursus</CardTitle>
              <CardDescription>Pilih kursus dan jenis kelas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="courseId">Kursus *</Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kursus" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        <div>
                          <div className="font-medium">{course.name}</div>
                          <div className="text-sm text-gray-500">{course.category}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="courseType">Jenis Kelas *</Label>
                <Select
                  value={formData.courseType}
                  onValueChange={(value) => setFormData({ ...formData, courseType: value })}
                  disabled={!formData.courseId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Kelas Reguler</SelectItem>
                    <SelectItem value="private">Kelas Privat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="participants">Jumlah Peserta *</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="participants"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.participants}
                    onChange={(e) => setFormData({ ...formData, participants: parseInt(e.target.value) || 1 })}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Minimal 1, maksimal 10 peserta</p>
              </div>

              <div>
                <Label htmlFor="discount">Diskon Tambahan (Rp)</Label>
                <div className="relative">
                  <Calculator className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })}
                    className="pl-10"
                    placeholder="Masukkan nominal diskon"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Masukkan nominal diskon dalam Rupiah</p>
              </div>

              {/* Informasi Kursus Dipilih */}
              {selectedCourse && coursePricing && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Informasi Kursus
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Kursus:</span>
                      <span className="font-medium">{selectedCourse.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Jenis:</span>
                      <span>{formData.courseType === 'regular' ? 'Kelas Reguler' : 'Kelas Privat'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Harga Dasar:</span>
                      <span>Rp {coursePricing.basePrice.toLocaleString('id-ID')}</span>
                    </div>
                    {coursePricing.discountRate && (
                      <div className="flex justify-between text-green-600">
                        <span>Diskon Kursus:</span>
                        <span>{coursePricing.discountRate}%</span>
                      </div>
                    )}
                    {formData.participants > 1 && formData.courseType === 'regular' && (
                      <div className="flex justify-between text-green-600">
                        <span>Diskon Grup:</span>
                        <span>{Math.min((formData.participants - 1) * 5, 20)}%</span>
                      </div>
                    )}
                    {formData.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Diskon Tambahan:</span>
                        <span>Rp {formData.discount.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total Harga:</span>
                      <span className="text-blue-600">Rp {calculatedPrice?.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading || !calculatedPrice}
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}