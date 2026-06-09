import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Award, BookOpen, CheckCircle, Clock, Download, FileText, User, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ studentNumber: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const student = await db.student.findUnique({
    where: { studentNumber: resolvedParams.studentNumber },
    include: { course: true }
  });

  if (!student || (student.status !== "completed" && student.status !== "graduated")) {
    return { title: "Siswa Tidak Ditemukan" };
  }

  return {
    title: `Verifikasi Alumni - ${student.name}`,
    description: `Halaman verifikasi resmi alumni Homely Kursus untuk ${student.name}.`,
  };
}

export default async function StudentPublicProfile({ params }: { params: Promise<{ studentNumber: string }> }) {
  const resolvedParams = await params;
  const studentNumber = resolvedParams.studentNumber;

  const student = await db.student.findUnique({
    where: { 
      studentNumber,
    },
    include: {
      course: true,
      certificates: {
        orderBy: {
          generatedAt: 'desc'
        }
      }
    }
  });

  if (!student || (student.status !== "completed" && student.status !== "graduated")) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <img
            src="https://res.cloudinary.com/dzksnkl72/image/upload/v1770305224/logo_innhbv.jpg"
            alt="Homely Logo"
            className="h-10 w-10 md:h-12 md:w-12 rounded object-cover"
          />
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900">Homely Kursus Komputer</h1>
          </div>
        </Link>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              {student.photo ? (
                <img src={student.photo} alt={student.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <User className="w-16 h-16 text-blue-500" />
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{student.name}</h2>
              </div>
              <p className="text-gray-500 mb-6 pb-6 border-b border-gray-100">ID Siswa: {student.studentNumber}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Program Kursus Block */}
                <div className="bg-blue-50/50 rounded-xl p-4 flex items-start gap-4 border border-blue-50">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[11px] text-blue-600 font-bold uppercase tracking-wider mb-1">PROGRAM KURSUS</p>
                    <p className="font-semibold text-gray-900 text-sm leading-snug">{student.course.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{student.courseType === 'private' ? 'Private' : 'Reguler'}</p>
                  </div>
                </div>

                {/* Status Akademik Block */}
                <div className="bg-green-50/50 rounded-xl p-4 flex items-start gap-4 border border-green-50">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[11px] text-green-600 font-bold uppercase tracking-wider mb-1">STATUS AKADEMIK</p>
                    <p className="font-semibold text-gray-900 text-sm leading-snug">Alumni (Lulus)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Certificates - takes up 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-6">
            {student.certificates.length > 0 ? (
              student.certificates.map((cert) => (
                <div key={cert.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0">
                      <CheckCircle className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-600 mb-2">Sertifikat Terverifikasi</h3>
                      <p className="text-sm text-gray-600 leading-relaxed max-w-lg">
                        Data peserta terverifikasi dan sertifikat ini diterbitkan secara resmi oleh Homely Kursus Komputer.
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="flex items-start gap-3">
                      <FileText className="w-6 h-6 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Nomor Sertifikat</p>
                        <p className="font-bold text-gray-900">{cert.certificateNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-6 h-6 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Durasi Kursus</p>
                        <p className="font-bold text-gray-900">{cert.courseDuration}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-6 h-6 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Tanggal Terbit</p>
                        <p className="font-bold text-gray-900">{format(cert.generatedAt, 'dd MMMM yyyy', { locale: id })}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-1">Belum Ada Sertifikat</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Sertifikat untuk siswa ini sedang dalam proses pembuatan atau belum di-generate oleh pihak admin.
                </p>
              </div>
            )}
          </div>

          {/* About Verification Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 h-full flex flex-col">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Tentang Verifikasi</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Halaman ini adalah bukti keaslian data peserta dan sertifikat yang telah diverifikasi oleh sistem resmi Homely Kursus Komputer.
              </p>
            </div>
          </div>
          
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-4 flex items-center gap-3 mt-4">
          <div className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center text-blue-500 font-bold text-xs flex-shrink-0">
            i
          </div>
          <p className="text-sm text-gray-600">Verifikasi dilakukan secara otomatis oleh sistem.</p>
        </div>

      </main>
    </div>
  );
}
