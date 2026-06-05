'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function TestResultPage() {
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId');
  
  const [attempt, setAttempt] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) return;
    
    const fetchAttempt = async () => {
      try {
        const res = await fetch(`/api/attempts/${attemptId}`);
        if (res.ok) {
          setAttempt(await res.json());
        }
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    };

    fetchAttempt();
  }, [attemptId]);

  if (isLoading) return <div className="p-10 text-center">Rapor Hesaplanıyor...</div>;
  if (!attempt) return <div className="p-10 text-center text-slate-500">Kayıt bulunamadı.</div>;

  const matrix = JSON.parse(attempt.competencyMatrix || '{}');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Üst Bilgi Kartı */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-slate-200 dark:border-zinc-800 p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500"></div>
          
          <div>
            <div className="text-emerald-500 font-bold mb-2 flex items-center gap-2">
              <span className="text-xl">🎯</span> Simülasyon Tamamlandı
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{attempt.test.roleName} - Kariyer Uyumluluk Raporu</h1>
            <p className="text-slate-500">{attempt.test.sector} Sektörü • {attempt.test.department} Departmanı</p>
          </div>

          <div className="flex items-center gap-8 bg-slate-50 dark:bg-zinc-950 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800">
            <div className="text-center">
              <div className="text-sm text-slate-400 font-bold uppercase mb-1">Genel Skor</div>
              <div className="text-4xl font-black text-slate-800 dark:text-white">{attempt.score}<span className="text-lg text-slate-400">/100</span></div>
            </div>
            <div className="w-px h-12 bg-slate-200 dark:bg-zinc-800"></div>
            <div className="text-center">
              <div className="text-sm text-slate-400 font-bold uppercase mb-1">Kullanılan Süre</div>
              <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                {Math.floor(attempt.timeSpentSec / 60)} dk {attempt.timeSpentSec % 60} sn
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Kolon: Yetkinlik Matrisi */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-slate-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                📊 Yetkinlik Matrisi
              </h2>
              
              <div className="space-y-6">
                {Object.entries(matrix).map(([comp, percent]: any) => (
                  <div key={comp}>
                    <div className="flex justify-between text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                      <span>{comp}</span>
                      <span>%{percent}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${percent >= 70 ? 'bg-emerald-500' : percent >= 40 ? 'bg-amber-400' : 'bg-red-400'}`} 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sağ Kolon: AI Yorumu ve Cevaplar */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI Kariyer Tavsiyesi */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-3xl p-8 border border-indigo-100 dark:border-indigo-900/30 shadow-sm relative">
              <div className="absolute top-6 right-6 text-4xl opacity-50">🤖</div>
              <h2 className="text-xl font-extrabold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center gap-2">
                Ajan 4: Kariyer ve Gelişim Tavsiyesi
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {attempt.aiCareerAdvice}
              </p>
            </div>

            {/* Soru Detayları */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-slate-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Detaylı AI Analizi (Soru Bazlı)</h2>
              
              <div className="space-y-6">
                {attempt.answers.map((ans: any, i: number) => (
                  <div key={ans.id} className="pb-6 border-b border-slate-100 dark:border-zinc-800 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        <span className="text-slate-400 mr-2">S{i+1}.</span>
                        {ans.question.text}
                      </div>
                      <div className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${ans.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {ans.pointsAwarded} Puan
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl text-sm text-slate-600 dark:text-slate-400 mb-3 border border-slate-100 dark:border-zinc-800">
                      <strong>Verdiğiniz Cevap:</strong> <br/>{ans.userAnswer}
                    </div>

                    {ans.aiFeedback && (
                      <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
                        <span className="text-lg">💡</span>
                        <div>
                          <strong className="text-amber-900 dark:text-amber-500 text-sm block mb-1">Ajan 4 Geri Bildirimi:</strong>
                          <span className="text-amber-800 dark:text-amber-200 text-sm">{ans.aiFeedback}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center pt-4">
              <Link href="/admin/documents" className="inline-block px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-md">
                Dokümanlara ve Yönetim Paneline Dön
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
