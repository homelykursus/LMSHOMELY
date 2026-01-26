'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, User, Phone, Calendar, GraduationCap, Briefcase, MapPin, DollarSign, FileText, AlertCircle, Eye, EyeOff, Key } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  dateOfBirth: string;
  whatsapp: string;
  photo?: string | null;
  education: string;
  specialization?: string | null;
  experience?: number | null;
  address?: string | null;
  joinDate: string;
  status: 'active' | 'inactive' | 'leave';
  salary?: number | null;
  notes?: string | null;
  courses: {
    id: string;
    isMain: boolean;
    course: {
      id: string;
      name: string;
      category: string;
    };
  }[];
}

interface EditTeacherFormProps {
  teacher: Teacher | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeacherUpdated: () => void;
}

interface Course {
  id: string;
  name: string;
  category: string;
}

export default function EditTeacherForm({ teacher, open, onOpenChange, onTeacherUpdated }: EditTeacherFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    whatsapp: '',
    education: '',
    specialization: '',
    experience: '',
    address: '',
    joinDate: '',
    status: 'active',
    salary: '',
    notes: '',
    photo: null as File | null,
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (open) {
      fetchCourses();
      if (teacher) {
        setFormData({
          name: teacher.name,
          dateOfBirth: teacher.dateOfBirth,
          whatsapp: teacher.whatsapp,
          education: teacher.education,
          specialization: teacher.specialization || '',
          experience: teacher.experience?.toString() || '',
          address: teacher.address || '',
          joinDate: teacher.joinDate,
          status: teacher.status,
          salary: teacher.salary?.toString() || '',
          notes: teacher.notes || '',
          photo: null,
          newPassword: '',
          confirmPassword: ''
        });
        setSelectedCourses(teacher.courses.map(tc => tc.course.id));
        setPhotoPreview(teacher.photo);
      }
    }
  }, [open, teacher]);

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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        photo: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
    if (!teacher) return;

    setLoading(true);
    setError(null);

    try {
      // Validate password if changing
      if (showPasswordSection) {
        if (!formData.newPassword) {
          setError('Password baru wajib diisi');
          setLoading(false);
          return;
        }
        if (formData.newPassword.length < 6) {
          setError('Password minimal 6 karakter');
          setLoading(false);
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          setError('Konfirmasi password tidak cocok');
          setLoading(false);
          return;
        }
      }

      const formPayload = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'photo' && value instanceof File) {
          formPayload.append(key, value);
        } else if (key !== 'photo' && key !== 'newPassword' && key !== 'confirmPassword') {
          formPayload.append(key, value);
        }
      });

      // Add password if changing
      if (showPasswordSection && formData.newPassword) {
        formPayload.append('password', formData.newPassword);
      }

      // Add course IDs as comma-separated string
      if (selectedCourses.length > 0) {
        formPayload.append('courseIds', selectedCourses.join(','));
      }

      const response = await fetch(`/api/teachers/${teacher.id}`, {
        method: 'PUT',
        body: formPayload,
      });

      const result = await response.json();

      if (response.ok) {
        onTeacherUpdated();
        onOpenChange(false);
        setShowPasswordSection(false);
      } else {
        setError(result.error || 'Gagal mengupdate data guru');
      }
    } catch (error) {
      console.error('Error updating teacher:', error);
      setError('Terjadi kesalahan saat mengupdate data guru');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setPhotoPreview(null);
    setShowPasswordSection(false);
    setError(null);
    setFormData(prev => ({
      ...prev,
      newPassword: '',
      confirmPassword: ''
    }));
  };

  if (!teacher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit Data Guru
          </DialogTitle>
          <DialogDescription>
            Perbarui data lengkap guru atau instruktur kursus
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
                              setPhotoPreview(teacher.photo || null);
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
                          {teacher.photo ? 'Ganti Foto' : 'Pilih Foto'}
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
                      placeholder="08xxxxxxxxxx"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Nomor WhatsApp digunakan sebagai username login
                    </p>
                  </div>

                  {/* Password Change Section */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">Password Login</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPasswordSection(!showPasswordSection)}
                        className="text-xs"
                      >
                        <Key className="h-3 w-3 mr-1" />
                        {showPasswordSection ? 'Batal Ganti Password' : 'Ganti Password'}
                      </Button>
                    </div>
                    
                    {showPasswordSection && (
                      <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <Label htmlFor="newPassword" className="text-sm font-medium">Password Baru *</Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showPassword ? "text" : "password"}
                              value={formData.newPassword}
                              onChange={(e) => handleInputChange('newPassword', e.target.value)}
                              placeholder="Masukkan password baru"
                              className="pr-10"
                              minLength={6}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Minimal 6 karakter untuk keamanan akun
                          </p>
                        </div>
                        
                        <div>
                          <Label htmlFor="confirmPassword" className="text-sm font-medium">Konfirmasi Password Baru *</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={formData.confirmPassword}
                              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                              placeholder="Ulangi password baru"
                              className="pr-10"
                              minLength={6}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Pastikan password sama dengan yang di atas
                          </p>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <AlertCircle className="h-4 w-4 text-blue-400" />
                            </div>
                            <div className="ml-2">
                              <p className="text-xs text-blue-700">
                                Password baru akan menggantikan password lama. Guru harus menggunakan password baru untuk login.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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
              {loading ? 'Menyimpan...' : 'Update Data Guru'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}