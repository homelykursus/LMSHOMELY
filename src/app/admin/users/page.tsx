'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Users, 
  UserPlus,
  Shield,
  ShieldCheck,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false); // Add submitting state
  
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'admin' as 'admin' | 'super_admin',
    isActive: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        // Handle non-JSON responses
        let errorMessage = 'Gagal memuat data pengguna';
        
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
          } else {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Pengguna berhasil ditambahkan');
        setIsAddDialogOpen(false);
        resetForm();
        fetchUsers();
      } else {
        // Handle non-JSON responses
        let errorMessage = 'Gagal menambahkan pengguna';
        
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
          } else {
            // If response is not JSON, get text
            const errorText = await response.text();
            errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('Terjadi kesalahan saat menambahkan pengguna');
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser) return;

    setSubmitting(true); // Use submitting state instead of loading

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Pengguna berhasil diperbarui');
        
        // Close dialog and reset state immediately
        setIsEditDialogOpen(false);
        setEditingUser(null);
        resetForm();
        
        // Refresh users list
        await fetchUsers();
      } else {
        // Handle non-JSON responses
        let errorMessage = 'Gagal memperbarui pengguna';
        
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
          } else {
            // If response is not JSON, get text
            const errorText = await response.text();
            errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Terjadi kesalahan saat memperbarui pengguna');
    } finally {
      setSubmitting(false); // Always reset submitting state
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pengguna "${user.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Pengguna berhasil dihapus');
        fetchUsers();
      } else {
        // Handle non-JSON responses
        let errorMessage = 'Gagal menghapus pengguna';
        
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
          } else {
            // If response is not JSON, get text
            const errorText = await response.text();
            errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Terjadi kesalahan saat menghapus pengguna');
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      password: '', // Don't pre-fill password
      role: user.role,
      isActive: user.isActive
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      password: '',
      role: 'admin',
      isActive: true
    });
    setShowPassword(false);
    setShowEditPassword(false);
    setSubmitting(false); // Reset submitting state
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><ShieldCheck className="h-3 w-3 mr-1" />Super Admin</Badge>;
      case 'admin':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">Aktif</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200">Tidak Aktif</Badge>
    );
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    superAdmins: users.filter(u => u.role === 'super_admin').length,
    admins: users.filter(u => u.role === 'admin').length
  };

  if (loading) {
    return (
      <LoadingSpinner 
        message="Loading..."
        subMessage="Data pengguna sedang dimuat"
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Akun Pengguna</h1>
          <p className="text-gray-600">Kelola akun admin yang dapat mengakses sistem</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah Pengguna
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Pengguna Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add-email">Email</Label>
                <Input
                  id="add-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="admin@example.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="add-name">Nama Lengkap</Label>
                <Input
                  id="add-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nama Admin"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="add-password">Password</Label>
                <div className="relative">
                  <Input
                    id="add-password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Minimal 6 karakter"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="add-role">Role</Label>
                <Select value={formData.role} onValueChange={(value: 'admin' | 'super_admin') => setFormData({...formData, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="add-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                />
                <Label htmlFor="add-active">Akun Aktif</Label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  Tambah Pengguna
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pengguna</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktif</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tidak Aktif</p>
                <p className="text-2xl font-bold">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShieldCheck className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Super Admin</p>
                <p className="text-2xl font-bold">{stats.superAdmins}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Admin</p>
                <p className="text-2xl font-bold">{stats.admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
          <CardDescription>
            Menampilkan {users.length} pengguna yang terdaftar dalam sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Pengguna</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Login Terakhir</TableHead>
                    <TableHead>Dibuat</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.isActive)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.lastLogin ? (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              {new Date(user.lastLogin).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          ) : (
                            <span className="text-gray-400">Belum pernah login</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {new Date(user.createdAt).toLocaleDateString('id-ID')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(user)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada pengguna</h3>
              <p className="text-gray-500">Tambahkan pengguna pertama untuk mulai menggunakan sistem</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => {
          if (!open && !submitting) {
            // Only allow closing if not submitting
            setIsEditDialogOpen(false);
            setEditingUser(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama Lengkap</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-password">Password Baru (Opsional)</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showEditPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Kosongkan jika tidak ingin mengubah"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowEditPassword(!showEditPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showEditPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={formData.role} onValueChange={(value: 'admin' | 'super_admin') => setFormData({...formData, role: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
              />
              <Label htmlFor="edit-active">Akun Aktif</Label>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingUser(null);
                  resetForm();
                }}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button 
                type="submit"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menyimpan...
                  </div>
                ) : (
                  'Simpan Perubahan'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}