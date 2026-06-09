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
import { LoadingSpinner } from '@/components/ui/loading-spinner';
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
  Loader2,
  Search,
  X
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface CertificateHistory {
  id: string;
  certificateNumber: string;
  courseName: string;
  courseDuration: string;
  generatedAt: string;
  student: {
    name: string;
    studentNumber: string;
  };
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
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
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

  const [history, setHistory] = useState<CertificateHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load templates and courses
  useEffect(() => {
    loadTemplates();
    loadCourses();
    loadStudents();
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch('/api/certificates/history');
      const data = await response.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus riwayat sertifikat ini?')) return;
    try {
      const res = await fetch(`/api/certificates/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory(history.filter(h => h.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete history', error);
    }
  };

  const handleDownloadQR = (studentNumber: string, studentName: string) => {
    const svg = document.getElementById(`qr-${studentNumber}`);
    if (svg) {
      const clone = svg.cloneNode(true) as SVGElement;
      clone.setAttribute("width", "1000"); // High resolution
      clone.setAttribute("height", "1000"); // High resolution
      const svgData = new XMLSerializer().serializeToString(clone);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = 1000;
        canvas.height = 1000;
        ctx?.drawImage(img, 0, 0, 1000, 1000);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `QR-Sertifikat-${studentName.replace(/\s+/g, '-')}.png`;
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

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
      setStudentSearchQuery('');
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
        // Single certificate generation - direct file download
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

        if (response.ok) {
          // Get filename from response headers
          const contentDisposition = response.headers.get('content-disposition');
          const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] || 'certificate.docx';
          
          // Download the file
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          alert('Sertifikat berhasil dibuat dan didownload!');
          loadHistory();
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          alert(errorData.error || 'Gagal membuat sertifikat');
        }
      } else {
        // Batch certificate generation - direct file download
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

        if (response.ok) {
          // Get filename from response headers
          const contentDisposition = response.headers.get('content-disposition');
          const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] || `batch-certificates-${selectedStudents.length}students.docx`;
          
          // Download the file
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          alert(`Berhasil membuat ${selectedStudents.length} sertifikat dalam 1 file Word!`);
          loadHistory();
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          alert(errorData.error || 'Gagal membuat sertifikat batch');
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

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="templates">Template & Generate</TabsTrigger>
          <TabsTrigger value="history">Riwayat Sertifikat</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">

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
      </TabsContent>

      <TabsContent value="history">
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Sertifikat</CardTitle>
            <CardDescription>
              Daftar siswa yang sertifikatnya sudah pernah digenerate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Belum ada riwayat sertifikat.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>ID Siswa</TableHead>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead>Program Kursus</TableHead>
                      <TableHead>Durasi</TableHead>
                      <TableHead>Tanggal Terbit</TableHead>
                      <TableHead>QR Code</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((cert, index) => (
                      <TableRow key={cert.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-mono text-sm">{cert.student.studentNumber}</TableCell>
                        <TableCell className="font-medium">{cert.student.name}</TableCell>
                        <TableCell>{cert.courseName}</TableCell>
                        <TableCell>{cert.courseDuration}</TableCell>
                        <TableCell>{format(new Date(cert.generatedAt), 'dd MMM yyyy', { locale: idLocale })}</TableCell>
                        <TableCell>
                          <div className="bg-white p-1 rounded inline-block border">
                            <QRCodeSVG
                              id={`qr-${cert.student.studentNumber}`}
                              value={`${typeof window !== 'undefined' ? window.location.origin : 'https://daftar.homelykursus.com'}/s/${cert.student.studentNumber}`}
                              size={60}
                              level="M"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDownloadQR(cert.student.studentNumber, cert.student.name)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download QR
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteHistory(cert.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      </Tabs>

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
                    onClick={() => {
                      const filtered = students.filter(student => 
                        (!selectedTemplate.course || selectedTemplate.course.id === student.course.id) &&
                        (studentSearchQuery === '' || student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()))
                      );
                      setSelectedStudents(filtered.map(s => s.id));
                    }}
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

              {/* Search Input */}
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama siswa..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {studentSearchQuery && (
                  <button
                    onClick={() => setStudentSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <div className="border rounded-lg max-h-60 overflow-y-auto">
                {students.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="mb-2">Tidak ada siswa yang memiliki kelas</div>
                    <div className="text-xs text-gray-400">
                      Siswa harus terdaftar di kelas untuk dapat membuat sertifikat
                    </div>
                  </div>
                ) : (() => {
                  const filteredStudents = students.filter(student => 
                    (!selectedTemplate.course || selectedTemplate.course.id === student.course.id) &&
                    (studentSearchQuery === '' || student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()))
                  );
                  
                  if (filteredStudents.length === 0) {
                    return (
                      <div className="p-4 text-center text-gray-500">
                        <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <div className="text-sm">Tidak ada siswa dengan nama &quot;{studentSearchQuery}&quot;</div>
                      </div>
                    );
                  }
                  
                  return filteredStudents.map(student => (
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
                  ));
                })()}
              </div>
              {studentSearchQuery && (
                <p className="text-xs text-gray-400 mt-1">
                  Menampilkan hasil pencarian untuk &quot;{studentSearchQuery}&quot;. Tombol &quot;Pilih Semua&quot; hanya memilih siswa yang tampil.
                </p>
              )}
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
    </div>
  );
}