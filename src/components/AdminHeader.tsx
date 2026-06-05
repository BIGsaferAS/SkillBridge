'use client';

import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/ThemeToggle"

export default function AdminHeader({ userName, companyName }: { userName: string, companyName?: string }) {
  const router = useRouter()

  return (
    <nav className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-900">
          {companyName ? companyName.charAt(0).toUpperCase() : 'C'}
        </div>
        <div>
          <h1 className="text-xl font-bold leading-tight">{companyName || 'SkillBridge'} Yönetici Paneli</h1>
          <p className="text-xs text-slate-400">Hoş geldiniz, {userName}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => router.push('/admin/users')}
          className="text-sm font-medium bg-cyan-600 hover:bg-cyan-700 px-3 py-1.5 rounded-md transition-colors"
        >
          Kullanıcı Yönetimi
        </button>
        <button 
          onClick={() => router.push('/admin/tests')}
          className="text-sm font-medium bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-md transition-colors"
        >
          Test Yönetimi
        </button>
        <button 
          onClick={() => router.push('/admin/results')}
          className="text-sm font-medium bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-md transition-colors"
        >
          Test Sonuçları
        </button>
        <button 
          onClick={() => router.push('/admin/documents')}
          className="text-sm font-medium bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-md transition-colors"
        >
          Doküman ve Bilgi Bankası
        </button>
        
        <button 
          onClick={() => router.push('/admin/jobs')}
          className="text-sm font-medium bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-md transition-colors"
        >
          İlan Yönetimi
        </button>
        <button 
          onClick={() => router.push('/admin/comparison')}
          className="text-sm font-medium bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-md transition-colors"
        >
          🔀 Karşılaştırma (10 Ajan)
        </button>
        <button 
          onClick={() => router.push('/define')}
          className="text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-1.5 rounded-md shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform"
        >
          💎 Define (Analiz)
        </button>
        <ThemeToggle />
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors"
        >
          Çıkış
        </button>
      </div>
    </nav>
  )
}
