import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from 'next/link';
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import ProgressChart from "@/components/ProgressChart"

const getScoreDetails = (score: number) => {
  if (score >= 80) return { label: 'İleri Seviye Yetkin', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30' };
  if (score >= 70) return { label: 'Yetkin', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30' };
  if (score >= 60) return { label: 'Beklenen', badgeClass: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-900/30' };
  if (score >= 50) return { label: 'Az Yetkin', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30' };
  return { label: 'Yetkin Olmayan', badgeClass: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400 border border-red-200 dark:border-red-900/30' };
};

export default async function IndividualDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "INDIVIDUAL") {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  // Veritabanı sorguları
  const activeAssignments = await prisma.testAssignment.findMany({
    where: { userId, status: "PENDING" },
    include: { jobPosting: true }
  });

  const completedResults = await prisma.testResult.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { jobPosting: true }
  });

  const favorites = await prisma.favoriteItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Üst Kısım: Başlık ve Hazineye Geçiş */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Aday Kontrol Paneli</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Hoş geldin, {(session.user as any).name || 'Kullanıcı'}</p>
          </div>
          <Link 
            href="/define" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:scale-105 transition-transform"
          >
            💎 Define (Hazine) Sayfama Git
          </Link>
        </div>
        
        {/* Ana Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sol Kolon: Konteyner 1 ve 2 */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Konteyner 1: Profil & Özet */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -mr-10 -mt-10 blur-2xl"></div>
              <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
                👤 Profil & Aktif Testler
              </h2>
              <div className="space-y-3">
                {activeAssignments.map(assignment => (
                  <div key={assignment.id} className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl">
                    <h3 className="font-bold text-emerald-900 dark:text-emerald-300 text-sm">{assignment.jobPosting.title}</h3>
                    <div className="mt-2">
                      <Link href={`/apply/${assignment.jobPostingId}`} className="text-xs font-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors inline-block">
                        Hemen Çöz
                      </Link>
                    </div>
                  </div>
                ))}
                {activeAssignments.length === 0 && (
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">Bekleyen testiniz bulunmuyor.</p>
                )}
              </div>
            </div>

            {/* Konteyner 2: Katıldığı Testler Listesi */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-4">
                📚 Katıldığı Testler
              </h2>
              <ul className="space-y-3">
                {completedResults.map(res => (
                  <li key={res.id} className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-800 pb-2 last:border-0">
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate pr-2">{res.jobPosting?.title || res.roleName}</span>
                    <span className="text-zinc-400 text-xs shrink-0">{new Date(res.createdAt).toLocaleDateString()}</span>
                  </li>
                ))}
                {completedResults.length === 0 && (
                  <li className="text-zinc-500 text-sm">Geçmiş test bulunamadı.</li>
                )}
              </ul>
            </div>
            
          </div>

          {/* Orta ve Sağ Kolon: Konteyner 3, 4 ve 5 */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Konteyner 4: Gelişim Grafiği */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-2">
                📈 Gelişim Grafiği
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Zamana göre test başarı skorlarınız</p>
              <ProgressChart data={completedResults} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Konteyner 3: Test Sonuçları & Detay */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
                <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-4">
                  🎯 Sonuçlar & Puanlar
                </h2>
                <div className="space-y-3">
                  {completedResults.map(res => (
                    <div key={res.id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-700">
                      <div>
                        <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{res.jobPosting?.title || res.roleName}</div>
                        <div className="text-xs text-zinc-500">{new Date(res.createdAt).toLocaleString('tr-TR')}</div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-lg">
                          %{res.score}
                        </span>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${getScoreDetails(res.score).badgeClass}`}>
                          {getScoreDetails(res.score).label}
                        </span>
                      </div>
                    </div>
                  ))}
                  {completedResults.length === 0 && (
                    <div className="text-zinc-500 text-sm">Sonuç bulunmuyor.</div>
                  )}
                </div>
              </div>

              {/* Konteyner 5: Kaydedilenler / Favoriler */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
                <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
                  ⭐ Favoriler & Kaydedilenler
                </h2>
                <div className="space-y-3">
                  {favorites.length > 0 ? favorites.map(fav => (
                    <div key={fav.id} className="p-3 border border-orange-100 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-900/10 rounded-xl">
                      <div className="text-xs font-bold text-orange-600 dark:text-orange-400 mb-1">{fav.itemType === 'QUESTION' ? 'Soru' : fav.itemType}</div>
                      <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{fav.title}</div>
                    </div>
                  )) : (
                    <div className="text-sm text-zinc-500 italic p-4 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                      Henüz hiçbir içeriği favorilere eklemediniz. İleride soru analizlerinde "Kaydet" tuşuna basarak burayı doldurabilirsiniz.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
