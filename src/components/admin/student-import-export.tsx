'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Loader2,
  FileSpreadsheet,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { type } from 'os';
import { type } from 'os';
import { error } from 'console';
import { error } from 'console';
import { error } from 'console';
import { error } from 'console';
import { error } from 'console';
import { type } from 'os';
import { error } from 'console';
import { error } from 'console';
import { error } from 'console';

interface ImportError {
  row: number;
  field: string;
  value: any;
  message: string;
}

interface ImportResult {
  success: boolean;
  totalRows: number;
  validRows: number;
  errorCount: number;
  errors: ImportError[];
  duplicateIds: string[];
  duplicateEmails: string[];
  previewData?: any[];
  importedStudents?: any[];
}

interface ExportOptions {
  includeInactive: boolean;
  dateFrom: string;
  dateTo: string;
  courseId: string;
}

interface StudentImportExportProps {
  onImportComplete?: () => void;
  courses?: Array<{ id: string; name: string }>;
}

export default function StudentImportExport({ onImportComplete, courses = [] }: StudentImportExportProps) {
  // Import states
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export states
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeInactive: false,
    dateFrom: '',
    dateTo: '',
    courseId: 'all'
  });

  // Template download
  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/students/template');
      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `student_import_template_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Template berhasil didownload!');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Gagal mendownload template');
    }
  };

  // File selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.error('Hanya file Excel (.xlsx, .xls) yang diperbolehkan');
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 10MB');
        return;
      }
      
      setSelectedFile(file);
      setImportResult(null);
      setShowPreview(false);
    }
  };

  // Import process
  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Pilih file Excel terlebih dahulu');
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/students/import', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      setImportResult(result);

      if (response.ok && result.success) {
        toast.success(`Berhasil mengimpor ${result.result.successCount} siswa!`);
        setImportDialogOpen(false);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onImportComplete?.();
      } else {
        // Show validation errors
        setShowPreview(true);
        if (result.result?.errorCount > 0) {
          toast.error(`Ditemukan ${result.result.errorCount} error dalam file`);
        }
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Terjadi kesalahan saat mengimpor data');
    } finally {
      setImporting(false);
    }
  };

  // Export process
  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (exportOptions.includeInactive) {
        params.append('includeInactive', 'true');
      }
      if (exportOptions.dateFrom) {
        params.append('dateFrom', exportOptions.dateFrom);
      }
      if (exportOptions.dateTo) {
        params.append('dateTo', exportOptions.dateTo);
      }
      if (exportOptions.courseId !== 'all') {
        params.append('courseId', exportOptions.courseId);
      }

      const response = await fetch(`/api/students/export?${params.toString()}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Get filename from response header or create default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'students_export.xlsx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Data siswa berhasil diekspor!');
      setExportDialogOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal mengekspor data');
    } finally {
      setExporting(false);
    }
  };

  // Reset import dialog
  const resetImportDialog = () => {
    setSelectedFile(null);
    setImportResult(null);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Template Download Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownloadTemplate}
        className="flex items-center gap-2"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Template
      </Button>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={(open) => {
        setImportDialogOpen(open);
        if (!open) resetImportDialog();
      }}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Data Siswa</DialogTitle>
            <DialogDescription>
              Upload file Excel untuk mengimpor data siswa dalam jumlah besar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file-upload">Pilih File Excel</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  File terpilih: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>

            {/* Import Result */}
            {importResult && (
              <div className="space-y-4">
                {importResult.success ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Berhasil mengimpor {importResult.result?.successCount || 0} siswa dari {importResult.totalRows} baris data.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      Ditemukan {importResult.result?.errorCount || 0} error dalam {importResult.totalRows} baris data.
                      {importResult.result?.validRows > 0 && (
                        <span> {importResult.result.validRows} baris valid siap diimpor.</span>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Error Details */}
                {importResult.result?.errors && importResult.result.errors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-red-800">Detail Error:</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {showPreview ? 'Sembunyikan' : 'Lihat Detail'}
                      </Button>
                    </div>
                    
                    {showPreview && (
                      <div className="max-h-60 overflow-y-auto border rounded">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Baris</TableHead>
                              <TableHead>Field</TableHead>
                              <TableHead>Nilai</TableHead>
                              <TableHead>Error</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {importResult.result.errors.slice(0, 50).map((error, index) => (
                              <TableRow key={index}>
                                <TableCell>{error.row}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{error.field}</Badge>
                                </TableCell>
                                <TableCell className="max-w-32 truncate">
                                  {error.value || '-'}
                                </TableCell>
                                <TableCell className="text-red-600 text-sm">
                                  {error.message}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {importResult.result.errors.length > 50 && (
                          <div className="p-2 text-center text-sm text-gray-500">
                            ... dan {importResult.result.errors.length - 50} error lainnya
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setImportDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                onClick={handleImport}
                disabled={!selectedFile || importing}
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mengimpor...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Data Siswa</DialogTitle>
            <DialogDescription>
              Pilih opsi export untuk mendownload data siswa dalam format Excel
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Export Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="include-inactive">Sertakan siswa tidak aktif</Label>
                <Switch
                  id="include-inactive"
                  checked={exportOptions.includeInactive}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeInactive: checked }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date-from">Tanggal Mulai</Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={exportOptions.dateFrom}
                    onChange={(e) => 
                      setExportOptions(prev => ({ ...prev, dateFrom: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-to">Tanggal Akhir</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={exportOptions.dateTo}
                    onChange={(e) => 
                      setExportOptions(prev => ({ ...prev, dateTo: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-filter">Filter Kursus</Label>
                <Select
                  value={exportOptions.courseId}
                  onValueChange={(value) => 
                    setExportOptions(prev => ({ ...prev, courseId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kursus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kursus</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setExportDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mengekspor...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}