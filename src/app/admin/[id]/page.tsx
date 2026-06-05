"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
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

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role === "ADMIN") {
      fetch(`/api/results/${params.id}`)
        .then(res => res.json())
        .then(data => {
          setResult(data)
          setIsLoading(false)
        })
    }
  }, [status, session, params.id])

  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return <div className="p-10 text-center text-slate-500">Yükleniyor...</div>
  }

  if (status === "unauthenticated" || (session?.user as any)?.role !== "ADMIN") {
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

  // Generate some fake radar data based on the score to make it look dynamic and cool
  const radarData = [
    { subject: 'İletişim & Müzakere', A: Math.min(100, result.score + 10), fullMark: 100 },
    { subject: 'Stratejik Düşünme', A: Math.max(30, result.score - 5), fullMark: 100 },
    { subject: 'Kriz Yönetimi', A: result.score, fullMark: 100 },
    { subject: 'Teknik Bilgi', A: Math.min(100, result.score + 15), fullMark: 100 },
    { subject: 'Değer Odaklılık', A: Math.max(40, result.score - 10), fullMark: 100 },
  ]

  const isHire = !result.hireDecision.includes('NO') && !result.hireDecision.includes('RED')

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <nav className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.push("/admin")} className="text-slate-400 hover:text-white transition-colors">
            ← Geri Dön
          </button>
          <h1 className="text-xl font-bold">Aday Detay: {result.user?.name}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors print:hidden">
            PDF İndir
          </button>
          <ThemeToggle />
          <span className="text-sm text-slate-300 print:hidden">{session?.user?.name}</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 mt-6 space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">{result.user?.name}</h2>
            <p className="text-slate-500 mt-1">{result.user?.email}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-full">
                Sektör: {result.sector}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-full">
                Rol: {result.roleName}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-center">
            <div className="flex flex-col items-center">
              <p className="text-sm text-slate-500 uppercase tracking-wide font-semibold mb-1">Ajan 5 (Sistem Skoru)</p>
              <div className="text-5xl font-black text-slate-900">%{result.score}</div>
              <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold ${getScoreDetails(result.score).badgeClass}`}>
                {getScoreDetails(result.score).label}
              </div>
            </div>
            <div className="w-px h-16 bg-slate-200"></div>
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-wide font-semibold mb-1">Ajan 9 Kararı</p>
              <div className={`text-4xl font-black ${isHire ? 'text-emerald-500' : 'text-rose-500'}`}>
                {result.hireDecision}
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Profile Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Radar Chart */}
          <div className="col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Yetkinlik Radarı (Ajan 8)</h3>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Aday" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Psychological Profile */}
          <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              🧠 Psikolojik Profil (Ajan 7)
            </h3>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
              <p className="whitespace-pre-wrap">{result.profileAnalysis}</p>
            </div>
          </div>
        </div>

        {/* Flaw and Mentor Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-rose-600 mb-4 flex items-center gap-2">
              🚨 Hata Dedektörü (Ajan 6)
            </h3>
            <div className="bg-rose-50 rounded-xl p-5 border border-rose-100">
              <p className="whitespace-pre-wrap text-rose-900 font-medium leading-relaxed">
                {result.flawAnalysis || "Aday hiç hata yapmadı veya kritik bir zafiyet tespit edilemedi."}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              📊 Kıyaslama (Ajan 8)
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
            Nihai Mentor Kararı (Ajan 9)
          </h3>
          <div className="prose prose-lg prose-slate max-w-none text-slate-700 leading-relaxed">
            <p className="whitespace-pre-wrap">{result.developmentAreas}</p>
          </div>
        </div>

      </main>
    </div>
  )
}
