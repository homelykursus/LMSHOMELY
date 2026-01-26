'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Loader2, 
  GraduationCap, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle, 
  Star,
  Monitor,
  Smartphone,
  Globe,
  Award,
  User
} from 'lucide-react'
import { toast } from 'sonner'

interface Course {
  id: string
  name: string
  description: string
  duration: number
  category: string
  pricing: {
    id: string
    courseType: string
    basePrice: number
    discountRate: number
  }[]
}

export default function RegistrationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [isClient, setIsClient] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    gender: '',
    whatsapp: '',
    courseId: '',
    courseType: 'regular',
    lastEducation: '',
    referralSource: ''
  })
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Update dateOfBirth when individual date components change
  useEffect(() => {
    if (formData.birthDay && formData.birthMonth && formData.birthYear) {
      const formattedDate = `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}`
      setFormData(prev => ({ ...prev, dateOfBirth: formattedDate }))
    }
  }, [formData.birthDay, formData.birthMonth, formData.birthYear])

  // Generate arrays for dropdowns
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString())
  const months = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
  ]
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 80 }, (_, i) => (currentYear - i).toString())

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data || [])
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    }
  }

  useEffect(() => {
    if (isClient) {
      fetchCourses()
    }
  }, [isClient])

  useEffect(() => {
    if (formData.courseId) {
      const course = courses.find(c => c.id === formData.courseId)
      setSelectedCourse(course || null)
    } else {
      setSelectedCourse(null)
    }
  }, [formData.courseId, courses])

  const calculatePrice = () => {
    if (!selectedCourse) return 0
    
    const pricing = selectedCourse.pricing.find(p => p.courseType === formData.courseType)
    if (!pricing) return 0
    
    const basePrice = pricing.basePrice
    const discount = (basePrice * pricing.discountRate) / 100
    return basePrice - discount
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.birthDay || !formData.birthMonth || !formData.birthYear || !formData.gender || !formData.whatsapp || !formData.courseId) {
      toast.error('Mohon lengkapi semua field yang wajib diisi')
      return
    }

    // Validasi format nama
    if (!/^[a-zA-Z\s\.\-']+$/.test(formData.name.trim())) {
      toast.error('Nama hanya boleh mengandung huruf, spasi, titik, strip, dan apostrof')
      return
    }

    // Validasi format WhatsApp
    if (!/^[0-9\+\-\s\(\)]+$/.test(formData.whatsapp.trim())) {
      toast.error('Nomor WhatsApp hanya boleh mengandung angka, +, -, spasi, dan tanda kurung')
      return
    }

    setIsLoading(true)
    
    try {
      const finalPrice = calculatePrice()
      const pricing = selectedCourse?.pricing.find(p => p.courseType === formData.courseType)
      const discount = pricing ? (pricing.basePrice * pricing.discountRate) / 100 : 0

      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          finalPrice,
          discount
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Pendaftaran berhasil! Kami akan menghubungi Anda segera.')
        setFormData({
          name: '',
          dateOfBirth: '',
          birthDay: '',
          birthMonth: '',
          birthYear: '',
          gender: '',
          whatsapp: '',
          courseId: '',
          courseType: 'regular',
          lastEducation: '',
          referralSource: ''
        })
        setSelectedCourse(null)
      } else {
        toast.error(data.error || 'Terjadi kesalahan saat mendaftar')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Terjadi kesalahan koneksi. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state on server-side
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
          <p className="text-gray-600 mt-2">Memuat halaman pendaftaran</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Homely Kursus Komputer</h1>
                <p className="text-gray-600">Belajar Komputer dengan Mudah dan Praktis</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+62 812-3456-7890</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@homelykursus.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Pendaftaran */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Users className="h-6 w-6" />
                  Daftar Sekarang
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Isi form di bawah untuk mendaftar kursus komputer
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Masukkan nama lengkap"
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-sm font-medium">
                        Jenis Kelamin <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Laki-laki</SelectItem>
                          <SelectItem value="female">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Tanggal Lahir <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-3">
                        <Select value={formData.birthDay} onValueChange={(value) => setFormData(prev => ({ ...prev, birthDay: value }))}>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Tanggal" />
                          </SelectTrigger>
                          <SelectContent>
                            {days.map((day) => (
                              <SelectItem key={day} value={day}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-5">
                        <Select value={formData.birthMonth} onValueChange={(value) => setFormData(prev => ({ ...prev, birthMonth: value }))}>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Bulan" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month.value} value={month.value}>
                                {month.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-4">
                        <Select value={formData.birthYear} onValueChange={(value) => setFormData(prev => ({ ...prev, birthYear: value }))}>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Tahun" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp" className="text-sm font-medium">
                        Nomor WhatsApp <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="whatsapp"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                        placeholder="08123456789"
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="referralSource" className="text-sm font-medium">
                        Tau Homely Kursus dari mana?
                      </Label>
                      <Select value={formData.referralSource} onValueChange={(value) => setFormData(prev => ({ ...prev, referralSource: value }))}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Pilih sumber referral" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Instagram">Instagram</SelectItem>
                          <SelectItem value="Facebook">Facebook</SelectItem>
                          <SelectItem value="Google">Google</SelectItem>
                          <SelectItem value="Tiktok">Tiktok</SelectItem>
                          <SelectItem value="dari Teman">dari Teman</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastEducation" className="text-sm font-medium">
                      Pendidikan Terakhir
                    </Label>
                    <Select value={formData.lastEducation} onValueChange={(value) => setFormData(prev => ({ ...prev, lastEducation: value }))}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Pilih pendidikan terakhir" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SD">SD</SelectItem>
                        <SelectItem value="SMP">SMP</SelectItem>
                        <SelectItem value="SMA">SMA/SMK</SelectItem>
                        <SelectItem value="D3">Diploma (D3)</SelectItem>
                        <SelectItem value="S1">Sarjana (S1)</SelectItem>
                        <SelectItem value="S2">Magister (S2)</SelectItem>
                        <SelectItem value="S3">Doktor (S3)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="courseId" className="text-sm font-medium">
                      Pilih Program Kursus <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.courseId} onValueChange={(value) => setFormData(prev => ({ ...prev, courseId: value }))}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Pilih program kursus" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            <div className="flex items-center gap-2">
                              <Monitor className="h-4 w-4" />
                              {course.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="courseType" className="text-sm font-medium">
                      Jenis Kelas <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.courseType} onValueChange={(value) => setFormData(prev => ({ ...prev, courseType: value }))}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Kelas Reguler (5ngg)
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Kelas Privat (1-on-1)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Preview */}
                  {selectedCourse && (
                    <Alert className="border-blue-200 bg-blue-50">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <div className="space-y-2">
                          <div className="font-medium">Informasi Kursus:</div>
                          <div className="text-sm space-y-1">
                            <div>Program: {selectedCourse.name}</div>
                            <div>Durasi: {selectedCourse.duration} pertemuan</div>
                            <div>Jenis: {formData.courseType === 'regular' ? 'Kelas Reguler' : 'Kelas Privat'}</div>
                            <div className="font-semibold text-lg text-blue-900">
                              Biaya: {formatCurrency(calculatePrice())}
                            </div>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Memproses Pendaftaran...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Daftar Sekarang
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Program Unggulan */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="h-5 w-5 text-green-600" />
                  Program Unggulan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Monitor className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <div className="font-medium">Microsoft Office</div>
                      <div className="text-sm text-gray-600">Word, Excel, PowerPoint</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <div className="font-medium">Web Design</div>
                      <div className="text-sm text-gray-600">HTML, CSS, JavaScript</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Smartphone className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <div className="font-medium">Graphic Design</div>
                      <div className="text-sm text-gray-600">Photoshop, CorelDraw</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Keunggulan */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="h-5 w-5 text-purple-600" />
                  Mengapa Pilih Kami?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Instruktur berpengalaman</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Kelas kecil (max 8 siswa)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Sertifikat resmi</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Jadwal fleksibel</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Praktek langsung</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kontak */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Hubungi Kami
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <div className="font-medium">Telepon</div>
                      <div className="text-sm text-gray-600">+62 812-3456-7890</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-gray-600">info@homelykursus.com</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <div className="font-medium">Alamat</div>
                      <div className="text-sm text-gray-600">
                        Jl. Pendidikan No. 123<br />
                        Jakarta Selatan 12345
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <div className="font-medium">Jam Operasional</div>
                      <div className="text-sm text-gray-600">
                        Senin - Sabtu: 08:00 - 17:00<br />
                        Minggu: Tutup
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Homely Kursus Komputer</h3>
          </div>
          <p className="text-gray-400 mb-4">
            Tempat terbaik untuk belajar komputer dengan metode praktis dan mudah dipahami
          </p>
          <div className="text-sm text-gray-500">
            © 2024 Homely Kursus Komputer. All rights reserved.
            {/* Hidden admin link */}
            <span className="mx-2">•</span>
            <a 
              href="/admin" 
              className="text-gray-600 hover:text-gray-400 transition-colors"
              title="Admin Dashboard"
            >
              Admin
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}