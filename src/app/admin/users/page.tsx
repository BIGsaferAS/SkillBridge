'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'INDIVIDUAL' });
  const router = useRouter();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {}
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingUserId ? 'PUT' : 'POST';
    const url = editingUserId ? `/api/admin/users/${editingUserId}` : '/api/admin/users';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingUserId(null);
        setFormData({ name: '', email: '', password: '', role: 'INDIVIDUAL' });
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'İşlem başarısız');
      }
    } catch (e) {
      alert('Hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) fetchUsers();
    } catch (e) {}
  };

  const openEditModal = (user: any) => {
    setEditingUserId(user.id);
    setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black">
      <nav className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">Kullanıcı Yönetimi</h1>
        <button onClick={() => router.push('/admin')} className="text-sm bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded">Raporlara Dön</button>
      </nav>

      <main className="max-w-7xl mx-auto p-6 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Şirket Kullanıcıları ve Adaylar</h2>
          <button 
            onClick={() => { setEditingUserId(null); setFormData({ name: '', email: '', password: '', role: 'INDIVIDUAL' }); setShowModal(true); }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            + Yeni Kullanıcı / Aday Ekle
          </button>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-sm text-indigo-800 dark:text-indigo-300 mb-6 border border-indigo-100 dark:border-indigo-900/40">
          <strong>Süper Admin Notu:</strong> Tüm sistem kullanıcılarını (şirket bazlı filtrelemelerle birlikte) artık daha kapsamlı olarak <a href="/super-admin/data-bank" className="underline font-bold">Merkezi Veri Bankası</a> üzerinden yönetebilirsiniz. Bu sayfa Şirket Yöneticileri (COMPANY_MANAGER) için tasarlanmıştır.
        </div>

        {isLoading ? (
          <div className="text-center p-10 text-slate-500">Yükleniyor...</div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-zinc-800">
              <thead className="bg-slate-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">İsim</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">E-posta</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-slate-200 dark:divide-zinc-800">
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-white">{u.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-zinc-400">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-zinc-400">{u.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <button onClick={() => openEditModal(u)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400">Düzenle ✏️</button>
                      <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-900 dark:text-red-400">Sil ❌</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-zinc-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                {editingUserId ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı / Aday Tanımla'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Ad Soyad</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">E-posta</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Şifre {editingUserId && '(Değiştirmek istemiyorsanız boş bırakın)'}</label>
                  <input type="password" required={!editingUserId} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Rol</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white">
                    <option value="INDIVIDUAL">Bireysel Aday (INDIVIDUAL)</option>
                    <option value="COMPANY_MANAGER">Şirket Yöneticisi (COMPANY_MANAGER)</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 rounded-lg">İptal</button>
                  <button type="submit" className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">Kaydet</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
