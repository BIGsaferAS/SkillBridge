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

  const isAdmin = role === 'ADMIN' || role === 'COMPANY_MANAGER' || role === 'SUPER_ADMIN';

  if (isAdmin) {
    redirect("/ready-tests");
  }

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
