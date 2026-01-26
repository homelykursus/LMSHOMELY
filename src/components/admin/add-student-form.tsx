'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calculator, Calendar, Phone, BookOpen, Camera, Upload, X } from 'lucide-react';
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

interface AddStudentFormProps {
  onStudentAdded: () => void;
}

export default function AddStudentForm({ onStudentAdded }: AddStudentFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: '',
    whatsapp: '',
    courseId: '',
    courseType: 'regular',
    discount: 0,
    lastEducation: '',
    referralSource: ''
  });
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    calculatePrice();
  }, [formData.courseId, formData.courseType, formData.discount, courses]);

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

    // Diskon tambahan jika ada di pricing
    if (pricing.discountRate) {
      discount = Math.max(discount, pricing.discountRate);
    }

    let finalPrice = Math.round(basePrice * (1 - discount / 100));
    
    // Apply nominal discount
    finalPrice = Math.max(0, finalPrice - formData.discount);
    
    setCalculatedPrice(finalPrice);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi tipe file
      if (!file.type.startsWith('image/')) {
        toast.error('File harus berupa gambar');
        return;
      }

      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran gambar maksimal 5MB');
        return;
      }

      setSelectedPhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
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

    if (!formData.gender) {
      toast.error('Jenis kelamin harus dipilih');
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

    // Validasi format WhatsApp (62xxxxxxxxxx - 10-13 digit setelah 62)
    const whatsappRegex = /^62\d{10,13}$/;
    if (!whatsappRegex.test(formData.whatsapp)) {
      toast.error('Format WhatsApp: 62xxxxxxxxxx (10-13 digit setelah 62)');
      return false;
    }

    if (!formData.courseId) {
      toast.error('Kursus harus dipilih');
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
      
      // Add discount
      formDataToSend.append('discount', formData.discount.toString());

      const response = await fetch('/api/students', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        toast.success('Data siswa berhasil ditambahkan!');
        setOpen(false);
        setFormData({
          name: '',
          dateOfBirth: '',
          gender: '',
          whatsapp: '',
          courseId: '',
          courseType: 'regular',
          discount: 0,
          lastEducation: '',
          referralSource: ''
        });
        setCalculatedPrice(null);
        setSelectedPhoto(null);
        setPhotoPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onStudentAdded();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal menambahkan data siswa');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Terjadi kesalahan saat menambahkan data');
    } finally {
      setLoading(false);
    }
  };

  const selectedCourse = courses.find(c => c.id === formData.courseId);
  const coursePricing = selectedCourse?.pricing.find(p => p.courseType === formData.courseType);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-6">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Siswa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Data Siswa Baru</DialogTitle>
          <DialogDescription>
            Masukkan data lengkap siswa untuk pendaftaran kursus
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
                <Label htmlFor="gender">Jenis Kelamin *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Laki-laki</SelectItem>
                    <SelectItem value="female">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
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
                      
                      // Jika user mengetik nomor yang dimulai dengan 08, ubah ke 628
                      if (value.startsWith('08')) {
                        value = '628' + value.slice(2);
                      }
                      // Jika user mengetik nomor yang dimulai dengan 8 (tanpa 0), ubah ke 628
                      else if (value.startsWith('8') && !value.startsWith('62')) {
                        value = '628' + value.slice(1);
                      }
                      // Jika tidak dimulai dengan 62, tambahkan 62 di depan
                      else if (!value.startsWith('62') && value.length > 0) {
                        value = '62' + value;
                      }
                      
                      // Batasi maksimal 15 digit (62 + 13 digit)
                      if (value.length > 15) {
                        value = value.slice(0, 15);
                      }
                      
                      setFormData({ ...formData, whatsapp: value });
                    }}
                    placeholder="62xxxxxxxxxx"
                    className="pl-10"
                    maxLength={15}
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Format: 62xxxxxxxxxx (otomatis ditambahkan 62)</p>
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

              <div>
                <Label htmlFor="referralSource">Tau Homely Kursus dari mana?</Label>
                <Select
                  value={formData.referralSource}
                  onValueChange={(value) => setFormData({ ...formData, referralSource: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih sumber referral" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Google">Google</SelectItem>
                    <SelectItem value="Tiktok">Tiktok</SelectItem>
                    <SelectItem value="dari Teman">dari Teman</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
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
                      <span>Kategori:</span>
                      <Badge variant="outline">{selectedCourse.category}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Jenis Kelas:</span>
                      <span>{formData.courseType === 'regular' ? 'Kelas Reguler' : 'Kelas Privat'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Harga Dasar:</span>
                      <span>Rp {coursePricing.basePrice.toLocaleString('id-ID')}</span>
                    </div>
                    {(() => {
                      let basePrice = coursePricing.basePrice;
                      let totalPercentageDiscount = 0;
                      
                      if (coursePricing.discountRate) {
                        totalPercentageDiscount = Math.max(totalPercentageDiscount, coursePricing.discountRate);
                      }
                      
                      let priceAfterPercentageDiscount = basePrice;
                      if (totalPercentageDiscount > 0) {
                        priceAfterPercentageDiscount = Math.round(basePrice * (1 - totalPercentageDiscount / 100));
                      }
                      
                      return (
                        <>
                          {coursePricing.discountRate && (
                            <div className="flex justify-between text-green-600">
                              <span>Diskon Kursus ({coursePricing.discountRate}%):</span>
                              <span>-Rp {Math.round(basePrice * coursePricing.discountRate / 100).toLocaleString('id-ID')}</span>
                            </div>
                          )}
                          {formData.discount > 0 && (
                            <div className="flex justify-between text-green-600 font-medium">
                              <span>Diskon Tambahan:</span>
                              <span>-Rp {formData.discount.toLocaleString('id-ID')}</span>
                            </div>
                          )}
                          {calculatedPrice !== null && calculatedPrice !== priceAfterPercentageDiscount && (
                            <div className="flex justify-between text-gray-600">
                              <span>Subtotal:</span>
                              <span>Rp {priceAfterPercentageDiscount.toLocaleString('id-ID')}</span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Harga Final */}
              {calculatedPrice !== null && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Total Harga Final:</span>
                    </div>
                    <span className="text-xl font-bold text-blue-900">
                      Rp {calculatedPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading || !calculatedPrice}>
              {loading ? 'Menyimpan...' : 'Tambah Siswa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}