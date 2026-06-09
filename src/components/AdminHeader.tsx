'use client';

import { useState } from 'react';
import { signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AdminHeader({ userName, companyName }: { userName: string, companyName?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Merkezi Veri Bankası', path: '/super-admin/data-bank', color: 'bg-cyan-600 hover:bg-cyan-700' },
    { label: 'Test Yönetimi', path: '/admin/tests', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { label: 'Test Sonuçları', path: '/admin/results', color: 'bg-teal-600 hover:bg-teal-700' },
    { label: 'Barkod & Sınav Dağıtım', path: '/admin/tests/qr-agent', color: 'bg-fuchsia-600 hover:bg-fuchsia-700' },
    { label: 'Sayfalar & Görevler', path: '/admin/agents', color: 'bg-violet-600 hover:bg-violet-700' },
    { label: 'Doküman ve Bilgi Bankası', path: '/admin/documents', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { label: 'İlan Yönetimi', path: '/admin/jobs', color: 'bg-indigo-600 hover:bg-indigo-700' },
    { label: '🔀 Karşılaştırma (10 Sayfa)', path: '/admin/comparison', color: 'bg-purple-600 hover:bg-purple-700' },
  ];

  return (
    <header className="bg-slate-950 text-white shadow-xl border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo and Greeting */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/admin')}>
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center font-black text-slate-950 shadow-md shadow-emerald-500/10">
              {companyName ? companyName.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <h1 className="text-md sm:text-lg font-black tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                {companyName || 'SkillBridge'} Yönetici Paneli
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Hoş geldiniz, <span className="text-emerald-400">{userName}</span></p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden xl:flex items-center space-x-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-white text-slate-900 shadow-md scale-105 font-bold' 
                      : `${item.color} text-white shadow-sm hover:scale-[1.02] active:scale-95`
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            
            <button 
              onClick={() => router.push('/ready-tests')}
              className="text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-1.5 rounded-lg shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform cursor-pointer"
            >
              📋 Hazır Testler
            </button>
            
            <div className="h-6 w-px bg-slate-800 mx-2" />
            
            <ThemeToggle />
            
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-xs font-bold bg-rose-600 hover:bg-rose-700 px-3 py-1.5 rounded-lg transition-all hover:shadow-lg hover:shadow-rose-500/10 cursor-pointer"
            >
              Çıkış
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex xl:hidden items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none transition-colors border border-slate-800"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="xl:hidden bg-slate-950 border-t border-slate-850 px-4 pt-2 pb-4 space-y-2 shadow-2xl backdrop-blur-md bg-opacity-95">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    setIsOpen(false);
                    router.push(item.path);
                  }}
                  className={`w-full text-left text-xs font-bold px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-white text-slate-950 shadow-md font-extrabold' 
                      : `${item.color} text-white`
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          
          <div className="border-t border-slate-900 pt-3 flex flex-col gap-2">
            <button 
              onClick={() => {
                setIsOpen(false);
                router.push('/ready-tests');
              }}
              className="w-full text-center text-xs font-extrabold bg-gradient-to-r from-amber-500 to-orange-600 py-3 rounded-xl shadow-lg shadow-orange-500/10 text-white"
            >
              📋 Hazır Testler
            </button>
            
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full text-center text-xs font-bold bg-rose-600 hover:bg-rose-700 py-3 rounded-xl transition-all"
            >
              Çıkış (Sign Out)
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
