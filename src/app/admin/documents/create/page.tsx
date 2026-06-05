'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateDocumentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    sector: '',
    department: '',
    roleName: '',
    content: ''
  });

  const [dbIndustries, setDbIndustries] = useState<any[]>([]);
  const [dbDepartments, setDbDepartments] = useState<any[]>([]);
  const [dbRoles, setDbRoles] = useState<any[]>([]);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const res = await fetch('/api/data-bank');
        if (res.ok) {
          const dbData = await res.json();
          setDbIndustries(dbData.industries || []);
          setDbDepartments(dbData.departments || []);
          setDbRoles(dbData.jobRoles || []);
        }
      } catch (e) {
        console.error("Master data fetch error", e);
      }
    };
    fetchMasterData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.content) return;

    setLoading(true);
    try {
      const res = await fetch('/api/documents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        router.push('/admin/documents');
      } else {
        alert("Oluşturma hatası");
      }
    } catch (err) {
      alert("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/documents" className="text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium flex items-center gap-2">
            ← Dokümanlara Dön
          </Link>
        </div>
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dokümanı Kendin Yarat</h1>
          <Link href="/admin/documents" className="text-slate-500 hover:underline">Geri Dön</Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Doküman Adı</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Konusu</label>
              <input type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Sektör Seçimi</label>
              <select 
                value={formData.sector} 
                onChange={e => setFormData({...formData, sector: e.target.value})} 
                className="w-full px-4 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              >
                <option value="">Sektör Seçiniz...</option>
                {dbIndustries.map(ind => <option key={ind.id} value={ind.name}>{ind.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Birim / Departman</label>
              <select 
                value={formData.department} 
                onChange={e => setFormData({...formData, department: e.target.value})} 
                className="w-full px-4 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              >
                <option value="">Departman Seçiniz...</option>
                {dbDepartments.map(dep => <option key={dep.id} value={dep.name}>{dep.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Pozisyon / Rol</label>
              <select 
                value={formData.roleName} 
                onChange={e => setFormData({...formData, roleName: e.target.value})} 
                className="w-full px-4 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              >
                <option value="">Rol Seçiniz...</option>
                {dbRoles.map(rol => <option key={rol.id} value={rol.name}>{rol.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">İçerik Editörü</label>
            <textarea 
              required
              rows={12}
              value={formData.content} 
              onChange={e => setFormData({...formData, content: e.target.value})} 
              className="w-full px-4 py-3 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white font-mono text-sm"
              placeholder="Dokümanın içeriğini buraya yazabilirsiniz veya yapıştırabilirsiniz..."
            ></textarea>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-md hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : 'Dokümanı Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
