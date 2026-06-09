import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import Link from "next/link"

const getScoreDetails = (score: number) => {
  if (score >= 80) return { label: 'İleri Seviye Yetkin', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30' };
  if (score >= 70) return { label: 'Yetkin', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30' };
  if (score >= 60) return { label: 'Beklenen', badgeClass: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-900/30' };
  if (score >= 50) return { label: 'Az Yetkin', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30' };
  return { label: 'Yetkin Olmayan', badgeClass: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400 border border-red-200 dark:border-red-900/30' };
};

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "COMPANY_MANAGER" && (session.user as any).role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const companyId = (session.user as any).companyId;
  const company = companyId ? await prisma.company.findUnique({ where: { id: companyId } }) : null;

  // Tüm ilanları getir
  const jobPostings = await prisma.jobPosting.findMany({
    where: companyId ? { companyId } : undefined,
    include: {
      _count: {
        select: { testAssignments: true, testResults: true }
      }
    }
  });

  // Sonuçları getir
  const results = await prisma.testResult.findMany({
    where: companyId ? { user: { companyId } } : undefined,
    include: { user: true, jobPosting: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  // İstatistik hesapla
  const totalPostings = jobPostings.length;
  const totalParticipants = jobPostings.reduce((acc, job) => acc + job._count.testAssignments, 0);
  const totalCompleted = jobPostings.reduce((acc, job) => acc + job._count.testResults, 0);
  const averageScore = results.length > 0 
    ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black">
      <main className="max-w-7xl mx-auto p-6 mt-4">
        
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="text-slate-500 dark:text-zinc-400 text-sm font-medium mb-1">Aktif İlanlar</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalPostings}</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="text-slate-500 dark:text-zinc-400 text-sm font-medium mb-1">Toplam Başvuru</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalParticipants}</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="text-slate-500 dark:text-zinc-400 text-sm font-medium mb-1">Tamamlanan Test</div>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{totalCompleted}</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="text-slate-500 dark:text-zinc-400 text-sm font-medium mb-1">Ortalama Başarı</div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">%{averageScore}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Kolon: Yönetilen Testler */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
                📋 Yönetilen Testler
              </h2>
              <div className="space-y-4">
                {jobPostings.map(job => (
                  <div key={job.id} className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg border border-slate-100 dark:border-zinc-700">
                    <h3 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">{job.title}</h3>
                    <div className="flex justify-between mt-2 text-xs text-slate-500 dark:text-zinc-400">
                      <span>{job._count.testAssignments} Aday</span>
                      <span>{job._count.testResults} Tamamladı</span>
                    </div>
                  </div>
                ))}
                {jobPostings.length === 0 && (
                  <p className="text-sm text-slate-500 italic">Henüz bir ilan oluşturmadınız.</p>
                )}
              </div>
            </div>
          </div>

          {/* Sağ Kolon: Aday Değerlendirme Tablosu */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-200">En Son Tamamlanan Testler</h2>
                <Link href="/admin/results" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">Tümünü Gör</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-zinc-800">
                  <thead className="bg-slate-50 dark:bg-zinc-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase">Aday</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase">Test</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase">Skor</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase">Karar</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                    {results.map(r => (
                      <tr key={r.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-slate-900 dark:text-white">{r.user?.name}</div>
                          <div className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-zinc-300">
                          {r.jobPosting?.title || r.roleName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-extrabold text-slate-900 dark:text-white">%{r.score}</span>
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getScoreDetails(r.score).badgeClass}`}>
                              {getScoreDetails(r.score).label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${r.hireDecision.includes('NO') || r.hireDecision.includes('RET') ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {r.hireDecision}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link href={`/admin/${r.id}`} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                            Rapor
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {results.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">Henüz tamamlanan test yok.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
