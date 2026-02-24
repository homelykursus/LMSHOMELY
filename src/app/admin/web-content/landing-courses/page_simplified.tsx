'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  FileText,
  Palette,
  Video,
  Code,
  TrendingUp,
  Sheet,
  Monitor,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { CurriculumInput } from '@/components/admin/curriculum-input';
import { SimpleListInput } from '@/components/admin/simple-list-input';
import { SoftwareInput } from '@/components/admin/software-input';

interface LandingCourse {
  id: string;
  name: string;
  description: string;
  duration: string;
  icon: string;
  slug: string;
  order: number;
  isActive: boolean;
  fullDescription?: string;
  sessionDuration?: string;
  method?: string;
  practicePercentage?: string;
  equipment?: string;
  gradient?: string;
  curriculum?: any;
  benefits?: any;
  targetAudience?: any;
  software?: any;
  originalPrice?: number;
  discountedPrice?: number;
  createdAt: string;
  updatedAt: string;
}

const iconOptions = [
  { value: 'FileText', label: 'File Text', icon: FileText },
  { value: 'Palette', label: 'Palette', icon: Palette },
  { value: 'Video', label: 'Video', icon: Video },
  { value: 'Code', label: 'Code', icon: Code },
  { value: 'TrendingUp', label: 'Trending Up', icon: TrendingUp },
  { value: 'Sheet', label: 'Sheet', icon: Sheet },
  { value: 'Monitor', label: 'Monitor', icon: Monitor }
];

export default function LandingCoursesPage() {
  const [courses, setCourses] = useState<LandingCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    icon: 'FileText',
    slug: '',
    order: 0,
    isActive: true,
    fullDescription: '',
    sessionDuration: '1,5 Jam',
    method: 'Tatap Muka',
    practicePercentage: '100% Full Praktik',
    equipment: 'Peralatan Belajar Sudah Disediakan',
    gradient: 'from-blue-500 to-cyan-500',
    originalPrice: 0,
    discountedPrice: 0
  });

  // Dynamic arrays for simple inputs
  const [curriculumItems, setCurriculumItems] = useState<Array<{title: string, subtopics: string[]}>>([]);
  const [benefitItems, setBenefitItems] = useState<string[]>([]);
  const [targetAudienceItems, setTargetAudienceItems] = useState<string[]>([]);
  const [softwareItems, setSoftwareItems] = useState<Array<{name: string, icon: string, description: string}>>([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/web-content/landing-courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        toast.error('Gagal memuat data program kursus');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.duration || !formData.slug) {
      toast.error('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    // Convert arrays to JSON
    const parsedData: any = { 
      ...formData,
      curriculum: curriculumItems.length > 0 ? curriculumItems : null,
      benefits: benefitItems.length > 0 ? benefitItems : null,
      targetAudience: targetAudienceItems.length > 0 ? targetAudienceItems : null,
      software: softwareItems.length > 0 ? softwareItems : null
    };

    setIsSubmitting(true);

    try {
      const url = editingId 
        ? `/api/web-content/landing-courses/${editingId}`
        : '/api/web-content/landing-courses';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(editingId ? 'Program kursus berhasil diupdate' : 'Program kursus berhasil ditambahkan');
        fetchCourses();
        resetForm();
      } else {
        const errorMessage = data.details 
          ? `${data.error}: ${data.details}` 
          : data.error || 'Terjadi kesalahan';
        toast.error(errorMessage);
        console.error('API Error:', data);
      }
    } catch (error: any) {
      console.error('Error saving course:', error);
      toast.error(`Terjadi kesalahan saat menyimpan data: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (course: LandingCourse) => {
    setFormData({
      name: course.name,
      description: course.description,
      duration: course.duration,
      icon: course.icon,
      slug: course.slug,
      order: course.order,
      isActive: course.isActive,
      fullDescription: course.fullDescription || '',
      sessionDuration: course.sessionDuration || '1,5 Jam',
      method: course.method || 'Tatap Muka',
      practicePercentage: course.practicePercentage || '100% Full Praktik',
      equipment: course.equipment || 'Peralatan Belajar Sudah Disediakan',
      gradient: course.gradient || 'from-blue-500 to-cyan-500',
      originalPrice: course.originalPrice || 0,
      discountedPrice: course.discountedPrice || 0
    });

    // Parse JSON data to arrays
    setCurriculumItems(course.curriculum || []);
    setBenefitItems(course.benefits || []);
    setTargetAudienceItems(course.targetAudience || []);
    setSoftwareItems(course.software || []);

    setEditingId(course.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus program kursus ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/web-content/landing-courses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Program kursus berhasil dihapus');
        fetchCourses();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Gagal menghapus program kursus');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Terjadi kesalahan saat menghapus data');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration: '',
      icon: 'FileText',
      slug: '',
      order: 0,
      isActive: true,
      fullDescription: '',
      sessionDuration: '1,5 Jam',
      method: 'Tatap Muka',
      practicePercentage: '100% Full Praktik',
      equipment: 'Peralatan Belajar Sudah Disediakan',
      gradient: 'from-blue-500 to-cyan-500',
      originalPrice: 0,
      discountedPrice: 0
    });
    setCurriculumItems([]);
    setBenefitItems([]);
    setTargetAudienceItems([]);
    setSoftwareItems([]);
    setEditingId(null);
    setShowForm(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(opt => opt.value === iconName);
    return iconOption ? iconOption.icon : FileText;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Program Kursus</h1>
          <p className="text-gray-600 mt-1">Kelola program kursus yang ditampilkan di landing page</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          {showForm ? (
            <>
              <X className="w-4 h-4" />
              Tutup Form
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Tambah Program
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Program Kursus' : 'Tambah Program Kursus Baru'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Program <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setFormData({ 
                        ...formData, 
                        name: newName,
                        slug: generateSlug(newName)
                      });
                    }}
                    placeholder="Contoh: Microsoft Office"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Durasi <span className="text-red-500">*</span></Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="Contoh: 12 Pertemuan"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi <span className="text-red-500">*</span></Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi singkat program kursus"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon <span className="text-red-500">*</span></Label>
                  <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-4 h-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug <span className="text-red-500">*</span></Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="microsoft-office"
                    required
                  />
                  <p className="text-xs text-gray-500">URL: /program/{formData.slug}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Urutan Tampil</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <Label htmlFor="isActive" className="cursor-pointer">Aktif (tampilkan di landing page)</Label>
              </div>

              {/* Detail Program Section */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Program (untuk halaman detail)</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullDescription">Deskripsi Lengkap</Label>
                    <Textarea
                      id="fullDescription"
                      value={formData.fullDescription}
                      onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                      placeholder="Deskripsi lengkap program untuk halaman detail"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sessionDuration">Durasi Per Sesi</Label>
                      <Select value={formData.sessionDuration} onValueChange={(value) => setFormData({ ...formData, sessionDuration: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1 Jam">1 Jam</SelectItem>
                          <SelectItem value="1,5 Jam">1,5 Jam</SelectItem>
                          <SelectItem value="2 Jam">2 Jam</SelectItem>
                          <SelectItem value="2,5 Jam">2,5 Jam</SelectItem>
                          <SelectItem value="3 Jam">3 Jam</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="method">Metode Belajar</Label>
                      <Select value={formData.method} onValueChange={(value) => setFormData({ ...formData, method: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tatap Muka">Tatap Muka</SelectItem>
                          <SelectItem value="Private 1 Guru 1 Siswa">Private 1 Guru 1 Siswa</SelectItem>
                          <SelectItem value="Online">Online</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="practicePercentage">Persentase Praktik</Label>
                      <Select value={formData.practicePercentage} onValueChange={(value) => setFormData({ ...formData, practicePercentage: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="100% Full Praktik">100% Full Praktik</SelectItem>
                          <SelectItem value="80% Praktik 20% Teori">80% Praktik 20% Teori</SelectItem>
                          <SelectItem value="70% Praktik 30% Teori">70% Praktik 30% Teori</SelectItem>
                          <SelectItem value="60% Praktik 40% Teori">60% Praktik 40% Teori</SelectItem>
                          <SelectItem value="50% Praktik 50% Teori">50% Praktik 50% Teori</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="equipment">Peralatan</Label>
                      <Select value={formData.equipment} onValueChange={(value) => setFormData({ ...formData, equipment: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Peralatan Belajar Sudah Disediakan">Peralatan Belajar Sudah Disediakan</SelectItem>
                          <SelectItem value="Bawa Laptop Sendiri">Bawa Laptop Sendiri</SelectItem>
                          <SelectItem value="Peralatan Opsional">Peralatan Opsional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gradient">Gradient Color</Label>
                    <Select value={formData.gradient} onValueChange={(value) => setFormData({ ...formData, gradient: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="from-blue-500 to-cyan-500">Blue to Cyan</SelectItem>
                        <SelectItem value="from-purple-500 to-pink-500">Purple to Pink</SelectItem>
                        <SelectItem value="from-red-500 to-orange-500">Red to Orange</SelectItem>
                        <SelectItem value="from-green-500 to-teal-500">Green to Teal</SelectItem>
                        <SelectItem value="from-yellow-500 to-orange-500">Yellow to Orange</SelectItem>
                        <SelectItem value="from-green-600 to-emerald-600">Green to Emerald</SelectItem>
                        <SelectItem value="from-indigo-500 to-purple-500">Indigo to Purple</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="originalPrice">Harga Normal (Rp)</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: parseInt(e.target.value) || 0 })}
                        placeholder="950000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discountedPrice">Harga Promo (Rp)</Label>
                      <Input
                        id="discountedPrice"
                        type="number"
                        value={formData.discountedPrice}
                        onChange={(e) => setFormData({ ...formData, discountedPrice: parseInt(e.target.value) || 0 })}
                        placeholder="700000"
                      />
                    </div>
                  </div>

                  {/* New Simple Inputs */}
                  <CurriculumInput value={curriculumItems} onChange={setCurriculumItems} />
                  
                  <SimpleListInput 
                    label="Manfaat"
                    icon="✨"
                    value={benefitItems}
                    onChange={setBenefitItems}
                    placeholder="Contoh: Menguasai Microsoft Word"
                    borderColor="border-green-200"
                    bgColor="bg-green-50"
                    textColor="text-green-900"
                  />

                  <SimpleListInput 
                    label="Target Audience"
                    icon="🎯"
                    value={targetAudienceItems}
                    onChange={setTargetAudienceItems}
                    placeholder="Contoh: Pelajar dan Mahasiswa"
                    borderColor="border-purple-200"
                    bgColor="bg-purple-50"
                    textColor="text-purple-900"
                  />

                  <SoftwareInput value={softwareItems} onChange={setSoftwareItems} />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingId ? 'Update' : 'Simpan'}
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="w-4 h-4 mr-2" />
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Belum ada program kursus</p>
            <p className="text-sm text-gray-500 mt-1">Klik tombol "Tambah Program" untuk menambahkan program kursus baru</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => {
            const IconComponent = getIconComponent(course.icon);
            return (
              <Card key={course.id} className={!course.isActive ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{course.name}</CardTitle>
                        <p className="text-sm text-gray-500">{course.duration}</p>
                      </div>
                    </div>
                    {course.isActive ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>Urutan: {course.order}</span>
                    <span>/program/{course.slug}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(course)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(course.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
