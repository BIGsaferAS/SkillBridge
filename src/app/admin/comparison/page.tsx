"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminHeader from "@/components/AdminHeader";
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
  const completedSessions = sessions.filter(s => s.status === "COMPLETED").length;
  const totalCandidates = sessions.reduce((acc, s) => acc + s.candidates.length, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100">
      <AdminHeader 
        userName={(session?.user as any)?.name || "Yönetici"} 
        companyName="Global" 
      />

      <main className="max-w-7xl mx-auto p-6 mt-4">
        {/* Breadcrumb & Title */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              🔀 Karşılaştırma Modülü <span className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold px-2 py-1 rounded-full uppercase tracking-wider">10 AI Ajanı</span>
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
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${s.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400'}`}>
                        {s.status === 'COMPLETED' ? 'Rapor Hazır' : 'Cevaplar Bekleniyor'}
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                🔀 Yeni Karşılaştırma Oturumu Başlat
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-6">
              {/* Title & Type */}
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

              {/* Requirements */}
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
                      ? "Örn: \n- En az 5 yıl React ve TypeScript tecrübesi olan\n- State yönetimi (Redux/Zustand) ve performans optimizasyonunda deneyimli\n- Mikrofrontend mimarileriyle çalışmış"
                      : "Örn: \n- Son 1 yılda en az 2 kritik projeyi başarıyla teslim etmiş olmak\n- Ekip koordinasyonu, bütçe yönetimi ve metodoloji geliştirme alanlarında başarı kanıtları sunmak"
                  }
                  className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl p-3 h-32 bg-slate-50 dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-zinc-900 outline-none"
                />
              </div>

              {/* Candidates array */}
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

              {/* Actions */}
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
          </div>
        </div>
      )}
    </div>
  );
}
