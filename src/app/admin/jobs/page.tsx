"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ThemeToggle } from "@/components/ThemeToggle"

export default function AdminJobs() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jobs, setJobs] = useState<any[]>([])
  const [title, setTitle] = useState("")
  const [sector, setSector] = useState("")
  const [department, setDepartment] = useState("")
  const [roleName, setRoleName] = useState("")
  const [competencyStr, setCompetencyStr] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      const role = (session?.user as any)?.role;
      if (role !== "ADMIN" && role !== "COMPANY_MANAGER" && role !== "SUPER_ADMIN") {
        router.push("/login")
      } else {
        fetchJobs()
      }
    }
  }, [status, session, router])

  const fetchJobs = async () => {
    const res = await fetch('/api/jobs')
    const data = await res.json()
    if (data.jobs) setJobs(data.jobs)
  }

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    const comps = competencyStr.split(',').map(c => c.trim())
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, sector, department, roleName, competencies: comps })
    })
    if (res.ok) {
      setTitle(""); setSector(""); setDepartment(""); setRoleName(""); setCompetencyStr("");
      fetchJobs();
    }
  }

  if (status === "loading") return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors text-slate-800 dark:text-slate-100">
      <nav className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">İlan Yönetimi</h1>
        <div className="flex space-x-4">
          <button onClick={() => router.push('/admin')} className="text-sm underline">Tabloya Dön</button>
          <ThemeToggle />
        </div>
      </nav>
      
      <div className="p-10 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md h-fit">
          <h2 className="font-bold text-lg mb-4">Yeni İlan Oluştur</h2>
          <form onSubmit={handleCreateJob} className="space-y-4">
            <div><label className="text-sm">İlan Başlığı</label><input required value={title} onChange={e=>setTitle(e.target.value)} className="w-full border p-2 rounded dark:bg-slate-700 dark:border-slate-600" /></div>
            <div><label className="text-sm">Sektör</label><input required value={sector} onChange={e=>setSector(e.target.value)} className="w-full border p-2 rounded dark:bg-slate-700 dark:border-slate-600" /></div>
            <div><label className="text-sm">Departman</label><input required value={department} onChange={e=>setDepartment(e.target.value)} className="w-full border p-2 rounded dark:bg-slate-700 dark:border-slate-600" /></div>
            <div><label className="text-sm">Pozisyon/Rol</label><input required value={roleName} onChange={e=>setRoleName(e.target.value)} className="w-full border p-2 rounded dark:bg-slate-700 dark:border-slate-600" /></div>
            <div><label className="text-sm">Yetkinlikler (Virgülle Ayırın)</label><input required value={competencyStr} onChange={e=>setCompetencyStr(e.target.value)} className="w-full border p-2 rounded dark:bg-slate-700 dark:border-slate-600" /></div>
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">İlanı Yayınla</button>
          </form>
        </div>
        
        <div className="md:col-span-2">
          <h2 className="font-bold text-lg mb-4">Aktif İlanlar</h2>
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md border-l-4 border-indigo-500 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">{job.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{job.sector} - {job.department} - {job.roleName}</p>
                  <p className="text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-2 py-1 rounded inline-block mt-2">
                    {(() => {
                      try {
                        return JSON.parse(job.competencies).join(', ');
                      } catch {
                        return job.competencies;
                      }
                    })()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 mb-2">Başvuru Linki:</p>
                  <input readOnly value={`http://localhost:3000/apply/${job.id}`} className="text-xs w-48 p-1 border rounded bg-slate-100 dark:bg-slate-900" />
                  <button onClick={() => navigator.clipboard.writeText(`http://localhost:3000/apply/${job.id}`)} className="ml-2 text-xs bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 px-2 py-1 rounded">Kopyala</button>
                </div>
              </div>
            ))}
            {jobs.length === 0 && <p className="text-slate-500">Henüz ilan bulunmuyor.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
