'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function SolveTestPage({ params }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();

  const [test, setTest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Guest States
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestConfirmed, setGuestConfirmed] = useState(false);
  
  // Test State
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const urlName = searchParams.get("name");
    const urlEmail = searchParams.get("email");
    if (urlName) setGuestName(urlName);
    if (urlEmail) setGuestEmail(urlEmail);
    if (urlName && urlEmail) {
      setGuestConfirmed(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const resolvedParams = await params;
        const res = await fetch(`/api/tests/${resolvedParams.id}`);
        if (res.ok) {
          const data = await res.json();
          setTest(data);
          setTimeLeft(data.timeLimitSec || 900);
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

  // Timer logic
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitting) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0 && test && !isSubmitting) {
      handleSubmit(); // Auto submit when time is up
    }
  }, [timeLeft, isSubmitting, test]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  type PipelineState = 'IDLE' | 'AJAN_4' | 'AJAN_5' | 'AJAN_6' | 'AJAN_7' | 'AJAN_8' | 'AJAN_9' | 'FINISHED';
  const [pipelineState, setPipelineState] = useState<PipelineState>('IDLE');

  const handleSubmit = async () => {
    if (!test) return;
    setIsSubmitting(true);
    setPipelineState('AJAN_4');
    
    try {
      await new Promise(r => setTimeout(r, 1000));
      setPipelineState('AJAN_5');
      await new Promise(r => setTimeout(r, 1000));
      setPipelineState('AJAN_6');
      await new Promise(r => setTimeout(r, 1000));
      setPipelineState('AJAN_7');
      await new Promise(r => setTimeout(r, 1000));
      setPipelineState('AJAN_8');
      await new Promise(r => setTimeout(r, 1000));
      setPipelineState('AJAN_9');

      const resolvedParams = await params;
       const res = await fetch(`/api/tests/${resolvedParams.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          answers,
          timeSpentSec: (test.timeLimitSec || 900) - timeLeft,
          guestInfo: sessionStatus === "unauthenticated" ? { name: guestName, email: guestEmail } : undefined
        })
      });

      if (res.ok) {
        setPipelineState('FINISHED');
        await new Promise(r => setTimeout(r, 800));
        const result = await res.json();
        router.push(`/tests/${resolvedParams.id}/result?attemptId=${result.attemptId}`);
      } else {
        alert('Gönderim sırasında hata oluştu.');
        setIsSubmitting(false);
        setPipelineState('IDLE');
      }
    } catch (e) {
      alert('Sunucuya ulaşılamadı.');
      setIsSubmitting(false);
      setPipelineState('IDLE');
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black"><div className="animate-pulse font-bold text-slate-400">Simülasyon Yükleniyor...</div></div>;
  if (!test) return <div className="p-10 text-center text-slate-500">Test bulunamadı.</div>;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const answeredCount = Object.keys(answers).length;
  const totalCount = test.questions?.length || 0;
  const progressPercent = totalCount === 0 ? 0 : Math.round((answeredCount / totalCount) * 100);

  if (sessionStatus === "unauthenticated" && !guestConfirmed) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl max-w-md w-full">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center font-bold text-xl mb-4 shadow-sm">
            T
          </div>
          
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
            {test.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mb-6 leading-relaxed">
            Bu sınava dış katılım veya QR kod taratarak erişmektesiniz. Testi çözmeye başlamadan önce lütfen ad soyad ve e-posta adresinizi girin.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); if(guestName.trim() && guestEmail.trim()) setGuestConfirmed(true); }} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ad Soyad</label>
              <input
                required
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Örn: Mehmet Öz"
                className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-zinc-950 focus:ring-2 focus:ring-purple-500 outline-none text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">E-Posta Adresi</label>
              <input
                required
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="Örn: mehmet@mail.com"
                className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-zinc-950 focus:ring-2 focus:ring-purple-500 outline-none text-xs text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-3 rounded-xl shadow-lg shadow-purple-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all text-xs cursor-pointer mt-2"
            >
              Simülasyon Testine Başla 🚀
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans pb-20">
      {/* 1. Üst Panel (Sabit Dashboard) */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 shadow-sm px-6 py-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white line-clamp-1">{test.title}</h1>
            <p className="text-xs text-slate-500 font-medium">{test.sector} • {test.department} • {test.roleName}</p>
          </div>
          
          <div className="flex items-center gap-8 bg-slate-100 dark:bg-zinc-900 px-6 py-2 rounded-2xl border border-slate-200 dark:border-zinc-800">
            {/* Soru Sayısı */}
            <div className="text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Soru Sayısı</div>
              <div className="text-lg font-black text-slate-800 dark:text-white flex items-center justify-center gap-1">
                🔢 {totalCount}
              </div>
            </div>

            <div className="w-px h-8 bg-slate-300 dark:bg-zinc-700"></div>

            {/* Zorluk Derecesi */}
            <div className="text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Zorluk Derecesi</div>
              <div className="text-lg font-black text-slate-800 dark:text-white flex items-center justify-center gap-1">
                🎯 {test.difficulty || 'Orta'}
              </div>
            </div>

            <div className="w-px h-8 bg-slate-300 dark:bg-zinc-700"></div>

            {/* Sayaç */}
            <div className="text-center min-w-[80px]">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Kalan Süre</div>
              <div className={`text-2xl font-black flex items-center justify-center gap-1 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-slate-800 dark:text-white'}`}>
                ⏱️ {formatTime(timeLeft)}
              </div>
            </div>
          </div>

        </div>
        
        {/* İlerleme Çubuğu - Hemen Altında */}
        <div className="max-w-5xl mx-auto mt-4">
          <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
            <span>İlerleme ({progressPercent}%)</span>
            <span>{answeredCount} / {totalCount} Çözüldü</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-8">
        {/* Vaka / Senaryo Kutusu */}
        {test.scenarioText && (
          <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 rounded-2xl p-8 mb-10 shadow-sm relative overflow-hidden">
            <div className="absolute -right-6 -top-6 text-indigo-100 dark:text-indigo-900/20 text-9xl">💼</div>
            <h2 className="text-indigo-800 dark:text-indigo-300 font-extrabold text-xl mb-4 relative z-10 flex items-center gap-2">
              <span className="text-2xl">📝</span> Vaka Senaryosu (Case Study)
            </h2>
            <div className="prose prose-indigo dark:prose-invert max-w-none relative z-10 text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {test.scenarioText}
            </div>
          </div>
        )}

        {/* Sorular */}
        <div className="space-y-12">
          {test.questions?.map((q: any, i: number) => {
            const isAnswered = !!answers[q.id];
            
            return (
              <div key={q.id} className={`bg-white dark:bg-zinc-900 rounded-2xl border transition-all duration-300 p-8 shadow-sm ${
                isAnswered ? 'border-emerald-200 dark:border-emerald-900/50' : 'border-slate-200 dark:border-zinc-800'
              }`}>
                <div className="flex items-start gap-4 mb-6">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    isAnswered ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}>
                    {i + 1}
                  </div>
                  <div>
                    {q.competency && (
                      <span className="inline-block px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider rounded mb-2">
                        Ölçülen Yetkinlik: {q.competency}
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-snug">{q.text}</h3>
                  </div>
                </div>

                <div className="pl-14">
                  {q.type === 'MULTIPLE_CHOICE' ? (
                    <div className="space-y-3">
                      {JSON.parse(q.options || '[]').map((opt: string, j: number) => {
                        const selected = answers[q.id] === opt;
                        return (
                          <label key={j} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                            selected 
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-500 dark:text-emerald-100 shadow-sm' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900'
                          }`}>
                            <input 
                              type="radio" 
                              name={`question-${q.id}`} 
                              value={opt}
                              checked={selected}
                              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                              className="w-5 h-5 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="font-medium text-[15px]">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div>
                      <textarea 
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder="Cevabınızı buraya detaylı olarak yazınız..."
                        rows={6}
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow text-slate-700 dark:text-slate-300 resize-y"
                      ></textarea>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Alt Panel - Testi Bitir ve Animasyon */}
        <div className="mt-12">
          
          {/* Cascade Pipeline Animation - Group 2 & 3 */}
          {pipelineState !== 'IDLE' && (
            <div className="bg-white dark:bg-zinc-950 p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm mb-10 animate-fade-in">
              <h2 className="text-2xl font-bold mb-8 text-indigo-700 dark:text-indigo-400 text-center">Cascade Pipeline: Değerlendirme & Analiz</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest mb-4">Grup 2 (Değerlendiriciler)</h3>
                  {['AJAN_4', 'AJAN_5', 'AJAN_6'].map((state, idx) => {
                    const isActive = pipelineState === state;
                    const isPast = ['AJAN_5', 'AJAN_6', 'AJAN_7', 'AJAN_8', 'AJAN_9', 'FINISHED'].includes(pipelineState) && state !== pipelineState;
                    return (
                      <div key={state} className={`flex items-center p-4 rounded-xl border transition-all duration-500 ${isActive ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-900/20 dark:border-indigo-700/50 scale-[1.02] shadow-md' : isPast ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-700/50' : 'bg-slate-50 border-slate-200 dark:bg-zinc-900/50 dark:border-zinc-800 opacity-50'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 font-bold ${isActive ? 'bg-indigo-500 text-white animate-pulse' : isPast ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-500 dark:bg-zinc-700 dark:text-zinc-500'}`}>{idx + 4}</div>
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-zinc-200">Ajan {idx + 4} {['(Sınav Sorumlusu)', '(Optik)', '(Hata Dedektörü)'][idx]}</h3>
                          <p className={`text-sm ${isActive ? 'text-indigo-600 dark:text-indigo-400 font-medium' : isPast ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-zinc-500'}`}>{isActive ? 'Çalışıyor...' : isPast ? 'Tamamlandı.' : 'Bekliyor...'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest mb-4">Grup 3 (Analistler)</h3>
                  {['AJAN_7', 'AJAN_8', 'AJAN_9'].map((state, idx) => {
                    const isActive = pipelineState === state;
                    const isPast = ['AJAN_8', 'AJAN_9', 'FINISHED'].includes(pipelineState) && state !== pipelineState;
                    return (
                      <div key={state} className={`flex items-center p-4 rounded-xl border transition-all duration-500 ${isActive ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-900/20 dark:border-indigo-700/50 scale-[1.02] shadow-md' : isPast ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-700/50' : 'bg-slate-50 border-slate-200 dark:bg-zinc-900/50 dark:border-zinc-800 opacity-50'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 font-bold ${isActive ? 'bg-indigo-500 text-white animate-pulse' : isPast ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-500 dark:bg-zinc-700 dark:text-zinc-500'}`}>{idx + 7}</div>
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-zinc-200">Ajan {idx + 7} {['(Profil Uzmanı)', '(Kıyaslama Motoru)', '(Gelişim Mentoru)'][idx]}</h3>
                          <p className={`text-sm ${isActive ? 'text-indigo-600 dark:text-indigo-400 font-medium' : isPast ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-zinc-500'}`}>{isActive ? 'Çalışıyor...' : isPast ? 'Tamamlandı.' : 'Bekliyor...'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
              </div>
            </div>
          )}

          <div className="text-center">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || pipelineState !== 'IDLE'}
              className={`px-12 py-5 rounded-2xl font-black text-xl text-white transition-all shadow-xl hover:shadow-2xl ${
                isSubmitting 
                  ? 'bg-slate-400 dark:bg-zinc-700 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-105 hover:from-emerald-400 hover:to-teal-400'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Yapay Zeka Yanıtlarınızı Analiz Ediyor...
                </span>
              ) : 'Testi Bitir ve Kariyer Raporunu Gör 🚀'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
