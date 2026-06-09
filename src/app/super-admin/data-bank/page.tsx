'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import AddCompanyModal from "@/components/AddCompanyModal";

export default function DataBankPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  const [data, setData] = useState<any>({
    industries: [], departments: [], jobRoles: [], competencies: [], questionTemplates: [], companies: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Form states for simple adding
  const [newIndustry, setNewIndustry] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newCompetency, setNewCompetency] = useState('');

  // User Management States
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState({ name: '', email: '', password: '', role: 'INDIVIDUAL', companyId: '' });

  const fetchData = async () => {
    try {
      const res = await fetch('/api/super-admin/data-bank');
      if (res.ok) {
        setData(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (type: string, payload: any, setter: any) => {
    try {
      const res = await fetch('/api/super-admin/data-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, payload })
      });
      if (res.ok) {
        setter('');
        fetchData();
      } else {
        alert('Ekleme başarısız');
      }
    } catch (e) {
      alert('Hata');
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingUserId ? 'PUT' : 'POST';
    const url = editingUserId ? `/api/admin/users/${editingUserId}` : '/api/admin/users';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userFormData),
      });

      if (res.ok) {
        setShowUserModal(false);
        setEditingUserId(null);
        setUserFormData({ name: '', email: '', password: '', role: 'INDIVIDUAL', companyId: '' });
        fetchData();
      } else {
        const d = await res.json();
        alert(d.error || 'İşlem başarısız');
      }
    } catch (e) {
      alert('Hata oluştu');
    }
  };

  const handleUserDelete = async (id: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (e) {}
  };

  const openUserEditModal = (user: any) => {
    setEditingUserId(user.id);
    setUserFormData({ name: user.name, email: user.email, password: '', role: user.role, companyId: user.companyId || '' });
    setShowUserModal(true);
  };

  // Competency Management States
  const [showCompetencyModal, setShowCompetencyModal] = useState(false);
  const [editingCompetencyId, setEditingCompetencyId] = useState<string | null>(null);
  const [competencyFormData, setCompetencyFormData] = useState({
    name: '', category: 'BİLİŞSEL', description: '', causeEffect: '', levelA: '', levelB: '', levelC: '', levelD: '', levelE: ''
  });

  const handleCompetencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingCompetencyId ? 'PUT' : 'POST';
      const bodyPayload = editingCompetencyId 
        ? { id: editingCompetencyId, type: 'competency', payload: competencyFormData }
        : { type: 'competency', payload: competencyFormData };

      const res = await fetch('/api/super-admin/data-bank', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      if (res.ok) {
        setShowCompetencyModal(false);
        fetchData();
      } else {
        alert('İşlem başarısız');
      }
    } catch (e) {
      alert('Hata oluştu');
    }
  };

  const handleCompetencyDelete = async (id: string) => {
    if (!confirm('Bu yetkinliği silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/super-admin/data-bank?type=competency&id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (e) {}
  };

  const openCompetencyEditModal = (comp?: any) => {
    if (comp) {
      setEditingCompetencyId(comp.id);
      setCompetencyFormData({
        name: comp.name || '',
        category: comp.category || 'BİLİŞSEL',
        description: comp.description || '',
        causeEffect: comp.causeEffect || '',
        levelA: comp.levelA || '',
        levelB: comp.levelB || '',
        levelC: comp.levelC || '',
        levelD: comp.levelD || '',
        levelE: comp.levelE || ''
      });
    } else {
      setEditingCompetencyId(null);
      setCompetencyFormData({ name: '', category: 'BİLİŞSEL', description: '', causeEffect: '', levelA: '', levelB: '', levelC: '', levelD: '', levelE: '' });
    }
    setShowCompetencyModal(true);
  };

  if (isLoading) return <div className="p-10 text-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Merkezi Veri Bankası</h1>
            <p className="text-slate-500 mt-2">Sistemdeki tüm şirketler ve kullanacakları sektör, departman, yetkinlik havuzu (Master Data).</p>
          </div>
          <div className="flex gap-2">
            {userRole === 'SUPER_ADMIN' && (
              <Link href="/super-admin" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all hover:scale-[1.02] flex items-center gap-1.5">
                ← Süper Admin Paneli (Dashboard)
              </Link>
            )}
            {(userRole === 'ADMIN' || userRole === 'COMPANY_MANAGER') && (
              <Link href="/admin" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all hover:scale-[1.02] flex items-center gap-1.5">
                ← Yönetici Paneli (Dashboard)
              </Link>
            )}
            {userRole && userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN' && userRole !== 'COMPANY_MANAGER' && (
              <Link href="/dashboard" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all hover:scale-[1.02] flex items-center gap-1.5">
                ← Aday Paneline Dön
              </Link>
            )}
          </div>
        </div>

        {/* Şirketler */}
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-zinc-800 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              🏢 Şirket Kayıtları
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{data.companies?.length || 0} Şirket</span>
            </h2>
            <AddCompanyModal onSuccess={fetchData} />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
              <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Şirket Adı</th>
                  <th className="px-6 py-3 text-left">Limit / Kapasite</th>
                  <th className="px-6 py-3 text-left">Kayıtlı Kullanıcı</th>
                  <th className="px-6 py-3 text-left">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {data.companies?.map((company: any) => (
                  <tr key={company.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-zinc-900 dark:text-white">{company.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-500 dark:text-zinc-400">{company.limit?.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-500 dark:text-zinc-400">{company._count?.users || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium space-x-3">
                      <button 
                        onClick={async () => {
                          const newName = prompt("Yeni Şirket Adı:", company.name);
                          if (!newName) return;
                          const newLimit = prompt("Yeni Kapasite/Limit:", company.limit?.toString());
                          if (!newLimit) return;
                          try {
                            const res = await fetch(`/api/companies/${company.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ name: newName, limit: Number(newLimit) })
                            });
                            if (res.ok) fetchData();
                            else alert("Hata oluştu.");
                          } catch (e) { alert("Bağlantı hatası"); }
                        }}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Düzenle ✏️
                      </button>
                      <button 
                        onClick={async () => {
                          if (!confirm(`"${company.name}" şirketini silmek istediğinize emin misiniz?`)) return;
                          try {
                            const res = await fetch(`/api/companies/${company.id}`, { method: 'DELETE' });
                            if (res.ok) fetchData();
                            else alert("Hata: " + (await res.json()).error);
                          } catch (e) { alert("Bağlantı hatası"); }
                        }}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Sil ❌
                      </button>
                    </td>
                  </tr>
                ))}
                {(!data.companies || data.companies.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-zinc-500">Henüz hiç şirket tanımlanmamış.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kullanıcı Yönetimi */}
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-zinc-800 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              👥 Sistem Kullanıcıları
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">{data.users?.length || 0} Kullanıcı</span>
            </h2>
            <button 
              onClick={() => { setEditingUserId(null); setUserFormData({ name: '', email: '', password: '', role: 'INDIVIDUAL', companyId: '' }); setShowUserModal(true); }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              + Yeni Kullanıcı / Aday Ekle
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
              <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">İsim</th>
                  <th className="px-6 py-3 text-left">E-posta</th>
                  <th className="px-6 py-3 text-left">Rol</th>
                  <th className="px-6 py-3 text-left">Şirket</th>
                  <th className="px-6 py-3 text-left">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {data.users?.map((u: any) => (
                  <tr key={u.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-zinc-900 dark:text-white">{u.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-500 dark:text-zinc-400">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-500 dark:text-zinc-400">{u.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-500 dark:text-zinc-400">{u.company?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium space-x-3">
                      <button onClick={() => openUserEditModal(u)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400">Düzenle ✏️</button>
                      <button onClick={() => handleUserDelete(u.id)} className="text-red-600 hover:text-red-900 dark:text-red-400">Sil ❌</button>
                    </td>
                  </tr>
                ))}
                {(!data.users || data.users.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-zinc-500">Henüz hiç kullanıcı yok.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Sektörler */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
              Sektörler <span className="bg-slate-100 dark:bg-zinc-800 text-xs px-2 py-1 rounded">{data.industries.length}</span>
            </h3>
            <div className="flex gap-2 mb-4">
              <input type="text" value={newIndustry} onChange={e => setNewIndustry(e.target.value)} placeholder="Yeni Sektör" className="flex-1 border rounded px-2 py-1 text-sm dark:bg-zinc-950 dark:border-zinc-800" />
              <button onClick={() => handleAdd('industry', { name: newIndustry }, setNewIndustry)} className="bg-emerald-500 text-white px-3 py-1 rounded text-sm font-bold">+</button>
            </div>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {data.industries.map((item: any) => <li key={item.id} className="text-sm border-b pb-1 dark:border-zinc-800">{item.name}</li>)}
            </ul>
          </div>

          {/* Departmanlar */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
              Departmanlar <span className="bg-slate-100 dark:bg-zinc-800 text-xs px-2 py-1 rounded">{data.departments.length}</span>
            </h3>
            <div className="flex gap-2 mb-4">
              <input type="text" value={newDepartment} onChange={e => setNewDepartment(e.target.value)} placeholder="Yeni Departman" className="flex-1 border rounded px-2 py-1 text-sm dark:bg-zinc-950 dark:border-zinc-800" />
              <button onClick={() => handleAdd('department', { name: newDepartment }, setNewDepartment)} className="bg-emerald-500 text-white px-3 py-1 rounded text-sm font-bold">+</button>
            </div>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {data.departments.map((item: any) => <li key={item.id} className="text-sm border-b pb-1 dark:border-zinc-800">{item.name}</li>)}
            </ul>
          </div>

          {/* Rol / Pozisyon */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
              Pozisyonlar <span className="bg-slate-100 dark:bg-zinc-800 text-xs px-2 py-1 rounded">{data.jobRoles.length}</span>
            </h3>
            <div className="flex gap-2 mb-4">
              <input type="text" value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="Yeni Pozisyon" className="flex-1 border rounded px-2 py-1 text-sm dark:bg-zinc-950 dark:border-zinc-800" />
              <button onClick={() => handleAdd('jobRole', { name: newRole }, setNewRole)} className="bg-emerald-500 text-white px-3 py-1 rounded text-sm font-bold">+</button>
            </div>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {data.jobRoles.map((item: any) => <li key={item.id} className="text-sm border-b pb-1 dark:border-zinc-800">{item.name}</li>)}
            </ul>
          </div>

        </div>

        {/* Detaylı Yetkinlikler Tablosu */}
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-zinc-800 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              🎯 Yetkinlik Havuzu (Master Competencies)
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">{data.competencies.length} Kayıt</span>
            </h2>
            <button onClick={() => openCompetencyEditModal()} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all">
              + Yeni Detaylı Yetkinlik Ekle
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
              <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Kategori & İsim</th>
                  <th className="px-6 py-3 text-left">İş Etkisi / Tanım</th>
                  <th className="px-6 py-3 text-left">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                {data.competencies.map((comp: any) => (
                  <tr key={comp.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{comp.name}</div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{comp.category}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-zinc-400 max-w-md truncate">
                      {comp.causeEffect || comp.description || 'Detay girilmemiş'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => openCompetencyEditModal(comp)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 font-medium">Düzenle</button>
                      <button onClick={() => handleCompetencyDelete(comp.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 font-medium">Sil</button>
                    </td>
                  </tr>
                ))}
                {data.competencies.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-zinc-500">Henüz yetkinlik eklenmemiş.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Soru Şablonları */}
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-zinc-800 mt-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            🧠 Soru ve Senaryo Havuzu (Question Templates)
            <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">{data.questionTemplates.length} Kayıt</span>
          </h2>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-sm text-indigo-800 dark:text-indigo-300 mb-6 border border-indigo-100 dark:border-indigo-900/40">
            Yapay zeka (Ajan 3) sınav üretirken, adayın seçtiği seviye ve sektör filtrelerine uyum sağlayan bu "Senaryo Kalıplarını" baz alarak kusursuz bir simülasyon yaratır.
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 uppercase">
                <tr>
                  <th className="p-3">Sektör/Dept</th>
                  <th className="p-3">Yetkinlik</th>
                  <th className="p-3">Zorluk</th>
                  <th className="p-3">Soru Tipi</th>
                  <th className="p-3">Soru Kökü</th>
                </tr>
              </thead>
              <tbody>
                {data.questionTemplates.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-center text-slate-400">Henüz soru kalıbı eklenmemiş.</td></tr>
                ) : (
                  data.questionTemplates.map((item: any) => (
                    <tr key={item.id} className="border-b dark:border-zinc-800">
                      <td className="p-3">{item.sector} / {item.department}</td>
                      <td className="p-3 font-medium text-emerald-600">{item.competency}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          item.difficulty === 'Kolay' ? 'bg-green-100 text-green-700' :
                          item.difficulty === 'Orta' ? 'bg-blue-100 text-blue-700' :
                          item.difficulty === 'Zor' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>{item.difficulty}</span>
                      </td>
                      <td className="p-3">{item.type}</td>
                      <td className="p-3 truncate max-w-[200px]">{item.questionText}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 text-right">
             <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all">
               + Yeni Senaryo Kalıbı Ekle (Ajan 3 İçin)
             </button>
          </div>
        </div>

      </div>

      {/* Kullanıcı / Aday Ekleme/Düzenleme Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-zinc-800 flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingUserId ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı Tanımla'}
              </h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
            </div>
            
            <div className="p-6 flex-1">
              <form id="userForm" onSubmit={handleUserSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-1">Ad Soyad</label>
                  <input type="text" required value={userFormData.name} onChange={e => setUserFormData({...userFormData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-1">E-Posta</label>
                  <input type="email" required value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-1">Rol</label>
                  <select value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="INDIVIDUAL">Bireysel Aday (INDIVIDUAL)</option>
                    <option value="COMPANY_MANAGER">Şirket Yöneticisi (COMPANY_MANAGER)</option>
                    <option value="HR_SPECIALIST">İK Uzmanı (HR_SPECIALIST)</option>
                    <option value="ADMIN">Sistem Yöneticisi (ADMIN)</option>
                    <option value="SUPER_ADMIN">Süper Admin (SUPER_ADMIN)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-1">Şirket (Opsiyonel)</label>
                  <select 
                    value={userFormData.companyId} 
                    onChange={e => setUserFormData({...userFormData, companyId: e.target.value})} 
                    className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Şirket Yok / Bireysel Aday</option>
                    {data.companies?.map((company: any) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-1">Şifre {editingUserId && '(Değiştirmeyecekseniz boş bırakın)'}</label>
                  <input type={editingUserId ? "password" : "text"} required={!editingUserId} value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder={editingUserId ? "Yeni şifre (opsiyonel)" : "Geçici şifre"} />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-zinc-800 flex justify-end space-x-3 bg-slate-50 dark:bg-zinc-900 rounded-b-2xl">
              <button type="button" onClick={() => setShowUserModal(false)} className="px-6 py-2 text-sm font-bold text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-700">İptal</button>
              <button type="submit" form="userForm" className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md">Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {showCompetencyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl border border-slate-200 dark:border-zinc-800 flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center sticky top-0 bg-white dark:bg-zinc-900 z-10 rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingCompetencyId ? 'Yetkinliği Düzenle' : 'Yeni Detaylı Yetkinlik Ekle'}
              </h3>
              <button onClick={() => setShowCompetencyModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="competencyForm" onSubmit={handleCompetencySubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-1">Yetkinlik Adı</label>
                    <input type="text" required value={competencyFormData.name} onChange={e => setCompetencyFormData({...competencyFormData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Örn: Problem Çözme" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-1">Kategori</label>
                    <select value={competencyFormData.category} onChange={e => setCompetencyFormData({...competencyFormData, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option value="BİLİŞSEL">Bilişsel Yetkinlikler</option>
                      <option value="TEMEL">Temel Yetkinlikler</option>
                      <option value="TEKNİK">Teknik Yetkinlikler</option>
                      <option value="YÖNETSEL">Yönetsel Yetkinlikler</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-1">Genel Tanım / İş Etkisi (Sebep-Sonuç)</label>
                  <textarea rows={2} value={competencyFormData.causeEffect} onChange={e => setCompetencyFormData({...competencyFormData, causeEffect: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Bu yetkinliğin şirkete ve işe olan etkisi nedir?"></textarea>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Seviye Kriterleri</h4>
                  
                  <div>
                    <label className="block text-xs font-bold text-red-600 dark:text-red-400 mb-1">[A] Çok Yetersiz</label>
                    <textarea rows={2} value={competencyFormData.levelA} onChange={e => setCompetencyFormData({...competencyFormData, levelA: e.target.value})} className="w-full px-3 py-2 border border-red-100 dark:border-red-900/30 rounded-lg bg-red-50/50 dark:bg-red-950/10 dark:text-white text-sm outline-none focus:border-red-400"></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-orange-600 dark:text-orange-400 mb-1">[B] Yetersiz</label>
                    <textarea rows={2} value={competencyFormData.levelB} onChange={e => setCompetencyFormData({...competencyFormData, levelB: e.target.value})} className="w-full px-3 py-2 border border-orange-100 dark:border-orange-900/30 rounded-lg bg-orange-50/50 dark:bg-orange-950/10 dark:text-white text-sm outline-none focus:border-orange-400"></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">[C] Beklenen (Standart)</label>
                    <textarea rows={2} value={competencyFormData.levelC} onChange={e => setCompetencyFormData({...competencyFormData, levelC: e.target.value})} className="w-full px-3 py-2 border border-blue-100 dark:border-blue-900/30 rounded-lg bg-blue-50/50 dark:bg-blue-950/10 dark:text-white text-sm outline-none focus:border-blue-400"></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">[D] Yeterli (Güçlü)</label>
                    <textarea rows={2} value={competencyFormData.levelD} onChange={e => setCompetencyFormData({...competencyFormData, levelD: e.target.value})} className="w-full px-3 py-2 border border-emerald-100 dark:border-emerald-900/30 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/10 dark:text-white text-sm outline-none focus:border-emerald-400"></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">[E] Çok Yeterli (Örnek/Lider)</label>
                    <textarea rows={2} value={competencyFormData.levelE} onChange={e => setCompetencyFormData({...competencyFormData, levelE: e.target.value})} className="w-full px-3 py-2 border border-purple-100 dark:border-purple-900/30 rounded-lg bg-purple-50/50 dark:bg-purple-950/10 dark:text-white text-sm outline-none focus:border-purple-400"></textarea>
                  </div>
                </div>

              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-zinc-800 flex justify-end space-x-3 bg-slate-50 dark:bg-zinc-900 rounded-b-2xl">
              <button type="button" onClick={() => setShowCompetencyModal(false)} className="px-6 py-2 text-sm font-bold text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-700">İptal</button>
              <button type="submit" form="competencyForm" className="px-6 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md">Kaydet</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
