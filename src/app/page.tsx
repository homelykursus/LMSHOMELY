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
  Phone, 
  Mail, 
  CheckCircle, 
  Monitor,
  User
} from 'lucide-react'
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon'
import { InstagramIcon } from '@/components/ui/instagram-icon'
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

  const formatWhatsAppMessage = () => {
    const course = courses.find(c => c.id === formData.courseId)
    const finalPrice = calculatePrice()
    const birthDate = `${formData.birthDay}/${formData.birthMonth}/${formData.birthYear}`
    const genderText = formData.gender === 'male' ? 'Laki-laki' : 'Perempuan'
    const courseTypeText = formData.courseType === 'regular' ? 'Kelas Reguler' : 'Kelas Privat'
    
    const message = `*PENDAFTARAN BARU - HOMELY KURSUS KOMPUTER*

📝 *Data Pendaftar:*
• Nama: ${formData.name}
• Tanggal Lahir: ${birthDate}
• Jenis Kelamin: ${genderText}
• WhatsApp: ${formData.whatsapp}

📚 *Program Kursus:*
• Kursus: ${course?.name || '-'}
• Jenis Kelas: ${courseTypeText}
• Total Biaya: ${formatCurrency(finalPrice)}

🎓 *Informasi Tambahan:*
• Pendidikan Terakhir: ${formData.lastEducation || '-'}
• Sumber Referral: ${formData.referralSource || '-'}

Mohon konfirmasi pendaftaran dan informasi pembayaran. Terima kasih! 🙏`

    return encodeURIComponent(message)
  }

  const redirectToWhatsApp = () => {
    const adminWhatsApp = '628216457578'
    const message = formatWhatsAppMessage()
    const whatsappUrl = `https://wa.me/${adminWhatsApp}?text=${message}`
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank')
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
        // Show success message
        toast.success(`Pendaftaran berhasil! Terima kasih ${formData.name}, silakan hubungi admin untuk konfirmasi pembayaran.`)
        
        // Redirect to WhatsApp with registration data
        setTimeout(() => {
          redirectToWhatsApp()
        }, 1000) // Small delay to show success message first
        
        // Reset form
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
          <p className="text-gray-600 mt-2">Memuat halaman pendaftaran</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <GraduationCap className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
              Homely Kursus
              <span className="block text-blue-200">Komputer</span>
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Belajar Komputer dengan Mudah dan Praktis
            </p>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 pb-16">
        {/* Form Pendaftaran */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl p-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Users className="h-8 w-8" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold mb-2">
                Daftar Sekarang
              </CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Isi form di bawah untuk memulai perjalanan belajar Anda
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8 lg:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Informasi Pribadi</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Masukkan nama lengkap"
                      required
                      className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                      Jenis Kelamin <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                      <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
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
                  <Label className="text-sm font-medium text-gray-700">
                    Tanggal Lahir <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-3">
                      <Select value={formData.birthDay} onValueChange={(value) => setFormData(prev => ({ ...prev, birthDay: value }))}>
                        <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
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
                        <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
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
                        <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
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
              </div>

              {/* Contact Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Informasi Kontak</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-sm font-medium text-gray-700">
                      Nomor WhatsApp <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="whatsapp"
                        value={formData.whatsapp}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, ''); // Remove all non-digits
                          
                          // If user starts typing and doesn't have 62, add it
                          if (value.length > 0 && !value.startsWith('62')) {
                            // If user starts with 08, replace with 628
                            if (value.startsWith('08')) {
                              value = '628' + value.slice(2);
                            }
                            // If user starts with 8 (without 0), add 628
                            else if (value.startsWith('8')) {
                              value = '628' + value.slice(1);
                            }
                            // For any other number, add 62 prefix
                            else {
                              value = '62' + value;
                            }
                          }
                          
                          // Limit to 15 digits maximum (62 + 13 digits)
                          if (value.length > 15) {
                            value = value.slice(0, 15);
                          }
                          
                          setFormData(prev => ({ ...prev, whatsapp: value }));
                        }}
                        placeholder="62812345678"
                        required
                        className="h-12 pl-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                      />
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Format otomatis: 62xxxxxxxxxx
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="referralSource" className="text-sm font-medium text-gray-700">
                      Tau Homely Kursus dari mana?
                    </Label>
                    <Select value={formData.referralSource} onValueChange={(value) => setFormData(prev => ({ ...prev, referralSource: value }))}>
                      <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                        <SelectValue placeholder="Pilih sumber referral" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Instagram">📸 Instagram</SelectItem>
                        <SelectItem value="Facebook">📘 Facebook</SelectItem>
                        <SelectItem value="Google">🔍 Google</SelectItem>
                        <SelectItem value="Tiktok">🎵 Tiktok</SelectItem>
                        <SelectItem value="dari Teman">👥 dari Teman</SelectItem>
                        <SelectItem value="Lainnya">📝 Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastEducation" className="text-sm font-medium text-gray-700">
                    Pendidikan Terakhir
                  </Label>
                  <Select value={formData.lastEducation} onValueChange={(value) => setFormData(prev => ({ ...prev, lastEducation: value }))}>
                    <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                      <SelectValue placeholder="Pilih pendidikan terakhir" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SD">🎒 SD</SelectItem>
                      <SelectItem value="SMP">📚 SMP</SelectItem>
                      <SelectItem value="SMA">🎓 SMA/SMK</SelectItem>
                      <SelectItem value="D3">📜 Diploma (D3)</SelectItem>
                      <SelectItem value="S1">🎓 Sarjana (S1)</SelectItem>
                      <SelectItem value="S2">👨‍🎓 Magister (S2)</SelectItem>
                      <SelectItem value="S3">👨‍🏫 Doktor (S3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Course Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Monitor className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Pilihan Kursus</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="courseId" className="text-sm font-medium text-gray-700">
                      Pilih Program Kursus <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.courseId} onValueChange={(value) => setFormData(prev => ({ ...prev, courseId: value }))}>
                      <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
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
                    <Label htmlFor="courseType" className="text-sm font-medium text-gray-700">
                      Jenis Kelas <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div 
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.courseType === 'regular' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, courseType: 'regular' }))}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            formData.courseType === 'regular' ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <Users className={`h-5 w-5 ${
                              formData.courseType === 'regular' ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Kelas Reguler</div>
                            <div className="text-sm text-gray-500">Maksimal 5 siswa</div>
                          </div>
                        </div>
                      </div>
                      <div 
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.courseType === 'private' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, courseType: 'private' }))}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            formData.courseType === 'private' ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <User className={`h-5 w-5 ${
                              formData.courseType === 'private' ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Kelas Privat</div>
                            <div className="text-sm text-gray-500">1-on-1 dengan instruktur</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Preview */}
              {selectedCourse && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900 mb-3">Ringkasan Pendaftaran</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Program Kursus</div>
                          <div className="font-medium text-gray-900">{selectedCourse.name}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Durasi</div>
                          <div className="font-medium text-gray-900">{selectedCourse.duration} pertemuan</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Jenis Kelas</div>
                          <div className="font-medium text-gray-900">
                            {formData.courseType === 'regular' ? 'Kelas Reguler' : 'Kelas Privat'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Total Biaya</div>
                          <div className="font-bold text-xl text-blue-900">
                            {formatCurrency(calculatePrice())}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    Memproses Pendaftaran...
                  </>
                ) : (
                  <>
                    <WhatsAppIcon className="mr-3 text-white" size={24} />
                    Kirim ke WhatsApp
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-500">
                Dengan mendaftar, Anda menyetujui syarat dan ketentuan yang berlaku
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-blue-600 rounded-2xl">
                <GraduationCap className="h-8 w-8" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4">Homely Kursus Komputer</h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-lg">
              Tempat terbaik untuk belajar komputer dengan metode praktis dan mudah dipahami. 
              Bergabunglah dengan ribuan siswa yang telah merasakan manfaatnya.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
              <div className="flex items-center gap-3 text-gray-300">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <WhatsAppIcon className="text-green-400" size={20} />
                </div>
                <span className="text-lg">+62 821-6457-578</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="p-2 bg-pink-600/20 rounded-lg">
                  <InstagramIcon className="text-pink-400" size={20} />
                </div>
                <span className="text-lg">@homelykursus</span>
              </div>
            </div>
            
            <div className="border-t border-gray-700 pt-8 text-sm text-gray-400">
              <div className="text-center">
                <span>© 2026 Homely Kursus Komputer. All rights reserved.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}