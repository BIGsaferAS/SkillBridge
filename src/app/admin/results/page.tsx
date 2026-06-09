'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const getScoreDetails = (score: number) => {
  if (score >= 80) return { label: 'İleri Seviye Yetkin', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30' };
  if (score >= 70) return { label: 'Yetkin', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30' };
  if (score >= 60) return { label: 'Beklenen', badgeClass: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-900/30' };
  if (score >= 50) return { label: 'Az Yetkin', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30' };
  return { label: 'Yetkin Olmayan', badgeClass: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400 border border-red-200 dark:border-red-900/30' };
};

export default function AdminResultsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [results, setResults] = useState<any[]>([]);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedScore, setSelectedScore] = useState('ALL');
  const [selectedDecision, setSelectedDecision] = useState('ALL');

  const fetchResults = async () => {
    try {
      const res = await fetch('/api/results');
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setFilteredResults(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      const role = (session?.user as any)?.role;
      if (role !== 'ADMIN' && role !== 'COMPANY_MANAGER' && role !== 'SUPER_ADMIN') {
        router.push('/login');
      } else {
        fetchResults();
      }
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session]);

  // Apply filters whenever filters or results change
  useEffect(() => {
    let temp = [...results];

    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase();
      temp = temp.filter(r => 
        (r.user?.name || '').toLowerCase().includes(query) ||
        (r.user?.email || '').toLowerCase().includes(query) ||
        (r.jobPosting?.title || r.roleName || '').toLowerCase().includes(query)
      );
    }

    if (selectedDept !== 'ALL') {
      temp = temp.filter(r => r.department === selectedDept);
    }

    if (selectedScore !== 'ALL') {
      if (selectedScore === '80PLUS') {
        temp = temp.filter(r => r.score >= 80);
      } else if (selectedScore === '70TO80') {
        temp = temp.filter(r => r.score >= 70 && r.score < 80);
      } else if (selectedScore === 'UNDER70') {
        temp = temp.filter(r => r.score < 70);
      }
    }

    if (selectedDecision !== 'ALL') {
      temp = temp.filter(r => r.hireDecision === selectedDecision);
    }

    setFilteredResults(temp);
  }, [searchTerm, selectedDept, selectedScore, selectedDecision, results]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" adayına ait test sonucunu silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch(`/api/results/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setResults(prev => prev.filter(r => r.id !== id));
      } else {
        alert('Silme işlemi başarısız.');
      }
    } catch (e) {
      alert('Bir hata oluştu.');
    }
  };

  const getUniqueDepartments = () => {
    const depts = new Set<string>();
    results.forEach(r => {
      if (r.department) depts.add(r.department);
    });
    return Array.from(depts);
  };

  // Top Stats
  const totalSolved = results.length;
  const avgScore = totalSolved > 0 
    ? Math.round(results.reduce((acc, curr) => acc + curr.score, 0) / totalSolved) 
    : 0;
  const highPerformers = results.filter(r => r.score >= 80).length;
  const hiredCount = results.filter(r => !r.hireDecision.includes('NO') && !r.hireDecision.includes('RED') && !r.hireDecision.includes('PENDING')).length;

  if (status === 'loading' || isLoading) {
    return <div className="p-10 text-center text-slate-500">Yükleniyor...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black">
      <main className="max-w-7xl mx-auto p-6 mt-4 space-y-6">
        
        {/* Başlık ve Butonlar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Aday Test Sonuçları</h1>
            <p className="text-slate-500 mt-1">Sistemdeki tüm test çözümlerine ait AI detaylı raporları ve yetkinlik skorları.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin" className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 shadow-sm transition-colors">
              Pano Anasayfası
            </Link>
            <Link href="/ready-tests" className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg text-sm font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-1">
              📋 Hazır Testler & Atama
            </Link>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="text-slate-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">Toplam Çözülen</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalSolved} Test</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="text-slate-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">Ortalama Başarı</div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">%{avgScore}</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="text-slate-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">Yüksek Skor (%80+)</div>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{highPerformers} Aday</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="text-slate-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">İşe Alım Önerisi</div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{hiredCount} Aday</div>
          </div>
        </div>

        {/* Arama ve Filtreleme Paneli */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Arama</label>
            <input 
              type="text" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Aday Adı, E-posta veya Test..."
              className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-zinc-950 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none animate-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Departman</label>
            <select 
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-zinc-950 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="ALL">Tümü</option>
              {getUniqueDepartments().map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Skor Aralığı</label>
            <select 
              value={selectedScore}
              onChange={e => setSelectedScore(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-zinc-950 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="ALL">Tümü</option>
              <option value="80PLUS">%80 ve Üstü</option>
              <option value="70TO80">%70 - %79 Arası</option>
              <option value="UNDER70">%70 Altı</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Ajan 9 Kararı</label>
            <select 
              value={selectedDecision}
              onChange={e => setSelectedDecision(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-zinc-950 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="ALL">Tümü</option>
              <option value="HIRE">HIRE (İşe Alım)</option>
              <option value="NO HIRE">NO HIRE (Uygun Değil)</option>
              <option value="PENDING">PENDING (Beklemede)</option>
            </select>
          </div>
        </div>

        {/* Test Sonuçları Tablosu */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-zinc-800 text-sm">
              <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4 text-left">Aday / İletişim</th>
                  <th className="px-6 py-4 text-left">Çözülen Test</th>
                  <th className="px-6 py-4 text-center">Skor (Ajan 5)</th>
                  <th className="px-6 py-4 text-center">Ajan 9 Kararı</th>
                  <th className="px-6 py-4 text-left">Tarih</th>
                  <th className="px-6 py-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                {filteredResults.map(r => {
                  const isHire = !r.hireDecision.includes('NO') && !r.hireDecision.includes('RED') && !r.hireDecision.includes('PENDING');
                  const isPending = r.hireDecision.includes('PENDING');
                  
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">{r.user?.name || 'Bilinmeyen Aday'}</div>
                        <div className="text-xs text-slate-500">{r.user?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 dark:text-zinc-300">{r.jobPosting?.title || r.roleName}</div>
                        <div className="text-xs text-slate-500">{r.department} / {r.sector}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="font-extrabold text-slate-900 dark:text-white">%{r.score}</span>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${getScoreDetails(r.score).badgeClass}`}>
                            {getScoreDetails(r.score).label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                          isPending ? 'bg-amber-100 text-amber-800' :
                          isHire ? 'bg-purple-100 text-purple-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {r.hireDecision}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {new Date(r.createdAt).toLocaleString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                        <Link 
                          href={`/admin/${r.id}`} 
                          className="inline-flex px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/40 rounded-lg text-xs font-bold transition-all hover:scale-105"
                        >
                          Detaylı Rapor 📊
                        </Link>
                        <button 
                          onClick={() => handleDelete(r.id, r.user?.name || 'Aday')} 
                          className="text-red-600 hover:text-red-950 dark:text-red-400 dark:hover:text-red-300 text-xs font-bold"
                        >
                          Sil ❌
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredResults.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                      Filtrelere uygun test sonucu bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
