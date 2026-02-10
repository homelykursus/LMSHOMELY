'use client';

import { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Edit, Trash2, Check, X } from 'lucide-react';

interface GalleryImage {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function GalleryWebPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    category: 'Fasilitas',
    order: 0,
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/web-content/gallery');
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingImage 
        ? `/api/web-content/gallery/${editingImage.id}`
        : '/api/web-content/gallery';
      
      const method = editingImage ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          createdBy: 'admin'
        })
      });

      if (response.ok) {
        await fetchImages();
        resetForm();
      } else {
        alert('Gagal menyimpan foto galeri');
      }
    } catch (error) {
      console.error('Error saving gallery image:', error);
      alert('Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (image: GalleryImage) => {
    setEditingImage(image);
    setFormData({
      title: image.title,
      imageUrl: image.imageUrl,
      category: image.category,
      order: image.order,
      isActive: image.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus foto galeri ini?')) return;

    try {
      const response = await fetch(`/api/web-content/gallery/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchImages();
      } else {
        alert('Gagal menghapus foto galeri');
      }
    } catch (error) {
      console.error('Error deleting gallery image:', error);
      alert('Terjadi kesalahan');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      imageUrl: '',
      category: 'Fasilitas',
      order: 0,
      isActive: true
    });
    setEditingImage(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <ImageIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Galeri Foto</h1>
        </div>
        <p className="text-gray-600">Kelola foto galeri yang ditampilkan di halaman landing</p>
      </div>

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Foto Galeri</span>
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingImage ? 'Edit Foto Galeri' : 'Tambah Foto Galeri Baru'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Judul Foto *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: Ruang Kelas Modern"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Gambar *
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Masukkan URL gambar dari Cloudinary atau sumber lainnya
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="Fasilitas">Fasilitas</option>
                <option value="Aktivitas">Aktivitas</option>
                <option value="Acara">Acara</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Urutan Tampil
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Angka lebih kecil akan ditampilkan lebih dulu
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Aktif (tampilkan di halaman landing)
              </label>
            </div>

            {/* Preview Image */}
            {formData.imageUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview Gambar
                </label>
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                  }}
                />
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Check className="w-5 h-5" />
                <span>{submitting ? 'Menyimpan...' : 'Simpan'}</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
                <span>Batal</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Gallery Images List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Judul
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urutan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {images.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Belum ada foto galeri. Klik tombol "Tambah Foto Galeri" untuk menambahkan.
                  </td>
                </tr>
              ) : (
                images.map((image) => (
                  <tr key={image.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={image.imageUrl}
                        alt={image.title}
                        className="w-20 h-16 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/80x60?text=Error';
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{image.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {image.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {image.order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        image.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {image.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(image)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center space-x-1"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(image.id)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center space-x-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Hapus</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Total:</strong> {images.length} foto galeri | 
          <strong className="ml-2">Aktif:</strong> {images.filter(i => i.isActive).length} foto
        </p>
      </div>
    </div>
  );
}
