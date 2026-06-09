'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

function TestResultContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId');
  
  const [attempt, setAttempt] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeRadarTab, setActiveRadarTab] = useState<string>("GENEL");
  const [competencyMetadata, setCompetencyMetadata] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/competencies')
      .then(res => res.json())
      .then(data => setCompetencyMetadata(data))
      .catch(err => console.error("Error loading competencies:", err));
  }, []);

  useEffect(() => {
    if (!attemptId) {
      setIsLoading(false);
      return;
    }
    
    const fetchAttempt = async () => {
      try {
        const res = await fetch(`/api/attempts/${attemptId}`);
        if (res.ok) {
          setAttempt(await res.json());
        } else {
          setErrorStatus(res.status);
          try {
            const data = await res.json();
            setErrorMessage(data.error || 'Bir hata oluştu');
          } catch {
            setErrorMessage('Bir hata oluştu');
          }
        }
      } catch (e) {
        console.error(e);
        setErrorMessage('Sunucuya bağlanırken bir hata oluştu.');
      }
      setIsLoading(false);
    };

    fetchAttempt();
  }, [attemptId]);

  if (isLoading) return <div className="p-10 text-center text-slate-500 dark:text-zinc-400">Rapor Hesaplanıyor...</div>;

  if (errorStatus === 401) {
    const callbackUrl = encodeURIComponent(`${pathname}?${searchParams.toString()}`);
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black p-6 font-sans flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-slate-200 dark:border-zinc-800 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-500"></div>
          <div className="text-4xl mb-4">🔐</div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Giriş Yapmanız Gerekiyor</h1>
          <p className="text-slate-600 dark:text-zinc-400 mb-6 text-sm leading-relaxed">
            {errorMessage || 'Bu test sonuçları kayıtlı bir kullanıcı hesabına aittir. Sonuçları görüntülemek için lütfen hesabınıza giriş yapın.'}
          </p>
          <div className="space-y-3">
            <Link 
              href={`/login?callbackUrl=${callbackUrl}`}
              className="block w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md text-sm text-center"
            >
              Giriş Yap
            </Link>
            <Link 
              href="/"
              className="block w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all text-sm text-center"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (errorStatus === 403) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black p-6 font-sans flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-slate-200 dark:border-zinc-800 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-rose-600"></div>
          <div className="text-4xl mb-4">🚫</div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Erişim Engellendi</h1>
          <p className="text-slate-600 dark:text-zinc-400 mb-6 text-sm leading-relaxed">
            {errorMessage || 'Bu test sonuçlarını görüntülemek için gerekli yetkiye sahip değilsiniz.'}
          </p>
          <Link 
            href="/"
            className="block w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md text-sm text-center"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black p-6 font-sans flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-slate-200 dark:border-zinc-800 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Kayıt Bulunamadı</h1>
          <p className="text-slate-600 dark:text-zinc-400 mb-6 text-sm leading-relaxed">
            İstediğiniz test sonucuna ulaşılamadı. Lütfen bağlantı adresini kontrol edin.
          </p>
          <Link 
            href="/"
            className="block w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md text-sm text-center"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  // Parse competency matrix with fallback
  const getCompetencyMatrix = () => {
    if (attempt.competencyMatrix) {
      try {
        const parsed = JSON.parse(attempt.competencyMatrix);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && Object.keys(parsed).length > 0) return parsed;
      } catch (e) {}
    }
    return {
      "Analitik Düşünme": Math.max(30, Math.min(100, attempt.score + 5)),
      "Problem Çözme": attempt.score,
      "İletişim": Math.max(30, Math.min(100, attempt.score - 10)),
      "Kriz Yönetimi": Math.max(30, Math.min(100, attempt.score - 5)),
      "Süreç Odaklılık": Math.max(30, Math.min(100, attempt.score + 10))
    };
  };

  const matrix = getCompetencyMatrix();
  const compMap = new Map(competencyMetadata.map(c => [c.name, c]));

  // Group competencies by their categories
  const categoryGroups: Record<string, any[]> = {
    "BİLİŞSEL": [],
    "TEKNİK": [],
    "TEMEL": [],
    "YÖNETSEL": []
  };

  Object.entries(matrix).forEach(([name, val]) => {
    const score = Number(val);
    const meta = compMap.get(name);
    const cat = (meta && typeof meta.category === "string") ? meta.category.toUpperCase() : "TEMEL";
    const item = { name, score, meta };
    if (categoryGroups[cat]) {
      categoryGroups[cat].push(item);
    } else {
      categoryGroups["TEMEL"].push(item);
    }
  });

  // Build Radar Data for the selected tab
  let radarData: any[] = [];
  if (activeRadarTab === "GENEL") {
    // Show category averages
    Object.entries(categoryGroups).forEach(([cat, list]) => {
      const avg = list.length > 0 
        ? Math.round(list.reduce((sum, item) => sum + item.score, 0) / list.length)
        : Math.max(40, attempt.score + (cat === 'BİLİŞSEL' ? 5 : cat === 'TEKNİK' ? 10 : cat === 'TEMEL' ? -5 : 0));
      
      radarData.push({
        subject: cat,
        "Mevcut Durum": avg,
        "Hedeflenen Düzey": 60,
        fullMark: 100
      });
    });
  } else {
    // Show competencies in selected category
    const list = categoryGroups[activeRadarTab] || [];
    list.forEach(item => {
      radarData.push({
        subject: item.name,
        "Mevcut Durum": item.score,
        "Hedeflenen Düzey": 60,
        fullMark: 100
      });
    });
  }

  // Get active competency list to render underneath or on the side
  const activeCompList = activeRadarTab === "GENEL"
    ? Object.values(categoryGroups).flat()
    : (categoryGroups[activeRadarTab] || []);

  // Helper for level retrieval
  const getLevelInfo = (score: number, meta: any) => {
    if (!meta) return { level: "Seviye 3 (Beklenen)", text: "Standart işlerde kurallara uyar, zamanında ve doğru çıktı üretir." };
    if (score >= 81) return { level: "Seviye 5 (Örnek)", text: meta.levelE || meta.description };
    if (score >= 61) return { level: "Seviye 4 (Yetkin)", text: meta.levelD || meta.description };
    if (score >= 41) return { level: "Seviye 3 (Beklenen)", text: meta.levelC || meta.description };
    if (score >= 21) return { level: "Seviye 2 (Sınırlı Başarı)", text: meta.levelB || meta.description };
    return { level: "Seviye 1 (Gelişmeli)", text: meta.levelA || meta.description };
  };

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

        {/* Dynamic Radar and Level Descriptions Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-slate-200 dark:border-zinc-800 p-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 dark:border-zinc-800 pb-4 gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Yetkinlik Ölçüm & Radar Analizi</h2>
              <p className="text-sm text-slate-500">Kategori bazlı radar grafik ve hedef & mevcut durum analizi</p>
            </div>
            
            {/* Tab buttons */}
            <div className="flex flex-wrap gap-2 bg-slate-50 dark:bg-zinc-950 p-1.5 rounded-2xl border border-slate-100 dark:border-zinc-800/80">
              {["GENEL", "BİLİŞSEL", "TEKNİK", "TEMEL", "YÖNETSEL"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveRadarTab(tab)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    activeRadarTab === tab
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {tab === "GENEL" ? "Genel Özet" : tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Radar Display Card */}
            <div data-help="radar-chart" className="lg:col-span-1 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-800 p-4 flex flex-col items-center justify-center min-h-[360px]">
              <h4 className="text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">
                {activeRadarTab === "GENEL" ? "Kategori Bazlı Genel Özet" : `${activeRadarTab} Yetkinlik Radarı`}
              </h4>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Hedeflenen Seviye" dataKey="Hedeflenen Düzey" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.15} />
                    <Radar name="Mevcut Durum" dataKey="Mevcut Durum" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                    <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Competency List with Levels */}
            <div data-help="competency-matrix" className="lg:col-span-2 space-y-4 max-h-[400px] overflow-y-auto pr-2">
              <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                {activeRadarTab === "GENEL" ? "Tüm Ölçülen Yetkinlikler" : `${activeRadarTab} Yetkinlik Detayları`}
              </h4>
              
              {activeCompList.length === 0 ? (
                <div className="p-10 text-center text-slate-400">Bu kategoride ölçülen yetkinlik bulunmamaktadır.</div>
              ) : (
                activeCompList.map((item, idx) => {
                  const levelInfo = getLevelInfo(item.score, item.meta);
                  return (
                    <div key={idx} className="p-4 bg-slate-50/50 dark:bg-zinc-950/40 rounded-xl border border-slate-100 dark:border-zinc-800/60 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-sm font-bold text-slate-800 dark:text-white">{item.name}</span>
                          <span className="text-[10px] ml-2 text-emerald-500 uppercase font-black">
                            {item.meta?.category || "TEMEL"}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Mevcut: %{item.score}</span>
                          <span className="text-[10px] text-slate-400 ml-2">Hedef: %60</span>
                        </div>
                      </div>

                      {/* Progress line comparison */}
                      <div className="relative w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                        {/* Target line indicator */}
                        <div className="absolute left-[60%] w-0.5 h-full bg-red-400 z-10" title="Hedef Seviye: %60"></div>
                        <div 
                          className={`h-full rounded-full transition-all ${
                            item.score >= 60 ? 'bg-emerald-500' : item.score >= 40 ? 'bg-amber-400' : 'bg-rose-500'
                          }`}
                          style={{ width: `${item.score}%` }}
                        ></div>
                      </div>

                      {/* Level statement and description */}
                      <div className="text-xs space-y-1 mt-1 bg-white dark:bg-zinc-900/40 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-800/40">
                        <div className="font-extrabold text-slate-700 dark:text-zinc-300">
                          {levelInfo.level}
                        </div>
                        <div className="text-slate-500 dark:text-zinc-400 leading-relaxed text-[11px]">
                          {levelInfo.text}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Kolon: Removed or repurposed if needed, we put the full detail in radar section */}
          {/* Sağ Kolon: AI Yorumu ve Cevaplar */}
          <div className="lg:col-span-3 space-y-8">
            {/* Ajan 17 Değerlendirme & Editör Raporu */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-slate-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <span>✨</span> Ajan 17: Editör & Kalite Raporu
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Psikolojik Profil */}
                  <div className="bg-slate-50 dark:bg-zinc-950/40 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800/60 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-zinc-200 mb-3 flex items-center gap-2">
                        🧠 Psikolojik Profil & Analiz
                      </h3>
                      <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">
                        {attempt.profileAnalysis || "Adayın profil analizi değerlendiriliyor..."}
                      </p>
                    </div>
                  </div>

                  {/* Sektörel Kıyaslama */}
                  <div className="bg-slate-50 dark:bg-zinc-950/40 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800/60 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-zinc-200 mb-3 flex items-center gap-2">
                        📊 Sektörel Kıyaslama (Benchmark)
                      </h3>
                      <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">
                        {attempt.benchmarking || "Kıyaslama verileri hazırlanıyor..."}
                      </p>
                    </div>
                  </div>

                  {/* Hata Dedektörü */}
                  <div data-help="flaw-detector" className="bg-rose-50/40 dark:bg-rose-950/10 p-6 rounded-2xl border border-rose-100/60 dark:border-rose-900/20 md:col-span-2">
                    <h3 className="text-base font-bold text-rose-800 dark:text-rose-400 mb-3 flex items-center gap-2">
                      🚨 Hata Dedektörü & Davranış Zafiyetleri
                    </h3>
                    <p className="text-rose-900/80 dark:text-rose-300/80 text-sm leading-relaxed whitespace-pre-wrap">
                      {attempt.flawAnalysis || "Refleks zafiyetleri analiz ediliyor..."}
                    </p>
                  </div>

                  {/* İşe Alım / Uyum Kararı */}
                  <div className="bg-slate-50 dark:bg-zinc-950/40 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800/60 md:col-span-2">
                    <h3 className="text-base font-bold text-slate-800 dark:text-zinc-200 mb-3 flex items-center gap-2">
                      💼 İşe Alım / Uyum Değerlendirmesi
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${
                        (attempt.hireDecision || "").toUpperCase().includes("GELİŞTİRİLMELİ") || (attempt.hireDecision || "").toUpperCase().includes("RED") || (attempt.hireDecision || "").toUpperCase().includes("UYGUN DEĞİL")
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                      }`}>
                        {attempt.hireDecision || "Değerlendiriliyor"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kariyer & Gelişim Tavsiyesi */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-3xl p-8 border border-indigo-100 dark:border-indigo-900/30 shadow-sm relative">
                <div className="absolute top-6 right-6 text-4xl opacity-50">📈</div>
                <h2 className="text-xl font-extrabold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center gap-2">
                  Ajan 17: Kariyer & Gelişim Yol Haritası
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                  {attempt.aiCareerAdvice}
                </p>
              </div>
            </div>

            {/* Soru Detayları */}
            <div data-help="question-answers" className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-slate-200 dark:border-zinc-800 shadow-sm">
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

                    {ans.question.correctAnswer && (
                      <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-4 rounded-xl text-sm text-emerald-800 dark:text-emerald-400 mb-3 border border-emerald-100/60 dark:border-emerald-900/20">
                        <strong>Doğru Cevap:</strong> <br/>{ans.question.correctAnswer}
                      </div>
                    )}

                    {ans.question.explanation && (
                      <div className="bg-blue-50/50 dark:bg-blue-950/10 p-4 rounded-xl text-sm text-blue-800 dark:text-blue-400 mb-3 border border-blue-100/60 dark:border-blue-900/20">
                        <strong>Soru Açıklaması:</strong> <br/>{ans.question.explanation}
                      </div>
                    )}

                    {ans.aiFeedback && (
                      <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
                        <span className="text-lg">💡</span>
                        <div>
                          <strong className="text-amber-900 dark:text-amber-500 text-sm block mb-1">Ajan 17 Geri Bildirimi:</strong>
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

export default function TestResultPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Yükleniyor...</div>}>
      <TestResultContent />
    </Suspense>
  );
}
