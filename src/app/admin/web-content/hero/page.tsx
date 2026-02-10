'use client';

import { useState, useEffect } from 'react';
import { Home, Plus, Edit, Trash2, Check, X, Image as ImageIcon } from 'lucide-react';

interface HeroSection {
  id: string;
  badgeText: string | null;
  title: string;
  description: string;
  imageUrl: string | null;
  animatedWords: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function HeroWebPage() {
  const [heroes, setHeroes] = useState<HeroSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHero, setEditingHero] = useState<HeroSection | null>(null);
  const [formData, setFormData] = useState({
    badgeText: '',
    title: '',
    description: '',
    imageUrl: '',
    animatedWords: '',
    isActive: false
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchHeroes();
  }, []);

  const fetchHeroes = async () => {
    try {
      const response = await fetch('/api/web-content/hero');
      if (response.ok) {
        const data = await response.json();
        setHeroes(data);
      }
    } catch (error) {
      console.error('Error fetching heroes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingHero 
        ? `/api/web-content/hero/${editingHero.id}`
        : '/api/web-content/hero';
      
      const method = editingHero ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchHeroes();
        resetForm();
      } else {
        alert('Gagal menyimpan hero');
      }
    } catch (error) {
      console.error('Error saving hero:', error);
      alert('Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (hero: HeroSection) => {
    setEditingHero(hero);
    setFormData({
      badgeText: hero.badgeText || '',
      title: hero.title,
      description: hero.description,
      imageUrl: hero.imageUrl || '',
      animatedWords: hero.animatedWords || '',
      isActive: hero.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus hero ini?')) return;

    try {
      const response = await fetch(`/api/web-content/hero/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchHeroes();
      } else {
        alert('Gagal menghapus hero');
      }
    } catch (error) {
      console.error('Error deleting hero:', error);
      alert('Terjadi kesalahan');
    }
  };

  const resetForm = () => {
    setFormData({
      badgeText: '',
      title: '',
      description: '',
      imageUrl: '',
      animatedWords: '',
      isActive: false
    });
    setEditingHero(null);
    setShowForm(false);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Home className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hero Web</h1>
            <p className="text-sm text-gray-600">Kelola judul, deskripsi, dan gambar hero section</p>
          </div>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Tambah Hero</span>
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingHero ? 'Edit Hero' : 'Tambah Hero Baru'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teks Badge
              </label>
              <input
                type="text"
                value={formData.badgeText}
                onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="📍 Kursus Komputer Pekanbaru"
              />
              <p className="text-xs text-gray-500 mt-1">
                Teks badge yang muncul di atas judul hero (opsional)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Judul <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: Kursus Komputer Pekanbaru"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Deskripsi hero section..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Gambar
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload gambar ke Cloudinary atau gunakan URL gambar
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kata-kata Animasi Typing
              </label>
              <input
                type="text"
                value={formData.animatedWords}
                onChange={(e) => setFormData({ ...formData, animatedWords: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder='Mudah,Cepat,Menyenangkan'
              />
              <p className="text-xs text-gray-500 mt-1">
                Pisahkan dengan koma (,) untuk beberapa kata. Contoh: Mudah,Cepat,Menyenangkan
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Set sebagai hero aktif (hanya 1 hero yang bisa aktif)
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? 'Menyimpan...' : editingHero ? 'Update' : 'Simpan'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading...</div>
        ) : heroes.length === 0 ? (
          <div className="p-12 text-center">
            <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Belum ada hero
            </h3>
            <p className="text-gray-600 mb-4">
              Klik tombol "Tambah Hero" untuk membuat hero section pertama
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {heroes.map((hero) => (
              <div key={hero.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {hero.title}
                      </h3>
                      {hero.isActive && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                          <Check className="h-3 w-3" />
                          <span>Aktif</span>
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{hero.description}</p>
                    {hero.imageUrl && (
                      <div className="flex items-center text-sm text-gray-500 space-x-1">
                        <ImageIcon className="h-4 w-4" />
                        <span className="truncate max-w-md">{hero.imageUrl}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(hero)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(hero.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
