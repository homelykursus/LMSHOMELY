'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Upload, 
  Database, 
  FileText, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  HardDrive,
  Archive
} from 'lucide-react';

interface BackupFile {
  id: string;
  name: string;
  type: 'data' | 'full';
  size: string;
  createdAt: string;
  status: 'completed' | 'failed' | 'in-progress';
}

export default function BackupPage() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [backupFiles, setBackupFiles] = useState<BackupFile[]>([
    {
      id: '1',
      name: 'backup-data-2025-01-27.json',
      type: 'data',
      size: '2.5 MB',
      createdAt: '2025-01-27 10:30:00',
      status: 'completed'
    },
    {
      id: '2',
      name: 'backup-full-2025-01-26.zip',
      type: 'full',
      size: '15.2 MB',
      createdAt: '2025-01-26 09:15:00',
      status: 'completed'
    }
  ]);
  const { toast } = useToast();

  const handleDataBackup = async () => {
    setIsBackingUp(true);
    setBackupProgress(0);

    try {
      // Simulate backup progress
      const interval = setInterval(() => {
        setBackupProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/admin/backup/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Backup failed');
      }

      const result = await response.json();
      
      // Add new backup to list
      const newBackup: BackupFile = {
        id: Date.now().toString(),
        name: `backup-data-${new Date().toISOString().split('T')[0]}.json`,
        type: 'data',
        size: result.size || '2.5 MB',
        createdAt: new Date().toLocaleString('id-ID'),
        status: 'completed'
      };
      
      setBackupFiles(prev => [newBackup, ...prev]);

      toast({
        title: "Backup Data Berhasil",
        description: "Data berhasil di-backup dan siap didownload.",
      });

      // Auto download
      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = newBackup.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      toast({
        title: "Backup Gagal",
        description: "Terjadi kesalahan saat melakukan backup data.",
        variant: "destructive",
      });
    } finally {
      setIsBackingUp(false);
      setBackupProgress(0);
    }
  };

  const handleFullBackup = async () => {
    setIsBackingUp(true);
    setBackupProgress(0);

    try {
      // Simulate backup progress
      const interval = setInterval(() => {
        setBackupProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 300);

      const response = await fetch('/api/admin/backup/full', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Full backup failed');
      }

      const blob = await response.blob();
      
      // Add new backup to list
      const newBackup: BackupFile = {
        id: Date.now().toString(),
        name: `backup-full-${new Date().toISOString().split('T')[0]}.zip`,
        type: 'full',
        size: `${(blob.size / (1024 * 1024)).toFixed(1)} MB`,
        createdAt: new Date().toLocaleString('id-ID'),
        status: 'completed'
      };
      
      setBackupFiles(prev => [newBackup, ...prev]);

      toast({
        title: "Backup Full Berhasil",
        description: "Backup lengkap berhasil dibuat dan siap didownload.",
      });

      // Auto download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = newBackup.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      toast({
        title: "Backup Full Gagal",
        description: "Terjadi kesalahan saat melakukan backup lengkap.",
        variant: "destructive",
      });
    } finally {
      setIsBackingUp(false);
      setBackupProgress(0);
    }
  };

  const handleRestore = async (file: File) => {
    setIsRestoring(true);

    try {
      const formData = new FormData();
      formData.append('backup', file);

      const response = await fetch('/api/admin/backup/restore', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Restore failed');
      }

      const result = await response.json();

      toast({
        title: "Restore Berhasil",
        description: `Data berhasil dipulihkan dari backup. ${result.restored_records} records restored.`,
      });

    } catch (error) {
      toast({
        title: "Restore Gagal",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat memulihkan data.",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json') || file.name.endsWith('.zip')) {
        handleRestore(file);
      } else {
        toast({
          title: "File Tidak Valid",
          description: "Hanya file .json atau .zip yang diperbolehkan.",
          variant: "destructive",
        });
      }
    }
  };

  const downloadBackup = async (backup: BackupFile) => {
    try {
      const response = await fetch(`/api/admin/backup/download/${backup.id}`);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backup.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Berhasil",
        description: `File ${backup.name} berhasil didownload.`,
      });
    } catch (error) {
      toast({
        title: "Download Gagal",
        description: "Terjadi kesalahan saat mendownload file backup.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Backup & Restore</h1>
          <p className="text-gray-600 mt-2">Kelola backup data sistem kursus</p>
        </div>
      </div>

      <Tabs defaultValue="backup" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="backup">Buat Backup</TabsTrigger>
          <TabsTrigger value="restore">Restore Data</TabsTrigger>
          <TabsTrigger value="history">Riwayat Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="backup" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Data Backup */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  <CardTitle>Backup Data Saja</CardTitle>
                </div>
                <CardDescription>
                  Backup hanya data database (siswa, guru, kelas, pembayaran, dll) tanpa file assets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Yang di-backup:</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Data siswa & alumni</li>
                    <li>• Data guru & kelas</li>
                    <li>• Pembayaran & keuangan</li>
                    <li>• Absensi & pertemuan</li>
                    <li>• Sertifikat (metadata)</li>
                  </ul>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Ukuran estimasi:</span>
                  <Badge variant="secondary">~2-5 MB</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Format:</span>
                  <Badge variant="outline">JSON</Badge>
                </div>

                {isBackingUp && (
                  <div className="space-y-2">
                    <Progress value={backupProgress} className="w-full" />
                    <p className="text-sm text-gray-600 text-center">
                      Memproses backup... {backupProgress}%
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handleDataBackup}
                  disabled={isBackingUp}
                  className="w-full"
                >
                  {isBackingUp ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Membuat Backup...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Backup Data
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Full Backup */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Archive className="h-5 w-5 text-green-600" />
                  <CardTitle>Backup Lengkap</CardTitle>
                </div>
                <CardDescription>
                  Backup lengkap termasuk data database dan semua file assets (foto, template, sertifikat)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Yang di-backup:</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Semua data database</li>
                    <li>• Foto siswa & guru</li>
                    <li>• Template sertifikat</li>
                    <li>• File sertifikat PDF</li>
                    <li>• Konfigurasi sistem</li>
                  </ul>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Ukuran estimasi:</span>
                  <Badge variant="secondary">~10-50 MB</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Format:</span>
                  <Badge variant="outline">ZIP</Badge>
                </div>

                {isBackingUp && (
                  <div className="space-y-2">
                    <Progress value={backupProgress} className="w-full" />
                    <p className="text-sm text-gray-600 text-center">
                      Memproses backup lengkap... {backupProgress}%
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handleFullBackup}
                  disabled={isBackingUp}
                  className="w-full"
                  variant="outline"
                >
                  {isBackingUp ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Membuat Backup...
                    </>
                  ) : (
                    <>
                      <HardDrive className="mr-2 h-4 w-4" />
                      Backup Lengkap
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="restore" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Restore Data dari Backup</span>
              </CardTitle>
              <CardDescription>
                Upload file backup untuk memulihkan data sistem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".json,.zip"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleRestore(file);
                    }
                  }}
                  className="hidden"
                  id="restore-file"
                />
                <div className="cursor-pointer" onClick={() => document.getElementById('restore-file')?.click()}>
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Pilih File Backup
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Drag & drop atau klik untuk memilih file backup (.json atau .zip)
                  </p>
                  <Button 
                    variant="outline" 
                    disabled={isRestoring}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('restore-file')?.click();
                    }}
                  >
                    {isRestoring ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memulihkan...
                      </>
                    ) : (
                      'Pilih File'
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Peringatan</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Proses restore akan mengganti semua data yang ada. Pastikan Anda sudah membuat backup data saat ini sebelum melakukan restore.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Riwayat Backup</span>
              </CardTitle>
              <CardDescription>
                Daftar file backup yang pernah dibuat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backupFiles.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {backup.type === 'data' ? (
                          <Database className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Archive className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{backup.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{backup.createdAt}</span>
                          </span>
                          <span>{backup.size}</span>
                          <Badge 
                            variant={backup.type === 'data' ? 'default' : 'secondary'}
                          >
                            {backup.type === 'data' ? 'Data Only' : 'Full Backup'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {backup.status === 'completed' && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadBackup(backup)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}