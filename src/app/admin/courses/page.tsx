'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  BookOpen, 
  Save,
  X
} from 'lucide-react';

interface Course {
  id: string;
  name: string;
  description: string;
  duration: number;
  category: string;
  isActive: boolean;
  pricing: CoursePricing[];
}

interface CoursePricing {
  id: string;
  courseType: string;
  basePrice: number;
  discountRate?: number;
  isActive: boolean;
}

export default function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState<boolean>(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingPricing, setEditingPricing] = useState<CoursePricing | null>(null);
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 0,
    category: '',
    pricing: [
      { courseType: 'regular', basePrice: 0, discountRate: 0 },
      { courseType: 'private', basePrice: 0, discountRate: 0 }
    ]
  });
  const [pricingFormData, setPricingFormData] = useState({
    courseType: 'regular',
    basePrice: 0,
    discountRate: 0,
    isActive: true
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchCourses();
        setIsAddCourseOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCourse) return;

    try {
      const response = await fetch(`/api/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          duration: formData.duration,
          category: formData.category,
          isActive: editingCourse.isActive
        }),
      });

      if (response.ok) {
        await fetchCourses();
        setEditingCourse(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kursus ini?')) return;

    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCourses();
      }
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const toggleCourseStatus = async (course: Course) => {
    try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: course.name,
          description: course.description,
          duration: course.duration,
          category: course.category,
          isActive: !course.isActive
        }),
      });

      if (response.ok) {
        await fetchCourses();
      }
    } catch (error) {
      console.error('Error toggling course status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration: 0,
      category: '',
      pricing: [
        { courseType: 'regular', basePrice: 0, discountRate: 0 },
        { courseType: 'private', basePrice: 0, discountRate: 0 }
      ]
    });
  };

  const startEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      description: course.description || '',
      duration: course.duration,
      category: course.category,
      pricing: course.pricing
    });
  };

  const cancelEdit = () => {
    setEditingCourse(null);
    resetForm();
  };

  const startEditPricing = (pricing: CoursePricing) => {
    setEditingPricing(pricing);
    setPricingFormData({
      courseType: pricing.courseType,
      basePrice: pricing.basePrice,
      discountRate: pricing.discountRate || 0,
      isActive: pricing.isActive
    });
    setIsPricingDialogOpen(true);
  };

  const handleUpdatePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingPricing) return;

    try {
      const response = await fetch('/api/pricing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingPricing.id,
          ...pricingFormData
        }),
      });

      if (response.ok) {
        await fetchCourses();
        setIsPricingDialogOpen(false);
        setEditingPricing(null);
      }
    } catch (error) {
      console.error('Error updating pricing:', error);
    }
  };

  if (loading) {
    return (
      <LoadingSpinner 
        message="Loading..."
        subMessage="Data kursus sedang dimuat"
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Program Kursus</h1>
          <p className="text-gray-600">Kelola semua kursus dan harga</p>
        </div>
        <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kursus
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah Kursus Baru</DialogTitle>
              <DialogDescription>
                Tambahkan kursus baru dengan harga dan detail lengkap. Durasi dihitung per pertemuan (1.5 jam per pertemuan).
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Kursus</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="programming">Programming</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="marketing">Digital Marketing</SelectItem>
                      <SelectItem value="data">Data Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Durasi (pertemuan)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                  required
                />
                <p className="text-sm text-gray-500">Setiap pertemuan berdurasi 1.5 jam</p>
              </div>

              <div className="space-y-4">
                <Label>Harga Kursus</Label>
                {formData.pricing.map((pricing, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Tipe</Label>
                        <Select 
                          value={pricing.courseType} 
                          onValueChange={(value) => {
                            const newPricing = [...formData.pricing];
                            newPricing[index].courseType = value;
                            setFormData({...formData, pricing: newPricing});
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="regular">Reguler</SelectItem>
                            <SelectItem value="private">Privat</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Harga Dasar</Label>
                        <Input
                          type="number"
                          min="0"
                          value={pricing.basePrice || ''}
                          onChange={(e) => {
                            const newPricing = [...formData.pricing];
                            newPricing[index].basePrice = parseInt(e.target.value) || 0;
                            setFormData({...formData, pricing: newPricing});
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Diskon (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={pricing.discountRate || ''}
                          onChange={(e) => {
                            const newPricing = [...formData.pricing];
                            newPricing[index].discountRate = parseInt(e.target.value) || 0;
                            setFormData({...formData, pricing: newPricing});
                          }}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddCourseOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Simpan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Kursus</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktif</p>
                <p className="text-2xl font-bold">{courses.filter(c => c.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-gray-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tidak Aktif</p>
                <p className="text-2xl font-bold">{courses.filter(c => !c.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Kategori</p>
                <p className="text-2xl font-bold">{[...new Set(courses.map(c => c.category))].length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Form */}
      {editingCourse && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Edit Kursus</CardTitle>
            <CardDescription>Perbarui informasi kursus. Durasi dihitung per pertemuan (1.5 jam per pertemuan).</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nama Kursus</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Kategori</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="programming">Programming</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="marketing">Digital Marketing</SelectItem>
                      <SelectItem value="data">Data Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Deskripsi</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Durasi (pertemuan)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  min="1"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                  required
                />
                <p className="text-sm text-gray-500">Setiap pertemuan berdurasi 1.5 jam</p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  <X className="h-4 w-4 mr-2" />
                  Batal
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Update
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kursus</CardTitle>
          <CardDescription>Kelola semua kursus dan harga</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Kursus</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Durasi</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id} className={!course.isActive ? 'opacity-60 bg-gray-50' : ''}>
                  <TableCell>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {course.name}
                        {!course.isActive && (
                          <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-600">
                            Tidak Aktif
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 line-clamp-1">
                        {course.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{course.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{course.duration} pertemuan</div>
                      <div className="text-gray-500">({Math.round((course.duration * 90) / 60)} jam)</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {course.pricing.map((pricing) => (
                        <div key={pricing.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="capitalize">{pricing.courseType}:</span>
                            <span className="font-medium">
                              Rp {pricing.basePrice.toLocaleString('id-ID')}
                            </span>
                            {pricing.discountRate > 0 && (
                              <Badge variant="outline" className="text-xs">
                                -{pricing.discountRate}%
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditPricing(pricing)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={course.isActive}
                        onCheckedChange={() => toggleCourseStatus(course)}
                      />
                      <span className="text-sm font-medium">
                        {course.isActive ? (
                          <span className="text-green-600">Aktif</span>
                        ) : (
                          <span className="text-red-600">Tidak Aktif</span>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(course)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(course.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Pricing Dialog */}
      <Dialog open={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Harga Kursus</DialogTitle>
            <DialogDescription>
              Perbarui harga dan diskon untuk kursus
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdatePricing} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-course-type">Tipe Kursus</Label>
              <Select 
                value={pricingFormData.courseType} 
                onValueChange={(value) => setPricingFormData({...pricingFormData, courseType: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Reguler</SelectItem>
                  <SelectItem value="private">Privat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-base-price">Harga Dasar</Label>
              <Input
                id="edit-base-price"
                type="number"
                min="0"
                value={pricingFormData.basePrice || ''}
                onChange={(e) => setPricingFormData({...pricingFormData, basePrice: parseInt(e.target.value) || 0})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-discount">Diskon (%)</Label>
              <Input
                id="edit-discount"
                type="number"
                min="0"
                max="100"
                value={pricingFormData.discountRate || ''}
                onChange={(e) => setPricingFormData({...pricingFormData, discountRate: parseInt(e.target.value) || 0})}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={pricingFormData.isActive}
                onCheckedChange={(checked) => setPricingFormData({...pricingFormData, isActive: checked})}
              />
              <Label htmlFor="edit-active">Aktif</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsPricingDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Update
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}