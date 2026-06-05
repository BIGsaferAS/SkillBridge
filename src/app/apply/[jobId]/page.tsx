"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ThemeToggle } from "@/components/ThemeToggle"
import SkillCreator from "@/components/SkillCreator"

export default function ApplyPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cvText, setCvText] = useState("")
  const [testStarted, setTestStarted] = useState(false)

  useEffect(() => {
    if (params?.jobId) {
      fetch(`/api/jobs/${params.jobId}`)
        .then(res => res.json())
        .then(data => {
          if (data.job) setJob(data.job)
          setLoading(false)
        })
    }
  }, [params])

  if (loading) return <div className="p-10 text-center">Yükleniyor...</div>
  if (!job) return <div className="p-10 text-center text-red-500">İlan bulunamadı veya süresi doldu.</div>

  if (testStarted) {
    return <SkillCreator predefinedJob={job} cvText={cvText} />
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors text-slate-800 dark:text-slate-100 p-4 md:p-10">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">
              {job.title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">{job.sector} • {job.department} • {job.roleName}</p>
          </div>
          <ThemeToggle />
        </div>
        
        <div className="mb-6">
          <h2 className="font-semibold text-lg mb-2">Aranan Yetkinlikler:</h2>
          <div className="flex flex-wrap gap-2">
            {JSON.parse(job.competencies).map((c: string) => (
              <span key={c} className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-3 py-1 rounded-full text-sm">
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t dark:border-slate-700 pt-6">
          <h2 className="font-semibold text-lg mb-4">Adım 1: Özgeçmiş (CV) Yükleme</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Yapay Zeka (Ajan 10) mülakatı özgeçmişinizdeki tecrübelere göre kişiselleştirecektir. Lütfen CV'nizi metin olarak aşağıya yapıştırın.
          </p>
          <textarea
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            placeholder="Örn: 2018-2023 yılları arasında X firmasında Senior Developer olarak çalıştım. AWS, Node.js ve React konusunda uzmanım..."
            className="w-full h-48 border border-slate-300 dark:border-slate-600 rounded-lg p-4 bg-transparent focus:ring-2 focus:ring-indigo-500 mb-6"
          />
          <button 
            disabled={!cvText.trim()}
            onClick={() => setTestStarted(true)}
            className="w-full bg-blue-600 disabled:bg-slate-400 text-white font-bold py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            Yapay Zeka Testine Başla 🚀
          </button>
        </div>
      </div>
    </div>
  )
}
