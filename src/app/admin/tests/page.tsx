import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import AdminHeader from "@/components/AdminHeader"
import Link from "next/link"
import TestShareButton from "@/components/TestShareButton"

export default async function AdminTestsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "COMPANY_MANAGER" && (session.user as any).role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const companyId = (session.user as any).companyId;

  // Tüm testleri getir
  const tests = await prisma.test.findMany({
    where: companyId ? { companyId } : undefined,
    include: {
      document: true,
      _count: {
        select: { questions: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black">
      <AdminHeader 
        userName={(session.user as any).name} 
      />

      <main className="max-w-7xl mx-auto p-6 mt-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Oluşturulan Testler</h1>
            <p className="text-slate-500 mt-1">Sistem tarafından veya manuel olarak üretilmiş olan tüm değerlendirme testleri.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/documents" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-indigo-700">
              + Dokümanlardan Yeni Test Yarat
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-zinc-800">
            <thead className="bg-slate-50 dark:bg-zinc-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Test Adı / Pozisyon</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Zorluk</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Soru Sayısı</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Kaynak Doküman</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Tarih</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
              {tests.map(test => (
                <tr key={test.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-slate-800 dark:text-zinc-200">{test.title}</div>
                    <div className="text-xs text-slate-500">{test.sector} - {test.department} - {test.roleName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${test.difficulty === 'Zor' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                      {test.difficulty || 'Bilinmiyor'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-zinc-400 font-medium">
                    {test._count.questions} Soru
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {test.document ? test.document.name : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(test.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-3">
                    <TestShareButton 
                      testId={test.id} 
                      testTitle={test.title} 
                      companyId={companyId} 
                    />
                    <Link href={`/tests/${test.id}/solve`} className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-200">
                      Testi İncele
                    </Link>
                  </td>
                </tr>
              ))}
              {tests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">Henüz oluşturulmuş bir test bulunmuyor.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
