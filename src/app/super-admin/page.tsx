import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import AddCompanyModal from "@/components/AddCompanyModal"

export default async function SuperAdminPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const companies = await prisma.company.findMany({
    include: { _count: { select: { users: true } } }
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Süper Admin Paneli</h1>
          <Link href="/super-admin/data-bank" className="mt-4 sm:mt-0 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-2">
            <span>🌐</span> Merkezi Veri Bankası Yönetimi
          </Link>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8 text-center mt-12">
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-4">Şirket Yönetimi ve Veri Havuzu Taşındı</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
            Şirket ekleme, silme ve düzenleme işlemleri ile sektörel yetkinliklerin tamamı artık "Merkezi Veri Bankası" (Master Data) altında toplanmıştır. Şirket kayıtlarını oradan yönetebilirsiniz.
          </p>
          <Link href="/super-admin/data-bank" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105 inline-flex items-center gap-2">
            <span>🌐</span> Merkezi Veri Bankasına Git
          </Link>
        </div>
      </div>
    </div>
  )
}
