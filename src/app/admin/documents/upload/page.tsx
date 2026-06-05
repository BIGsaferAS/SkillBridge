'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UploadDocumentPage() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('subject', subject);

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        router.push('/admin/documents');
      } else {
        alert("Yükleme hatası");
      }
    } catch (err) {
      alert("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/documents" className="text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium flex items-center gap-2">
            ← Dokümanlara Dön
          </Link>
        </div>
        
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8">Dosya Yükle</h1>

        <form onSubmit={handleUpload} className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Doküman Adı</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" placeholder="Örn: Satış Eğitimi 2026" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Konusu</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" placeholder="Örn: Müşteri İletişimi" />
          </div>

          <div 
            onDragOver={(e) => e.preventDefault()} 
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-xl p-10 text-center hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <div className="text-4xl mb-4">📄</div>
            <p className="text-slate-600 dark:text-zinc-400 font-medium mb-2">
              Sürükle bırak veya dosya seçin
            </p>
            <p className="text-xs text-slate-400 mb-4">Desteklenen Formatlar: PDF, DOCX, XLSX, TXT (Max 5MB)</p>
            <input 
              type="file" 
              accept=".pdf,.docx,.xlsx,.txt"
              onChange={(e) => e.target.files && setFile(e.target.files[0])}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 dark:file:bg-zinc-800 dark:file:text-zinc-300 cursor-pointer"
            />
            {file && (
              <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-bold">
                Seçilen Dosya: {file.name}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={loading || !file}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold shadow-md hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? 'Yükleniyor...' : 'Sisteme Yükle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
