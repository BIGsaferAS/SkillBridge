'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AgentInfo {
  id: string;
  order: number;
  name: string;
  role: string;
  taskDescription: string;
  fulfilledWork: string;
  status: 'ONLINE' | 'IDLE';
}

export default function AgentTaskDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [selectedAgent, setSelectedAgent] = useState('AJAN_1');
  const [customPrompt, setCustomPrompt] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('Terminal çıktıları burada görüntülenecektir...');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const agentsList: AgentInfo[] = [
    {
      id: 'AJAN_1',
      order: 1,
      name: 'Sayfa 1: Araştırmacı (Researcher)',
      role: 'Sektör ve Meslek Analisti',
      taskDescription: 'Seçilen meslek rolüne ait yetkinlik standartlarını, kriz anı zorluklarını ve itiraz çözümlerini araştırır.',
      fulfilledWork: 'Ham yetkinlik listesi, objection-handling (itiraz çözme) adımları ve kriz senaryo başlıklarını JSON formatında hazırlar.',
      status: 'ONLINE'
    },
    {
      id: 'AJAN_2',
      order: 2,
      name: 'Sayfa 2: Hikaye Yazarı (Case Writer)',
      role: 'Senarist & Vaka Tasarımcısı',
      taskDescription: 'Sayfa 1\'den gelen araştırma notlarını kullanarak, adayın teknik reflekslerini zorlayacak kriz dolu bir Case Study yazar.',
      fulfilledWork: 'MEDDPICC/SPIN satış metodolojilerine veya meslek krizlerine uygun ikilemler barındıran zengin vaka hikayesi üretir.',
      status: 'ONLINE'
    },
    {
      id: 'AJAN_3',
      order: 3,
      name: 'Sayfa 3: Soru Tasarımcısı (Question Designer)',
      role: 'Soru Tasarımcısı',
      taskDescription: 'Yazılan vaka hikayesini analiz ederek adayın kriz çözme reflekslerini ve metodolojik tutarlılığını ölçecek 3 adet Çoktan Seçmeli soru üretir.',
      fulfilledWork: 'Açıklama, şıklar ve doğru cevapları içeren sınav sorularını JSON formatında tasarlar.',
      status: 'ONLINE'
    },
    {
      id: 'AJAN_4',
      order: 4,
      name: 'Sayfa 4: Sınav Sorumlusu (Exam Proctor)',
      role: 'Süreç ve Akış Denetçisi',
      taskDescription: 'Adayın test ekranındaki sınav süresini, tamamlanma durumunu ve optik cevap girişlerini yönetir.',
      fulfilledWork: 'Test çözme süresini kaydeder ve sınav girişlerinin eksiksiz backend\'e iletilmesini denetler.',
      status: 'ONLINE'
    },
    {
      id: 'AJAN_5',
      order: 5,
      name: 'Sayfa 5: Optik Değerlendirici (Evaluator)',
      role: 'Değerlendirici & Puanlama Motoru',
      taskDescription: 'Sınav bittiğinde adayın cevaplarını testin beklenen cevap şablonuyla karşılaştırarak ilk ham değerlendirme puanını hesaplar.',
      fulfilledWork: 'Adayın test başarı yüzdesini ve hatalı/doğru cevap listesini çıkarır.',
      status: 'ONLINE'
    },
    {
      id: 'AJAN_6',
      order: 6,
      name: 'Sayfa 6: Hata Dedektörü (Flaw Detector)',
      role: 'Zafiyet Dedektörü',
      taskDescription: 'Adayın yaptığı hatalı cevapları ve metodoloji sapmalarını tarayarak adayın refleks zafiyetlerini belirler.',
      fulfilledWork: 'Hatalı cevaplara dayanarak adaya özel psikolojik ve analitik bir "Hata Haritası" hazırlar.',
      status: 'ONLINE'
    },
    {
      id: 'AJAN_7',
      order: 7,
      name: 'Sayfa 7: Profil Uzmanı (Profiler)',
      role: 'Karakter ve Stres Çözümleyici',
      taskDescription: 'Adayın kriz anındaki karar alma hızını ve yanıt kalıplarını inceleyerek mizaç analizini gerçekleştirir.',
      fulfilledWork: 'Adayın kriz anındaki stres eşiğini, vizyonerlik durumunu ve analitik eğilimini raporlar.',
      status: 'ONLINE'
    },
    {
      id: 'AJAN_8',
      order: 8,
      name: 'Sayfa 8: Kıyaslama Motoru (Benchmarker)',
      role: 'Karşılaştırma & Sıralama Motoru',
      taskDescription: 'Adayın sınav performansını, rolün "İdeal Aday Profili" ve pazar ortalaması ile kıyaslar.',
      fulfilledWork: 'Adayın ideal standartlarla uyuşma yüzdesini ve pazar dilimi konumlandırmasını hesaplar.',
      status: 'ONLINE'
    },
    {
      id: 'AJAN_9',
      order: 9,
      name: 'Sayfa 9: Mentor (Decision Maker)',
      role: 'Nihai Karar Verici & Mentor',
      taskDescription: 'Diğer tüm sayfaların (Sayfa 4-8) ürettiği raporları birleştirerek nihai kararı üretir ve adayın zayıf olduğu alanlar için gelişim tavsiyeleri yazar.',
      fulfilledWork: 'HIRE / NO HIRE kararını, yetkinlik gelişim haritasını ve 30 günlük çalışma önerilerini tamamlar.',
      status: 'ONLINE'
    },
    {
      id: 'AJAN_10',
      order: 10,
      name: 'Sayfa 10: CV Analisti (Resume Analyst)',
      role: 'CV Tarayıcı & Özelleştirici',
      taskDescription: 'Adayın sisteme yüklediği CV\'yi (Özgeçmiş) okuyarak iş ilanı gereksinimleri ile karşılaştırır ve zayıf/şüpheli yanları tespit eder.',
      fulfilledWork: 'Test oluşturulurken adayı özellikle terletecek ve CV zayıflıklarını ölçecek 3 spesifik odak noktası üretir.',
      status: 'ONLINE'
    },
    {
      id: 'AJAN_11',
      order: 11,
      name: 'Sayfa 11: Barkod & Sınav Koordinatörü',
      role: 'Sınav Dağıtım & Erişim Temsilcisi',
      taskDescription: 'Testlerin QR kod veya barkod aracılığıyla tek adaya, gruba veya şirkete dağıtılmasını, erişim linklerini ve davet şablonlarını yönetir.',
      fulfilledWork: 'QR paylaşım modalı entegrasyonu, davet e-postası taslakları ve çözülen QR testlerinin denetim günlüklerini (audit logs) tutar.',
      status: 'ONLINE'
    },
    {
      id: 'AJAN_12',
      order: 12,
      name: 'Sayfa 12: Frontend Geliştirici (Frontend Developer)',
      role: 'Arayüz ve Kullanıcı Deneyimi Geliştirici',
      taskDescription: 'Tasarımcıdan gelen arayüzleri koda döker, mobil uyumluluk ve API entegrasyonu (veri tüketimi) sağlar.',
      fulfilledWork: 'Responsive HTML/CSS/JS bileşenleri, API entegrasyon kodları ve dinamik form doğrulama mantığı.',
      status: 'ONLINE'
    },
    {
      id: 'AJAN_13',
      order: 13,
      name: 'Sayfa 13: Backend Geliştirici (Backend Developer)',
      role: 'API ve İş Mantığı Mimarisi',
      taskDescription: 'Frontend\'in veri alıp gönderebilmesi için güvenli REST/GraphQL API\'ler yazar, yetkilendirme (Auth) ve hata yönetimi kurgular.',
      fulfilledWork: 'Güvenli API uç noktaları, kullanıcı yetkilendirme servisleri ve hata takip günlükleri (logs).',
      status: 'ONLINE'
    },
    {
      id: 'AJAN_14',
      order: 14,
      name: 'Sayfa 14: Veri Tabanı Uzmanı (Database Specialist)',
      role: 'Veri Modelleme ve Performans Mühendisi',
      taskDescription: 'Tablo ilişkilerini, şemaları (schema) ve sorgu optimizasyonlarını (indexing) tasarlar; veri güvenliğini ve yedeklemeleri yönetir.',
      fulfilledWork: 'DB şemaları (migrations), optimize edilmiş sorgu indeksleri ve otomatik yedekleme planları.',
      status: 'ONLINE'
    },
    {
      id: 'AJAN_15',
      order: 15,
      name: 'Sayfa 15: UI/UX Tasarımcı (UI/UX Designer)',
      role: 'Kullanıcı Deneyimi ve Arayüz Denetçisi',
      taskDescription: 'Arayüz tasarımlarındaki görsel eksikleri giderir, kullanıcı akışlarını (user flows) basitleştirir ve ortak bileşen kütüphanesi (Design System) hazırlar.',
      fulfilledWork: 'Ekran tasarımları, kullanıcı akış şemaları ve renk/font standartlarını içeren ortak Tasarım Kütüphanesi.',
      status: 'ONLINE'
    },
    {
      id: 'AJAN_16',
      order: 16,
      name: 'Sayfa 16: Soru Tasarımcısı (HR Specialist)',
      role: 'Yetkinlik Soru Tasarımcısı',
      taskDescription: 'Sadece veritabanındaki yetkinlik matrisini ve seviye tanımlarını referans alarak geleneksel davranışsal mülakat soruları ve çoktan seçmeli durum değerlendirmeleri hazırlar.',
      fulfilledWork: 'Ölçülmek istenen yetkinliklere göre davranışsal mülakat sorularını veya çoktan seçmeli yetkinlik sorularını şıklarıyla birlikte hazırlar.',
      status: 'ONLINE'
    },
    {
      id: 'AJAN_17',
      order: 17,
      name: 'Sayfa 17: Editör ve Kalite Denetleyici (Editor Agent)',
      role: 'Editör & Kalite Denetleyicisi',
      taskDescription: 'Ajan 1, 2, 3 ve 16\'nın ürettiği vaka sorularını, matris çıktılarını ve radar grafik modellerini Recep Yigit\'in master prompt kurallarına göre denetler, hataları düzeltir ve format tutarlılığını sağlar.',
      fulfilledWork: '4 kategori x 10 yetkinlik (toplam 40 yetkinlik) yapısına uygun, 5\'li baremde (A-E) puanlanabilen ve radar grafiğe altlık oluşturan JSON veri matrisini onaylar.',
      status: 'ONLINE'
    }
  ];

  useEffect(() => {
    if (status === 'authenticated') {
      const role = (session?.user as any)?.role;
      if (role !== 'ADMIN' && role !== 'COMPANY_MANAGER' && role !== 'SUPER_ADMIN') {
        router.push('/login');
      }
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session]);

  const handleRunTask = async () => {
    if (!customPrompt.trim() || isRunning) return;
    setIsRunning(true);
    setTerminalOutput('');
    setLogs([
      `[SİSTEM] Sayfa ${selectedAgent} için yeni görev başlatılıyor...`,
      `[SİSTEM] Gemini AI sunucusuna bağlantı kuruluyor...`,
      `[SİSTEM] ${selectedAgent} görev talimatı derleniyor.`
    ]);

    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent,
          input: {
            isCustomTask: true,
            customPrompt: customPrompt
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        setLogs(prev => [...prev, `[SİSTEM] Sayfa ${selectedAgent} görevi başarıyla yerine getirdi.`, `[SİSTEM] Çıktı alındı.`]);
        const outputVal = typeof data.result === 'object' ? JSON.stringify(data.result, null, 2) : data.result;
        setTerminalOutput(outputVal);
      } else {
        setLogs(prev => [...prev, `[HATA] Sayfa görevi tamamlayamadı.`]);
        setTerminalOutput(`Hata oluştu: ${data.error || 'Bilinmeyen hata'}`);
      }
    } catch (e) {
      setLogs(prev => [...prev, `[HATA] Sunucuyla bağlantı kurulamadı.`]);
      setTerminalOutput('Bağlantı hatası oluştu. Lütfen .env dosyasındaki GEMINI_API_KEY değerini kontrol edin.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleLoadSuggestion = (agentId: string, promptText: string) => {
    setSelectedAgent(agentId);
    setCustomPrompt(promptText);
  };

  const handleApproveOutput = () => {
    navigator.clipboard.writeText(terminalOutput);
    setLogs(prev => [...prev, `[SİSTEM] ✔️ ÇIKTI ONAYLANDI. Panoya kopyalandı.`]);
    alert("Sayfa çıktısı onaylandı ve panoya kopyalandı!");
  };

  const handleCancelOutput = () => {
    if (!confirm("Çıktıyı temizlemek ve işlemi iptal etmek istediğinize emin misiniz?")) return;
    setTerminalOutput('Terminal çıktıları burada görüntülenecektir...');
    setLogs([]);
  };

  if (status === 'loading') {
    return <div className="p-10 text-center text-slate-500">Yükleniyor...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black">
      <main className="max-w-7xl mx-auto p-6 mt-4 space-y-6">
        
        {/* Başlık */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              ⚙️ Sayfa AI Görev Kontrol Merkezi
            </h1>
            <p className="text-slate-500 mt-1">Sistemdeki 17 yapay zeka sayfasının sırasını, görevlerini inceleyin ve onlara doğrudan yeni görevler tanımlayın.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin" className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 shadow-sm transition-colors">
              Pano Anasayfası
            </Link>
          </div>
        </div>

        {/* Ana Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sol Kolon: Ajan Sıralı Listesi */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                📋 İşlem Sırasına Göre Sayfalar (1-17)
              </h2>

              <div className="space-y-4 max-h-[750px] overflow-y-auto pr-2">
                {agentsList.map(agent => (
                  <div key={agent.id} className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-100 dark:border-zinc-800 hover:border-purple-200 dark:hover:border-purple-900/50 transition-all">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-xs px-2.5 py-1 rounded-full font-bold">
                            Sıra: {agent.order}
                          </span>
                          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{agent.name}</h3>
                        </div>
                        <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-1">{agent.role}</div>
                      </div>
                      <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold shrink-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {agent.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-200/60 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-zinc-200 block mb-1">🎯 Sayfanın Görevi:</span>
                        {agent.taskDescription}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-zinc-200 block mb-1">📦 Teslim Ettiği Çıktı:</span>
                        {agent.fulfilledWork}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sağ Kolon: Görev Atama Arayüzü ve Çıktı Terminali */}
          <div className="space-y-6">
            
            {/* Görev Atama Kartı */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                🤖 Sayfalara Yeni Görev Tanımla
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sayfa Seçin</label>
                  <select 
                    value={selectedAgent}
                    onChange={e => setSelectedAgent(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm bg-slate-50 dark:bg-zinc-950 dark:border-zinc-800 focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-slate-800 dark:text-white"
                  >
                    {agentsList.map(a => (
                      <option key={a.id} value={a.id}>Sayfa {a.order}: {a.id === 'AJAN_11' ? 'Dağıtım Koord.' : a.name.split(':')[1]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Görevin Tanımı / Prompt</label>
                  <textarea 
                    rows={4}
                    value={customPrompt}
                    onChange={e => setCustomPrompt(e.target.value)}
                    placeholder="Seçtiğiniz sayfanın uzmanlık alanına göre yapmak istediği yeni görevi detaylıca yazın..."
                    className="w-full px-3 py-2 border rounded-xl text-sm bg-slate-50 dark:bg-zinc-950 dark:border-zinc-800 focus:ring-2 focus:ring-purple-500 outline-none font-mono text-xs text-slate-800 dark:text-white"
                  ></textarea>
                </div>

                <button
                  onClick={handleRunTask}
                  disabled={isRunning || !customPrompt.trim()}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-purple-500/20 transition-all disabled:opacity-50"
                >
                  {isRunning ? 'Sayfa Görevi Çalıştırıyor...' : 'Görevi Sayfaya Gönder ➔'}
                </button>
              </div>

              {/* Hızlı Test Önerileri */}
              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hızlı Deneme Şablonları</span>
                <div className="space-y-1.5">
                  <button 
                    onClick={() => handleLoadSuggestion('AJAN_1', 'Yazılım Mühendisi pozisyonu için mülakat kriz argümanları ve yetkinlikleri çıkar.')}
                    className="w-full text-left text-[11px] bg-slate-50 hover:bg-slate-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 p-2 rounded-lg truncate text-purple-700 dark:text-purple-300 font-medium"
                  >
                    Sayfa 1: Yazılım Mühendisi Yetkinlikleri
                  </button>
                  <button 
                    onClick={() => handleLoadSuggestion('AJAN_2', 'B2B Yazılım Satış Temsilcisi için PoC testi patlaması temalı 2 paragraflık vaka hikayesi yaz.')}
                    className="w-full text-left text-[11px] bg-slate-50 hover:bg-slate-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 p-2 rounded-lg truncate text-purple-700 dark:text-purple-300 font-medium"
                  >
                    Sayfa 2: PoC Kriz Hikayesi Üret
                  </button>
                  <button 
                    onClick={() => handleLoadSuggestion('AJAN_6', 'Adayın IT entegrasyonu riskli bulup testi iptal etme kararına göre hata haritası çıkar.')}
                    className="w-full text-left text-[11px] bg-slate-50 hover:bg-slate-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 p-2 rounded-lg truncate text-purple-700 dark:text-purple-300 font-medium"
                  >
                    Sayfa 6: IT İptal Karar Zafiyet Analizi
                  </button>
                  <button 
                    onClick={() => handleLoadSuggestion('AJAN_11', 'Genel yetkinlik testi için QR kodlu sınav davet e-postası hazırla.')}
                    className="w-full text-left text-[11px] bg-slate-50 hover:bg-slate-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 p-2 rounded-lg truncate text-purple-700 dark:text-purple-300 font-medium"
                  >
                    Sayfa 11: QR Sınav Davet Şablonu
                  </button>
                  <button 
                    onClick={() => handleLoadSuggestion('AJAN_12', 'Figma tasarımına göre profil yönetim sayfası responsive TailwindCSS kodlarını yaz.')}
                    className="w-full text-left text-[11px] bg-slate-50 hover:bg-slate-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 p-2 rounded-lg truncate text-purple-700 dark:text-purple-300 font-medium"
                  >
                    Sayfa 12: Profil Sayfası Ön Yüz Kodları
                  </button>
                  <button 
                    onClick={() => handleLoadSuggestion('AJAN_13', 'Kullanıcı giriş ve JWT yetkilendirme REST API uç noktasını yaz.')}
                    className="w-full text-left text-[11px] bg-slate-50 hover:bg-slate-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 p-2 rounded-lg truncate text-purple-700 dark:text-purple-300 font-medium"
                  >
                    Sayfa 13: JWT Giriş API'si
                  </button>
                  <button 
                    onClick={() => handleLoadSuggestion('AJAN_14', 'Bire-çok ilişkili Kullanıcı ve Sertifika tabloları için PostgreSQL şeması tasarla.')}
                    className="w-full text-left text-[11px] bg-slate-50 hover:bg-slate-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 p-2 rounded-lg truncate text-purple-700 dark:text-purple-300 font-medium"
                  >
                    Sayfa 14: Veritabanı Tablo Tasarımı
                  </button>
                  <button 
                    onClick={() => handleLoadSuggestion('AJAN_15', 'İşe alım adımları sayfasındaki UX akışını sadeleştirecek öneriler sun.')}
                    className="w-full text-left text-[11px] bg-slate-50 hover:bg-slate-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 p-2 rounded-lg truncate text-purple-700 dark:text-purple-300 font-medium"
                  >
                    Sayfa 15: UX Sadeleştirme Önerileri
                  </button>
                  <button 
                    onClick={() => handleLoadSuggestion('AJAN_17', 'Aşağıdaki vaka sorularını 40 yetkinlik ve A-E baremi kurallarına göre denetleyip düzelt:\n[{"question": "...", "options": [...]}]')}
                    className="w-full text-left text-[11px] bg-slate-50 hover:bg-slate-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 p-2 rounded-lg truncate text-purple-700 dark:text-purple-300 font-medium"
                  >
                    Sayfa 17: Vaka Sorularını Denetle
                  </button>
                </div>
              </div>
            </div>

            {/* Ajan Çıktı Terminali */}
            <div className="bg-zinc-950 text-slate-100 rounded-3xl border border-zinc-800 shadow-xl overflow-hidden flex flex-col h-[400px]">
              <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-3 flex items-center justify-between text-xs font-mono">
                <span className="text-purple-400 font-bold">SAYFA AI TERMINALI v1.0</span>
                <span className="text-slate-500">Çıktı Konsolu</span>
              </div>
              <div className="flex-1 p-5 overflow-y-auto font-mono text-xs space-y-3 leading-relaxed">
                {logs.map((log, index) => (
                  <div key={index} className="text-zinc-500">{log}</div>
                ))}
                <div className="text-slate-200 whitespace-pre-wrap pt-2 border-t border-zinc-900">{terminalOutput}</div>
              </div>

              {/* Onay ve Vazgeç Butonları */}
              {terminalOutput && terminalOutput !== 'Terminal çıktıları burada görüntülenecektir...' && !isRunning && (
                <div className="bg-zinc-900/90 border-t border-zinc-850 p-3 flex gap-3 justify-end items-center animate-fade-in">
                  <button
                    onClick={handleApproveOutput}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md shadow-emerald-950/40"
                  >
                    ✓ Onayla
                  </button>
                  <button
                    onClick={handleCancelOutput}
                    className="bg-zinc-805 hover:bg-zinc-700 text-slate-350 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-zinc-750"
                  >
                    ✕ Vazgeç
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
