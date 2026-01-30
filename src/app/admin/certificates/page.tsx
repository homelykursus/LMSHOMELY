'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Award, 
  Upload, 
  FileText, 
  Settings, 
  Download, 
  Eye, 
  Trash2, 
  Plus,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface CertificateTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  originalFileName: string;
  fileSize: number;
  isActive: boolean;
  placeholders: string;
  course?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface Course {
  id: string;
  name: string;
}

export default function CertificatesPage() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    courseId: '',
    category: 'course_completion',
    file: null as File | null
  });
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    warnings?: string[];
  } | null>(null);

  // Load templates and courses
  useEffect(() => {
    loadTemplates();
    loadCourses();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/certificates/templates');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses');
      const data = await response.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.docx')) {
        setUploadResult({
          success: false,
          message: 'Hanya file .docx yang didukung'
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadResult({
          success: false,
          message: 'Ukuran file maksimal 10MB'
        });
        return;
      }
      setUploadForm(prev => ({ ...prev, file }));
      setUploadResult(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.name) {
      setUploadResult({
        success: false,
        message: 'Nama template dan file harus diisi'
      });
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('name', uploadForm.name);
      formData.append('description', uploadForm.description);
      formData.append('courseId', uploadForm.courseId);
      formData.append('category', uploadForm.category);
      formData.append('createdBy', 'admin'); // TODO: Get from auth

      const response = await fetch('/api/certificates/templates', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setUploadResult({
          success: true,
          message: 'Template berhasil diupload',
          warnings: data.validation?.warnings
        });
        setUploadForm({
          name: '',
          description: '',
          courseId: '',
          category: 'course_completion',
          file: null
        });
        setShowUploadForm(false);
        loadTemplates();
      } else {
        setUploadResult({
          success: false,
          message: data.error || 'Upload gagal'
        });
      }
    } catch (error: any) {
      setUploadResult({
        success: false,
        message: `Upload gagal: ${error.message}`
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus template ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/certificates/templates/${templateId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        loadTemplates();
      } else {
        alert(data.error || 'Gagal menghapus template');
      }
    } catch (error: any) {
      alert(`Gagal menghapus template: ${error.message}`);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPlaceholders = (placeholdersJson: string) => {
    try {
      return JSON.parse(placeholdersJson);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Memuat...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cetak Sertifikat</h1>
          <p className="text-gray-600">Kelola template Word dan generate sertifikat</p>
        </div>
        <Button onClick={() => setShowUploadForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Upload Template
        </Button>
      </div>

      {/* Upload Result Alert */}
      {uploadResult && (
        <Alert className={`mb-6 ${uploadResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <AlertCircle className={`h-4 w-4 ${uploadResult.success ? 'text-green-600' : 'text-red-600'}`} />
          <AlertDescription className={uploadResult.success ? 'text-green-800' : 'text-red-800'}>
            {uploadResult.message}
            {uploadResult.warnings && uploadResult.warnings.length > 0 && (
              <div className="mt-2">
                <strong>Peringatan:</strong>
                <ul className="list-disc list-inside mt-1">
                  {uploadResult.warnings.map((warning, index) => (
                    <li key={index} className="text-sm">{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Form */}
      {showUploadForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Template Word</CardTitle>
            <CardDescription>
              Upload file .docx dengan placeholder seperti {`{{student_name}}`}, {`{{course_name}}`}, dll.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nama Template *</Label>
                  <Input
                    id="name"
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Contoh: Sertifikat Kursus Komputer"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="course">Kursus (Opsional)</Label>
                  <Select value={uploadForm.courseId} onValueChange={(value) => setUploadForm(prev => ({ ...prev, courseId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kursus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Semua Kursus</SelectItem>
                      {courses.map(course => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Deskripsi template..."
                />
              </div>

              <div>
                <Label htmlFor="file">File Template (.docx) *</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".docx"
                  onChange={handleFileChange}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Maksimal 10MB. Gunakan placeholder seperti {`{{student_name}}`}, {`{{course_name}}`}, {`{{certificate_date}}`}
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Mengupload...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Template
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowUploadForm(false)}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Templates List */}
      <div className="grid grid-cols-1 gap-6">
        {templates.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Template</h3>
              <p className="text-gray-500 mb-4">Upload template Word pertama Anda untuk mulai membuat sertifikat</p>
              <Button onClick={() => setShowUploadForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Template Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          templates.map(template => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      {template.name}
                      {template.isActive ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Nonaktif
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {template.description || 'Tidak ada deskripsi'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline">
                      <Award className="h-4 w-4 mr-1" />
                      Generate
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>File:</strong> {template.originalFileName}
                    <br />
                    <strong>Ukuran:</strong> {formatFileSize(template.fileSize)}
                  </div>
                  <div>
                    <strong>Kursus:</strong> {template.course?.name || 'Semua Kursus'}
                    <br />
                    <strong>Kategori:</strong> {template.category}
                  </div>
                  <div>
                    <strong>Placeholder:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {getPlaceholders(template.placeholders).map((placeholder: string) => (
                        <Badge key={placeholder} variant="outline" className="text-xs">
                          {`{{${placeholder}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* System Status */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Status Sistem
          </CardTitle>
          <CardDescription>
            Sistem cetak sertifikat Word template sudah aktif
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <h4 className="font-medium text-green-900">Word Processing</h4>
                <p className="text-sm text-green-700">docxtemplater + pizzip</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium text-blue-900">Template Management</h4>
                <p className="text-sm text-blue-700">Upload & validation</p>
              </div>
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <h4 className="font-medium text-yellow-900">PDF Generation</h4>
                <p className="text-sm text-yellow-700">In development</p>
              </div>
              <Settings className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}