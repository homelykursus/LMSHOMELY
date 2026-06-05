'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Users,
  BookOpen,
  RefreshCw,
  XCircle,
  Monitor,
  User,
  Info,
  CheckCircle,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  avatar?: string;
}

interface AvailableClass {
  id: string;
  name: string;
  schedule: string;
  room: string | null;
  courseName: string;
  courseCategory: string;
  maxStudents: number;
  enrolledCount: number;
  availableSlots: number;
  isFull: boolean;
  students: Student[];
}

const ADMIN_WHATSAPP = '628216457578';

function getInitials(name: string): string {
  const words = name.trim().split(' ').filter((w) => w.length > 0);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return words[0]?.substring(0, 2).toUpperCase() || 'U';
}

function maskName(name: string): string {
  const words = name.trim().split(' ').filter((w) => w.length > 0);
  if (words.length === 0) return '';
  if (words.length === 1) {
    const word = words[0];
    if (word.length <= 2) return word;
    return word.substring(0, 2) + '*'.repeat(word.length - 2);
  }
  const firstName = words[0];
  const maskedOthers = words.slice(1).map((w) => w.charAt(0) + '*'.repeat(w.length - 1));
  return [firstName, ...maskedOthers].join(' ');
}

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-red-500',
];

function getAvatarColor(name: string): string {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export default function KuotaKelasPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<AvailableClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/public/available-classes');
      if (!res.ok) throw new Error('Gagal memuat data');
      const data = await res.json();
      setClasses(data);
    } catch (err) {
      setError('Gagal memuat data kelas. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handlePilihKelas = (cls: AvailableClass) => {
    const msg = encodeURIComponent(
      `Halo Admin,\n\nSaya tertarik untuk bergabung di kelas berikut:\n\n📚 *${cls.name}*\n🎓 Program: ${cls.courseName}\n🕐 Jadwal: ${cls.schedule}\n\nMohon informasi lebih lanjut mengenai pendaftaran. Terima kasih!`
    );
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${msg}`, '_blank');
  };

  const handlePrivateClass = () => {
    const msg = encodeURIComponent(
      `Halo Admin,\n\nSaya tertarik dengan kelas Private dengan jadwal yang fleksibel.\n\nMohon informasi lebih lanjut mengenai kelas private. Terima kasih!`
    );
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${msg}`, '_blank');
  };

  const getCourseIcon = (courseName: string) => {
    if (courseName.toLowerCase().includes('office') || courseName.toLowerCase().includes('excel')) {
      return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
    }
    return <BookOpen className="h-4 w-4 text-emerald-600" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <img
            src="https://res.cloudinary.com/dzksnkl72/image/upload/v1770305224/logo_innhbv.jpg"
            alt="Homely Logo"
            className="h-10 w-10 md:h-12 md:w-12 rounded object-cover"
          />
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900">Homely Kursus Komputer</h1>
          </div>
        </div>
        <button
          onClick={() => router.push('/pendaftaran')}
          className="bg-gradient-to-br from-orange-400 via-orange-500 to-pink-500 hover:from-orange-500 hover:via-orange-600 hover:to-pink-600 text-white px-6 py-2 rounded-full font-medium transition-all flex items-center space-x-2 text-sm shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5"
          style={{
            boxShadow: '0 4px 15px rgba(251, 146, 60, 0.4), inset 0 -2px 5px rgba(0, 0, 0, 0.2)',
          }}
        >
          <FileText className="w-4 h-4" />
          <span>Daftar</span>
        </button>
      </header>

      <main className="w-full max-w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-10">
        {/* Title Section */}
        <div className="mb-10">
          <div className="inline-block bg-rose-50 text-[#ed325a] px-3 py-1 rounded-md text-xs font-bold tracking-wider mb-4 border border-rose-100 uppercase">
            Kelas Segera Mulai
          </div>
          <h2 className="text-4xl font-extrabold text-[#1a2b4b] mb-3 tracking-tight">
            Kuota Kelas Tersedia
          </h2>
          <p className="text-slate-500 text-lg">
            Pilih jadwal kelas kursus komputer yang masih tersedia.
          </p>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-[#ed325a] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Memuat data kelas...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-lg mx-auto">
            <XCircle className="h-10 w-10 text-red-400 mx-auto mb-2" />
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={fetchClasses}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Grid Layout for classes */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...classes].sort((a, b) => (a.isFull === b.isFull ? 0 : a.isFull ? 1 : -1)).map((cls) => {
              let badgeText = '';
              let badgeColor = '';
              if (cls.isFull) {
                badgeText = 'KELAS PENUH';
                badgeColor = 'bg-rose-50 text-rose-600 border border-rose-100';
              } else if (cls.availableSlots <= 2) {
                badgeText = `${cls.availableSlots} siswa lagi`;
                badgeColor = 'bg-orange-50 text-orange-600 border border-orange-100';
              } else if (cls.availableSlots <= 4) {
                badgeText = `${cls.availableSlots} siswa lagi`;
                badgeColor = 'bg-blue-50 text-blue-600 border border-blue-100';
              } else {
                badgeText = `${cls.availableSlots} siswa lagi`;
                badgeColor = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
              }

              const progressPct = Math.min((cls.enrolledCount / cls.maxStudents) * 100, 100);

              return (
                <div key={cls.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow h-full">
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Card Header: Days & Badge */}
                    <div className="flex justify-between items-start mb-4 gap-2">
                      <h3 className="font-bold text-slate-800 text-lg leading-tight">{cls.name}</h3>
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-md whitespace-nowrap uppercase tracking-wide ${badgeColor}`}>
                        {badgeText}
                      </span>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-2 text-slate-600 text-sm font-medium mb-4">
                      <Clock className="w-4 h-4 text-[#ed325a]" />
                      <span>{cls.schedule}</span>
                    </div>

                    {/* Course */}
                    <div className="bg-emerald-50/70 rounded-xl px-3 py-2.5 flex items-center gap-2.5 mb-6 border border-emerald-100/50">
                      {getCourseIcon(cls.courseName)}
                      <span className="text-emerald-700 text-sm font-semibold">{cls.courseName}</span>
                    </div>

                    {/* Students List */}
                    <div className="mb-6 flex-1">
                      <h4 className="font-bold text-slate-800 text-sm mb-3">
                        Siswa Terdaftar ({cls.enrolledCount}/{cls.maxStudents})
                      </h4>
                      <div className="flex flex-col gap-3">
                        {cls.students.map((student) => (
                          <div key={student.id} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${getAvatarColor(student.name)}`}>
                              {getInitials(student.name)}
                            </div>
                            <span className="text-slate-600 text-sm font-medium">{maskName(student.name)}</span>
                          </div>
                        ))}
                        {cls.students.length === 0 && (
                          <p className="text-gray-400 text-sm italic">Belum ada siswa.</p>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar & Footer */}
                    <div className="mt-auto pt-5 border-t border-gray-100">
                      <div className="flex justify-between items-center text-sm font-bold text-slate-800 mb-2">
                        <span>Kuota</span>
                        <span>{cls.enrolledCount}/{cls.maxStudents}</span>
                      </div>
                      <div className="h-2.5 w-full bg-gray-100 rounded-full mb-6 overflow-hidden">
                        <div
                          className="h-full bg-[#ed325a] rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      {cls.isFull ? (
                        <button disabled className="w-full bg-gray-100 text-gray-400 font-bold py-3 rounded-xl text-sm cursor-not-allowed">
                          Kelas Penuh
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePilihKelas(cls)}
                          className="w-full bg-[#ed325a] hover:bg-rose-600 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm shadow-rose-200"
                        >
                          Pilih Kelas
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Section */}
        {!loading && !error && (
          <div className="mt-12">
            {/* Private Class Banner - Modern & Prominent */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1a2b4b] via-indigo-900 to-[#1e3a8a] rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center gap-10 border border-indigo-500/20">

              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[100px] opacity-30 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-64 h-64 bg-[#ed325a] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

              <div className="flex-shrink-0 relative z-10">
                <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-[0_0_30px_rgba(59,130,246,0.3)] transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="relative">
                    <Users className="w-12 h-12 text-blue-200" />
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-tr from-[#ed325a] to-pink-500 rounded-xl p-1.5 shadow-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 relative z-10 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight">
                  Butuh waktu belajar yang lebih <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-emerald-300">fleksibel?</span>
                </h3>
                <p className="text-indigo-100 mb-8 text-base md:text-lg max-w-2xl">
                  Tersedia juga <strong className="text-white font-bold">Kelas Private (1 Guru 1 Siswa)</strong> yang materinya bisa disesuaikan khusus untuk kebutuhanmu.
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-indigo-50 font-medium">
                  <div className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 transition-colors px-4 py-2.5 rounded-xl border border-white/10 shadow-sm backdrop-blur-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>Waktu Fleksibel</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 transition-colors px-4 py-2.5 rounded-xl border border-white/10 shadow-sm backdrop-blur-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>Materi Kustom</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 transition-colors px-4 py-2.5 rounded-xl border border-white/10 shadow-sm backdrop-blur-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>Belajar Fokus</span>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 relative z-10 w-full md:w-auto mt-6 md:mt-0">
                <button
                  onClick={handlePrivateClass}
                  className="group relative w-full md:w-auto bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-bold py-4 px-8 rounded-2xl text-base transition-all duration-300 shadow-[0_10px_20px_-10px_rgba(59,130,246,0.6)] hover:shadow-[0_15px_30px_-10px_rgba(59,130,246,0.8)] hover:-translate-y-1 overflow-hidden border border-blue-400/50"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Lihat Kelas Private
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="mt-12 text-center flex items-center justify-center gap-2 text-slate-500 text-sm">
            <svg className="w-4 h-4 text-[#ed325a]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            Kami siap membantu kamu menemukan kelas yang paling sesuai.
          </div>
        )}
      </main>
    </div>
  );
}

