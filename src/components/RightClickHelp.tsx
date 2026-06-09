'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface HelpItem {
  title: string;
  desc: string;
}

const helpData: Record<string, HelpItem> = {
  'admin-dashboard': {
    title: "İK Yönetim Paneli",
    desc: "Yöneticilerin giriş yaptığında karşılaştığı ana kontrol merkezidir. Aktif ilanlar, toplam başvuru sayısı, tamamlanan test sayısı ve şirketin genel başarı ortalaması gibi kritik metrikleri görüntüler. Ayrıca departman bazlı başarı grafiklerini ve son tamamlanan testlerin özet listesini içerir."
  },
  'ready-tests': {
    title: "Hazır Testler ve Hızlı Sınav Atama",
    desc: "İK yetkililerinin adaylara en hızlı şekilde test ataması yapabilmesi için tasarlanmış modüldür. Sektör, departman ve pozisyon bazlı hazır sınav şablonlarını filtreleyebilir, detaylarını görüntüleyebilir, QR Kod veya Paylaşım Linki (URL) üreterek tekil adaylara, ekiplere ya da şirket geneline hızlıca atayabilirsiniz."
  },
  'documents': {
    title: "Dokümanlardan Sınav/Simülasyon Üretme",
    desc: "Şirketinizin kendi yönergelerine, eğitim kitapçıklarına veya teknik dokümanlarına (PDF, DOCX, TXT, HTML) bağlı kalarak yapay zeka (Gemini) yardımıyla tamamen şirketinize özel sektörel vaka analizleri ve çoktan seçmeli durum değerlendirme sınavları hazırlamak için kullanılır."
  },
  'test-solve': {
    title: "Aday Sınav Arayüzü (Simülasyon Çözüm)",
    desc: "Adayın veya çalışanın paylaşılan barkod (QR) veya link üzerinden eriştiği sınav ekranıdır. Şirket testlerinde adaydan sadece 'Ad Soyad' alınır ve şirket listesinde yer alıyorsa teste girmesine izin verilir. Aday üstte vaka senaryosunu okur, altta ise geri sayım sayacı eşliğinde soruları yanıtlar."
  },
  'test-result': {
    title: "Aday Simülasyon Raporu & Sonuç Ekranı",
    desc: "Test bittiğinde adayın ve İK yetkilisinin gördüğü otonom analiz raporudur. Genel başarı skoru, süre, 4 ana kategorideki yetkinlik dağılım grafiği, Ajan 17 (Editör) otonom gelişim yol haritası ve soru bazlı adayın yanıtı ile doğru yanıtın açıklamalı karşılaştırmasını gösterir."
  },
  'admin-candidate-detail': {
    title: "Yönetici Aday Detay Analizi",
    desc: "İK yetkilisinin adayın sınav performansını tüm kırılımlarıyla incelediği detaylı rapordur. Ajan 17'nin ürettiği Psikolojik Profil, Sektörel Kıyaslama (Benchmark), Hata Dedektörü (Refleks Hataları), Uyum/İşe Alım Önerisi ve sayfanın altındaki soru-soru adayın verdiği cevapları, doğru cevapları ve Ajan 17 geri bildirimlerini içerir."
  },
  'comparison': {
    title: "Aday Karşılaştırma Oturumu (Mukayese)",
    desc: "Aynı pozisyona başvuran birden fazla adayın CV'lerini (özgeçmiş) ve çözdükleri test sonuçlarını birleştirerek yapay zeka ajanlarıyla otonom sıralama yapmak için kullanılır. Sistem kriterlerinize göre en uygun kazanan adayı (Winner) gerekçeleriyle birlikte seçer."
  },
  'users': {
    title: "Kullanıcı ve Aday Yönetimi",
    desc: "Şirketiniz bünyesindeki kullanıcıları, İK yöneticilerini ve adayları yönettiğiniz alandır. QR Kod okutarak teste girecek adayların ad-soyad bilgilerini buraya girerek doğrulanmalarını sağlayabilirsiniz. Eklenen kullanıcılar otomatik olarak şirketinizle ilişkilendirilir."
  },
  'login': {
    title: "SkillBridge Giriş Ekranı",
    desc: "Süper Yönetici, Şirket Yöneticisi ve Bireysel Adayların sisteme güvenli şekilde giriş yaptığı ekrandır. Giriş sonrasında yetki rolünüze göre otomatik olarak ilgili kontrol paneline yönlendirilirsiniz."
  },
  'candidate-dashboard': {
    title: "Aday Kontrol Paneli",
    desc: "Bireysel adayların kendilerine atanan aktif sınavları listelediği, sınav durumlarını takip ettiği ve tamamladıkları sınavların sonuçlarına ulaştıkları kişisel başlangıç ekranıdır."
  },
  'define': {
    title: "Kişisel Hazine (Yetkinlik Gelişim Raporu)",
    desc: "Adayların şimdiye kadar çözdüğü tüm sınavlardan elde ettikleri yetkinlik kazanımlarını ve zaman içerisindeki gelişim grafiklerini takip ettikleri kişisel gelişim kütüphanesidir."
  },
  'radar-chart': {
    title: "Yetkinlik Radar Analiz Grafiği",
    desc: "Adayın sınavda ölçülen yetkinlik düzeylerini, rol için hedeflenen baraj seviyesi (%60) ile karşılaştırmalı olarak gösteren dinamik radar analiz grafiğidir. Adayın güçlü ve gelişim odaklı alanlarını görselleştirir."
  },
  'flaw-detector': {
    title: "Ajan 17 Hata Dedektörü ve Davranış Zafiyetleri",
    desc: "Adayın vaka senaryolarındaki çelişkili veya riskli şıklara verdiği yanıtları inceleyen, sınav sırasındaki refleks hatalarını ve davranışsal zafiyetlerini saptayan yapay zeka hata dedektörü analizidir."
  },
  'competency-matrix': {
    title: "Seviye Odaklı Yetkinlik Listesi",
    desc: "Platformdaki 4 ana kategoride (Bilişsel, Teknik, Temel, Yönetsel) yer alan 39 yetkinliğin, Seviye 1'den (Gelişmeli) Seviye 5'e (Örnek) kadar olan baremlere göre adayın mevcut durumunu ve o seviyedeki davranış göstergelerini listeler."
  },
  'question-answers': {
    title: "Soru Bazlı Aday Cevap Analizi",
    desc: "Adayın testteki her soruya verdiği cevaplar ile doğru cevapları, soruların açıklamalarını ve yapay zeka editörünün (Ajan 17) adayın yanıtına özel olarak ürettiği nokta atışı geri bildirimlerini listeler."
  },
  'general': {
    title: "SkillBridge AI Yardım Asistanı",
    desc: "SkillBridge AI, işe alım ve yetenek ölçümü süreçlerinizde yapay zeka ajanları (Ajan 1-17) yardımıyla karar vermenizi kolaylaştıran otonom değerlendirme platformudur. Detaylı bilgi almak için üst menülerden kılavuza erişebilirsiniz."
  }
};

export default function RightClickHelp() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeHelp, setActiveHelp] = useState<HelpItem & { key: string } | null>(null);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Allow default right click inside inputs, select and textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'SELECT'
      ) {
        return;
      }

      e.preventDefault();

      // Resolve clicked element help key
      let el: HTMLElement | null = target;
      let resolvedKey = '';
      while (el) {
        const helpKey = el.getAttribute('data-help');
        if (helpKey && helpData[helpKey]) {
          resolvedKey = helpKey;
          break;
        }
        el = el.parentElement;
      }

      // If no DOM helpKey was found, fallback to pathname-based keys
      if (!resolvedKey) {
        if (pathname === '/admin') {
          resolvedKey = 'admin-dashboard';
        } else if (pathname.startsWith('/admin/comparison')) {
          resolvedKey = 'comparison';
        } else if (pathname.startsWith('/admin/documents')) {
          resolvedKey = 'documents';
        } else if (pathname === '/ready-tests') {
          resolvedKey = 'ready-tests';
        } else if (pathname === '/admin/users') {
          resolvedKey = 'users';
        } else if (pathname.match(/^\/admin\/[^\/]+$/)) {
          resolvedKey = 'admin-candidate-detail';
        } else if (pathname.match(/^\/tests\/[^\/]+\/solve$/)) {
          resolvedKey = 'test-solve';
        } else if (pathname.match(/^\/tests\/[^\/]+\/result$/)) {
          resolvedKey = 'test-result';
        } else if (pathname === '/login') {
          resolvedKey = 'login';
        } else if (pathname === '/dashboard') {
          resolvedKey = 'candidate-dashboard';
        } else if (pathname === '/define') {
          resolvedKey = 'define';
        } else {
          resolvedKey = 'general';
        }
      }

      const item = helpData[resolvedKey];
      if (item) {
        setActiveHelp({ ...item, key: resolvedKey });
        setIsOpen(true);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [pathname]);

  if (!isOpen || !activeHelp) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl max-w-md w-full animate-scale-up relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500 rounded-t-3xl"></div>
        
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold cursor-pointer"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-4 mt-2">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
              {activeHelp.title}
            </h3>
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
              SkillBridge Otonom Yardım
            </span>
          </div>
        </div>

        <p className="text-slate-600 dark:text-zinc-300 text-sm leading-relaxed mb-6 whitespace-pre-wrap font-medium">
          {activeHelp.desc}
        </p>

        <div className="flex gap-2.5">
          <button 
            onClick={() => setIsOpen(false)}
            className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer text-center"
          >
            Anladım, Kapat
          </button>
          <a 
            href="/user_manual.html" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer text-center shadow-md shadow-indigo-500/20"
          >
            Kılavuzu Aç 📖
          </a>
        </div>
      </div>
    </div>
  );
}
