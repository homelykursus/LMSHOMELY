'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Upload, X, User, Phone, Calendar, GraduationCap, Briefcase, MapPin, DollarSign, FileText, AlertCircle } from 'lucide-react';

interface AddTeacherFormProps {
  onTeacherAdded: () => void;
}

interface Course {
  id: string;
  name: string;
  category: string;
}

export default function AddTeacherForm({ onTeacherAdded }: AddTeacherFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    whatsapp: '',
    password: '',
    education: '',
    specialization: '',
    experience: '',
    address: '',
    instagramUsername: '',
    joinDate: '',
    status: 'active',
    salary: '',
    notes: '',
    photo: null as File | null
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Special handling untuk WhatsApp format - tanpa format otomatis
    if (field === 'whatsapp') {
      // Hanya hapus karakter non-digit dan non-plus, biarkan user mengetik format sendiri
      value = value.replace(/[^\d+]/g, '');
      
      // Batasi panjang maksimal (untuk nomor internasional)
      if (value.length > 20) {
        value = value.substring(0, 20);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Import image compression utility
      const { ImageCompressor } = await import('@/lib/image-compression');
      
      // Validate image
      const validation = ImageCompressor.validateImage(file);
      if (!validation.valid) {
        setError(validation.error || 'File tidak valid');
        return;
      }

      try {
        // Check if compression is needed
        const shouldCompress = ImageCompressor.shouldCompress(file);
        let finalFile = file;

        if (shouldCompress) {
          // Show compression message
          setError('Mengompres gambar untuk optimasi...');
          
          // Compress image for production compatibility
          finalFile = await ImageCompressor.compressImage(file, {
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 0.8,
            maxSizeKB: 2048 // 2MB limit for Vercel
          });

          const originalSize = ImageCompressor.formatFileSize(file.size);
          const compressedSize = ImageCompressor.formatFileSize(finalFile.size);
          
          setError(`Gambar dikompres: ${originalSize} → ${compressedSize}`);
          
          // Clear message after 3 seconds
          setTimeout(() => setError(null), 3000);
        }

        setFormData(prev => ({
          ...prev,
          photo: finalFile
        }));
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(finalFile);
        
      } catch (error) {
        console.error('Error processing image:', error);
        setError('Gagal memproses gambar');
      }
    }
  };

  const handleCourseToggle = (courseId: string, checked: boolean) => {
    if (checked) {
      setSelectedCourses(prev => [...prev, courseId]);
    } else {
      setSelectedCourses(prev => prev.filter(id => id !== courseId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formPayload = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'photo' && value instanceof File) {
          formPayload.append(key, value);
        } else if (key !== 'photo') {
          formPayload.append(key, value);
        }
      });

      // Add course IDs as comma-separated string
      if (selectedCourses.length > 0) {
        formPayload.append('courseIds', selectedCourses.join(','));
      }

      const response = await fetch('/api/teachers', {
        method: 'POST',
        body: formPayload,
      });

      const result = await response.json();

      if (response.ok) {
        onTeacherAdded();
        setOpen(false);
        resetForm();
      } else {
        setError(result.error || 'Gagal membuat data guru');
      }
    } catch (error) {
      console.error('Error creating teacher:', error);
      setError('Terjadi kesalahan saat membuat data guru');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dateOfBirth: '',
      whatsapp: '',
      password: '',
      education: '',
      specialization: '',
      experience: '',
      address: '',
      instagramUsername: '',
      joinDate: '',
      status: 'active',
      salary: '',
      notes: '',
      photo: null
    });
    setSelectedCourses([]);
    setPhotoPreview(null);
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah Guru
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Tambah Data Guru Baru
          </DialogTitle>
          <DialogDescription>
            Masukkan data lengkap guru atau instruktur kursus
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Terjadi Kesalahan
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Personal Data */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Pribadi</CardTitle>
                  <CardDescription>Informasi pribadi dan kontak guru</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Photo Upload */}
                  <div>
                    <Label htmlFor="photo" className="text-sm font-medium">Foto Guru</Label>
                    <div className="mt-2 flex items-center gap-4">
                      {photoPreview ? (
                        <div className="relative">
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-white"
                            onClick={() => {
                              setPhotoPreview(null);
                              setFormData(prev => ({ ...prev, photo: null }));
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <User className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <Input
                          id="photo"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('photo')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Pilih Foto
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">Nama Lengkap *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="dateOfBirth" className="text-sm font-medium">Tanggal Lahir *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatsapp" className="text-sm font-medium">Nomor WhatsApp *</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp}
                      onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                      placeholder="Contoh: 081234567890 atau +6281234567890"
                      maxLength={20}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Masukkan nomor WhatsApp tanpa format khusus - Nomor WhatsApp akan digunakan sebagai username login
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-sm font-medium">Password Login *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Masukkan password untuk login guru"
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimal 6 karakter untuk keamanan akun
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-sm font-medium">Alamat Lengkap</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Masukkan alamat lengkap"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="instagramUsername" className="text-sm font-medium">Username Instagram</Label>
                    <Input
                      id="instagramUsername"
                      value={formData.instagramUsername}
                      onChange={(e) => handleInputChange('instagramUsername', e.target.value)}
                      placeholder="Contoh: homelykursus (tanpa @)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Masukkan username Instagram tanpa simbol @ (akan ditampilkan di landing page)
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pendidikan & Pengalaman</CardTitle>
                  <CardDescription>Informasi pendidikan dan pengalaman mengajar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="education" className="text-sm font-medium">Pendidikan Terakhir *</Label>
                    <Select value={formData.education} onValueChange={(value) => handleInputChange('education', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih pendidikan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SMA">SMA</SelectItem>
                        <SelectItem value="D3">D3</SelectItem>
                        <SelectItem value="S1">S1</SelectItem>
                        <SelectItem value="S2">S2</SelectItem>
                        <SelectItem value="S3">S3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="specialization" className="text-sm font-medium">Spesialisasi</Label>
                    <Input
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      placeholder="Contoh: Matematika, Bahasa Inggris, dll"
                    />
                  </div>

                  <div>
                    <Label htmlFor="experience" className="text-sm font-medium">Pengalaman Mengajar (Tahun)</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Employment & Courses */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Kepegawaian</CardTitle>
                  <CardDescription>Informasi kerja dan status guru</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="joinDate" className="text-sm font-medium">Tanggal Bergabung *</Label>
                    <Input
                      id="joinDate"
                      type="date"
                      value={formData.joinDate}
                      onChange={(e) => handleInputChange('joinDate', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="status" className="text-sm font-medium">Status *</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="inactive">Tidak Aktif</SelectItem>
                        <SelectItem value="leave">Cuti</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="salary" className="text-sm font-medium">Gaji per Bulan</Label>
                    <Input
                      id="salary"
                      type="number"
                      min="0"
                      value={formData.salary}
                      onChange={(e) => handleInputChange('salary', e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-sm font-medium">Catatan Tambahan</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Catatan khusus tentang guru"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Program Kursus</CardTitle>
                  <CardDescription>Pilih program kursus yang dapat diampu</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {courses.length > 0 ? (
                      courses.map((course) => (
                        <div key={course.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={course.id}
                            checked={selectedCourses.includes(course.id)}
                            onCheckedChange={(checked) => handleCourseToggle(course.id, checked as boolean)}
                          />
                          <Label htmlFor={course.id} className="text-sm font-medium cursor-pointer">
                            {course.name}
                          </Label>
                          <span className="text-xs text-gray-500">({course.category})</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Belum ada program kursus tersedia</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Data Guru'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}