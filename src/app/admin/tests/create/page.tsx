'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function CreateTestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docId = searchParams.get('docId');

  const [document, setDocument] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form States
  const [sector, setSector] = useState('');
  const [subject, setSubject] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [difficulty, setDifficulty] = useState('Orta');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [timeLimit, setTimeLimit] = useState<number>(15);
  const [competencies, setCompetencies] = useState<string[]>([]);
  
  // Master Data Bank states
  const [dbIndustries, setDbIndustries] = useState<any[]>([]);
  const [dbDepartments, setDbDepartments] = useState<any[]>([]);
  const [dbRoles, setDbRoles] = useState<any[]>([]);
  const [dbCompetencies, setDbCompetencies] = useState<any[]>([]);

  useEffect(() => {
    // Fetch Data Bank
    const fetchMasterData = async () => {
      try {
        const res = await fetch('/api/data-bank');
        if (res.ok) {
          const dbData = await res.json();
          setDbIndustries(dbData.industries || []);
          setDbDepartments(dbData.departments || []);
          setDbRoles(dbData.jobRoles || []);
          setDbCompetencies(dbData.competencies || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchMasterData();

    if (!docId) {
      alert('Doküman ID bulunamadı.');
      router.push('/admin/documents');
      return;
    }

    const fetchDoc = async () => {
      try {
        const res = await fetch('/api/documents');
        const docs = await res.json();
        const found = docs.find((d: any) => d.id === docId);
        if (found) {
          setDocument(found);
          setSubject(found.subject || found.name);
          if (found.sector) setSector(found.sector);
          if (found.department) setDepartment(found.department);
          if (found.roleName) setPosition(found.roleName);
        } else {
          alert('Doküman bulunamadı.');
          router.push('/admin/documents');
        }
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    };

    fetchDoc();
  }, [docId, router]);

  const toggleCompetency = (comp: string) => {
    if (competencies.includes(comp)) {
      setCompetencies(competencies.filter(c => c !== comp));
    } else {
      setCompetencies([...competencies, comp]);
    }
  };

  // Pipeline Animation State
  type PipelineState = 'IDLE' | 'AJAN_1' | 'AJAN_2' | 'AJAN_3' | 'TEST_READY';
  const [pipelineState, setPipelineState] = useState<PipelineState>('IDLE');

  const handleGenerate = async () => {
    if (!sector || !department || !position || competencies.length === 0) {
      alert('Lütfen sektör, departman, pozisyon ve en az 1 yetkinlik seçin.');
      return;
    }

    setIsGenerating(true);
    setPipelineState('AJAN_1');
    try {
      // Fake delay for Ajan 1
      await new Promise(r => setTimeout(r, 1500));
      setPipelineState('AJAN_2');
      // Fake delay for Ajan 2
      await new Promise(r => setTimeout(r, 1500));
      setPipelineState('AJAN_3');
      
      // Start real request
      const res = await fetch('/api/tests/generate-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          documentId: docId,
          sector,
          subject,
          department,
          roleName: position,
          competencies,
          difficulty,
          questionCount,
          timeLimit
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPipelineState('TEST_READY');
        await new Promise(r => setTimeout(r, 1000));
        // Yönetici için önizleme/çözme ekranına yönlendir
        router.push(`/tests/${data.testId}/solve`);
      } else {
        const err = await res.json();
        alert('Simülasyon üretilirken hata oluştu: ' + err.error);
        setPipelineState('IDLE');
        setIsGenerating(false);
      }
    } catch (e) {
      alert('Sunucuya ulaşılamadı.');
      setPipelineState('IDLE');
      setIsGenerating(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center text-slate-500">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/documents" className="text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium flex items-center gap-2">
            ← Dokümanlara Dön
          </Link>
        </div>
        
        {/* Kare 1: Ana Kutu */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border-4 border-emerald-50 dark:border-zinc-800 p-8 text-center relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
          
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner transform rotate-3">
            🤖
          </div>
          
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Yapay Zeka Özelleştirilmiş Test Ortamı</h1>
          <p className="text-slate-500 mb-6 max-w-xl mx-auto">
            Seçtiğiniz <strong>{document?.name}</strong> belgesi referans alınarak, belirttiğiniz parametrelere uygun <strong>Kusursuz Round (Contest)</strong> simülasyonu oluşturulacaktır.
          </p>

          {/* Template Engine - Canlı Önizleme */}
          <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 text-left mb-8 shadow-inner transition-all duration-300">
            <h3 className="text-emerald-800 dark:text-emerald-400 font-bold mb-3 flex items-center gap-2">
              <span className="animate-pulse">⚡</span> Dinamik Şablon Taslağı (Canlı)
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
              "Bu değerlendirme, 
              <span className="font-bold text-emerald-600 dark:text-emerald-400 mx-1 border-b-2 border-emerald-300">{sector || '[Sektör]'}</span> 
              sektöründe yer alan 
              <span className="font-bold text-emerald-600 dark:text-emerald-400 mx-1 border-b-2 border-emerald-300">{department || '[Birim]'}</span> 
              departmanındaki 
              <span className="font-bold text-emerald-600 dark:text-emerald-400 mx-1 border-b-2 border-emerald-300">{position || '[Pozisyon]'}</span> 
              rolünün yetkinliklerini ölçmek için hazırlanmıştır. Adayın/Çalışanın 
              <span className="font-bold text-emerald-600 dark:text-emerald-400 mx-1 border-b-2 border-emerald-300">
                {competencies.length > 0 ? competencies.join(', ') : '[Yetkinlikler]'}
              </span> 
              konularındaki performansı, sistemdeki {difficulty} zorluk derecesi kriterlerine göre puanlanacaktır."
            </p>
          </div>

          {/* Kare 2: İç Kutu */}
          <div className="bg-slate-50 dark:bg-zinc-950 p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 text-left mb-10 shadow-sm relative">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-sm">⚙️</span>
              Kariyer ve Yetkinlik Odaklı Test Oluşturucu
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Sektör Seçimi</label>
                <select 
                  value={sector} onChange={(e) => setSector(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                >
                  <option value="">Sektör Seçiniz...</option>
                  {dbIndustries.map(ind => <option key={ind.id} value={ind.name}>{ind.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Konu Başlığı</label>
                <input 
                  type="text" 
                  value={subject} onChange={(e) => setSubject(e.target.value)}
                  placeholder="Örn: Yapay Zeka Entegrasyonu"
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Şirket / Arama Birimleri (Departman)</label>
                <select 
                  value={department} onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                >
                  <option value="">Departman Seçiniz...</option>
                  {dbDepartments.map(dep => <option key={dep.id} value={dep.name}>{dep.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Pozisyon</label>
                <select 
                  value={position} onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                >
                  <option value="">Rol Seçiniz...</option>
                  {dbRoles.map(rol => <option key={rol.id} value={rol.name}>{rol.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Zorluk Derecesi (AI Parametresi)</label>
                <select 
                  value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow text-indigo-700 font-bold"
                >
                  <option value="Kolay">🟢 Kolay (Junior)</option>
                  <option value="Orta">🟡 Orta (Mid-Level)</option>
                  <option value="Zor">🟠 Zor (Senior)</option>
                  <option value="Ekspert">🔴 Ekspert (Director/Lead)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Soru Sayısı</label>
                <input 
                  type="number" 
                  min="1" max="50"
                  value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Süre Sınırı (Dakika)</label>
                <input 
                  type="number" 
                  min="1" max="180"
                  value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-4">Yetkinlikler (Ölçülecek Beceriler)</label>
              
              {/* Grup Mantığı: dbCompetencies'i kategoriye göre ayır */}
              <div className="space-y-6">
                {['BİLİŞSEL', 'TEMEL', 'TEKNİK', 'YÖNETSEL'].map(categoryName => {
                  const categoryComps = dbCompetencies.filter(c => c.category === categoryName);
                  if (categoryComps.length === 0) return null;
                  
                  return (
                    <div key={categoryName} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl p-4 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-3 border-b border-slate-100 dark:border-zinc-800 pb-2">
                        {categoryName} YETKİNLİKLER
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {categoryComps.map(comp => (
                          <div key={comp.id} className="relative group">
                            <button
                              onClick={() => toggleCompetency(comp.name)}
                              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                                competencies.includes(comp.name) 
                                  ? 'bg-emerald-100 border-emerald-400 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-500 dark:text-emerald-200 shadow-sm' 
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700'
                              }`}
                            >
                              {competencies.includes(comp.name) && <span className="mr-2">✓</span>}
                              {comp.name}
                            </button>
                            
                            {/* Cause Effect Tooltip */}
                            {comp.causeEffect && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-slate-800 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl pointer-events-none">
                                <div className="font-bold text-emerald-400 mb-1">Sebep-Sonuç (İş Etkisi)</div>
                                {comp.causeEffect}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {dbCompetencies.length === 0 && <span className="text-sm text-slate-400">Veri bankasında yetkinlik bulunamadı. Lütfen Süper Admin panelinden ekleyin.</span>}
              </div>
              
              <p className="text-xs text-slate-500 mt-4">* Yapay zeka senaryosu ve soruları, seçtiğiniz bu yetkinliklerin sebep-sonuç bağlamlarına göre kurgulanacaktır.</p>
            </div>
          </div>

          <div>
            {/* Cascade Pipeline Animation */}
            {pipelineState !== 'IDLE' && (
              <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm mb-6 animate-fade-in text-left">
                <h2 className="text-xl font-semibold mb-6 text-purple-700 dark:text-purple-400">Cascade Pipeline: Grup 1 (Üreticiler)</h2>
                <div className="space-y-4">
                  {['AJAN_1', 'AJAN_2', 'AJAN_3'].map((state, idx) => {
                    const isActive = pipelineState === state;
                    const isPast = ['TEST_READY'].includes(pipelineState) || (state === 'AJAN_1' && pipelineState !== 'AJAN_1') || (state === 'AJAN_2' && pipelineState === 'AJAN_3');
                    return (
                      <div key={state} className={`flex items-center p-4 rounded-xl border transition-all duration-500 ${isActive ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700/50 scale-[1.02] shadow-md' : isPast ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-700/50' : 'bg-slate-50 border-slate-200 dark:bg-zinc-900/50 dark:border-zinc-800 opacity-50'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 font-bold ${isActive ? 'bg-blue-500 text-white animate-pulse' : isPast ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-500 dark:bg-zinc-700 dark:text-zinc-500'}`}>{idx + 1}</div>
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-zinc-200">Ajan {idx + 1} {['(Araştırmacı)', '(Yazar - Editör)', '(Soru Tasarımcısı)'][idx]}</h3>
                          <p className={`text-sm ${isActive ? 'text-blue-600 dark:text-blue-400 font-medium' : isPast ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-zinc-500'}`}>{isActive ? 'Çalışıyor...' : isPast ? 'Tamamlandı.' : 'Bekliyor...'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button 
              onClick={handleGenerate}
              disabled={isGenerating || pipelineState !== 'IDLE'}
              className={`px-10 py-4 rounded-2xl font-bold text-white text-lg transition-all shadow-lg hover:shadow-xl w-full md:w-auto ${
                isGenerating 
                  ? 'bg-slate-400 dark:bg-zinc-700 cursor-not-allowed' 
                  : 'bg-slate-900 hover:bg-slate-800 hover:-translate-y-1 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200'
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Yapay Zeka Kusursuz Round Üretiyor...
                </span>
              ) : 'Simülasyonu Başlat 🚀'}
            </button>
            <p className="text-sm text-slate-400 mt-4">Simülasyon yaratıldığında, önizleme ve çözme ekranına (Aday görünümü) yönlendirileceksiniz.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
