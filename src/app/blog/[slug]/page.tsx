'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, Tag } from 'lucide-react';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';

// Blog data (same as listing page)
const blogPosts = [
  {
    id: 1,
    title: 'Cara Belajar Microsoft Excel untuk Pemula di Pekanbaru',
    slug: 'cara-belajar-microsoft-excel-untuk-pemula-pekanbaru',
    excerpt: 'Panduan lengkap belajar Microsoft Excel untuk pemula di Pekanbaru. Tips, trik, dan rekomendasi kursus Excel terbaik. Mulai dari nol hingga mahir!',
    image: 'https://res.cloudinary.com/dzksnkl72/image/upload/v1738835142/microsoft-excel_zxcvbn.png',
    author: 'Admin Homely',
    date: '2025-02-09',
    readTime: '8 menit',
    category: 'Tutorial',
    categoryColor: 'bg-blue-500',
    content: `
      <p>Microsoft Excel adalah salah satu skill komputer yang paling dicari di dunia kerja. Menurut data LinkedIn, 80% lowongan pekerjaan kantor membutuhkan kemampuan Microsoft Excel. Jika Anda tinggal di Pekanbaru dan ingin belajar Excel dari nol, artikel ini akan memandu Anda langkah demi langkah.</p>

      <h2>Mengapa Belajar Microsoft Excel Itu Penting?</h2>
      <p>Microsoft Excel bukan hanya sekedar aplikasi spreadsheet biasa. Excel adalah tool powerful yang digunakan untuk:</p>
      <ul>
        <li><strong>Analisis Data</strong> - Mengolah dan menganalisis data bisnis</li>
        <li><strong>Laporan Keuangan</strong> - Membuat laporan keuangan perusahaan</li>
        <li><strong>Visualisasi Data</strong> - Membuat chart dan grafik yang menarik</li>
        <li><strong>Project Management</strong> - Tracking progress project</li>
        <li><strong>Database Management</strong> - Mengelola database sederhana</li>
      </ul>
      <p>Di Pekanbaru, banyak perusahaan seperti bank, BUMN, startup, dan UMKM yang membutuhkan karyawan dengan skill Excel yang mumpuni.</p>

      <h2>Langkah-Langkah Belajar Excel untuk Pemula</h2>

      <h3>1. Pahami Dasar-Dasar Excel</h3>
      <p>Sebelum masuk ke rumus yang kompleks, Anda harus memahami dasar-dasar Excel terlebih dahulu:</p>
      <p><strong>A. Mengenal Interface Excel</strong></p>
      <ul>
        <li>Ribbon dan Tab</li>
        <li>Cell, Row, dan Column</li>
        <li>Worksheet dan Workbook</li>
        <li>Formula Bar</li>
      </ul>
      <p><strong>B. Operasi Dasar</strong></p>
      <ul>
        <li>Input data (text, number, date)</li>
        <li>Format cell (font, color, border)</li>
        <li>Copy, paste, cut</li>
        <li>Undo dan redo</li>
      </ul>
      <p><strong>Tips:</strong> Luangkan waktu 2-3 hari untuk benar-benar familiar dengan interface Excel sebelum lanjut ke materi berikutnya.</p>

      <h3>2. Kuasai Rumus-Rumus Dasar</h3>
      <p>Rumus adalah jantung dari Microsoft Excel. Berikut rumus-rumus yang wajib dikuasai pemula:</p>
      <p><strong>Rumus Matematika Dasar:</strong></p>
      <ul>
        <li><code>SUM()</code> - Menjumlahkan angka</li>
        <li><code>AVERAGE()</code> - Menghitung rata-rata</li>
        <li><code>MAX()</code> - Mencari nilai tertinggi</li>
        <li><code>MIN()</code> - Mencari nilai terendah</li>
        <li><code>COUNT()</code> - Menghitung jumlah cell berisi angka</li>
      </ul>
      <p><strong>Rumus Logika:</strong></p>
      <ul>
        <li><code>IF()</code> - Kondisi if-then-else</li>
        <li><code>AND()</code> - Kondisi dan</li>
        <li><code>OR()</code> - Kondisi atau</li>
      </ul>

      <h3>3. Pelajari Fitur-Fitur Penting</h3>
      <p>Setelah menguasai rumus dasar, saatnya belajar fitur-fitur yang membuat pekerjaan Anda lebih efisien:</p>
      <ul>
        <li><strong>Sorting & Filtering</strong> - Sort data ascending/descending, filter berdasarkan kriteria</li>
        <li><strong>Conditional Formatting</strong> - Highlight cell berdasarkan nilai</li>
        <li><strong>Data Validation</strong> - Dropdown list dan input restrictions</li>
        <li><strong>Pivot Table</strong> - Membuat pivot table untuk analisis data</li>
        <li><strong>Charts & Graphs</strong> - Column chart, line chart, pie chart</li>
      </ul>

      <h3>4. Praktik dengan Project Nyata</h3>
      <p>Teori tanpa praktik tidak akan membuat Anda mahir. Coba buat project-project sederhana seperti:</p>
      <ol>
        <li><strong>Budget Bulanan Pribadi</strong> - Input pemasukan dan pengeluaran, hitung total dan sisa</li>
        <li><strong>Daftar Inventori Barang</strong> - List barang dengan harga, hitung total nilai inventori</li>
        <li><strong>Jadwal Kegiatan Mingguan</strong> - Buat tabel jadwal dengan color coding</li>
        <li><strong>Laporan Penjualan Sederhana</strong> - Input data penjualan harian, buat chart</li>
      </ol>

      <h2>Sumber Belajar Excel di Pekanbaru</h2>

      <h3>1. Kursus Offline di Pekanbaru</h3>
      <p>Jika Anda tipe orang yang lebih suka belajar tatap muka dengan instruktur, kursus offline adalah pilihan terbaik:</p>
      <p><strong>Keuntungan Kursus Offline:</strong></p>
      <ul>
        <li>Bimbingan langsung dari instruktur berpengalaman</li>
        <li>Bisa bertanya langsung saat ada yang tidak dipahami</li>
        <li>Networking dengan sesama peserta</li>
        <li>Sertifikat resmi setelah lulus</li>
        <li>Praktik dengan komputer yang sudah disiapkan</li>
      </ul>
      <p><strong>Rekomendasi:</strong> Homely Kursus Komputer menawarkan kursus Microsoft Office termasuk Excel dengan instruktur berpengalaman 5+ tahun, kelas kecil (maksimal 10 orang), jadwal fleksibel, lokasi strategis di Pekanbaru, dan harga terjangkau dengan kualitas terbaik.</p>

      <h3>2. Belajar Online (Gratis & Berbayar)</h3>
      <p>Jika budget terbatas atau ingin belajar mandiri, ada banyak sumber online:</p>
      <p><strong>Platform Gratis:</strong></p>
      <ul>
        <li>YouTube (channel: Ignasius Ryan, Kelas Excel)</li>
        <li>Microsoft Learn (official documentation)</li>
        <li>Google Sheets (alternatif gratis Excel)</li>
      </ul>
      <p><strong>Kekurangan Belajar Online:</strong></p>
      <ul>
        <li>Tidak ada bimbingan langsung</li>
        <li>Mudah kehilangan motivasi</li>
        <li>Tidak ada networking</li>
        <li>Sertifikat kurang diakui perusahaan lokal</li>
      </ul>

      <h2>Tips Sukses Belajar Excel</h2>
      <ol>
        <li><strong>Konsisten Praktik Setiap Hari</strong> - Luangkan minimal 30 menit setiap hari untuk praktik Excel</li>
        <li><strong>Jangan Takut Salah</strong> - Excel memiliki fitur Undo (Ctrl+Z). Jangan takut untuk eksperimen</li>
        <li><strong>Gunakan Keyboard Shortcuts</strong> - Ctrl+C (Copy), Ctrl+V (Paste), Ctrl+Z (Undo), dll</li>
        <li><strong>Join Komunitas Excel</strong> - Bergabung dengan komunitas Excel Indonesia di Facebook atau Telegram</li>
        <li><strong>Sertifikasi MOS</strong> - Setelah mahir, pertimbangkan untuk ambil sertifikasi Microsoft Office Specialist</li>
      </ol>

      <h2>Berapa Lama Waktu yang Dibutuhkan?</h2>
      <p>Waktu yang dibutuhkan untuk mahir Excel tergantung intensitas belajar:</p>
      <p><strong>Belajar Mandiri (Online):</strong></p>
      <ul>
        <li>Dasar: 2-3 bulan (1 jam/hari)</li>
        <li>Intermediate: 4-6 bulan</li>
        <li>Advanced: 8-12 bulan</li>
      </ul>
      <p><strong>Kursus Intensif (Offline):</strong></p>
      <ul>
        <li>Dasar: 2-4 minggu (3x seminggu)</li>
        <li>Intermediate: 1-2 bulan</li>
        <li>Advanced: 2-3 bulan</li>
      </ul>
      <p><strong>Tips:</strong> Dengan kursus offline, Anda bisa belajar lebih cepat karena ada struktur yang jelas dan bimbingan langsung.</p>

      <h2>Peluang Karir dengan Skill Excel</h2>
      <p>Setelah mahir Excel, banyak peluang karir terbuka untuk Anda:</p>
      <p><strong>Posisi yang Membutuhkan Excel:</strong></p>
      <ul>
        <li>Data Analyst (Gaji: Rp 5-10 juta/bulan)</li>
        <li>Financial Analyst (Gaji: Rp 6-12 juta/bulan)</li>
        <li>Admin & Staff Accounting (Gaji: Rp 4-7 juta/bulan)</li>
        <li>Business Analyst (Gaji: Rp 7-15 juta/bulan)</li>
        <li>Project Manager (Gaji: Rp 8-20 juta/bulan)</li>
      </ul>

      <h2>FAQ - Pertanyaan yang Sering Ditanya</h2>
      <p><strong>Apakah Excel sulit dipelajari?</strong></p>
      <p>Tidak! Excel sebenarnya mudah jika Anda belajar dengan metode yang tepat. Mulai dari dasar, praktik konsisten, dan jangan skip materi.</p>
      
      <p><strong>Berapa biaya kursus Excel di Pekanbaru?</strong></p>
      <p>Biaya kursus Excel di Pekanbaru bervariasi antara Rp 500.000 - Rp 1.500.000 tergantung durasi dan materi. Di Homely Kursus Komputer, kami menawarkan harga terjangkau dengan kualitas terbaik.</p>
      
      <p><strong>Apakah saya perlu background IT untuk belajar Excel?</strong></p>
      <p>Tidak perlu! Excel bisa dipelajari oleh siapa saja dari berbagai background. Yang penting adalah kemauan untuk belajar dan praktik.</p>

      <h2>Kesimpulan</h2>
      <p>Belajar Microsoft Excel adalah investasi terbaik untuk karir Anda. Dengan skill Excel yang mumpuni, peluang kerja dan penghasilan Anda akan meningkat signifikan.</p>
      <p><strong>Langkah-langkah belajar Excel:</strong></p>
      <ol>
        <li>Pahami dasar-dasar interface</li>
        <li>Kuasai rumus-rumus dasar</li>
        <li>Pelajari fitur-fitur penting</li>
        <li>Praktik dengan project nyata</li>
        <li>Tingkatkan dengan rumus advanced</li>
      </ol>
      <p>Jika Anda serius ingin mahir Excel dalam waktu singkat, kursus offline adalah pilihan terbaik. Di Pekanbaru, Homely Kursus Komputer menawarkan program Microsoft Office yang komprehensif dengan instruktur berpengalaman.</p>
    `
  },
  {
    id: 2,
    title: 'Tips Belajar Microsoft Office untuk Pemula',
    slug: 'tips-belajar-microsoft-office-pemula',
    excerpt: 'Panduan lengkap untuk memulai belajar Microsoft Office dari nol hingga mahir. Pelajari Word, Excel, dan PowerPoint dengan mudah.',
    image: 'https://res.cloudinary.com/dzksnkl72/image/upload/v1738835142/microsoft-office_iqvqxe.png',
    author: 'Admin Homely',
    date: '2024-02-05',
    readTime: '5 menit',
    category: 'Tutorial',
    categoryColor: 'bg-blue-500',
    content: `
      <h2>Mengapa Microsoft Office Penting?</h2>
      <p>Microsoft Office adalah suite aplikasi produktivitas yang paling banyak digunakan di dunia. Menguasai Microsoft Office akan membuka banyak peluang karir dan meningkatkan produktivitas Anda.</p>
      
      <h2>1. Microsoft Word - Pengolah Kata</h2>
      <p>Word adalah aplikasi pengolah kata yang powerful. Mulailah dengan mempelajari:</p>
      <ul>
        <li>Formatting teks dan paragraf</li>
        <li>Membuat tabel dan daftar</li>
        <li>Menyisipkan gambar dan grafik</li>
        <li>Menggunakan template</li>
      </ul>
      
      <h2>2. Microsoft Excel - Spreadsheet</h2>
      <p>Excel adalah aplikasi spreadsheet untuk analisis data. Fokus pada:</p>
      <ul>
        <li>Formula dasar (SUM, AVERAGE, COUNT)</li>
        <li>Formatting sel dan data</li>
        <li>Membuat chart dan grafik</li>
        <li>Pivot tables untuk analisis data</li>
      </ul>
      
      <h2>3. Microsoft PowerPoint - Presentasi</h2>
      <p>PowerPoint untuk membuat presentasi menarik:</p>
      <ul>
        <li>Desain slide yang efektif</li>
        <li>Animasi dan transisi</li>
        <li>Menyisipkan multimedia</li>
        <li>Tips presentasi profesional</li>
      </ul>
      
      <h2>Tips Belajar Efektif</h2>
      <p>Untuk menguasai Microsoft Office dengan cepat:</p>
      <ol>
        <li>Praktik setiap hari minimal 30 menit</li>
        <li>Ikuti tutorial online atau kursus</li>
        <li>Buat project nyata untuk latihan</li>
        <li>Jangan takut mencoba fitur baru</li>
      </ol>
      
      <h2>Kesimpulan</h2>
      <p>Microsoft Office adalah skill yang sangat berharga di dunia kerja modern. Dengan latihan konsisten dan panduan yang tepat, Anda bisa menguasainya dalam waktu singkat. Mulai belajar sekarang!</p>
    `
  },
  {
    id: 3,
    title: 'Cara Membuat Desain Grafis Profesional dengan CorelDRAW',
    slug: 'cara-membuat-desain-grafis-coreldraw',
    excerpt: 'Pelajari teknik-teknik dasar dan advanced dalam CorelDRAW untuk membuat desain grafis yang menarik dan profesional.',
    image: 'https://res.cloudinary.com/dzksnkl72/image/upload/v1738835142/corel-draw_aqhqxe.png',
    author: 'Admin Homely',
    date: '2024-02-03',
    readTime: '7 menit',
    category: 'Desain',
    categoryColor: 'bg-purple-500',
    content: `
      <h2>Pengenalan CorelDRAW</h2>
      <p>CorelDRAW adalah software desain grafis berbasis vektor yang sangat populer di kalangan desainer profesional. Software ini ideal untuk membuat logo, brosur, poster, dan berbagai desain grafis lainnya.</p>
      
      <h2>Tools Dasar yang Harus Dikuasai</h2>
      <ul>
        <li><strong>Pick Tool:</strong> Untuk memilih dan memanipulasi objek</li>
        <li><strong>Shape Tool:</strong> Mengedit bentuk dan kurva</li>
        <li><strong>Pen Tool:</strong> Membuat path dan kurva custom</li>
        <li><strong>Text Tool:</strong> Menambahkan dan mengedit teks</li>
      </ul>
      
      <h2>Teknik Desain Profesional</h2>
      <p>Beberapa teknik yang sering digunakan desainer profesional:</p>
      <ol>
        <li>Gunakan grid dan guidelines untuk alignment yang presisi</li>
        <li>Manfaatkan color palette yang konsisten</li>
        <li>Pelajari penggunaan layers untuk organisasi yang baik</li>
        <li>Kuasai teknik tracing untuk mengubah bitmap ke vektor</li>
      </ol>
      
      <h2>Tips untuk Pemula</h2>
      <p>Mulai dengan project sederhana seperti membuat logo atau kartu nama. Jangan langsung mencoba project yang terlalu kompleks. Praktik konsisten adalah kunci untuk menguasai CorelDRAW.</p>
    `
  },
  {
    id: 4,
    title: 'Mengenal Dasar-Dasar Editing Video dengan Adobe Premiere',
    slug: 'dasar-editing-video-adobe-premiere',
    excerpt: 'Tutorial lengkap untuk memulai editing video menggunakan Adobe Premiere Pro. Cocok untuk content creator pemula.',
    image: 'https://res.cloudinary.com/dzksnkl72/image/upload/v1738835142/adobe-premiere_xqhqwe.png',
    author: 'Admin Homely',
    date: '2024-02-01',
    readTime: '10 menit',
    category: 'Video Editing',
    categoryColor: 'bg-pink-500',
    content: `
      <h2>Mengapa Adobe Premiere Pro?</h2>
      <p>Adobe Premiere Pro adalah standar industri untuk video editing profesional. Digunakan oleh YouTuber, filmmaker, dan content creator di seluruh dunia.</p>
      
      <h2>Interface dan Workspace</h2>
      <p>Kenali bagian-bagian penting dalam Premiere Pro:</p>
      <ul>
        <li>Project Panel: Tempat menyimpan semua media</li>
        <li>Timeline: Area untuk mengedit video</li>
        <li>Program Monitor: Preview hasil editing</li>
        <li>Effect Controls: Mengatur efek dan animasi</li>
      </ul>
      
      <h2>Workflow Editing Dasar</h2>
      <ol>
        <li>Import footage dan audio</li>
        <li>Arrange clips di timeline</li>
        <li>Trim dan cut untuk pacing yang baik</li>
        <li>Tambahkan transitions dan effects</li>
        <li>Color grading untuk mood yang tepat</li>
        <li>Export dengan settings yang optimal</li>
      </ol>
      
      <h2>Tips untuk Content Creator</h2>
      <p>Gunakan keyboard shortcuts untuk mempercepat workflow. Pelajari color grading dasar untuk membuat video lebih cinematic. Jangan overuse effects - less is more!</p>
    `
  },
  {
    id: 5,
    title: 'Strategi Digital Marketing untuk UMKM',
    slug: 'strategi-digital-marketing-umkm',
    excerpt: 'Panduan praktis menggunakan digital marketing untuk meningkatkan penjualan bisnis UMKM Anda di era digital.',
    image: 'https://res.cloudinary.com/dzksnkl72/image/upload/v1738835142/digital-marketing_plqwer.png',
    author: 'Admin Homely',
    date: '2024-01-28',
    readTime: '6 menit',
    category: 'Marketing',
    categoryColor: 'bg-green-500',
    content: `
      <h2>Digital Marketing untuk UMKM</h2>
      <p>Di era digital, UMKM harus beradaptasi dengan strategi marketing online untuk tetap kompetitif dan menjangkau lebih banyak pelanggan.</p>
      
      <h2>Platform yang Harus Dimanfaatkan</h2>
      <ul>
        <li><strong>Instagram:</strong> Visual marketing dan engagement</li>
        <li><strong>Facebook:</strong> Community building dan ads</li>
        <li><strong>WhatsApp Business:</strong> Customer service dan sales</li>
        <li><strong>Google My Business:</strong> Local SEO</li>
      </ul>
      
      <h2>Strategi Content Marketing</h2>
      <p>Buat konten yang valuable untuk audience Anda:</p>
      <ol>
        <li>Behind the scenes produksi</li>
        <li>Tutorial penggunaan produk</li>
        <li>Testimoni pelanggan</li>
        <li>Tips dan trik terkait produk</li>
      </ol>
      
      <h2>Mengukur Kesuksesan</h2>
      <p>Gunakan analytics untuk tracking performa. Fokus pada metrics yang penting: engagement rate, conversion rate, dan ROI dari iklan yang dijalankan.</p>
    `
  },
  {
    id: 6,
    title: 'Photoshop untuk Pemula: Teknik Dasar yang Wajib Dikuasai',
    slug: 'photoshop-pemula-teknik-dasar',
    excerpt: 'Kuasai teknik-teknik dasar Adobe Photoshop yang paling sering digunakan dalam dunia desain grafis dan fotografi.',
    image: 'https://res.cloudinary.com/dzksnkl72/image/upload/v1738835142/adobe-photoshop_mnbvcx.png',
    author: 'Admin Homely',
    date: '2024-01-25',
    readTime: '8 menit',
    category: 'Desain',
    categoryColor: 'bg-purple-500',
    content: `
      <h2>Photoshop untuk Pemula</h2>
      <p>Adobe Photoshop adalah software editing foto dan desain grafis paling powerful. Meskipun terlihat kompleks, dengan mempelajari dasar-dasarnya, Anda bisa mulai membuat karya yang menakjubkan.</p>
      
      <h2>Tools Esensial</h2>
      <ul>
        <li><strong>Selection Tools:</strong> Marquee, Lasso, Magic Wand</li>
        <li><strong>Brush Tool:</strong> Untuk painting dan retouching</li>
        <li><strong>Clone Stamp:</strong> Menghilangkan objek tidak diinginkan</li>
        <li><strong>Layers:</strong> Fundamental untuk editing non-destructive</li>
      </ul>
      
      <h2>Teknik yang Harus Dikuasai</h2>
      <ol>
        <li>Layer masking untuk compositing</li>
        <li>Adjustment layers untuk color correction</li>
        <li>Blending modes untuk efek kreatif</li>
        <li>Smart objects untuk editing fleksibel</li>
      </ol>
      
      <h2>Project Latihan</h2>
      <p>Mulai dengan project sederhana: photo retouching, membuat poster, atau social media graphics. Praktik konsisten akan membuat Anda mahir dengan cepat.</p>
    `
  },
  {
    id: 7,
    title: 'Meningkatkan Produktivitas dengan Microsoft Excel',
    slug: 'meningkatkan-produktivitas-excel',
    excerpt: 'Tips dan trik menggunakan formula dan fitur Excel untuk meningkatkan produktivitas kerja Anda sehari-hari.',
    image: 'https://res.cloudinary.com/dzksnkl72/image/upload/v1738835142/microsoft-excel_zxcvbn.png',
    author: 'Admin Homely',
    date: '2024-01-22',
    readTime: '6 menit',
    category: 'Tutorial',
    categoryColor: 'bg-blue-500',
    content: `
      <h2>Excel untuk Produktivitas</h2>
      <p>Microsoft Excel bukan hanya untuk akuntan. Dengan menguasai Excel, Anda bisa mengotomasi banyak tugas repetitif dan menghemat waktu berjam-jam setiap minggu.</p>
      
      <h2>Formula yang Paling Berguna</h2>
      <ul>
        <li><strong>VLOOKUP/XLOOKUP:</strong> Mencari data dengan cepat</li>
        <li><strong>IF dan nested IF:</strong> Logic dan decision making</li>
        <li><strong>SUMIF/COUNTIF:</strong> Conditional calculations</li>
        <li><strong>INDEX MATCH:</strong> Alternative VLOOKUP yang lebih powerful</li>
      </ul>
      
      <h2>Fitur Produktivitas</h2>
      <ol>
        <li>Pivot Tables untuk analisis data cepat</li>
        <li>Conditional Formatting untuk visualisasi</li>
        <li>Data Validation untuk input yang akurat</li>
        <li>Macros untuk automasi tugas berulang</li>
      </ol>
      
      <h2>Tips Pro</h2>
      <p>Pelajari keyboard shortcuts untuk navigasi cepat. Gunakan named ranges untuk formula yang lebih readable. Selalu backup data penting Anda!</p>
    `
  }
];

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const post = blogPosts.find(p => p.slug === slug);
  
  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen pt-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Artikel Tidak Ditemukan</h1>
            <p className="text-gray-600 mb-8">Maaf, artikel yang Anda cari tidak tersedia.</p>
            <Link
              href="/blog"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Kembali ke Blog</span>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      {/* Back Button Section with top padding for fixed header */}
      <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm mt-16 md:mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/blog')}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Kembali ke Blog</span>
          </button>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Badge */}
        <div className="mb-6">
          <span className={`${post.categoryColor} text-white text-sm font-bold px-4 py-2 rounded-full inline-flex items-center space-x-2`}>
            <Tag size={16} />
            <span>{post.category}</span>
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center space-x-6 text-gray-600 mb-8 pb-8 border-b">
          <div className="flex items-center space-x-2">
            <Calendar size={18} />
            <span>{new Date(post.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock size={18} />
            <span>{post.readTime} baca</span>
          </div>
        </div>

        {/* Featured Image */}
        <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Article Body */}
        <div 
          className="prose prose-lg max-w-none
            prose-headings:text-gray-900 prose-headings:font-bold
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
            prose-ul:my-6 prose-ul:space-y-2
            prose-ol:my-6 prose-ol:space-y-2
            prose-li:text-gray-700
            prose-strong:text-gray-900 prose-strong:font-semibold"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Call to Action */}
        <div className="mt-16 p-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Tertarik Belajar Lebih Lanjut?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Daftar sekarang di Homely Kursus dan kuasai skill yang Anda butuhkan dengan bimbingan mentor profesional.
          </p>
          <Link
            href="/pendaftaran"
            className="inline-block bg-white text-blue-600 font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
          >
            Daftar Sekarang
          </Link>
        </div>
      </article>
      
      <Footer />
    </div>
  );
}
