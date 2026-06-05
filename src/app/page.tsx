import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-800 dark:text-zinc-200 transition-colors font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-emerald-400 rounded-lg flex items-center justify-center text-white font-bold text-xl">S</div>
              <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-400">
                SkillBridge AI
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/login" className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Şirket Girişi
              </Link>
              <Link href="/demo" className="text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                Demoyu Dene
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Decorative blobs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] opacity-30 dark:opacity-10 pointer-events-none blur-3xl">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-500 to-zinc-400 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-2000 ml-32"></div>
          </div>

          <div className="text-center relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold text-sm mb-8 border border-orange-200 dark:border-orange-800/50 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-orange-500 mr-2 animate-pulse"></span>
              Kritik Güncelleme: Otonom Yapay Zeka Aktif!
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 text-black dark:text-white">
              Adayları <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400">9 Farklı Yapay Zeka</span> İle Test Edin.
            </h1>
            
            <p className="mt-4 text-xl sm:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto font-light leading-relaxed">
              Özgeçmişleri okuyan, dinamik vaka senaryoları üreten ve mülakatı otonom olarak değerlendiren yapay zeka ajanlarıyla işe alım sürecinizi %80 hızlandırın.
            </p>
            
            <div className="mt-10 flex justify-center gap-4 flex-col sm:flex-row">
              <Link href="/login" className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-lg shadow-xl shadow-emerald-200 dark:shadow-emerald-900/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
                İnsan Kaynakları Paneli 💼
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center text-2xl mb-6 font-bold">1</div>
              <h3 className="text-xl font-bold mb-3 text-black dark:text-white">CV ile Dinamik Test</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">Adayın CV'si yüklendiğinde, Ajan 10 özgeçmişi tarar ve mülakatı adayın yetkinliklerine özel olarak anında zorlaştırır.</p>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl flex items-center justify-center text-2xl mb-6 font-bold">2</div>
              <h3 className="text-xl font-bold mb-3 text-black dark:text-white">Gerçekçi Kriz Senaryoları</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">Sıkıcı ezber sorularını unutun! Sistem adayın departmanına özel, şirketi kurtaracağı kritik vaka hikayeleri üretir.</p>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-bl-full -z-10"></div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center text-2xl mb-6 font-bold">!</div>
              <h3 className="text-xl font-bold mb-3 text-orange-600 dark:text-orange-400">Anında Kritik Karar (HIRE)</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">Sınav biter bitmez detaylı radar grafikleri çıkarılır ve adayı "İşe Al" (HIRE) kararı anında raporlanıp Excel'e dökülür.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-800 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center text-white font-bold text-xs">S</div>
            <span className="font-bold text-black dark:text-white">SkillBridge AI</span>
          </div>
          <p className="text-zinc-500 dark:text-zinc-500 text-sm">
            © 2026 SkillBridge. Geleceğin İşe Alım Teknolojileri.
          </p>
        </div>
      </footer>
    </div>
  );
}
