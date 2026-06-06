'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminHeader from '@/components/AdminHeader';

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
      name: 'Ajan 1: Araştırmacı (Researcher)',
      role: 'Sektör ve Meslek Analisti',
      taskDescription: 'Seçilen meslek rolüne ait yetkinlik standartlarını, kriz anı zorluklarını ve itiraz çözümlerini araştırır.',
      fulfilledWork: 'Ham yetkinlik listesi, objection-handling (itiraz çözme) adımları ve kriz senaryo başlıklarını JSON formatında hazırlar.',
      status: 'ONLINE'
    },
    {
      id: 'AJAN_2',
      order: 2,
      name: 'Ajan 2: Hikaye Yazarı (Case Writer)',
      role: 'Senarist & Vaka Tasarımcısı',
      taskDescription: 'Ajan 1\'den gelen araştırma notlarını kullanarak, adayın teknik reflekslerini zorlayacak kriz dolu bir Case Study yazar.',
      fulfilledWork: 'MEDDPICC/SPIN satış metodolojilerine veya meslek krizlerine uygun ikilemler barındıran zengin vaka hikayesi üretir.',
      status: 'ONLINE'
    },
    {
      id: 'AJAN_3',
      order: 3,
      name: 'Ajan 3: Soru Tasarımcısı (Question Designer)',
      role: 'Soru Tasarımcısı',
      taskDescription: 'Yazılan vaka hikayesini analiz ederek adayın kriz çözme reflekslerini ve metodolojik tutarlılığını ölçecek 3 adet Çoktan Seçmeli soru üretir.',
      fulfilledWork: 'Açıklama, şıklar ve doğru cevapları içeren sınav sorularını JSON formatında tasarlar.',
      status: 'ONLINE'
    },
    {
      id: 'AJAN_4',
      order: 4,
      name: 'Ajan 4: Sınav Sorumlusu (Exam Proctor)',
      role: 'Süreç ve Akış Denetçisi',
      taskDescription: 'Adayın test ekranındaki sınav süresini, tamamlanma durumunu ve optik cevap girişlerini yönetir.',
      fulfilledWork: 'Test çözme süresini kaydeder ve sınav girişlerinin eksiksiz backend\'e iletilmesini denetler.',
      status: 'ONLINE'
    },
    {
      id: 'AJAN_5',
      order: 5,
      name: 'Ajan 5: Optik Değerlendirici (Evaluator)',
      role: 'Değerlendirici & Puanlama Motoru',
      taskDescription: 'Sınav bittiğinde adayın cevaplarını testin beklenen cevap şablonuyla karşılaştırarak ilk ham değerlendirme puanını hesaplar.',
      fulfilledWork: 'Adayın test başarı yüzdesini ve hatalı/doğru cevap listesini çıkarır.',
      status: 'ONLINE'
    },
    {
      id: 'AJAN_6',
      order: 6,
      name: 'Ajan 6: Hata Dedektörü (Flaw Detector)',
      role: 'Zafiyet Dedektörü',
      taskDescription: 'Adayın yaptığı hatalı cevapları ve metodoloji sapmalarını tarayarak adayın refleks zafiyetlerini belirler.',
      fulfilledWork: 'Hatalı cevaplara dayanarak adaya özel psikolojik ve analitik bir "Hata Haritası" hazırlar.',
      status: 'ONLINE'
    },
    {
      id: 'AJAN_7',
      order: 7,
      name: 'Ajan 7: Profil Uzmanı (Profiler)',
      role: 'Karakter ve Stres Çözümleyici',
      taskDescription: 'Adayın kriz anındaki karar alma hızını ve yanıt kalıplarını inceleyerek mizaç analizini gerçekleştirir.',
      fulfilledWork: 'Adayın kriz anındaki stres eşiğini, vizyonerlik durumunu ve analitik eğilimini raporlar.',
      status: 'ONLINE'
    },
    {
      id: 'AJAN_8',
      order: 8,
      name: 'Ajan 8: Kıyaslama Motoru (Benchmarker)',
      role: 'Karşılaştırma & Sıralama Motoru',
      taskDescription: 'Adayın sınav performansını, rolün "İdeal Aday Profili" ve pazar ortalaması ile kıyaslar.',
      fulfilledWork: 'Adayın ideal standartlarla uyuşma yüzdesini ve pazar dilimi konumlandırmasını hesaplar.',
      status: 'ONLINE'
    },
    {
      id: 'AJAN_9',
      order: 9,
      name: 'Ajan 9: Mentor (Decision Maker)',
      role: 'Nihai Karar Verici & Mentor',
      taskDescription: 'Diğer tüm ajanların (Ajan 4-8) ürettiği raporları birleştirerek nihai kararı üretir ve adayın zayıf olduğu alanlar için gelişim tavsiyeleri yazar.',
      fulfilledWork: 'HIRE / NO HIRE kararını, yetkinlik gelişim haritasını ve 30 günlük çalışma önerilerini tamamlar.',
      status: 'ONLINE'
    },
    {
      id: 'AJAN_10',
      order: 10,
      name: 'Ajan 10: CV Analisti (Resume Analyst)',
      role: 'CV Tarayıcı & Özelleştirici',
      taskDescription: 'Adayın sisteme yüklediği CV\'yi (Özgeçmiş) okuyarak iş ilanı gereksinimleri ile karşılaştırır ve zayıf/şüpheli yanları tespit eder.',
      fulfilledWork: 'Test oluşturulurken adayı özellikle terletecek ve CV zayıflıklarını ölçecek 3 spesifik odak noktası üretir.',
      status: 'ONLINE'
    },
    {
      id: 'AJAN_11',
      order: 11,
      name: 'Ajan 11: Barkod & Sınav Koordinatörü',
      role: 'Sınav Dağıtım & Erişim Temsilcisi',
      taskDescription: 'Testlerin QR kod veya barkod aracılığıyla tek adaya, gruba veya şirkete dağıtılmasını, erişim linklerini ve davet şablonlarını yönetir.',
      fulfilledWork: 'QR paylaşım modalı entegrasyonu, davet e-postası taslakları ve çözülen QR testlerinin denetim günlüklerini (audit logs) tutar.',
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
      `[SİSTEM] Ajan ${selectedAgent} için yeni görev başlatılıyor...`,
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
        setLogs(prev => [...prev, `[SİSTEM] Ajan ${selectedAgent} görevi başarıyla yerine getirdi.`, `[SİSTEM] Çıktı alındı.`]);
        setTerminalOutput(data.result);
      } else {
        setLogs(prev => [...prev, `[HATA] Ajan görevi tamamlayamadı.`]);
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

  if (status === 'loading') {
    return <div className="p-10 text-center text-slate-500">Yükleniyor...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black">
      <AdminHeader userName={(session?.user as any)?.name || 'Yönetici'} />

      <main className="max-w-7xl mx-auto p-6 mt-4 space-y-6">
        
        {/* Başlık */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              ⚙️ Ajan Görev Kontrol Merkezi
            </h1>
            <p className="text-slate-500 mt-1">Sistemdeki 11 yapay zeka ajanının sırasını, görevlerini inceleyin ve onlara doğrudan yeni görevler tanımlayın.</p>
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
                📋 İşlem Sırasına Göre Ajanlar (1-11)
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
                        <span className="font-bold text-slate-800 dark:text-zinc-200 block mb-1">🎯 Ajanın Görevi:</span>
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
                🤖 Ajanlara Yeni Görev Tanımla
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Ajan Seçin</label>
                  <select 
                    value={selectedAgent}
                    onChange={e => setSelectedAgent(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm bg-slate-50 dark:bg-zinc-950 dark:border-zinc-800 focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-slate-800 dark:text-white"
                  >
                    {agentsList.map(a => (
                      <option key={a.id} value={a.id}>Ajan {a.order}: {a.id === 'AJAN_11' ? 'Dağıtım Koord.' : a.name.split(':')[1]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Görevin Tanımı / Prompt</label>
                  <textarea 
                    rows={4}
                    value={customPrompt}
                    onChange={e => setCustomPrompt(e.target.value)}
                    placeholder="Seçtiğiniz ajanın uzmanlık alanına göre yapmak istediği yeni görevi detaylıca yazın..."
                    className="w-full px-3 py-2 border rounded-xl text-sm bg-slate-50 dark:bg-zinc-950 dark:border-zinc-800 focus:ring-2 focus:ring-purple-500 outline-none font-mono text-xs text-slate-800 dark:text-white"
                  ></textarea>
                </div>

                <button
                  onClick={handleRunTask}
                  disabled={isRunning || !customPrompt.trim()}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-purple-500/20 transition-all disabled:opacity-50"
                >
                  {isRunning ? 'Ajan Görevi Çalıştırıyor...' : 'Görevi Ajanına Gönder ➔'}
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
                    Ajan 1: Yazılım Mühendisi Yetkinlikleri
                  </button>
                  <button 
                    onClick={() => handleLoadSuggestion('AJAN_2', 'B2B Yazılım Satış Temsilcisi için PoC testi patlaması temalı 2 paragraflık vaka hikayesi yaz.')}
                    className="w-full text-left text-[11px] bg-slate-50 hover:bg-slate-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 p-2 rounded-lg truncate text-purple-700 dark:text-purple-300 font-medium"
                  >
                    Ajan 2: PoC Kriz Hikayesi Üret
                  </button>
                  <button 
                    onClick={() => handleLoadSuggestion('AJAN_6', 'Adayın IT entegrasyonu riskli bulup testi iptal etme kararına göre hata haritası çıkar.')}
                    className="w-full text-left text-[11px] bg-slate-50 hover:bg-slate-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 p-2 rounded-lg truncate text-purple-700 dark:text-purple-300 font-medium"
                  >
                    Ajan 6: IT İptal Karar Zafiyet Analizi
                  </button>
                  <button 
                    onClick={() => handleLoadSuggestion('AJAN_11', 'Genel yetkinlik testi için QR kodlu sınav davet e-postası hazırla.')}
                    className="w-full text-left text-[11px] bg-slate-50 hover:bg-slate-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 p-2 rounded-lg truncate text-purple-700 dark:text-purple-300 font-medium"
                  >
                    Ajan 11: QR Sınav Davet Şablonu
                  </button>
                </div>
              </div>
            </div>

            {/* Ajan Çıktı Terminali */}
            <div className="bg-zinc-950 text-slate-100 rounded-3xl border border-zinc-800 shadow-xl overflow-hidden flex flex-col h-[400px]">
              <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-3 flex items-center justify-between text-xs font-mono">
                <span className="text-purple-400 font-bold">AJAN TERMINALI v1.0</span>
                <span className="text-slate-500">Çıktı Konsolu</span>
              </div>
              <div className="flex-1 p-5 overflow-y-auto font-mono text-xs space-y-3 leading-relaxed">
                {logs.map((log, index) => (
                  <div key={index} className="text-zinc-500">{log}</div>
                ))}
                <div className="text-slate-200 whitespace-pre-wrap pt-2 border-t border-zinc-900">{terminalOutput}</div>
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
