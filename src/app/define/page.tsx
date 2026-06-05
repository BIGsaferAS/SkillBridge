import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function DefinePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  const companyId = (session.user as any).companyId;

  const isAdmin = role === 'ADMIN' || role === 'COMPANY_MANAGER';

  if (isAdmin) {
    // ADMIN GÖRÜNÜMÜ: Şirket Röntgeni
    const attempts = await prisma.testAttempt.findMany({
      where: {
        status: 'COMPLETED',
        test: companyId ? { companyId } : undefined
      },
      include: {
        test: true
      }
    });

    // Departman başarı oranları hesapla
    const deptStats: Record<string, { total: number, count: number }> = {};
    const compStats: Record<string, { total: number, count: number }> = {};

    attempts.forEach(a => {
      const dept = a.test?.department || 'Diğer';
      if (!deptStats[dept]) deptStats[dept] = { total: 0, count: 0 };
      deptStats[dept].total += (a.score || 0);
      deptStats[dept].count += 1;

      // Hata yapılan konuları bulmak için competencyMatrix'i analiz et
      if (a.competencyMatrix) {
        try {
          const matrix = JSON.parse(a.competencyMatrix);
          for (const [comp, score] of Object.entries(matrix)) {
            if (!compStats[comp]) compStats[comp] = { total: 0, count: 0 };
            compStats[comp].total += Number(score);
            compStats[comp].count += 1;
          }
        } catch (e) {}
      }
    });

    // En zayıf yetkinlikleri bul (ortalama puana göre sırala, en düşük 5)
    const worstCompetencies = Object.entries(compStats)
      .map(([name, data]) => ({ name, avg: data.total / data.count }))
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 5)
      .map(c => `${c.name} (%${Math.round(c.avg)})`);

    const displayTopics = worstCompetencies.length > 0 
      ? worstCompetencies 
      : ["Henüz test çözülmemiş veya yeterli veri yok."];

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">💎 Kurumsal Hazine (Define)</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Şirketinizin genel yetkinlik röntgeni ve derinlemesine veri analizi.</p>
            </div>
            <Link href="/admin" className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700">Panele Dön</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg border border-orange-100 dark:border-orange-900/30">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6">📊 Departman Bazlı Başarı</h2>
              <div className="space-y-4">
                {Object.keys(deptStats).map(dept => {
                  const avg = Math.round(deptStats[dept].total / deptStats[dept].count);
                  return (
                    <div key={dept}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{dept}</span>
                        <span className="font-bold text-emerald-600">% {avg}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-2.5">
                        <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${avg}%` }}></div>
                      </div>
                    </div>
                  );
                })}
                {Object.keys(deptStats).length === 0 && <p className="text-slate-500 italic">Yeterli veri yok.</p>}
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg border border-orange-100 dark:border-orange-900/30">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">⚠️ En Çok Hata Yapılan Konular</h2>
                <ul className="space-y-2">
                  {displayTopics.map((topic, i) => (
                    <li key={i} className="flex items-center gap-3 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg">
                      <span className="text-xl">📉</span> {topic}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-lg text-white">
                <h2 className="text-xl font-bold mb-2">📥 Detaylı Raporlar</h2>
                <p className="text-sm text-slate-300 mb-4">Şirket genelindeki tüm zayıf ve güçlü yönlerin yapay zeka analiz raporunu indirin.</p>
                <button className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-100 transition-colors">
                  Full Raporu İndir (PDF)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    // USER GÖRÜNÜMÜ: Kişisel Hazine
    const certificates = await prisma.certificate.findMany({ where: { userId } });
    const userAttempts = await prisma.testAttempt.findMany({
      where: { userId, status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      include: { test: true }
    });

    // Tavsiyeleri topla
    const advices: { testTitle: string, advice: string }[] = [];
    userAttempts.forEach(a => {
      if (a.aiCareerAdvice) {
        advices.push({ testTitle: a.test.title, advice: a.aiCareerAdvice });
      }
    });

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">💎 Kişisel Hazinem</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Sana özel çalışma önerileri, çözümler ve kazandığın yetkinlikler.</p>
            </div>
            <Link href="/dashboard" className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700">Panele Dön</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Çalışma Önerileri */}
            <div className="md:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg border border-teal-100 dark:border-teal-900/30">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                🧠 Yapay Zeka Çalışma Önerileri
              </h2>
              <div className="space-y-4">
                {advices.length > 0 ? advices.map((adv, i) => (
                  <div key={i} className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                    <h3 className="font-bold text-amber-800 dark:text-amber-400 mb-2">{adv.testTitle} Testi Geri Bildirimi</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{adv.advice}</p>
                    <Link href="/dashboard" className="text-xs font-bold bg-amber-600 text-white px-3 py-1.5 rounded-lg inline-block">Detaylı İncele</Link>
                  </div>
                )) : (
                  <div className="text-sm text-slate-500 italic p-4 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl text-center">
                    Henüz tamamlanmış bir testiniz veya yapay zeka öneriniz bulunmuyor.
                  </div>
                )}
              </div>
            </div>

            {/* Sertifikalar */}
            <div className="bg-gradient-to-br from-emerald-800 to-teal-900 p-6 rounded-2xl shadow-lg text-white">
              <h2 className="text-xl font-bold mb-6 text-emerald-100">🏆 Sertifikalarım</h2>
              <div className="space-y-4">
                {certificates.map(cert => (
                  <div key={cert.id} className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                    <div className="text-2xl mb-2">🥇</div>
                    <div className="font-bold text-sm">{cert.name}</div>
                    <div className="text-xs text-emerald-200 mt-1">{new Date(cert.issueDate).toLocaleDateString()}</div>
                  </div>
                ))}
                {certificates.length === 0 && (
                  <div className="text-sm text-emerald-200/70 italic text-center p-4 border border-dashed border-emerald-400/30 rounded-xl">
                    Henüz hiç sertifika kazanmadınız. Testleri başarıyla geçerek rozetleri toplayın!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
