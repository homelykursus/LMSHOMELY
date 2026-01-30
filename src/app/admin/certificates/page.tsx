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

interface Student {
  id: string;
  name: string;
  studentNumber: string;
  course: {
    id: string;
    name: string;
  };
  classCount?: number;
  teachers?: string[];
}

export default function CertificatesPage() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    courseId: 'all',
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
    loadStudents();
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
      // For now, we'll extract courses from students data
      // In the future, we can create a dedicated courses API
      const response = await fetch('/api/students');
      const students = await response.json();
      
      // Extract unique courses from students
      const coursesMap = new Map();
      students.forEach((student: any) => {
        if (student.courseId && student.courseName) {
          coursesMap.set(student.courseId, {
            id: student.courseId,
            name: student.courseName
          });
        }
      });
      
      setCourses(Array.from(coursesMap.values()));
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const loadStudents = async () => {
    try {
      // Load only students who have classes (eligible for certificates)
      const response = await fetch('/api/students/with-classes');
      const students = await response.json();
      
      // Transform the data to match our interface
      const transformedStudents = students.map((student: any) => ({
        id: student.id,
        name: student.name,
        studentNumber: student.studentNumber,
        course: {
          id: student.course.id,
          name: student.course.name
        },
        classCount: student.classCount,
        teachers: student.teachers
      }));
      
      setStudents(transformedStudents);
    } catch (error) {
      console.error('Failed to load students:', error);
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
      formData.append('courseId', uploadForm.courseId === 'all' ? '' : uploadForm.courseId);
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
          courseId: 'all',
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

  const handleGenerateCertificate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setSelectedStudents([]);
      setShowGenerateModal(true);
    }
  };

  const handlePreviewTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Open template file for preview
      const templatePath = template.originalFileName;
      alert(`Preview template: ${template.name}\n\nFile: ${templatePath}\n\nNote: Template preview akan dibuka di aplikasi Word/Office yang terinstall.`);
      
      // In a real implementation, you might want to:
      // 1. Generate a sample certificate with dummy data
      // 2. Show it in a modal or new tab
      // 3. Or download the original template file
    }
  };

  const handleStudentSelection = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleGenerateSelected = async () => {
    if (!selectedTemplate || selectedStudents.length === 0) {
      alert('Pilih minimal satu siswa untuk generate sertifikat');
      return;
    }

    setGenerating(true);

    try {
      if (selectedStudents.length === 1) {
        // Single certificate generation
        const response = await fetch('/api/certificates/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            templateId: selectedTemplate.id,
            studentId: selectedStudents[0],
            generatedBy: 'admin' // TODO: Get from auth
          })
        });

        const data = await response.json();
        
        if (data.success) {
          alert('Sertifikat berhasil dibuat!');
          if (data.downloadUrl) {
            // Extract filename and use download API
            const filename = data.downloadUrl.split('/').pop();
            const downloadApiUrl = `/api/certificates/download/${filename}`;
            
            const link = document.createElement('a');
            link.href = downloadApiUrl;
            link.download = `${data.certificate.certificateNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        } else {
          alert(data.error || 'Gagal membuat sertifikat');
        }
      } else {
        // Batch certificate generation (multiple certificates in one document)
        const response = await fetch('/api/certificates/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            templateId: selectedTemplate.id,
            studentIds: selectedStudents,
            generatedBy: 'admin' // TODO: Get from auth
          })
        });

        const data = await response.json();
        
        if (data.success) {
          alert(`Berhasil membuat ${data.certificateCount} sertifikat dalam 1 file Word!`);
          
          // Download the combined certificate file
          if (data.downloadUrl) {
            const link = document.createElement('a');
            link.href = data.downloadUrl;
            link.download = `batch-certificates-${data.certificateCount}students.docx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        } else {
          alert(data.error || 'Gagal membuat sertifikat batch');
        }
      }

      setShowGenerateModal(false);
      setSelectedStudents([]);
      setSelectedTemplate(null);
    } catch (error: any) {
      alert(`Gagal membuat sertifikat: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPlaceholders = (placeholdersJson: string): string[] => {
    try {
      const parsed = JSON.parse(placeholdersJson);
      // Ensure we return an array of unique strings
      if (Array.isArray(parsed)) {
        return [...new Set(parsed.filter(item => typeof item === 'string'))];
      }
      return [];
    } catch {
      return [];
    }
  };

  // Component for Generated Certificates List
  const GeneratedCertificatesList = () => {
    const [generatedCerts, setGeneratedCerts] = useState<any[]>([]);
    const [loadingCerts, setLoadingCerts] = useState(true);

    useEffect(() => {
      loadGeneratedCertificates();
    }, []);

    const loadGeneratedCertificates = async () => {
      try {
        // For now, we'll fetch from database directly
        // In a real app, you'd have an API endpoint for this
        const response = await fetch('/api/certificates/generated');
        if (response.ok) {
          const data = await response.json();
          setGeneratedCerts(data.certificates || []);
        }
      } catch (error) {
        console.error('Failed to load generated certificates:', error);
      } finally {
        setLoadingCerts(false);
      }
    };

    const handleDownloadCertificate = (cert: any) => {
      if (cert.downloadUrl) {
        // Extract filename from download URL
        const filename = cert.downloadUrl.split('/').pop();
        const downloadApiUrl = `/api/certificates/download/${filename}`;
        
        const link = document.createElement('a');
        link.href = downloadApiUrl;
        link.download = `${cert.certificateNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };

    const handlePreviewCertificate = (cert: any) => {
      if (cert.downloadUrl) {
        window.open(cert.downloadUrl, '_blank');
      }
    };

    const handleDeleteCertificate = async (cert: any) => {
      if (!confirm(`Apakah Anda yakin ingin menghapus sertifikat ${cert.certificateNumber}?`)) {
        return;
      }

      try {
        const response = await fetch(`/api/certificates/${cert.id}`, {
          method: 'DELETE'
        });

        const data = await response.json();
        
        if (data.success) {
          alert('Sertifikat berhasil dihapus');
          loadGeneratedCertificates(); // Reload the list
        } else {
          alert(data.error || 'Gagal menghapus sertifikat');
        }
      } catch (error: any) {
        alert(`Gagal menghapus sertifikat: ${error.message}`);
      }
    };

    if (loadingCerts) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Memuat sertifikat...</span>
        </div>
      );
    }

    if (generatedCerts.length === 0) {
      return (
        <div className="text-center p-8 text-gray-500">
          <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Belum ada sertifikat yang dibuat</p>
          <p className="text-sm">Generate sertifikat pertama Anda menggunakan template di atas</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {generatedCerts.map((cert) => (
          <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
            <div className="flex-1">
              <div className="font-medium">{cert.studentName}</div>
              <div className="text-sm text-gray-500">
                {cert.certificateNumber} • {cert.courseName}
              </div>
              <div className="text-xs text-gray-400">
                Generated: {new Date(cert.generatedAt).toLocaleDateString('id-ID')}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePreviewCertificate(cert)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button
                size="sm"
                onClick={() => handleDownloadCertificate(cert)}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeleteCertificate(cert)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
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
                    <li key={`warning-${index}`} className="text-sm">{warning}</li>
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
            {/* Sample Template Download */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 mb-1">Template Contoh</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Download template contoh yang sudah berisi semua placeholder yang diperlukan. 
                    Anda bisa mengedit desainnya di Microsoft Word.
                  </p>
                  <a 
                    href="/sample-certificate-template.docx" 
                    download="sample-certificate-template.docx"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download Template Contoh
                  </a>
                </div>
              </div>
            </div>

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
                      <SelectItem value="all">Semua Kursus</SelectItem>
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
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handlePreviewTemplate(template.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleGenerateCertificate(template.id)}
                    >
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
                      {getPlaceholders(template.placeholders).map((placeholder: string, index: number) => (
                        <Badge key={`${template.id}-${placeholder}-${index}`} variant="outline" className="text-xs">
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

      {/* Generate Certificate Modal */}
      {showGenerateModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Generate Sertifikat</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowGenerateModal(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">Template: {selectedTemplate.name}</h4>
              <p className="text-sm text-blue-700">
                {selectedTemplate.course?.name || 'Semua Kursus'}
              </p>
              {selectedStudents.length > 1 && (
                <p className="text-xs text-blue-600 mt-1">
                  💡 Tip: Memilih beberapa siswa akan menghasilkan 1 file Word dengan {selectedStudents.length} halaman sertifikat
                </p>
              )}
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <Label>Pilih Siswa ({selectedStudents.length} dipilih)</Label>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedStudents(students.map(s => s.id))}
                  >
                    Pilih Semua
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedStudents([])}
                  >
                    Batal Pilih
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-lg max-h-60 overflow-y-auto">
                {students.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="mb-2">Tidak ada siswa yang memiliki kelas</div>
                    <div className="text-xs text-gray-400">
                      Siswa harus terdaftar di kelas untuk dapat membuat sertifikat
                    </div>
                  </div>
                ) : (
                  students
                    .filter(student => 
                      !selectedTemplate.course || 
                      selectedTemplate.course.id === student.course.id
                    )
                    .map(student => (
                      <div 
                        key={student.id} 
                        className="flex items-center p-3 border-b last:border-b-0 hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          id={`student-${student.id}`}
                          checked={selectedStudents.includes(student.id)}
                          onChange={(e) => handleStudentSelection(student.id, e.target.checked)}
                          className="mr-3"
                        />
                        <label 
                          htmlFor={`student-${student.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-gray-500">
                            {student.studentNumber} • {student.course.name}
                          </div>
                          {student.classCount && student.classCount > 0 && (
                            <div className="text-xs text-green-600">
                              ✓ {student.classCount} kelas • Guru: {student.teachers?.join(', ') || 'Tidak ada'}
                            </div>
                          )}
                        </label>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowGenerateModal(false)}
                disabled={generating}
              >
                Batal
              </Button>
              <Button 
                onClick={handleGenerateSelected}
                disabled={generating || selectedStudents.length === 0}
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Membuat...
                  </>
                ) : (
                  <>
                    <Award className="h-4 w-4 mr-2" />
                    {selectedStudents.length === 1 
                      ? 'Generate 1 Sertifikat' 
                      : `Generate ${selectedStudents.length} Sertifikat (1 File)`
                    }
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Certificates List */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-green-600" />
            Sertifikat yang Sudah Dibuat
          </CardTitle>
          <CardDescription>
            Daftar sertifikat yang sudah di-generate dan siap didownload
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GeneratedCertificatesList />
        </CardContent>
      </Card>

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