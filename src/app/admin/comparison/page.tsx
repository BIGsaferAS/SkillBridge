"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminComparisonDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Session Form states
  const [title, setTitle] = useState("");
  const [type, setType] = useState("RECRUITMENT"); // RECRUITMENT or PROMOTION
  const [requirements, setRequirements] = useState("");
  const [candidates, setCandidates] = useState<{ name: string; email: string }[]>([
    { name: "", email: "" }
  ]);

  // File Upload states
  const [activeTab, setActiveTab] = useState<"INVITE" | "UPLOAD">("INVITE");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState("");
  const [requirementsFile, setRequirementsFile] = useState<File | null>(null);
  const [cvFiles, setCvFiles] = useState<File[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      const role = (session?.user as any)?.role;
      if (role !== "ADMIN" && role !== "COMPANY_MANAGER" && role !== "SUPER_ADMIN") {
        router.push("/login");
      } else {
        fetchSessions();
      }
    }
  }, [status, session, router]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/comparison");
      const data = await res.json();
      if (data.sessions) {
        setSessions(data.sessions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidateRow = () => {
    setCandidates([...candidates, { name: "", email: "" }]);
  };

  const handleRemoveCandidateRow = (index: number) => {
    if (candidates.length === 1) return;
    setCandidates(candidates.filter((_, idx) => idx !== index));
  };

  const handleCandidateChange = (index: number, field: "name" | "email", value: string) => {
    const updated = [...candidates];
    updated[index][field] = value;
    setCandidates(updated);
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const filteredCandidates = candidates.filter(c => c.name.trim() && c.email.trim());
    if (filteredCandidates.length === 0) {
      alert("Lütfen en az bir aday/çalışan ekleyin.");
      return;
    }

    try {
      const res = await fetch("/api/admin/comparison", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type,
          requirements,
          candidates: filteredCandidates
        })
      });

      if (res.ok) {
        setTitle("");
        setType("RECRUITMENT");
        setRequirements("");
        setCandidates([{ name: "", email: "" }]);
        setShowModal(false);
        fetchSessions();
      } else {
        const err = await res.json();
        alert("Oturum oluşturulamadı: " + err.error);
      }
    } catch {
      alert("Hata oluştu.");
    }
  };

  const handleUploadAndCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cvFiles.length === 0) {
      alert("Lütfen en az bir aday CV'si seçin.");
      return;
    }

    setIsUploading(true);
    setUploadStatusText("Dosyalar yükleniyor ve hazırlanıyor...");
    
    const steps = [
      "Belgeler sunucuya aktarılıyor...",
      "Yapay zeka belgeleri tarıyor...",
      "Adayların ad, e-posta ve deneyimleri ayrıştırılıyor...",
      "Karşılaştırma oturumu oluşturuluyor..."
    ];
    
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setUploadStatusText(steps[currentStep]);
        currentStep++;
      }
    }, 2000);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("type", type);
      formData.append("requirementsText", requirements);
      if (requirementsFile) {
        formData.append("requirementsFile", requirementsFile);
      }
      cvFiles.forEach(file => {
        formData.append("cvFiles", file);
      });

      const res = await fetch("/api/admin/comparison/upload-compare", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);

      if (res.ok) {
        const data = await res.json();
        setUploadStatusText("Başarılı! Karşılaştırma ekranına yönlendiriliyorsunuz...");
        setTitle("");
        setType("RECRUITMENT");
        setRequirements("");
        setRequirementsFile(null);
        setCvFiles([]);
        setShowModal(false);
        router.push(`/admin/comparison/${data.sessionId}?run=true`);
      } else {
        const err = await res.json();
        alert("Hata oluştu: " + err.error);
      }
    } catch (error) {
      clearInterval(interval);
      console.error(error);
      alert("Sunucuyla iletişim kurulurken bir hata oluştu.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm("Bu karşılaştırma oturumunu silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/admin/comparison/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchSessions();
      } else {
        const err = await res.json();
        alert("Silinemedi: " + err.error);
      }
    } catch {
      alert("Hata oluştu.");
    }
  };

  if (status === "loading" || loading && sessions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Calculate statistics
  const totalSessions = sessions.length;
  const activeSessions = sessions.filter(s => s.status === "ACTIVE").length;
  const completedSessions = sessions.filter(s => s.status === "COMPLETED" || s.status === "APPROVED").length;
  const totalCandidates = sessions.reduce((acc, s) => acc + s.candidates.length, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100">
      <main className="max-w-7xl mx-auto p-6 mt-4">
        {/* Breadcrumb & Title */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              🔀 Karşılaştırma Modülü <span className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold px-2 py-1 rounded-full uppercase tracking-wider">10 AI Sayfası</span>
            </h1>
            <p className="text-slate-500 mt-1">İşe alımlarda görev tanımı & CV'yi, terfilerde iş bitirme belgelerini otonom olarak yan yana kıyaslayın.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all text-sm cursor-pointer"
          >
            + Yeni Karşılaştırma Başlat
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="text-slate-500 dark:text-zinc-400 text-sm font-medium mb-1">Toplam Oturum</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalSessions}</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="text-slate-500 dark:text-zinc-400 text-sm font-medium mb-1">Aktif Değerlendirmeler</div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{activeSessions}</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="text-slate-500 dark:text-zinc-400 text-sm font-medium mb-1">Tamamlanan Analizler</div>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{completedSessions}</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="text-slate-500 dark:text-zinc-400 text-sm font-medium mb-1">Toplam Değerlendirilen Aday</div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalCandidates}</div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-200">Karşılaştırma Oturumları</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-zinc-800">
              <thead className="bg-slate-50 dark:bg-zinc-800/40">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Oturum / Başlık</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Tür</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Aday Sayısı</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Durum</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Tarih</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/admin/comparison/${s.id}`} className="font-bold text-slate-900 dark:text-white hover:underline text-sm md:text-base">
                        {s.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-md text-xs font-semibold ${s.type === 'RECRUITMENT' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                        {s.type === 'RECRUITMENT' ? 'İşe Alım' : 'Terfi'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {s.candidates.length} Aday
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                        s.status === 'APPROVED' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/30' :
                        s.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' : 
                        'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400'
                      }`}>
                        {s.status === 'APPROVED' ? 'Onaylandı' :
                         s.status === 'COMPLETED' ? 'Rapor Hazır' : 
                         'Cevaplar Bekleniyor'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(s.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                      <Link
                        href={`/admin/comparison/${s.id}`}
                        className="text-sm font-bold text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        İncele & Çalıştır
                      </Link>
                      <button
                        onClick={() => handleDeleteSession(s.id)}
                        className="text-sm font-medium text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500 italic">
                      Henüz karşılaştırma oturumu oluşturmadınız.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* CREATE NEW COMPARISON SESSION MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 animate-scale-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                🔀 Yeni Karşılaştırma Başlat
              </h2>
              <button
                onClick={() => {
                  if (!isUploading) {
                    setShowModal(false);
                  }
                }}
                disabled={isUploading}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold cursor-pointer disabled:opacity-30"
              >
                ✕
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-100 dark:border-zinc-800 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab("INVITE")}
                disabled={isUploading}
                className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-all cursor-pointer ${
                  activeTab === "INVITE"
                    ? "border-purple-600 text-purple-600 dark:text-purple-400"
                    : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-zinc-350"
                }`}
              >
                ✉️ Davetiye ile Karşılaştır
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("UPLOAD")}
                disabled={isUploading}
                className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-all cursor-pointer ${
                  activeTab === "UPLOAD"
                    ? "border-purple-600 text-purple-600 dark:text-purple-400"
                    : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-zinc-355"
                }`}
              >
                📂 Belgelerle Doğrudan Karşılaştır
              </button>
            </div>

            {/* Loader State */}
            {isUploading ? (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-pulse">
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-900/30"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-purple-600 animate-spin"></div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Belgeler Analiz Ediliyor</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md">
                  {uploadStatusText}
                </p>
                <div className="mt-4 flex gap-1 justify-center items-center">
                  <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            ) : activeTab === "INVITE" ? (
              /* INVITATION FORM (ORIGINAL) */
              <form onSubmit={handleCreateSession} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Karşılaştırma Oturumu Başlığı</label>
                    <input
                      required
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Örn: Kıdemli React Geliştirici Seçimi veya Finans Müdürü Terfisi"
                      className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-zinc-950 focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Karşılaştırma Türü</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-zinc-950 focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-sm"
                    >
                      <option value="RECRUITMENT">İşe Alım (CV Bazlı)</option>
                      <option value="PROMOTION">Terfi (İş Bitirme Bazlı)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    {type === "RECRUITMENT" ? "İş Tanımı & Görev Tanımı ve Aranan Nitelikler" : "Terfi Kriterleri, İş Bitirme Şartları ve Deneyim Tanımı"}
                  </label>
                  <textarea
                    required
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder={
                      type === "RECRUITMENT"
                        ? "Örn: \n- En az 5 yıl React ve TypeScript tecrübesi olan\n- State yönetimi (Redux/Zustand) ve performans optimizasyonunda deneyimli"
                        : "Örn: \n- Son 1 yılda en az 2 kritik projeyi başarıyla teslim etmiş olmak\n- Ekip koordinasyonu, bütçe yönetimi alanlarında başarı kanıtları sunmak"
                    }
                    className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl p-3 h-32 bg-slate-50 dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-zinc-900 outline-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Karşılaştırılacak Kişiler (Adaylar / Çalışanlar)</label>
                    <button
                      type="button"
                      onClick={handleAddCandidateRow}
                      className="text-xs text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      + Kişi Ekle
                    </button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto p-1 bg-slate-50 dark:bg-zinc-950/40 rounded-xl border border-slate-100 dark:border-zinc-800/80">
                    {candidates.map((cand, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <span className="text-xs font-bold text-slate-400 w-6 text-center">{idx + 1}.</span>
                        <input
                          required
                          type="text"
                          placeholder="Ad Soyad"
                          value={cand.name}
                          onChange={(e) => handleCandidateChange(idx, "name", e.target.value)}
                          className="flex-1 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500 outline-none text-xs"
                        />
                        <input
                          required
                          type="email"
                          placeholder="E-posta"
                          value={cand.email}
                          onChange={(e) => handleCandidateChange(idx, "email", e.target.value)}
                          className="flex-1 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500 outline-none text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCandidateRow(idx)}
                          disabled={candidates.length === 1}
                          className="text-red-500 hover:text-red-700 font-bold px-2 py-1 text-xs disabled:opacity-30 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-zinc-800 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 cursor-pointer"
                  >
                    Oturumu Oluştur & Davetleri Hazırla 🚀
                  </button>
                </div>
              </form>
            ) : (
              /* DOCUMENT UPLOAD FORM (NEW) */
              <form onSubmit={handleUploadAndCompare} className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Karşılaştırma Oturumu Başlığı</label>
                    <input
                      required
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Örn: Kıdemli React Geliştirici Seçimi veya Finans Müdürü Terfisi"
                      className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-zinc-950 focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Karşılaştırma Türü</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-zinc-950 focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-sm"
                    >
                      <option value="RECRUITMENT">İşe Alım (CV Bazlı)</option>
                      <option value="PROMOTION">Terfi (İş Bitirme Bazlı)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      {type === "RECRUITMENT" ? "1. Görev Tanımı ve Aranan Nitelikler (Metin)" : "1. Terfi Kriterleri ve Deneyim Tanımı (Metin)"}
                    </label>
                    <textarea
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      placeholder={
                        type === "RECRUITMENT"
                          ? "Örn: \n- En az 5 yıl React ve TypeScript tecrübesi olan..."
                          : "Örn: \n- Son 1 yılda en az 2 kritik projeyi başarıyla teslim etmiş olmak..."
                      }
                      className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl p-3 flex-1 h-36 bg-slate-50 dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-zinc-900 outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      {type === "RECRUITMENT" ? "1. VEYA Görev Tanımı Belgesi Yükleyin" : "1. VEYA Kriter Belgesi Yükleyin"}
                    </label>
                    <div className="border-2 border-dashed border-slate-200 dark:border-zinc-800 hover:border-purple-500 rounded-xl p-4 h-36 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-zinc-950/20 transition-all relative">
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={(e) => setRequirementsFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      />
                      {requirementsFile ? (
                        <div className="text-center z-10">
                          <span className="text-2xl">📄</span>
                          <p className="text-xs font-bold text-slate-700 dark:text-zinc-200 mt-1 max-w-[180px] truncate">{requirementsFile.name}</p>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setRequirementsFile(null); }}
                            className="text-[10px] text-red-500 hover:underline mt-2 font-bold cursor-pointer"
                          >
                            Kaldır
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-slate-400 pointer-events-none">
                          <span className="text-3xl mb-1 block">📥</span>
                          <span className="text-xs font-bold block text-slate-500">Dosya Sürükleyin veya Seçin</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">PDF, DOCX, TXT (Maks 10MB)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    {type === "RECRUITMENT" ? "2. Aday CV Belgelerini Yükleyin" : "2. Aday Performans / İş Bitirme Belgelerini Yükleyin"}
                  </label>
                  <div className="border-2 border-dashed border-slate-200 dark:border-zinc-800 hover:border-purple-500 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-zinc-950/20 transition-all relative">
                    <input
                      required={cvFiles.length === 0}
                      type="file"
                      multiple
                      accept=".pdf,.docx,.txt"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setCvFiles(prev => [...prev, ...files]);
                      }}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <div className="text-center text-slate-400 pointer-events-none">
                      <span className="text-3xl mb-2 block">🗂️</span>
                      <span className="text-xs font-bold block text-slate-500">Çoklu Aday Belgelerini Sürükleyin veya Seçin</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Birden fazla PDF, DOCX, TXT seçebilirsiniz</span>
                    </div>
                  </div>

                  {cvFiles.length > 0 && (
                    <div className="mt-4 bg-slate-50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-850 rounded-xl p-3 max-h-40 overflow-y-auto">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Yüklenecek Belgeler ({cvFiles.length})</span>
                      <div className="space-y-1.5">
                        {cvFiles.map((file, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-850 p-2 rounded-lg animate-fade-in">
                            <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate max-w-[280px]">📄 {file.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(0)} KB</span>
                              <button
                                type="button"
                                onClick={() => setCvFiles(cvFiles.filter((_, i) => i !== idx))}
                                className="text-red-500 hover:text-red-700 font-bold px-1.5 cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-zinc-800 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setTitle("");
                      setType("RECRUITMENT");
                      setRequirements("");
                      setRequirementsFile(null);
                      setCvFiles([]);
                      setShowModal(false);
                    }}
                    className="px-4 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 cursor-pointer"
                  >
                    Yükle ve Doğrudan Karşılaştır 🚀
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
