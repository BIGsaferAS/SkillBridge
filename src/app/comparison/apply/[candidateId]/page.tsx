"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSession } from "next-auth/react";

export default function CandidateApplyPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Form states for Recruitment (CV Builder)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [education, setEducation] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [crisisAnswer, setCrisisAnswer] = useState("");
  const [rawCvText, setRawCvText] = useState("");
  const [cvMethod, setCvMethod] = useState<"structured" | "raw">("structured");

  // Form states for Promotion
  const [currentRole, setCurrentRole] = useState("");
  const [completedProjects, setCompletedProjects] = useState("");
  const [kpisAndSuccess, setKpisAndSuccess] = useState("");
  const [difficultiesFaced, setDifficultiesFaced] = useState("");

  useEffect(() => {
    if (params?.candidateId) {
      fetch(`/api/comparison/candidate/${params.candidateId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setCandidate(data.candidate);
            setName(data.candidate.name || "");
            setEmail(data.candidate.email || "");
          }
          setLoading(false);
        })
        .catch(() => {
          setError("Sunucuya bağlanılamadı.");
          setLoading(false);
        });
    }
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let submittedData = "";
    if (candidate.session.type === "RECRUITMENT") {
      if (cvMethod === "structured") {
        submittedData = `
AD SOYAD: ${name}
E-POSTA: ${email}
EĞİTİM BİLGİLERİ:
${education}
DENEYİM BİLGİLERİ:
${experience}
TEKNİK YETKİNLİKLER VE ARAÇLAR:
${skills}
ZORLU BİR PROBLEM / KRİZ ANINDAKİ ÇÖZÜM YAKLAŞIMI:
${crisisAnswer}
        `.trim();
      } else {
        submittedData = `
AD SOYAD: ${name}
E-POSTA: ${email}
CV DETAYLARI (RAW):
${rawCvText}
        `.trim();
      }
    } else {
      submittedData = `
ÇALIŞAN ADI: ${name}
E-POSTA: ${email}
MEVCUT ROL VE KIDEM: ${currentRole}
TAMAMLANAN PROJELER VE İŞ BİTİRME BELGELERİ:
${completedProjects}
KPI METRİKLERİ VE ELDE EDİLEN BAŞARILAR:
${kpisAndSuccess}
KARŞILAŞILAN TEKNİK/OPERASYONEL KRİZLER VE ÇÖZÜM YÖNTEMLERİ:
${difficultiesFaced}
      `.trim();
    }

    try {
      const res = await fetch(`/api/comparison/candidate/${candidate.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submittedData }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const err = await res.json();
        alert("Hata oluştu: " + err.error);
      }
    } catch {
      alert("Bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 rounded-xl shadow-lg text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-zinc-100 mb-2">Hata Oluştu</h1>
          <p className="text-slate-500 dark:text-zinc-400 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 rounded-2xl shadow-xl text-center max-w-lg">
          <div className="text-emerald-500 text-6xl mb-4 animate-bounce">🎉</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Bilgileriniz Başarıyla Gönderildi!</h1>
          <p className="text-slate-500 dark:text-zinc-400 mb-6">
            Bilgileriniz veri havuzuna kaydedilmiştir. AI Karşılaştırma Sayfalarımız (10 Sayfa) pozisyon veya terfi kriterlerine uyumunuzu analiz edecektir. Katılımınız için teşekkür ederiz.
          </p>
          <div className="text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-2 rounded-md font-medium mb-6">
            Oturum: {candidate.session.title}
          </div>
          <button
            onClick={() => {
              if (session?.user) {
                const role = (session.user as any).role;
                if (role === "ADMIN" || role === "COMPANY_MANAGER" || role === "SUPER_ADMIN") {
                  router.push("/admin/comparison");
                } else {
                  router.push("/dashboard");
                }
              } else {
                router.push("/");
              }
            }}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all text-xs cursor-pointer shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95"
          >
            Geri Dön / Tamamla 🚀
          </button>
        </div>
      </div>
    );
  }

  const isRecruitment = candidate.session.type === "RECRUITMENT";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors text-slate-800 dark:text-zinc-100">
       {/* Top Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (session?.user) {
                const role = (session.user as any).role;
                if (role === "ADMIN" || role === "COMPANY_MANAGER" || role === "SUPER_ADMIN") {
                  router.push("/admin/comparison");
                } else {
                  router.push("/dashboard");
                }
              } else {
                router.push("/");
              }
            }}
            className="text-slate-500 hover:text-slate-850 dark:text-zinc-400 dark:hover:text-white font-bold flex items-center gap-1.5 text-xs border border-slate-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-sm"
          >
            ← Geri Dön
          </button>
          
          <div className="w-px h-6 bg-slate-200 dark:bg-zinc-800"></div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-md shadow-purple-500/20">
              K
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-zinc-200 text-sm block">SkillBridge</span>
              <span className="text-[10px] text-purple-600 font-semibold tracking-wider uppercase block">Karşılaştırma Oturumu</span>
            </div>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Grid */}
      <main className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Session Criteria */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${isRecruitment ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
              {isRecruitment ? "İşe Alım / CV Değerlendirme" : "Terfi / Performans Değerlendirme"}
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {candidate.session.title}
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Lütfen istenen kriterler doğrultusunda bilgilerinizi eksiksiz doldurun.
            </p>

            <div className="border-t border-slate-100 dark:border-zinc-800 pt-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {isRecruitment ? "İş Tanımı & Yetkinlik Beklentisi" : "Terfi İş Bitirme & Tecrübe Beklentisi"}
              </h3>
              <div className="text-sm text-slate-600 dark:text-zinc-300 whitespace-pre-line leading-relaxed bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-slate-100 dark:border-zinc-800/60 max-h-96 overflow-y-auto">
                {candidate.session.requirements}
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Interactive form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              📝 Katılım ve Başvuru Formu
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-1">Ad Soyad</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-zinc-950 focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-zinc-900 transition-all outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-1">E-Posta</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-zinc-950 focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-zinc-900 transition-all outline-none text-sm"
                  />
                </div>
              </div>

              {isRecruitment ? (
                // RECRUITMENT FORM
                <div className="space-y-6">
                  {/* Method selector */}
                  <div className="flex bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl w-fit">
                    <button
                      type="button"
                      onClick={() => setCvMethod("structured")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${cvMethod === "structured" ? 'bg-white dark:bg-zinc-800 shadow-sm text-purple-600' : 'text-slate-500'}`}
                    >
                      Soru Cevap ile CV Oluştur
                    </button>
                    <button
                      type="button"
                      onClick={() => setCvMethod("raw")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${cvMethod === "raw" ? 'bg-white dark:bg-zinc-800 shadow-sm text-purple-600' : 'text-slate-500'}`}
                    >
                      Hazır CV Metni Yapıştır
                    </button>
                  </div>

                  {cvMethod === "structured" ? (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-1">Eğitim Bilgileri</label>
                        <textarea
                          required
                          value={education}
                          onChange={(e) => setEducation(e.target.value)}
                          placeholder="Örn: X Üniversitesi, Bilgisayar Mühendisliği Lisansı (2014-2018)"
                          className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl p-3 h-24 bg-slate-50 dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-zinc-900 transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-1">Mesleki Deneyimler</label>
                        <textarea
                          required
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          placeholder="Örn: A Firması - Senior Developer (2020-Günümüz): Frontend mimarilerini kurdum, 5 kişilik ekibi koordine ettim."
                          className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl p-3 h-32 bg-slate-50 dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-zinc-900 transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-1">Teknik Yetkinlikler & Araçlar</label>
                        <textarea
                          required
                          value={skills}
                          onChange={(e) => setSkills(e.target.value)}
                          placeholder="Örn: React, Node.js, TypeScript, Docker, AWS, PostgreSQL, Git"
                          className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl p-3 h-24 bg-slate-50 dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-zinc-900 transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-1">
                          Kriz Anı Sorusu: Kariyerinizde karşılaştığınız en büyük teknik/operasyonel kriz neydi ve nasıl çözdünüz?
                        </label>
                        <textarea
                          required
                          value={crisisAnswer}
                          onChange={(e) => setCrisisAnswer(e.target.value)}
                          placeholder="Örn: PoC aşamasında çöken sunucuyu şeffaflıkla yönetip 4 saatte yedeklerini ayağa kaldırdık..."
                          className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl p-3 h-32 bg-slate-50 dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-zinc-900 transition-all outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-1">Hazır CV / Özgeçmiş Metni</label>
                      <textarea
                        required
                        value={rawCvText}
                        onChange={(e) => setRawCvText(e.target.value)}
                        placeholder="Özgeçmişinizi buraya kopyalayıp yapıştırın..."
                        className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl p-4 h-96 bg-slate-50 dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-zinc-900 transition-all outline-none"
                      />
                    </div>
                  )}
                </div>
              ) : (
                // PROMOTION FORM
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-1">Mevcut Rolünüz ve Kıdeminiz</label>
                    <input
                      required
                      type="text"
                      value={currentRole}
                      onChange={(e) => setCurrentRole(e.target.value)}
                      placeholder="Örn: Kıdemli Full-Stack Geliştirici (3 Yıl)"
                      className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-zinc-950 focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-zinc-900 transition-all outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-1">
                      Tamamlanan Projeler & İş Bitirme Belgeleri
                    </label>
                    <textarea
                      required
                      value={completedProjects}
                      onChange={(e) => setCompletedProjects(e.target.value)}
                      placeholder="Örn: 
- Proje A: Ödeme altyapısının yenilenmesi. Rol: Lead. Kullanılan Teknolojiler: Node, Redis.
- Proje B: Mikroservis migrasyonu. Rol: Developer. Teslimat: 3 adet servis..."
                      className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl p-3 h-40 bg-slate-50 dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-zinc-900 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-1">
                      Elde Edilen Başarılar ve KPI Metrikleri
                    </label>
                    <textarea
                      required
                      value={kpisAndSuccess}
                      onChange={(e) => setKpisAndSuccess(e.target.value)}
                      placeholder="Örn: Sayfa yükleme hızları %40 artırıldı. API hata oranları binde 5'e indirildi. Şirket içi maliyette yıllık 12.000$ tasarruf sağlandı..."
                      className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl p-3 h-32 bg-slate-50 dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-zinc-900 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-1">
                      Karşılaşılan Krizler ve Çözüm Yöntemleri
                    </label>
                    <textarea
                      required
                      value={difficultiesFaced}
                      onChange={(e) => setDifficultiesFaced(e.target.value)}
                      placeholder="Örn: Canlıya çıkışta veritabanı kitlenmesi yaşandı. Ekibi organize edip rollback planı yürüttük ve sorunu kalıcı olarak çözdük..."
                      className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl p-3 h-32 bg-slate-50 dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-zinc-900 transition-all outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-purple-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-sm"
              >
                {loading ? "Kaydediliyor..." : "Başvuruyu ve Bilgileri AI Sayfalarına Gönder 🚀"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
