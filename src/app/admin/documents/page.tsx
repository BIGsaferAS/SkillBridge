'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewDoc, setViewDoc] = useState<any | null>(null);
  const router = useRouter();

  const fetchDocs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/documents?t=' + Date.now(), { 
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache' }
      });
      if (res.ok) {
        setDocuments(await res.json());
      } else {
        const errData = await res.json();
        alert('Dokümanlar yüklenemedi: ' + errData.error);
      }
    } catch (e) {
      alert('Sunucuya bağlanılamadı.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bu dokümanı silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDocs();
      } else {
        const errData = await res.json();
        alert('Silinemedi: ' + errData.error);
      }
    } catch (e) {
      alert('Sunucu hatası');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium flex items-center gap-2">
            ← Panele Dön
          </Link>
        </div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Dokümanlar & Bilgi Bankası</h1>
            <p className="text-slate-500 mt-1">Yüklediğiniz veya yarattığınız tüm dokümanlar buradan testlere dönüştürülebilir.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/documents/upload" className="bg-slate-800 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-700">
              + Dosya Yükle
            </Link>
            <Link href="/admin/documents/create" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-emerald-700">
              + Kendin Yarat
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-slate-500">Yükleniyor...</div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-zinc-800">
              <thead className="bg-slate-50 dark:bg-zinc-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Doküman Adı</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Türü</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Konu</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Boyut</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Tarih</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                {documents.map(doc => (
                  <tr key={doc.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800 dark:text-zinc-200">{doc.name}</div>
                      <div className="text-xs text-slate-500">{doc.fileFormat?.toUpperCase()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${doc.type === 'UPLOADED' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {doc.type === 'UPLOADED' ? 'Yüklendi' : 'Sistemde Yaratıldı'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-zinc-400">
                      {doc.subject || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {doc.sizeBytes ? (doc.sizeBytes / 1024).toFixed(1) + ' KB' : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-3">
                      <button onClick={() => setViewDoc(doc)} className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200">
                        Görüntüle
                      </button>
                      <button 
                        onClick={() => router.push(`/admin/tests/create?docId=${doc.id}`)}
                        className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-200"
                      >
                        Test Yarat
                      </button>
                      <button onClick={() => handleDelete(doc.id)} className="text-red-500 hover:text-red-700 font-bold text-xs">
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
                {documents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500">Henüz doküman bulunmuyor.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Görüntüleme Modalı */}
        {viewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
              <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">{viewDoc.name}</h3>
                <button onClick={() => setViewDoc(null)} className="text-slate-400 hover:text-red-500 font-bold">Kapat</button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {viewDoc.type === 'CREATED' ? (
                  <div className="whitespace-pre-wrap text-sm text-slate-700 dark:text-zinc-300">
                    {viewDoc.content}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="mb-4 text-slate-600 dark:text-zinc-400">Bu bir yüklenmiş dosya ({viewDoc.fileFormat}). İndirerek veya yeni sekmede açarak görüntüleyebilirsiniz.</p>
                    <a href={viewDoc.filePath} target="_blank" className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 inline-block">
                      Dosyayı Aç / İndir
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
