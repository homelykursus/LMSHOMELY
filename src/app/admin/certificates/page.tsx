'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Edit,
  Users,
  Award,
  AlertCircle,
  CheckCircle,
  Plus,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  courseId?: string;
  course?: {
    id: string;
    name: string;
  };
  originalFileName: string;
  placeholders: string[];
  fileSize: number;
  fileType: string;
  isActive: boolean;
  createdAt: string;
  certificateCount: number;
  isGeneral?: boolean;
}

interface Course {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface Certificate {
  id: string;
  certificateNumber: string;
  studentName: string;
  courseName: string;
  teacherName?: string;
  generatedAt: string;
  status: string;
  downloadUrl?: string;
  template: {
    name: string;
  };
}

export default function CertificatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('templates');
  
  // Template upload state
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    category: 'course_completion',
    courseId: 'general',
    file: null as File | null
  });

  // Certificate generation state
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [generateForm, setGenerateForm] = useState({
    templateId: '',
    studentIds: [] as string[],
    selectedCourse: ''
  });

  // Edit template state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    category: '',
    isActive: true
  });

  // Filter state
  const [templateFilter, setTemplateFilter] = useState({
    courseId: 'all',
    category: 'all'
  });

  useEffect(() => {
    fetchTemplates();
    fetchCertificates();
    fetchCourses();
    fetchStudents();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses/active');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        toast.error('Gagal memuat data course');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Terjadi kesalahan saat memuat course');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        toast.error('Gagal memuat data siswa');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Terjadi kesalahan saat memuat siswa');
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/certificates/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      } else {
        toast.error('Gagal memuat data template');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Terjadi kesalahan saat memuat template');
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificates = async () => {
    try {
      const response = await fetch('/api/certificates');
      if (response.ok) {
        const data = await response.json();
        setCertificates(data.certificates);
      } else {
        toast.error('Gagal memuat data sertifikat');
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Terjadi kesalahan saat memuat sertifikat');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Format file tidak didukung. Hanya mendukung .docx dan .doc');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 10MB');
        return;
      }

      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  const handleUploadTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.file || !uploadForm.name) {
      toast.error('Nama template dan file harus diisi');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('name', uploadForm.name);
      formData.append('description', uploadForm.description);
      formData.append('category', uploadForm.category);
      if (uploadForm.courseId && uploadForm.courseId !== 'general') {
        formData.append('courseId', uploadForm.courseId);
      }

      const response = await fetch('/api/certificates/templates', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Template berhasil diupload');
        setIsUploadDialogOpen(false);
        resetUploadForm();
        fetchTemplates();
      } else {
        toast.error(result.error || 'Gagal mengupload template');
      }
    } catch (error) {
      console.error('Error uploading template:', error);
      toast.error('Terjadi kesalahan saat mengupload template');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateCertificates = async () => {
    if (!generateForm.templateId || generateForm.studentIds.length === 0) {
      toast.error('Template dan siswa harus dipilih');
      return;
    }

    setGenerating(true);

    try {
      if (generateForm.studentIds.length === 1) {
        // Single certificate generation
        const response = await fetch('/api/certificates/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            templateId: generateForm.templateId,
            studentId: generateForm.studentIds[0]
          })
        });

        const result = await response.json();

        if (response.ok) {
          toast.success('Sertifikat berhasil digenerate');
          setIsGenerateDialogOpen(false);
          resetGenerateForm();
          fetchCertificates();
        } else {
          toast.error(result.error || 'Gagal generate sertifikat');
        }
      } else {
        // Bulk certificate generation
        const response = await fetch('/api/certificates/bulk-generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            templateId: generateForm.templateId,
            studentIds: generateForm.studentIds
          })
        });

        const result = await response.json();

        if (response.ok) {
          const { totalGenerated, failed } = result.result;
          if (failed.length > 0) {
            toast.warning(`${totalGenerated} sertifikat berhasil, ${failed.length} gagal`);
          } else {
            toast.success(`${totalGenerated} sertifikat berhasil digenerate`);
          }
          setIsGenerateDialogOpen(false);
          resetGenerateForm();
          fetchCertificates();
        } else {
          toast.error(result.error || 'Gagal generate sertifikat');
        }
      }
    } catch (error) {
      console.error('Error generating certificates:', error);
      toast.error('Terjadi kesalahan saat generate sertifikat');
    } finally {
      setGenerating(false);
    }
  };

  const resetGenerateForm = () => {
    setGenerateForm({
      templateId: '',
      studentIds: [],
      selectedCourse: ''
    });
  };

  const resetUploadForm = () => {
    setUploadForm({
      name: '',
      description: '',
      category: 'course_completion',
      courseId: 'general',
      file: null
    });
  };

  const handleDeleteTemplate = async (template: Template) => {
    const warningMessage = template.certificateCount > 0 
      ? `PERINGATAN: Template "${template.name}" telah digunakan untuk ${template.certificateCount} sertifikat. Menghapus template ini mungkin akan mempengaruhi sertifikat yang sudah ada.\n\nApakah Anda yakin ingin menghapus template ini?`
      : `Apakah Anda yakin ingin menghapus template "${template.name}"?`;
      
    if (!confirm(warningMessage)) {
      return;
    }

    try {
      const response = await fetch(`/api/certificates/templates/${template.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Template berhasil dihapus');
        fetchTemplates();
      } else {
        toast.error(result.error || 'Gagal menghapus template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Terjadi kesalahan saat menghapus template');
    }
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setEditForm({
      name: template.name,
      description: template.description || '',
      category: template.category,
      isActive: template.isActive
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTemplate || !editForm.name) {
      toast.error('Nama template harus diisi');
      return;
    }

    setUpdating(true);

    try {
      const response = await fetch(`/api/certificates/templates/${editingTemplate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Template berhasil diperbarui');
        setIsEditDialogOpen(false);
        setEditingTemplate(null);
        resetEditForm();
        fetchTemplates();
      } else {
        toast.error(result.error || 'Gagal memperbarui template');
      }
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Terjadi kesalahan saat memperbarui template');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteCertificate = async (certificate: Certificate) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus sertifikat "${certificate.certificateNumber}" untuk ${certificate.studentName}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/certificates/${certificate.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Sertifikat berhasil dihapus');
        fetchCertificates(); // Refresh the certificates list
      } else {
        toast.error(result.error || 'Gagal menghapus sertifikat');
      }
    } catch (error) {
      console.error('Error deleting certificate:', error);
      toast.error('Terjadi kesalahan saat menghapus sertifikat');
    }
  };

  const resetEditForm = () => {
    setEditForm({
      name: '',
      description: '',
      category: '',
      isActive: true
    });
  };

  const getCategoryBadge = (category: string) => {
    const categories = {
      course_completion: { label: 'Penyelesaian Kursus', color: 'bg-blue-100 text-blue-800' },
      graduation: { label: 'Kelulusan', color: 'bg-green-100 text-green-800' },
      achievement: { label: 'Prestasi', color: 'bg-purple-100 text-purple-800' }
    };
    
    const cat = categories[category as keyof typeof categories] || { label: category, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={cat.color}>{cat.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statuses = {
      generated: { label: 'Digenerate', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      downloaded: { label: 'Didownload', color: 'bg-blue-100 text-blue-800', icon: Download }
    };
    
    const stat = statuses[status as keyof typeof statuses] || { label: status, color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    const Icon = stat.icon;
    
    return (
      <Badge className={`${stat.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {stat.label}
      </Badge>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter templates based on selected filters
  const filteredTemplates = templates.filter(template => {
    if (templateFilter.courseId && templateFilter.courseId !== 'all') {
      if (templateFilter.courseId === 'general') {
        if (template.courseId !== null) return false;
      } else {
        if (template.courseId !== templateFilter.courseId) return false;
      }
    }
    
    if (templateFilter.category && templateFilter.category !== 'all') {
      if (template.category !== templateFilter.category) return false;
    }
    
    return true;
  });

  const stats = {
    totalTemplates: templates.length,
    activeTemplates: templates.filter(t => t.isActive).length,
    generalTemplates: templates.filter(t => !t.courseId).length,
    courseSpecificTemplates: templates.filter(t => t.courseId).length,
    totalCertificates: certificates.length,
    recentCertificates: certificates.filter(c => {
      const generatedDate = new Date(c.generatedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return generatedDate >= weekAgo;
    }).length
  };

  if (loading) {
    return (
      <LoadingSpinner 
        message="Loading..."
        subMessage="Data sertifikat sedang dimuat"
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cetak Sertifikat</h1>
          <p className="text-gray-600">Kelola template dan generate sertifikat untuk siswa</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsGenerateDialogOpen(true)}>
            <Award className="h-4 w-4 mr-2" />
            Generate Sertifikat
          </Button>
          
          <Button variant="outline" asChild>
            <a href="/api/certificates/sample-template" download="template-sertifikat-contoh.html">
              <Download className="h-4 w-4 mr-2" />
              Download Template Contoh
            </a>
          </Button>
          
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Template
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Template</p>
                <p className="text-2xl font-bold">{stats.totalTemplates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Template Umum</p>
                <p className="text-2xl font-bold">{stats.generalTemplates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Template Khusus</p>
                <p className="text-2xl font-bold">{stats.courseSpecificTemplates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sertifikat</p>
                <p className="text-2xl font-bold">{stats.totalCertificates}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Template Sertifikat</TabsTrigger>
          <TabsTrigger value="certificates">Riwayat Sertifikat</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Sertifikat</CardTitle>
              <CardDescription>
                Kelola template Word untuk generate sertifikat
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filter Section */}
              <div className="flex space-x-4 mb-6">
                <div className="flex-1">
                  <Label htmlFor="filter-course">Filter Program Kursus</Label>
                  <Select 
                    value={templateFilter.courseId} 
                    onValueChange={(value) => setTemplateFilter(prev => ({ ...prev, courseId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Semua program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Program</SelectItem>
                      <SelectItem value="general">Template Umum</SelectItem>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="filter-category">Filter Kategori</Label>
                  <Select 
                    value={templateFilter.category} 
                    onValueChange={(value) => setTemplateFilter(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Semua kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kategori</SelectItem>
                      <SelectItem value="course_completion">Penyelesaian Kursus</SelectItem>
                      <SelectItem value="graduation">Kelulusan</SelectItem>
                      <SelectItem value="achievement">Prestasi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filteredTemplates.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Template</TableHead>
                        <TableHead>Program Kursus</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>File</TableHead>
                        <TableHead>Digunakan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTemplates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{template.name}</div>
                              {template.description && (
                                <div className="text-sm text-gray-500">{template.description}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {template.course ? (
                              <Badge className="bg-blue-100 text-blue-800">
                                {template.course.name}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-600">
                                Template Umum
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {getCategoryBadge(template.category)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{template.originalFileName}</div>
                              <div className="text-gray-500">{formatFileSize(template.fileSize)}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{template.certificateCount}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {template.isActive ? 'Aktif' : 'Tidak Aktif'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditTemplate(template)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleDeleteTemplate(template)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada template</h3>
                  <p className="text-gray-500 mb-4">Upload template Word pertama untuk mulai generate sertifikat</p>
                  <Button onClick={() => setIsUploadDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Template
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Sertifikat</CardTitle>
              <CardDescription>
                Daftar sertifikat yang telah digenerate
              </CardDescription>
            </CardHeader>
            <CardContent>
              {certificates.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No. Sertifikat</TableHead>
                        <TableHead>Siswa</TableHead>
                        <TableHead>Kursus</TableHead>
                        <TableHead>Guru</TableHead>
                        <TableHead>Template</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {certificates.map((certificate) => (
                        <TableRow key={certificate.id}>
                          <TableCell className="font-mono text-sm">
                            {certificate.certificateNumber}
                          </TableCell>
                          <TableCell>{certificate.studentName}</TableCell>
                          <TableCell>{certificate.courseName}</TableCell>
                          <TableCell>{certificate.teacherName || '-'}</TableCell>
                          <TableCell>{certificate.template.name}</TableCell>
                          <TableCell>
                            {new Date(certificate.generatedAt).toLocaleDateString('id-ID')}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(certificate.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {certificate.downloadUrl && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={certificate.downloadUrl} target="_blank" rel="noopener noreferrer">
                                    <Download className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleDeleteCertificate(certificate)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada sertifikat</h3>
                  <p className="text-gray-500">Sertifikat yang digenerate akan muncul di sini</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Template Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Template Sertifikat</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUploadTemplate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Nama Template</Label>
              <Input
                id="template-name"
                value={uploadForm.name}
                onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Contoh: Sertifikat Penyelesaian Kursus"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template-description">Deskripsi (Opsional)</Label>
              <Textarea
                id="template-description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Deskripsi template..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template-category">Kategori</Label>
              <Select value={uploadForm.category} onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="course_completion">Penyelesaian Kursus</SelectItem>
                  <SelectItem value="graduation">Kelulusan</SelectItem>
                  <SelectItem value="achievement">Prestasi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template-course">Program Kursus (Opsional)</Label>
              <Select value={uploadForm.courseId} onValueChange={(value) => setUploadForm(prev => ({ ...prev, courseId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih program kursus atau kosongkan untuk template umum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Template Umum (Semua Program)</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Jika dipilih, template hanya akan tersedia untuk program kursus ini. 
                Jika kosong, template dapat digunakan untuk semua program.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template-file">File Template (.docx atau .doc)</Label>
              <Input
                id="template-file"
                type="file"
                accept=".docx,.doc"
                onChange={handleFileUpload}
                required
              />
              {uploadForm.file && (
                <p className="text-sm text-gray-500">
                  File: {uploadForm.file.name} ({formatFileSize(uploadForm.file.size)})
                </p>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mengupload...
                  </div>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Template
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Generate Certificate Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Sertifikat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Pilih Program Kursus</Label>
              <Select 
                value={generateForm.selectedCourse} 
                onValueChange={(value) => setGenerateForm(prev => ({ ...prev, selectedCourse: value, templateId: '', studentIds: [] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih program kursus" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {generateForm.selectedCourse && (
              <>
                <div className="space-y-2">
                  <Label>Pilih Template</Label>
                  <Select 
                    value={generateForm.templateId} 
                    onValueChange={(value) => setGenerateForm(prev => ({ ...prev, templateId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih template sertifikat" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates
                        .filter(t => t.isActive && (t.courseId === generateForm.selectedCourse || !t.courseId))
                        .map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} {!template.courseId && '(Template Umum)'}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Pilih Siswa</Label>
                  <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                    {students
                      .filter(s => {
                        // Filter siswa berdasarkan course yang dipilih
                        if (s.courseId !== generateForm.selectedCourse) return false;
                        
                        // Cek apakah siswa sudah masuk kelas (ada di ClassStudent)
                        return s.classes && s.classes.length > 0;
                      })
                      .map((student) => (
                        <div key={student.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            id={`student-${student.id}`}
                            checked={generateForm.studentIds.includes(student.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setGenerateForm(prev => ({
                                  ...prev,
                                  studentIds: [...prev.studentIds, student.id]
                                }));
                              } else {
                                setGenerateForm(prev => ({
                                  ...prev,
                                  studentIds: prev.studentIds.filter(id => id !== student.id)
                                }));
                              }
                            }}
                            className="rounded"
                          />
                          <label htmlFor={`student-${student.id}`} className="flex-1 cursor-pointer">
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-gray-500">
                              ID: {student.id} | Status: {student.status} | Kelas: {student.classes?.length || 0}
                            </div>
                          </label>
                        </div>
                      ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    Hanya siswa yang sudah masuk kelas yang dapat digenerate sertifikat
                  </p>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                Batal
              </Button>
              <Button 
                onClick={handleGenerateCertificates}
                disabled={!generateForm.templateId || generateForm.studentIds.length === 0 || generating}
              >
                {generating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </div>
                ) : (
                  <>
                    <Award className="h-4 w-4 mr-2" />
                    Generate {generateForm.studentIds.length} Sertifikat
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Template Sertifikat</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateTemplate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-template-name">Nama Template</Label>
              <Input
                id="edit-template-name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Contoh: Sertifikat Penyelesaian Kursus"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-template-description">Deskripsi (Opsional)</Label>
              <Textarea
                id="edit-template-description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Deskripsi template..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-template-category">Kategori</Label>
              <Select value={editForm.category} onValueChange={(value) => setEditForm(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="course_completion">Penyelesaian Kursus</SelectItem>
                  <SelectItem value="graduation">Kelulusan</SelectItem>
                  <SelectItem value="achievement">Prestasi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-template-active"
                checked={editForm.isActive}
                onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="edit-template-active" className="cursor-pointer">
                Template Aktif
              </Label>
            </div>
            
            {editingTemplate && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600 mb-1">
                  <strong>File:</strong> {editingTemplate.originalFileName}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Ukuran:</strong> {formatFileSize(editingTemplate.fileSize)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Digunakan:</strong> {editingTemplate.certificateCount} kali
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Untuk mengganti file template, silakan upload template baru
                </p>
              </div>
            )}
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={updating}>
                {updating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menyimpan...
                  </div>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}