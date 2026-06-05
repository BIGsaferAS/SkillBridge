'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    chronologicalHistory: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Kayıt başarısız');
      }

      // Automatically redirect to login after successful registration
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-white dark:bg-zinc-900 p-10 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="mx-auto w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-6">S</div>
          <h2 className="text-center text-3xl font-extrabold text-zinc-900 dark:text-white">
            Aday Kaydı
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Sisteme katılın ve size atanan yetkinlik testlerini çözün.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-500 p-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Ad Soyad</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="appearance-none rounded-lg block w-full px-3 py-3 border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 placeholder-zinc-500 text-zinc-900 dark:text-white focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="Örn: Ali Yılmaz"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">E-posta Adresi</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="appearance-none rounded-lg block w-full px-3 py-3 border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 placeholder-zinc-500 text-zinc-900 dark:text-white focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="E-posta Adresi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Şifre</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="appearance-none rounded-lg block w-full px-3 py-3 border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 placeholder-zinc-500 text-zinc-900 dark:text-white focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="Şifre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Kronolojik Özgeçmiş & Deneyimler</label>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Örn: 2020-2022 X şirketinde Yazılımcı, 2022-2024 Y şirketinde Kıdemli Geliştirici...</p>
              <textarea
                required
                rows={4}
                value={formData.chronologicalHistory}
                onChange={(e) => setFormData({...formData, chronologicalHistory: e.target.value})}
                className="appearance-none rounded-lg block w-full px-3 py-3 border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 placeholder-zinc-500 text-zinc-900 dark:text-white focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="Kariyer geçmişinizi detaylıca yazın."
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
            </button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Zaten hesabınız var mı?{' '}
              <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
                Giriş Yap
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
