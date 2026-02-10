'use client';

import { useState, useEffect } from 'react';
import { MapPin, Plus, Edit, Trash2, Check, X } from 'lucide-react';

interface LocationInfo {
  id: string;
  title: string;
  subtitle: string;
  address: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  instagramUsername: string;
  instagramUrl: string;
  googleMapsEmbed: string;
  googleMapsLink: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function LocationWebPage() {
  const [locations, setLocations] = useState<LocationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationInfo | null>(null);
  const [formData, setFormData] = useState({
    title: 'Lokasi Kami',
    subtitle: 'Kunjungi kami dan rasakan pengalaman belajar yang menyenangkan',
    address: 'Jl. Kasah Ujung, No. 3, Pekanbaru\nRiau, Indonesia',
    whatsappNumber: '6282164575780',
    whatsappDisplay: '+62 821-6457-578',
    instagramUsername: 'homelykursus',
    instagramUrl: 'https://instagram.com/homelykursus',
    googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15958.850753834!2d101.43638!3d0.50729!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d5a8e9e4c8f8e9%3A0x1234567890abcdef!2sJl.%20Kasah%20Ujung%2C%20No.%203%2C%20Pekanbaru%20-%20Riau!5e0!3m2!1sen!2sid!4v1234567890',
    googleMapsLink: 'https://maps.app.goo.gl/1WPaH5dPRuhyhfVv6',
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/web-content/location');
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      }
    } catch (error) {
      console.error('Error fetching location info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingLocation 
        ? `/api/web-content/location/${editingLocation.id}`
        : '/api/web-content/location';
      
      const method = editingLocation ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          createdBy: 'admin'
        })
      });

      if (response.ok) {
        await fetchLocations();
        resetForm();
      } else {
        alert('Gagal menyimpan informasi lokasi');
      }
    } catch (error) {
      console.error('Error saving location info:', error);
      alert('Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (location: LocationInfo) => {
    setEditingLocation(location);
    setFormData({
      title: location.title,
      subtitle: location.subtitle,
      address: location.address,
      whatsappNumber: location.whatsappNumber,
      whatsappDisplay: location.whatsappDisplay,
      instagramUsername: location.instagramUsername,
      instagramUrl: location.instagramUrl,
      googleMapsEmbed: location.googleMapsEmbed,
      googleMapsLink: location.googleMapsLink,
      isActive: location.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus informasi lokasi ini?')) return;

    try {
      const response = await fetch(`/api/web-content/location/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchLocations();
      } else {
        alert('Gagal menghapus informasi lokasi');
      }
    } catch (error) {
      console.error('Error deleting location info:', error);
      alert('Terjadi kesalahan');
    }
  };

  const resetForm = () => {
    setFormData({
      title: 'Lokasi Kami',
      subtitle: 'Kunjungi kami dan rasakan pengalaman belajar yang menyenangkan',
      address: 'Jl. Kasah Ujung, No. 3, Pekanbaru\nRiau, Indonesia',
      whatsappNumber: '6282164575780',
      whatsappDisplay: '+62 821-6457-578',
      instagramUsername: 'homelykursus',
      instagramUrl: 'https://instagram.com/homelykursus',
      googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15958.850753834!2d101.43638!3d0.50729!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d5a8e9e4c8f8e9%3A0x1234567890abcdef!2sJl.%20Kasah%20Ujung%2C%20No.%203%2C%20Pekanbaru%20-%20Riau!5e0!3m2!1sen!2sid!4v1234567890',
      googleMapsLink: 'https://maps.app.goo.gl/1WPaH5dPRuhyhfVv6',
      isActive: true
    });
    setEditingLocation(null);
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
          <MapPin className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Lokasi Kami</h1>
        </div>
        <p className="text-gray-600">Kelola informasi lokasi yang ditampilkan di halaman landing</p>
      </div>

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Informasi Lokasi</span>
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingLocation ? 'Edit Informasi Lokasi' : 'Tambah Informasi Lokasi Baru'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Section *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Lokasi Kami"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle *
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Kunjungi kami..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat Lengkap *
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Jl. Kasah Ujung, No. 3, Pekanbaru&#10;Riau, Indonesia"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Gunakan Enter untuk baris baru
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor WhatsApp (Format: 628xxx) *
                </label>
                <input
                  type="text"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="6282164575780"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Untuk link WhatsApp (tanpa + dan spasi)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor WhatsApp (Tampilan) *
                </label>
                <input
                  type="text"
                  value={formData.whatsappDisplay}
                  onChange={(e) => setFormData({ ...formData, whatsappDisplay: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+62 821-6457-578"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format untuk ditampilkan di website
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username Instagram (tanpa @) *
                </label>
                <input
                  type="text"
                  value={formData.instagramUsername}
                  onChange={(e) => setFormData({ ...formData, instagramUsername: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="homelykursus"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Instagram *
                </label>
                <input
                  type="url"
                  value={formData.instagramUrl}
                  onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://instagram.com/homelykursus"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Maps Embed URL *
              </label>
              <textarea
                value={formData.googleMapsEmbed}
                onChange={(e) => setFormData({ ...formData, googleMapsEmbed: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                rows={3}
                placeholder="https://www.google.com/maps/embed?pb=..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Dapatkan dari Google Maps → Share → Embed a map → Copy HTML (ambil URL dari src="...")
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Maps Link (untuk tombol) *
              </label>
              <input
                type="url"
                value={formData.googleMapsLink}
                onChange={(e) => setFormData({ ...formData, googleMapsLink: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://maps.app.goo.gl/..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Link pendek dari Google Maps untuk tombol "Buka di Google Maps"
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

      {/* Locations List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Judul
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alamat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kontak
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
              {locations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Belum ada informasi lokasi. Klik tombol "Tambah Informasi Lokasi" untuk menambahkan.
                  </td>
                </tr>
              ) : (
                locations.map((location) => (
                  <tr key={location.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{location.title}</div>
                      <div className="text-sm text-gray-500">{location.subtitle}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 whitespace-pre-line max-w-xs">
                        {location.address}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div>WA: {location.whatsappDisplay}</div>
                        <div>IG: @{location.instagramUsername}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        location.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {location.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(location)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center space-x-1"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(location.id)}
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
          <strong>Total:</strong> {locations.length} informasi lokasi | 
          <strong className="ml-2">Aktif:</strong> {locations.filter(l => l.isActive).length}
        </p>
      </div>
    </div>
  );
}
