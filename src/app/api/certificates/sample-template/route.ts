import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';

// GET - Download sample certificate template
export async function GET(request: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      // Create a simple HTML template that can be saved as Word document
      const templateContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Template Sertifikat</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            text-align: center;
            padding: 50px;
            line-height: 1.6;
        }
        .certificate {
            border: 3px solid #000;
            padding: 40px;
            margin: 20px;
            background: #fff;
        }
        .title {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 30px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .subtitle {
            font-size: 18px;
            margin-bottom: 40px;
            color: #666;
        }
        .student-name {
            font-size: 28px;
            font-weight: bold;
            margin: 20px 0;
            text-decoration: underline;
            color: #000;
        }
        .details {
            font-size: 16px;
            margin: 15px 0;
        }
        .signature {
            margin-top: 60px;
            font-size: 14px;
        }
        .placeholder {
            background-color: #e3f2fd;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="title">Sertifikat Penyelesaian Kursus</div>
        
        <div class="subtitle">Diberikan kepada:</div>
        
        <div class="student-name">
            <span class="placeholder">{{student_name}}</span>
        </div>
        
        <div class="details">
            ID Siswa: <span class="placeholder">{{student_id}}</span>
        </div>
        
        <div class="details">
            Telah menyelesaikan program kursus:
        </div>
        
        <div class="details" style="font-size: 20px; font-weight: bold; margin: 20px 0;">
            <span class="placeholder">{{course_name}}</span>
        </div>
        
        <div class="details">
            Dengan durasi: <span class="placeholder">{{course_duration}}</span> jam
        </div>
        
        <div class="details">
            Dibimbing oleh: <span class="placeholder">{{teacher_name}}</span>
        </div>
        
        <div class="details" style="margin-top: 40px;">
            Diberikan pada tanggal: <span class="placeholder">{{certificate_date}}</span>
        </div>
        
        <div class="signature">
            <div style="margin-top: 80px;">
                <div>_________________________</div>
                <div style="margin-top: 10px;">Direktur Kursus</div>
            </div>
        </div>
    </div>
    
    <div style="margin-top: 40px; padding: 20px; background: #f5f5f5; border-radius: 8px; text-align: left;">
        <h3>Instruksi Penggunaan:</h3>
        <ol>
            <li>Simpan file ini sebagai dokumen Word (.docx)</li>
            <li>Edit desain sesuai kebutuhan Anda</li>
            <li>Jangan ubah placeholder yang ada di dalam kurung kurawal ganda</li>
            <li>Upload template melalui halaman admin sertifikat</li>
        </ol>
        
        <h4>Placeholder yang tersedia:</h4>
        <ul>
            <li><code>{{student_name}}</code> - Nama siswa</li>
            <li><code>{{student_id}}</code> - ID siswa</li>
            <li><code>{{course_name}}</code> - Nama program kursus</li>
            <li><code>{{teacher_name}}</code> - Nama guru yang mengajar</li>
            <li><code>{{course_duration}}</code> - Durasi kursus dalam jam</li>
            <li><code>{{certificate_date}}</code> - Tanggal sertifikat digenerate</li>
            <li><code>{{certificate_month_year}}</code> - Bulan/tahun dalam angka romawi (contoh: I/2026)</li>
            <li><code>{{student_photo}}</code> - Foto siswa (otomatis diproses dan dimasukkan)</li>
        </ul>
    </div>
</body>
</html>`;

      return new NextResponse(templateContent, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': 'attachment; filename="template-sertifikat-contoh.html"',
          'Cache-Control': 'no-cache'
        }
      });

    } catch (error) {
      console.error('Error generating sample template:', error);
      return NextResponse.json(
        { error: 'Gagal membuat template contoh' },
        { status: 500 }
      );
    }
  })(request);
}