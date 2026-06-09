"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts'
import { ThemeToggle } from "@/components/ThemeToggle"

const getScoreDetails = (score: number) => {
  if (score >= 80) return { label: 'İleri Seviye Yetkin', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30' };
  if (score >= 70) return { label: 'Yetkin', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30' };
  if (score >= 60) return { label: 'Beklenen', badgeClass: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-900/30' };
  if (score >= 50) return { label: 'Az Yetkin', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30' };
  return { label: 'Yetkin Olmayan', badgeClass: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400 border border-red-200 dark:border-red-900/30' };
};

export default function CandidateDetail() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeRadarTab, setActiveRadarTab] = useState<string>("GENEL")
  const [competencyMetadata, setCompetencyMetadata] = useState<any[]>([])

  useEffect(() => {
    const role = (session?.user as any)?.role;
    const hasAccess = role === "ADMIN" || role === "COMPANY_MANAGER" || role === "SUPER_ADMIN";
    if (status === "authenticated" && hasAccess) {
      fetch(`/api/results/${params.id}`)
        .then(res => res.json())
        .then(data => {
          setResult(data)
          setIsLoading(false)
        })

      fetch('/api/competencies')
        .then(res => res.json())
        .then(data => setCompetencyMetadata(data))
        .catch(err => console.error("Error loading competencies:", err))
    }
  }, [status, session, params.id])

  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return <div className="p-10 text-center text-slate-500">Yükleniyor...</div>
  }

  const userRole = (session?.user as any)?.role;
  const isAuthorized = userRole === "ADMIN" || userRole === "COMPANY_MANAGER" || userRole === "SUPER_ADMIN";
  if (status === "unauthenticated" || !isAuthorized) {
    router.push("/login")
    return null
  }

  if (!result || result.error) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-red-600">Aday Bulunamadı</h2>
        <button onClick={() => router.push("/admin")} className="mt-4 text-blue-600 underline">Panoya Dön</button>
      </div>
    )
  }

  // Extract competency matrix with fallback
  const getCompetencyMatrix = () => {
    if (result.competencyMatrix) {
      try {
        const parsed = JSON.parse(result.competencyMatrix)
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && Object.keys(parsed).length > 0) return parsed
      } catch (e) {}
    }
    // Fallback: Generate mock values based on result score for backward compatibility
    return {
      "Analitik Düşünme": Math.max(30, Math.min(100, result.score + 5)),
      "Problem Çözme": result.score,
      "İletişim": Math.max(30, Math.min(100, result.score - 10)),
      "Kriz Yönetimi": Math.max(30, Math.min(100, result.score - 5)),
      "Süreç Odaklılık": Math.max(30, Math.min(100, result.score + 10))
    }
  };

  const matrix = getCompetencyMatrix()
  const compMap = new Map(competencyMetadata.map(c => [c.name, c]))

  // Group competencies by their categories
  const categoryGroups: Record<string, any[]> = {
    "BİLİŞSEL": [],
    "TEKNİK": [],
    "TEMEL": [],
    "YÖNETSEL": []
  };

  Object.entries(matrix).forEach(([name, val]) => {
    const score = Number(val)
    const meta = compMap.get(name)
    const cat = (meta && typeof meta.category === "string") ? meta.category.toUpperCase() : "TEMEL"
    const item = { name, score, meta }
    if (categoryGroups[cat]) {
      categoryGroups[cat].push(item)
    } else {
      categoryGroups["TEMEL"].push(item)
    }
  })

  // Build Radar Data for the selected tab
  let radarData: any[] = []
  if (activeRadarTab === "GENEL") {
    // Show category averages
    Object.entries(categoryGroups).forEach(([cat, list]) => {
      const avg = list.length > 0 
        ? Math.round(list.reduce((sum, item) => sum + item.score, 0) / list.length)
        : Math.max(40, result.score + (cat === 'BİLİŞSEL' ? 5 : cat === 'TEKNİK' ? 10 : cat === 'TEMEL' ? -5 : 0))
      
      radarData.push({
        subject: cat,
        "Mevcut Durum": avg,
        "Hedeflenen Düzey": 60,
        fullMark: 100
      })
    })
  } else {
    // Show competencies in selected category
    const list = categoryGroups[activeRadarTab] || []
    list.forEach(item => {
      radarData.push({
        subject: item.name,
        "Mevcut Durum": item.score,
        "Hedeflenen Düzey": 60,
        fullMark: 100
      })
    })
  }

  // Get active competency list to render underneath or on the side
  const activeCompList = activeRadarTab === "GENEL"
    ? Object.values(categoryGroups).flat()
    : (categoryGroups[activeRadarTab] || [])

  // Helper for level retrieval
  const getLevelInfo = (score: number, meta: any) => {
    if (!meta) return { level: "Seviye 3 (Beklenen)", text: "Standart işlerde kurallara uyar, zamanında ve doğru çıktı üretir." };
    if (score >= 81) return { level: "Seviye 5 (Örnek)", text: meta.levelE || meta.description };
    if (score >= 61) return { level: "Seviye 4 (Yetkin)", text: meta.levelD || meta.description };
    if (score >= 41) return { level: "Seviye 3 (Beklenen)", text: meta.levelC || meta.description };
    if (score >= 21) return { level: "Seviye 2 (Sınırlı Başarı)", text: meta.levelB || meta.description };
    return { level: "Seviye 1 (Gelişmeli)", text: meta.levelA || meta.description };
  };

  const isHire = !result.hireDecision.toUpperCase().includes('GELİŞTİRİLMELİ') && !result.hireDecision.toUpperCase().includes('RED') && !result.hireDecision.toUpperCase().includes('UYGUN DEĞİL')

  return (
    <div className="min-h-screen bg-slate-50 pb-20 dark:bg-zinc-950 dark:text-white">
      <nav className="bg-slate-900 text-white p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-md sticky top-0 z-50">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button onClick={() => router.push("/admin")} className="text-slate-400 hover:text-white transition-colors shrink-0 text-lg">
            ←
          </button>
          <h1 className="text-base sm:text-lg font-bold truncate">Aday Detay: {result.user?.name}</h1>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto print:hidden">
          <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-colors shrink-0">
            PDF İndir
          </button>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="text-xs text-slate-300 hidden md:inline">{session?.user?.name}</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 mt-6 space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">{result.user?.name}</h2>
            <p className="text-slate-500 mt-1">{result.user?.email}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-sm font-medium rounded-full">
                Sektör: {result.sector}
              </span>
              <span className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-sm font-medium rounded-full">
                Rol: {result.roleName}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-center">
            <div className="flex flex-col items-center">
              <p className="text-sm text-slate-500 dark:text-zinc-400 uppercase tracking-wide font-semibold mb-1">Genel Skor</p>
              <div className="text-5xl font-black text-slate-900 dark:text-white">%{result.score}</div>
              <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold ${getScoreDetails(result.score).badgeClass}`}>
                {getScoreDetails(result.score).label}
              </div>
            </div>
            <div className="w-px h-16 bg-slate-200 dark:bg-zinc-800"></div>
            <div>
              <p className="text-sm text-slate-500 dark:text-zinc-400 uppercase tracking-wide font-semibold mb-1">Karar</p>
              <div className={`text-4xl font-black ${isHire ? 'text-emerald-500' : 'text-rose-500'}`}>
                {result.hireDecision}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Radar and Level Descriptions Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 dark:border-zinc-800 pb-4 gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Yetkinlik Ölçüm & Radar Analizi</h3>
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
                    <Radar name="Mevcut Durum" dataKey="Mevcut Durum" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.4} />
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
                          <span className="text-[10px] ml-2 text-indigo-500 uppercase font-black">
                            {item.meta?.category || "TEMEL"}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Mevcut: %{item.score}</span>
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

        {/* Psychological Profile */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            🧠 Psikolojik Profil (Sayfa 7)
          </h3>
          <div className="prose prose-slate max-w-none text-slate-600 dark:text-zinc-300 leading-relaxed">
            <p className="whitespace-pre-wrap">{result.profileAnalysis}</p>
          </div>
        </div>

        {/* Flaw and Mentor Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div data-help="flaw-detector" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-rose-600 mb-4 flex items-center gap-2">
              🚨 Hata Dedektörü (Sayfa 6)
            </h3>
            <div className="bg-rose-50 rounded-xl p-5 border border-rose-100">
              <p className="whitespace-pre-wrap text-rose-900 font-medium leading-relaxed">
                {result.flawAnalysis || "Aday hiç hata yapmadı veya kritik bir zafiyet tespit edilemedi."}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              📊 Kıyaslama (Sayfa 8)
            </h3>
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
              <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                {result.benchmarking}
              </p>
            </div>
          </div>

        </div>

        {/* Final Mentor Report */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 border-t-4 border-t-emerald-500">
          <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
            Nihai Mentor Kararı (Sayfa 9)
          </h3>
          <div className="prose prose-lg prose-slate max-w-none text-slate-700 leading-relaxed">
            <p className="whitespace-pre-wrap">{result.developmentAreas}</p>
          </div>
        </div>

        {/* Detaylı Aday Cevapları */}
        {result.answers && result.answers.length > 0 && (
          <div data-help="question-answers" className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 p-8">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              📝 Soru Bazlı Detaylı Analiz & Aday Cevapları
            </h3>
            
            <div className="space-y-6">
              {result.answers.map((ans: any, i: number) => (
                <div key={ans.id} className="pb-6 border-b border-slate-100 dark:border-zinc-850 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      <span className="text-slate-400 mr-2">S{i+1}.</span>
                      {ans.question?.text}
                    </div>
                    <div className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${ans.isCorrect ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'}`}>
                      {ans.pointsAwarded} Puan
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl text-sm text-slate-600 dark:text-slate-400 mb-3 border border-slate-100 dark:border-zinc-800">
                    <strong>Adayın Cevabı:</strong> <br/>{ans.userAnswer}
                  </div>

                  {ans.question?.correctAnswer && (
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-4 rounded-xl text-sm text-emerald-800 dark:text-emerald-400 mb-3 border border-emerald-100/60 dark:border-emerald-900/20">
                      <strong>Doğru Cevap:</strong> <br/>{ans.question.correctAnswer}
                    </div>
                  )}

                  {ans.question?.explanation && (
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
        )}

      </main>
    </div>
  )
}
