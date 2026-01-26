'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Separator } from '@/components/ui/separator'
import { User, Mail, Lock, Save, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

interface AdminProfile {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  lastLogin: string | null
  createdAt: string
  updatedAt: string
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/admin/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setFormData(prev => ({
          ...prev,
          name: data.user.name,
          email: data.user.email
        }))
      } else {
        toast.error('Failed to load profile')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveProfile = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required')
      return
    }

    // Validate password fields if changing password
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        toast.error('Current password is required to change password')
        return
      }
      if (formData.newPassword.length < 6) {
        toast.error('New password must be at least 6 characters long')
        return
      }
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('New passwords do not match')
        return
      }
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setProfile(data.user)
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      } else {
        toast.error(data.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <LoadingSpinner 
        message="Loading profile..."
        subMessage="Memuat data profil admin"
      />
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profil Admin</h1>
        <p className="text-gray-600">Kelola informasi profil dan keamanan akun Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Profil
              </CardTitle>
              <CardDescription>
                Update informasi dasar profil Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Masukkan email"
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Ubah Password
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Password Saat Ini</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                        placeholder="Masukkan password saat ini"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newPassword">Password Baru</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={formData.newPassword}
                          onChange={(e) => handleInputChange('newPassword', e.target.value)}
                          placeholder="Masukkan password baru"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          placeholder="Konfirmasi password baru"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Kosongkan jika tidak ingin mengubah password. Password minimal 6 karakter.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Information */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Informasi Akun</CardTitle>
              <CardDescription>
                Detail akun dan aktivitas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile && (
                <>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Role</Label>
                    <p className="text-sm font-medium capitalize">{profile.role}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <p className="text-sm font-medium">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        profile.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {profile.isActive ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Login Terakhir</Label>
                    <p className="text-sm">
                      {profile.lastLogin 
                        ? formatDate(profile.lastLogin)
                        : 'Belum pernah login'
                      }
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Akun Dibuat</Label>
                    <p className="text-sm">{formatDate(profile.createdAt)}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Terakhir Diupdate</Label>
                    <p className="text-sm">{formatDate(profile.updatedAt)}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}