"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function CandidateJoinPage() {
  const params = useParams();
  const router = useRouter();

  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params?.sessionId) {
      // Oturum bilgilerini çekelim
      fetch(`/api/admin/comparison/${params.sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setError("Oturum bilgileri yüklenemedi. Yetki sorunu veya geçersiz oturum.");
          } else {
            setSessionInfo(data.session);
          }
          setLoading(false);
        })
        .catch(() => {
          setError("Sunucu bağlantı hatası.");
          setLoading(false);
        });
    }
  }, [params]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/comparison/session/${params.sessionId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email })
      });

      if (res.ok) {
        const data = await res.json();
        // Aday ID'si ile başvuru formuna yönlendir
        router.push(`/comparison/apply/${data.candidateId}`);
      } else {
        const err = await res.json();
        alert("Katılım başarısız: " + err.error);
      }
    } catch {
      alert("Hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !sessionInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 rounded-xl shadow-lg text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-zinc-100 mb-2">Giriş Yapılamadı</h1>
          <p className="text-slate-500 dark:text-zinc-400 mb-6">{error || "Karşılaştırma oturumu bulunamadı."}</p>
        </div>
      </div>
    );
  }

  const isRecruitment = sessionInfo.type === "RECRUITMENT";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors text-slate-800 dark:text-zinc-100 flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-md shadow-purple-500/20">
            K
          </div>
          <div>
            <span className="font-bold text-slate-800 dark:text-zinc-200 text-sm block">SkillBridge</span>
            <span className="text-[10px] text-purple-600 font-semibold tracking-wider uppercase block">Oturum Katılım Kaydı</span>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl max-w-md w-full">
          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold mb-3 ${isRecruitment ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
            {isRecruitment ? "İşe Alım / CV Karşılaştırma" : "Terfi / Performans Karşılaştırma"}
          </span>
          
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
            {sessionInfo.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mb-6">
            Lütfen ad soyad ve e-posta adresinizi girerek oturuma kaydolun. Sonrasında değerlendirme formu açılacaktır.
          </p>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-1">Ad Soyad</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Ahmet Yılmaz"
                className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-zinc-950 focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-1">E-Posta Adresi</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Örn: ahmet@mail.com"
                className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-zinc-950 focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-zinc-900 outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white font-extrabold py-3 rounded-xl shadow-lg shadow-purple-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all text-sm cursor-pointer mt-2"
            >
              {submitting ? "Kaydediliyor..." : "Oturuma Katıl ve Forma Başla 🚀"}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
        SkillBridge AI Değerlendirme Platformu © 2026
      </footer>
    </div>
  );
}
