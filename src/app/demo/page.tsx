"use client";

import { useState, useEffect } from 'react';
import SkillCreator from '@/components/SkillCreator';

export default function DemoPage() {
  const [isDemoActive, setIsDemoActive] = useState(false);

  useEffect(() => {
    if (!isDemoActive) return;

    // 1. KOPYALAMAYI VE SEÇMEYİ ENGELLE (Text Selection & Copy)
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      alert("Bu demoda kopyalama yapmak yasaktır!");
    };
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Sağ tık menüsünü engeller
    };
    
    document.addEventListener('copy', handleCopy);
    document.addEventListener('contextmenu', handleContextMenu);
    
    // CSS ile seçilmeyi tamamen kapatma
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    (document.body.style as any).msUserSelect = "none";
    (document.body.style as any).mozUserSelect = "none";

    // 2. KAYIT FORMLARINI VE INPUTLARI KİLİTLE (Müdahaleyi Engelle)
    const inputs = document.querySelectorAll('input, select, textarea, button:not(#startDemoBtn)');
    inputs.forEach((input: any) => {
      input.disabled = true; // Tüm form elemanlarını ve butonları dondurur
      input.style.pointerEvents = 'none'; // Tıklanmayı engeller
    });

    // Kayıt formlarının gönderilmesini kesin olarak engelle
    const handleFormSubmit = (e: Event) => {
      e.preventDefault();
      return false;
    };
    const forms = document.querySelectorAll('form');
    forms.forEach((form: any) => {
      form.addEventListener('submit', handleFormSubmit);
    });

    // 3. EKRAN GÖRÜNTÜSÜ VE KLAVYE KISAYOLLARINI ENGELLE (PrintScreen / Ctrl+S / Ctrl+P)
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText(''); // Panoyu temizle
        alert("Ekran görüntüsü almaya izniniz yok!");
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S (Kaydet), Ctrl+P (Yazdır), Ctrl+U (Kaynak Kodu), Ctrl+Shift+I (Geliştirici Araçları)
      if (e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'u' || e.key === 'Shift')) {
        e.preventDefault();
        alert("Bu işlem demo modunda engellenmiştir.");
      }
    };

    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('keydown', handleKeyDown);

    // 4. İNDİRMELERİ ENGELLE (Linklerin çalışmasını durdurma)
    const handleLinkClick = (e: Event) => {
      e.preventDefault(); // Sayfa dışına çıkmayı veya bir şey indirmeyi engeller
      alert("Demo modunda indirme veya yönlendirme yapılamaz. Sadece izleyebilirsiniz.");
    };
    const links = document.querySelectorAll('a');
    links.forEach((link: any) => {
      link.addEventListener('click', handleLinkClick);
    });

    // Clean up event listeners on unmount or when deactivated
    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
      (document.body.style as any).msUserSelect = "";
      (document.body.style as any).mozUserSelect = "";
      
      inputs.forEach((input: any) => {
        input.disabled = false;
        input.style.pointerEvents = '';
      });

      forms.forEach((form: any) => {
        form.removeEventListener('submit', handleFormSubmit);
      });

      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', handleKeyDown);

      links.forEach((link: any) => {
        link.removeEventListener('click', handleLinkClick);
      });
    };
  }, [isDemoActive]);

  const handleStartDemo = () => {
    setIsDemoActive(true);
    alert("SkillBridge Demosu Başladı! Sayfa şu anda sadece izleme modundadır. Müdahale, kopyalama veya indirme yapılamaz.");
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors pb-12">
      {/* Sticky Premium Shield Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 border-b border-indigo-900 text-white py-4 px-6 sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">🛡️</span>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-white">SkillBridge Demo Koruma Kalkanı</h2>
              <p className="text-[11px] sm:text-xs text-indigo-200">Sadece izleme modunu aktif ederek güvenlik katmanını test edin.</p>
            </div>
          </div>
          <button
            id="startDemoBtn"
            disabled={isDemoActive}
            onClick={handleStartDemo}
            className={`px-5 py-2.5 rounded-xl text-xs font-black shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer ${
              isDemoActive 
                ? 'bg-indigo-950 text-indigo-400 border border-indigo-900 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-blue-500/10'
            }`}
          >
            {isDemoActive ? "Demo Aktif (Salt Okunur) 🔒" : "Demoyu Başlat 🚀"}
          </button>
        </div>
      </div>

      <div className="pt-6">
        <SkillCreator />
      </div>
    </main>
  );
}
