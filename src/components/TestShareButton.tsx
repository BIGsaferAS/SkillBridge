"use client";

import { useState, useEffect } from "react";

interface TestShareButtonProps {
  testId: string;
  testTitle: string;
  companyId: string | null;
}

export default function TestShareButton({ testId, testTitle, companyId }: TestShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scope, setScope] = useState<"SINGLE" | "COMPANY" | "GROUP">("SINGLE");

  // Form inputs
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [groupName, setGroupName] = useState("");
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(companyId || "");

  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/companies")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setCompanies(data);
            if (!selectedCompanyId && data.length > 0) {
              setSelectedCompanyId(data[0].id);
            }
          }
        })
        .catch((err) => console.error("Error loading companies:", err));
    }
  }, [isOpen]);

  // Compute generated URL
  let generatedUrl = `${origin}/tests/${testId}/solve`;
  if (scope === "SINGLE" && candidateEmail) {
    generatedUrl += `?name=${encodeURIComponent(candidateName)}&email=${encodeURIComponent(candidateEmail)}`;
  } else if (scope === "COMPANY" && (selectedCompanyId || companyId)) {
    generatedUrl += `?company=${encodeURIComponent(selectedCompanyId || companyId || "")}`;
  } else if (scope === "GROUP" && groupName) {
    generatedUrl += `?group=${encodeURIComponent(groupName)}`;
  }

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(generatedUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedUrl);
    alert("Test linki kopyalandı!");
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Test Katılım QR Kodu - ${testTitle}</title>
            <style>
              body {
                font-family: sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
              }
              .card {
                text-align: center;
                border: 2px solid #ccc;
                border-radius: 20px;
                padding: 40px;
                max-width: 400px;
              }
              img {
                width: 250px;
                height: 250px;
                margin: 20px 0;
              }
              h1 { font-size: 24px; margin: 0 0 10px; color: #333; }
              p { font-size: 14px; color: #666; margin: 0 0 20px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>${testTitle}</h1>
              <p>Testi mobil cihazınızla çözmek için aşağıdaki QR kodu taratın.</p>
              <img src="${qrImageUrl}" />
              <p style="font-size: 11px; word-break: break-all; color: #888;">${generatedUrl}</p>
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs font-bold bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
      >
        📢 Paylaş & QR
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 relative animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">📢 Test Paylaşım ve Barkod (QR)</h3>
                <p className="text-xs text-slate-400 mt-1">{testTitle}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5">
              {/* Scope Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Paylaşım Kapsamı</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl text-xs font-bold text-center">
                  <button
                    type="button"
                    onClick={() => setScope("SINGLE")}
                    className={`py-2 rounded-lg transition-all ${scope === "SINGLE" ? 'bg-white dark:bg-zinc-800 text-purple-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    Tekil Aday
                  </button>
                  <button
                    type="button"
                    onClick={() => setScope("COMPANY")}
                    className={`py-2 rounded-lg transition-all ${scope === "COMPANY" ? 'bg-white dark:bg-zinc-800 text-purple-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    Şirket Geneli
                  </button>
                  <button
                    type="button"
                    onClick={() => setScope("GROUP")}
                    className={`py-2 rounded-lg transition-all ${scope === "GROUP" ? 'bg-white dark:bg-zinc-800 text-purple-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    Grup / Ekip
                  </button>
                </div>
              </div>

              {/* Dynamic Form inputs based on scope */}
              {scope === "SINGLE" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800/80">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Aday Ad Soyad</label>
                    <input
                      type="text"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="Örn: Can Demir"
                      className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 bg-white dark:bg-zinc-900 outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Aday E-posta</label>
                    <input
                      type="email"
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                      placeholder="Örn: candemir@mail.com"
                      className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 bg-white dark:bg-zinc-900 outline-none text-xs"
                    />
                  </div>
                </div>
              )}

              {scope === "GROUP" && (
                <div className="bg-slate-50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800/80">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Grup / Ekip Adı</label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Örn: 2026_Yaz_Stajyerleri veya Satis_Ekibi"
                    className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 bg-white dark:bg-zinc-900 outline-none text-xs"
                  />
                </div>
              )}

              {scope === "COMPANY" && (
                <div className="bg-slate-50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800/80 space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hedef Şirket Seçin</label>
                    <select
                      value={selectedCompanyId}
                      onChange={(e) => setSelectedCompanyId(e.target.value)}
                      className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 bg-white dark:bg-zinc-900 outline-none text-xs text-slate-700 dark:text-slate-200 focus:border-purple-500 font-medium"
                    >
                      <option value="">Şirket Seçin...</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-xs text-slate-500 leading-relaxed">
                    🏢 <strong>Şirket Geneli Paylaşım:</strong> Bu seçenek, seçtiğiniz şirkete bağlı olan çalışanların tamamının çözmesi için genel bir QR kod/link oluşturur.
                  </div>
                </div>
              )}

              {/* QR and URL display */}
              <div className="flex flex-col md:flex-row gap-5 items-center justify-between border-t border-slate-100 dark:border-zinc-800/80 pt-5">
                <div className="flex flex-col items-center bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-850 p-4 rounded-2xl w-full md:w-auto">
                  <img
                    src={qrImageUrl}
                    alt="QR Code"
                    className="w-36 h-36 border p-2 bg-white rounded-xl shadow-sm"
                  />
                  <button
                    onClick={handlePrint}
                    className="mt-2.5 text-[10px] font-bold text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60 px-3 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    🖨️ QR Kodunu Yazdır
                  </button>
                </div>

                <div className="flex-1 w-full space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Paylaşım Linki (URL)</label>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={generatedUrl}
                        className="flex-1 border border-slate-200 dark:border-zinc-850 rounded-xl px-3 py-2 bg-slate-50 dark:bg-zinc-950 text-xs font-mono select-all outline-none"
                      />
                      <button
                        onClick={handleCopy}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3 rounded-xl cursor-pointer"
                      >
                        Kopyala
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal">
                    Kullanıcılar QR kodu mobil cihazlarının kamerasıyla okutarak veya linke tıklayarak doğrudan teste başlayabilirler. Giriş yapmamışlarsa ad-soyad girmeleri istenecektir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
