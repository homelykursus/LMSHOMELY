'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Camera, X, User } from 'lucide-react';
import { toast } from 'sonner';

interface StudentPhotoUploadProps {
  studentId: string;
  studentName: string;
  currentPhoto?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onPhotoUpdated: () => void;
}

export default function StudentPhotoUpload({
  studentId,
  studentName,
  currentPhoto,
  isOpen,
  onClose,
  onPhotoUpdated
}: StudentPhotoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('File harus berupa gambar (JPG, PNG, dll)');
        return;
      }

      // Validate file size (max 10MB untuk Cloudinary free)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 10MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Pilih foto terlebih dahulu');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('studentId', studentId);

      const response = await fetch('/api/upload/student-photo', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Foto siswa berhasil diperbarui dengan Cloudinary');
        console.log('Cloudinary upload result:', result.data.cloudinary);
        onPhotoUpdated();
        handleClose();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Gagal mengupload foto');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Terjadi kesalahan saat mengupload foto');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const fakeEvent = {
        target: { files: [file] }
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(fakeEvent);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Upload Foto Siswa
          </DialogTitle>
          <DialogDescription>
            {studentName} - Tambah atau ganti foto profil
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Photo */}
          {currentPhoto && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Foto Saat Ini:</p>
              <img
                src={currentPhoto}
                alt={studentName}
                className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-gray-200"
              />
            </div>
          )}

          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div
              className="text-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {previewUrl ? (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover mx-auto border-2 border-blue-200"
                  />
                  <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                    <Camera className="h-4 w-4" />
                    <span>Klik untuk ganti foto</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 mx-auto text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">
                      Klik atau drag & drop foto di sini
                    </p>
                    <p className="text-xs text-gray-500">
                      JPG, PNG, GIF maksimal 10MB (Cloudinary)
                    </p>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-blue-700">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl('');
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={uploading}
            >
              Batal
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Mengupload...' : 'Upload Foto'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}