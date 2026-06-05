"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import Link from "next/link";

const getScoreDetails = (score: number) => {
  if (score >= 80) return { label: 'İleri Seviye Yetkin', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30' };
  if (score >= 70) return { label: 'Yetkin', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30' };
  if (score >= 60) return { label: 'Beklenen', badgeClass: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-900/30' };
  if (score >= 50) return { label: 'Az Yetkin', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30' };
  return { label: 'Yetkin Olmayan', badgeClass: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400 border border-red-200 dark:border-red-900/30' };
};

export default function AdminComparisonDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();

  const [compSession, setCompSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [runningPipeline, setRunningPipeline] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [runLogs, setRunLogs] = useState<string[]>([]);
  
  // Evaluation Result States
  const [evalResult, setEvalResult] = useState<any>(null);
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<any>(null);
  
  // QR Code States
  const [selectedCandidateQR, setSelectedCandidateQR] = useState<any>(null);
  const [showGeneralQR, setShowGeneralQR] = useState(false);

  const pipelineAgentDetails = [
    { name: "Ajan K1", role: "Gereksinim Çözümleyici", action: "İş tanımı/terfi kriterleri analiz edilip 5 temel yetkinlik metrik parametresi belirleniyor..." },
    { name: "Ajan K2", role: "CV & Profil Yapılandırıcı", action: "Adayların gönderdiği CV ve iş bitirme dokümanları taranıp yapılandırılmış JSON verisine dönüştürülüyor..." },
    { name: "Ajan K3", role: "Teknik Uyum Değerlendirici", action: "Adayların teknik yetkinlikleri, ilan gereksinimlerindeki araç ve diller ile eşleştiriliyor..." },
    { name: "Ajan K4", role: "Tecrübe & Kıdem Analisti", action: "Adayların mesleki kıdemi ve geçmiş rollerde kalma süreleri inceleniyor..." },
    { name: "Ajan K5", role: "İş Bitirme & Proje Skorer", action: "Adayların tamamladıkları projelerin kapsamı, karmaşıklığı ve etki metrikleri puanlanıyor..." },
    { name: "Ajan K6", role: "Metot & Araç Analisti", action: "Adayların aşina olduğu metodolojiler (Agile, Scrum, DevOps, git) ve çalışma pratikleri denetleniyor..." },
    { name: "Ajan K7", role: "Davranışsal Profiler", action: "Adayların kriz anı cevapları analiz edilerek sorun çözme ve iletişim üslupları profilleniyor..." },
    { name: "Ajan K8", role: "Risk ve Tutarsızlık Dedektörü", action: "Profildeki boşluklar, çelişkili ifadeler veya abartılı iddialar taranıp risk faktörleri saptanıyor..." },
    { name: "Ajan K9", role: "Puanlama & Karar Motoru", action: "Tüm ajanların bağımsız puanları ağırlıklandırılarak nihai uyumluluk skorları hesaplanıyor..." },
    { name: "Ajan K10", role: "Şampiyon Belirleyici", action: "Adaylar yan yana kıyaslanıyor, liderlik tablosu oluşturuluyor ve şampiyon aday seçiliyor..." }
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && params?.id) {
      fetchSessionDetails();
    }
  }, [status, session, params, router]);

  const fetchSessionDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/comparison/${params.id}`);
      const data = await res.json();
      if (data.session) {
        setCompSession(data.session);
        
        // Eğer zaten değerlendirilmişse, kaydedilen sonuçları yükle
        const evaluatedCandidates = data.session.candidates.filter((c: any) => c.status === "EVALUATED");
        if (evaluatedCandidates.length > 0) {
          // K10 narrative ve kriterleri herhangi bir evaluated adayın agentEvaluations bilgisinden çekebiliriz
          try {
            const firstEval = JSON.parse(evaluatedCandidates[0].agentEvaluations);
            const winner = data.session.candidates.find((c: any) => c.isWinner);
            
            // UI için evalResult modelini yeniden yapılandır
            const formattedEvaluations: Record<string, any> = {};
            data.session.candidates.forEach((c: any) => {
              if (c.agentEvaluations) {
                const parsed = JSON.parse(c.agentEvaluations);
                formattedEvaluations[c.id] = {
                  ...parsed.evaluation,
                  overallScore: c.score,
                  name: c.name,
                  email: c.email
                };
              }
            });

            setEvalResult({
              criteriaList: firstEval.criteriaList,
              comparisonNarrative: firstEval.comparisonNarrative,
              winnerId: winner?.id || "",
              evaluations: formattedEvaluations
            });
          } catch (e) {
            console.error("Error formatting saved evaluations", e);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (candId: string) => {
    const link = `${window.location.origin}/comparison/apply/${candId}`;
    navigator.clipboard.writeText(link);
    alert("Katılım linki kopyalandı!");
  };

  const run10AgentPipeline = async () => {
    setRunningPipeline(true);
    setPipelineStep(0);
    setRunLogs([]);

    // Ajanların çalışma simülasyonu loglarını göster
    for (let i = 0; i < pipelineAgentDetails.length; i++) {
      setPipelineStep(i);
      const agent = pipelineAgentDetails[i];
      
      setRunLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 🚀 ${agent.name} (${agent.role}) devreye girdi.`,
        `[${new Date().toLocaleTimeString()}] ⚙️ İşlem: ${agent.action}`
      ]);
      
      // Her ajan için 1200ms bekle (Canlı akış hissi)
      await new Promise(resolve => setTimeout(resolve, 1200));

      setRunLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ✔️ ${agent.name} analizini tamamladı ve sonuçları bir sonraki ajana aktardı.`,
        `--------------------------------------------------`
      ]);
    }

    setRunLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🧠 Tüm ajan verileri toplandı, nihai karşılaştırma raporu oluşturuluyor...`]);

    try {
      const res = await fetch(`/api/admin/comparison/${params.id}/run`, {
        method: "POST"
      });

      if (res.ok) {
        const data = await res.json();
        setEvalResult({
          criteriaList: data.criteriaList,
          comparisonNarrative: data.comparisonNarrative,
          winnerId: data.winnerId,
          evaluations: data.evaluations
        });
        setRunLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🎉 10 Ajanlı Analiz başarıyla tamamlandı! Rapor yüklendi.`]);
        fetchSessionDetails();
      } else {
        const err = await res.json();
        alert("Pipeline çalıştırılırken hata oluştu: " + err.error);
      }
    } catch {
      alert("Sunucu hatası.");
    } finally {
      setRunningPipeline(false);
    }
  };

  if (loading && !compSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const isRecruitment = compSession.type === "RECRUITMENT";
  const submittedCandidates = compSession.candidates.filter((c: any) => c.status === "SUBMITTED" || c.status === "EVALUATED");
  const canRun = submittedCandidates.length > 0;

  // Sıralı aday listesi (skora göre)
  const sortedCandidates = [...compSession.candidates]
    .filter(c => c.status === "EVALUATED")
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  const winnerCandidate = compSession.candidates.find((c: any) => c.id === evalResult?.winnerId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 pb-12">
      <AdminHeader 
        userName={(session?.user as any)?.name || "Yönetici"} 
        companyName="Global" 
      />

      <main className="max-w-7xl mx-auto p-4 md:p-6 mt-4">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link href="/admin/comparison" className="text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium flex items-center gap-2 text-sm">
            ← Karşılaştırmalara Dön
          </Link>
        </div>

        {/* Title Card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${isRecruitment ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
              {isRecruitment ? "İşe Alım / CV Karşılaştırma" : "Terfi / Performans Karşılaştırma"}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">{compSession.title}</h1>
            <p className="text-sm text-slate-500 mt-1">Oturum ID: {compSession.id}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={run10AgentPipeline}
              disabled={!canRun || runningPipeline}
              className={`font-extrabold text-sm px-6 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                canRun 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20 hover:scale-105 active:scale-95' 
                  : 'bg-slate-200 text-slate-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed'
              }`}
            >
              🚀 {runningPipeline ? "Ajanlar Çalışıyor..." : "10 Ajanı Başlat ve Kıyasla"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Criteria and Candidate Links */}
          <div className="lg:col-span-1 space-y-6">
            {/* Criteria */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">📋 Beklenti Kriterleri</h2>
              <div className="text-xs text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl border border-slate-100 dark:border-zinc-800/80 whitespace-pre-line max-h-60 overflow-y-auto leading-relaxed">
                {compSession.requirements}
              </div>
            </div>

            {/* General Session QR Code */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm text-center">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">📢 Genel Katılım QR Kodu</h2>
              <p className="text-[11px] text-slate-500 mb-4">Adayların QR kod taratıp kendi bilgileriyle oturuma kaydolması için gösterin.</p>
              <button
                onClick={() => setShowGeneralQR(true)}
                className="w-full bg-purple-50 hover:bg-purple-100 dark:bg-zinc-950 text-purple-700 dark:text-purple-400 font-bold py-2.5 rounded-xl border border-purple-100 dark:border-zinc-850 transition-all text-xs cursor-pointer shadow-sm"
              >
                📱 QR Kod ve Katılım Linki Göster
              </button>
            </div>

            {/* Candidates management */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">👥 Adaylar ve Katılım Durumları</h2>
              <div className="space-y-3">
                {compSession.candidates.map((cand: any) => (
                  <div key={cand.id} className="p-3 bg-slate-50 dark:bg-zinc-950/40 rounded-xl border border-slate-100 dark:border-zinc-800/80 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">{cand.name}</h4>
                        <span className="text-[10px] text-slate-400">{cand.email}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cand.status === 'EVALUATED' ? 'bg-emerald-100 text-emerald-800' :
                        cand.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {cand.status === 'EVALUATED' ? 'Değerlendirildi' : cand.status === 'SUBMITTED' ? 'Yanıtladı' : 'Bekliyor'}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-1 border-t border-slate-100 dark:border-zinc-800/80 pt-2 text-center items-center">
                      <button
                        onClick={() => handleCopyLink(cand.id)}
                        className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer flex-1 text-left"
                      >
                        🔗 Link Kopyala
                      </button>
                      <button
                        onClick={() => setSelectedCandidateQR(cand)}
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex-1"
                      >
                        📱 QR Göster
                      </button>
                      <a
                        href={`/comparison/apply/${cand.id}`}
                        target="_blank"
                        className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 font-medium flex-1 text-right"
                      >
                        Formu Gör →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: RUN PIPELINE ANIMATION OR RESULTS */}
          <div className="lg:col-span-2 space-y-6">
            {/* RUNNING PIPELINE VIEW */}
            {runningPipeline && (
              <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl p-6 border border-zinc-800 font-mono text-xs md:text-sm h-[600px] flex flex-col">
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-zinc-400 text-xs ml-3 font-semibold">10-Agent Autonomous Pipeline Execution Terminal</span>
                </div>

                {/* Pipeline visual steps */}
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-6 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  {pipelineAgentDetails.map((agent, idx) => (
                    <div 
                      key={idx} 
                      className={`p-2 rounded-lg flex flex-col items-center justify-center text-center transition-all ${
                        pipelineStep === idx 
                          ? 'bg-purple-900/60 border border-purple-500 text-purple-200 animate-pulse' 
                          : pipelineStep > idx 
                            ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-400' 
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-600'
                      }`}
                    >
                      <span className="text-[10px] font-bold block">K{idx+1}</span>
                      <span className="text-[8px] opacity-75 hidden md:block">{agent.name.split(" ")[1]}</span>
                    </div>
                  ))}
                </div>

                {/* Terminal logs stream */}
                <div className="flex-1 overflow-y-auto space-y-2 bg-black/60 p-4 rounded-xl border border-zinc-800/80 max-h-[360px] scrollbar-thin">
                  {runLogs.map((log, idx) => (
                    <div 
                      key={idx} 
                      className={`${
                        log.includes("🚀") ? "text-purple-400 font-semibold" : 
                        log.includes("✔️") ? "text-emerald-400" :
                        log.includes("🎉") ? "text-amber-400 font-bold" : "text-zinc-300"
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RESULTS VIEW */}
            {!runningPipeline && evalResult && (
              <div className="space-y-6 animate-fade-in">
                
                {/* 1. Winner Presentation Card */}
                {winnerCandidate && (
                  <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-purple-500/20 relative overflow-hidden">
                    {/* Decorative backdrop */}
                    <div className="absolute right-0 top-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full border border-yellow-500/30">
                          🏆 AI SEÇİMİ: EN UYGUN ADAY
                        </span>
                        <h2 className="text-3xl font-extrabold mt-3">{winnerCandidate.name}</h2>
                        <p className="text-purple-200 text-sm mt-1">{winnerCandidate.email}</p>
                        
                        <div className="flex items-center gap-6 mt-4">
                          <div>
                            <span className="text-purple-300 text-xs block">Eşleşme Skoru</span>
                            <div className="flex items-center gap-2">
                              <span className="text-3xl font-black text-yellow-300">%{winnerCandidate.score}</span>
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${getScoreDetails(winnerCandidate.score).badgeClass}`}>
                                {getScoreDetails(winnerCandidate.score).label}
                              </span>
                            </div>
                          </div>
                          <div className="w-px h-10 bg-purple-700"></div>
                          <div>
                            <span className="text-purple-300 text-xs block">Sıralama</span>
                            <span className="text-xl font-extrabold text-white">#1 / {compSession.candidates.length}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl w-full md:max-w-xs">
                        <span className="text-xs font-bold text-yellow-300 block mb-1">Ajan K10 Yönetici Özeti</span>
                        <p className="text-[11px] text-purple-100 leading-relaxed max-h-32 overflow-y-auto">
                          {evalResult.comparisonNarrative.slice(0, 220)}...
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Executive Rapor Detayı */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">🗣️ Ajan K10 Karşılaştırma Raporu</h3>
                  <p className="text-sm text-slate-600 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                    {evalResult.comparisonNarrative}
                  </p>
                </div>

                {/* 3. Comparison Matrix Grid */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 dark:border-zinc-800">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">📊 Karşılaştırma ve Uyum Matrisi</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 dark:divide-zinc-800">
                      <thead className="bg-slate-50 dark:bg-zinc-800/40">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Aday / Sıra</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Skor</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Güçlü Yanlar (K9)</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Risk Analizi (K8)</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Ayrıntılar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                        {sortedCandidates.map((cand, idx) => {
                          const evalData = evalResult.evaluations[cand.id] || {};
                          return (
                            <tr key={cand.id} className={`hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors ${cand.isWinner ? 'bg-purple-50/30 dark:bg-purple-950/10' : ''}`}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                    idx === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400' : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {idx + 1}
                                  </span>
                                  <div>
                                    <span className="font-bold text-slate-900 dark:text-white block text-sm">{cand.name}</span>
                                    <span className="text-[10px] text-slate-400">{cand.email}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center whitespace-nowrap">
                                <div className="flex flex-col items-center gap-1">
                                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">%{cand.score}</span>
                                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${getScoreDetails(cand.score).badgeClass}`}>
                                    {getScoreDetails(cand.score).label}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 max-w-xs">
                                <div className="flex flex-wrap gap-1">
                                  {evalData.pros?.slice(0, 2).map((pro: string, index: number) => (
                                    <span key={index} className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 px-2 py-0.5 rounded text-[10px]">
                                      {pro}
                                    </span>
                                  )) || <span className="text-slate-400">-</span>}
                                </div>
                              </td>
                              <td className="px-6 py-4 max-w-xs text-slate-500 truncate">
                                {evalData.riskAssessment || "-"}
                              </td>
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                <button
                                  onClick={() => setSelectedCandidateDetail({ id: cand.id, name: cand.name, ...evalData })}
                                  className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                                >
                                  Detaylı İncele
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* EMPTY STATE */}
            {!runningPipeline && !evalResult && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-12 text-center shadow-sm">
                <div className="text-slate-300 text-6xl mb-4">🔀</div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-200 mb-2">Analiz Henüz Başlatılmadı</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto mb-6">
                  Bu oturumdaki adayların cevapları toplanınca "10 Ajanı Başlat ve Kıyasla" butonuna basarak otonom karşılaştırma motorunu çalıştırabilirsiniz.
                </p>
                
                <div className="inline-flex items-center gap-2 text-xs bg-slate-50 dark:bg-zinc-950 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <span className="font-semibold text-slate-600 dark:text-zinc-300">Durum:</span>
                  <span className="text-purple-600 font-bold">{submittedCandidates.length} Aday form doldurdu.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* CANDIDATE DETAIL REPORT MODAL */}
      {selectedCandidateDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 animate-scale-up text-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedCandidateDetail.name}</h2>
                <p className="text-xs text-slate-400">Detaylı Yapay Zeka (Ajan K2-K9) Performans Analizi</p>
              </div>
              <button
                onClick={() => setSelectedCandidateDetail(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Profile Summary */}
              <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl border border-slate-100 dark:border-zinc-850">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Ajan K2 Profil Özeti</span>
                <p className="text-slate-700 dark:text-zinc-300 leading-relaxed italic">{selectedCandidateDetail.profileSummary}</p>
              </div>

              {/* Sub-scores (K3 - K6) */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Alt Ajan Uyumluluk Skorları</h4>
                <div className="space-y-3">
                  {[
                    { label: "Ajan K3 (Teknik Yetkinlik Uyum Puanı)", score: selectedCandidateDetail.technicalScore, color: "bg-blue-600" },
                    { label: "Ajan K4 (Kıdem & Tecrübe Uyum Puanı)", score: selectedCandidateDetail.experienceScore, color: "bg-indigo-600" },
                    { label: "Ajan K5 (İş Bitirme & Proje Puanı)", score: selectedCandidateDetail.projectScore, color: "bg-emerald-600" },
                    { label: "Ajan K6 (Metot & Araç Uyum Puanı)", score: selectedCandidateDetail.methodologyScore, color: "bg-purple-600" }
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>{item.label}</span>
                        <span className="font-bold">%{item.score}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.score}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Behavioral & Risks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-100 dark:border-zinc-800 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Ajan K7 Davranışsal Profil</span>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">{selectedCandidateDetail.behavioralTraits}</p>
                </div>
                <div className="border border-slate-100 dark:border-zinc-800 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Ajan K8 Risk Değerlendirmesi</span>
                  <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed font-semibold">{selectedCandidateDetail.riskAssessment}</p>
                </div>
              </div>

              {/* Pros & Cons (K9) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-zinc-800 pt-4">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide block mb-2">⭐ Güçlü Yönler (Ajan K9)</span>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 dark:text-zinc-300">
                    {selectedCandidateDetail.pros?.map((pro: string, i: number) => (
                      <li key={i}>{pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide block mb-2">⚠️ Zayıf Yönler / Gelişim Alanları (Ajan K9)</span>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 dark:text-zinc-300">
                    {selectedCandidateDetail.cons?.map((con: string, i: number) => (
                      <li key={i}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 border-t border-slate-100 dark:border-zinc-800 pt-4">
              <button
                onClick={() => setSelectedCandidateDetail(null)}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANDIDATE QR MODAL */}
      {selectedCandidateQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl p-6 relative animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">📱 Aday Katılım QR Kodu</h3>
                <p className="text-xs text-slate-400 mt-1">{selectedCandidateQR.name} ({selectedCandidateQR.email})</p>
              </div>
              <button
                onClick={() => setSelectedCandidateQR(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + "/comparison/apply/" + selectedCandidateQR.id)}`}
                alt="Candidate QR Code"
                className="w-48 h-48 border p-2 bg-white rounded-2xl shadow-sm"
              />
              
              <div className="w-full text-center space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Katılım Bağlantısı</span>
                <input
                  readOnly
                  value={`${window.location.origin}/comparison/apply/${selectedCandidateQR.id}`}
                  className="w-full text-center border border-slate-200 dark:border-zinc-850 rounded-xl px-3 py-2 bg-slate-50 dark:bg-zinc-950 text-xs font-mono select-all outline-none"
                />
              </div>

              <div className="flex gap-2 w-full pt-4 border-t border-slate-100 dark:border-zinc-800">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/comparison/apply/${selectedCandidateQR.id}`);
                    alert("Katılım linki kopyalandı!");
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-xl text-xs cursor-pointer"
                >
                  Bağlantıyı Kopyala
                </button>
                <button
                  onClick={() => setSelectedCandidateQR(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold py-2 rounded-xl text-xs cursor-pointer"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GENERAL SESSION QR MODAL */}
      {showGeneralQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl p-6 relative animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">📢 Genel Katılım QR Kodu</h3>
                <p className="text-xs text-slate-400 mt-1">Oturum: {compSession.title}</p>
              </div>
              <button
                onClick={() => setShowGeneralQR(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + "/comparison/apply/join/" + compSession.id)}`}
                alt="General Session QR Code"
                className="w-48 h-48 border p-2 bg-white rounded-2xl shadow-sm"
              />
              
              <div className="w-full text-center space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Genel Kayıt Bağlantısı</span>
                <input
                  readOnly
                  value={`${window.location.origin}/comparison/apply/join/${compSession.id}`}
                  className="w-full text-center border border-slate-200 dark:border-zinc-850 rounded-xl px-3 py-2 bg-slate-50 dark:bg-zinc-950 text-xs font-mono select-all outline-none"
                />
              </div>

              <div className="flex gap-2 w-full pt-4 border-t border-slate-100 dark:border-zinc-800">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/comparison/apply/join/${compSession.id}`);
                    alert("Genel kayıt linki kopyalandı!");
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-xl text-xs cursor-pointer"
                >
                  Bağlantıyı Kopyala
                </button>
                <button
                  onClick={() => setShowGeneralQR(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold py-2 rounded-xl text-xs cursor-pointer"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
