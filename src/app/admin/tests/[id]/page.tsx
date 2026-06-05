'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TestDetailsPage({ params }: any) {
  const [test, setTest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const resolvedParams = await params;
        const res = await fetch(`/api/tests/${resolvedParams.id}`);
        if (res.ok) {
          setTest(await res.json());
        } else {
          alert('Test yüklenemedi.');
        }
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    };

    fetchTest();
  }, [params]);

  if (isLoading) return <div className="p-10 text-center text-slate-500">Test yükleniyor...</div>;
  if (!test) return <div className="p-10 text-center text-slate-500">Test bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/documents" className="text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium flex items-center gap-2">
            ← Dokümanlara Dön
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-emerald-500 dark:border-emerald-600 p-8 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
              Başarıyla Üretildi
            </span>
            <span className="text-sm text-slate-500">{new Date(test.createdAt).toLocaleString()}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{test.title}</h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-2">{test.description}</p>
        </div>

        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Yapay Zeka Tarafından Üretilen Sorular ({test.questions?.length})</h2>

        <div className="space-y-6">
          {test.questions?.map((q: any, i: number) => {
            const options = JSON.parse(q.options || '[]');
            return (
              <div key={q.id} className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 p-6">
                <div className="font-bold text-lg text-slate-800 dark:text-zinc-100 mb-4">
                  <span className="text-emerald-600 mr-2">Soru {i + 1}.</span> 
                  {q.text}
                </div>
                
                <div className="space-y-2 mb-4">
                  {options.map((opt: string, j: number) => {
                    const isCorrect = opt === q.correctAnswer;
                    return (
                      <div key={j} className={`p-3 rounded-lg border ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                        {String.fromCharCode(65 + j)}) {opt}
                        {isCorrect && <span className="ml-2 font-bold text-emerald-600">✓ (Doğru Cevap)</span>}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-sm text-amber-800">
                    <strong>Açıklama:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
