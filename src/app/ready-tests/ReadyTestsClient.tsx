"use client";

import { useState } from "react";
import Link from "next/link";

interface Sector {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
}

interface JobRole {
  id: string;
  name: string;
}

interface TestItem {
  id: string;
  title: string;
  sector: string | null;
  department: string | null;
  roleName: string | null;
  difficulty: string | null;
  _count: {
    questions: number;
  };
}

interface CompanyItem {
  id: string;
  name: string;
}

interface ReadyTestsClientProps {
  sectors: Sector[];
  departments: Department[];
  roles: JobRole[];
  initialTests: TestItem[];
  companyId: string | null;
  companies: CompanyItem[];
}

export default function ReadyTestsClient({
  sectors,
  departments,
  roles,
  initialTests,
  companyId,
  companies
}: ReadyTestsClientProps) {
  // Filters
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  // Custom Test Creation
  const [customJobTitle, setCustomJobTitle] = useState("");
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customError, setCustomError] = useState("");

  // Assignment Modal
  const [assigningTest, setAssigningTest] = useState<TestItem | null>(null);
  const [assignScope, setAssignScope] = useState<"SINGLE" | "COMPANY" | "GROUP">("SINGLE");
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState(companyId || (companies.length > 0 ? companies[0].id : ""));
  const [copied, setCopied] = useState(false);

  // Filter logic
  const filteredTests = initialTests.filter(test => {
    if (selectedSector && test.sector !== selectedSector) return false;
    if (selectedDepartment && test.department !== selectedDepartment) return false;
    if (selectedRole && test.roleName !== selectedRole) return false;
    return true;
  });

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customJobTitle.trim()) return;

    setIsCreatingCustom(true);
    setCustomError("");

    try {
      const res = await fetch("/api/tests/create-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle: customJobTitle })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCustomJobTitle("");
        // Set the created test as the active assigning test immediately
        const newTest: TestItem = {
          id: data.test.id,
          title: data.test.title,
          sector: "Özel",
          department: "Özel",
          roleName: customJobTitle,
          difficulty: "Orta",
          _count: { questions: 3 }
        };
        setAssigningTest(newTest);
      } else {
        setCustomError(data.error || "Özel test oluşturulurken bir hata oluştu.");
      }
    } catch (err) {
      setCustomError("Sunucu bağlantı hatası.");
    } finally {
      setIsCreatingCustom(false);
    }
  };

  // Compute Share Link
  const getShareUrl = () => {
    if (!assigningTest) return "";
    let url = `${typeof window !== "undefined" ? window.location.origin : ""}/tests/${assigningTest.id}/solve`;
    if (assignScope === "SINGLE" && candidateEmail) {
      url += `?name=${encodeURIComponent(candidateName)}&email=${encodeURIComponent(candidateEmail)}`;
    } else if (assignScope === "COMPANY" && (selectedCompanyId || companyId)) {
      url += `?company=${encodeURIComponent(selectedCompanyId || companyId || "")}`;
    } else if (assignScope === "GROUP" && groupName) {
      url += `?group=${encodeURIComponent(groupName)}`;
    }
    return url;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintQR = () => {
    if (!assigningTest) return;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(getShareUrl())}`;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Test Katılım QR Kodu - ${assigningTest.title}</title>
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
                border: 2px solid #eaeaea;
                border-radius: 24px;
                padding: 40px;
                max-width: 400px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.05);
              }
              img {
                width: 240px;
                height: 240px;
                margin: 20px 0;
                border: 1px solid #eee;
                padding: 10px;
                border-radius: 12px;
              }
              h1 { font-size: 22px; margin: 0 0 10px; color: #1e293b; font-weight: 800; }
              p { font-size: 13px; color: #64748b; margin: 0 0 20px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>${assigningTest.title}</h1>
              <p>Testi mobil cihazınızla çözmek için aşağıdaki QR kodu taratın.</p>
              <img src="${qrUrl}" />
              <p style="font-size: 11px; word-break: break-all; color: #94a3b8; font-family: monospace;">${getShareUrl()}</p>
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
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans pb-16">
      {/* Header */}
      <div className="bg-slate-900 text-white py-12 px-6 shadow-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            📋 Hazır Testler & Hızlı Atama
          </h1>
          <p className="text-slate-400 mt-2 text-sm md:text-base max-w-xl">
            Sektör, departman ve pozisyonunuza uygun hazır testleri listeleyin veya kendi özel iş alanınızı saniyeler içinde tasarlayın.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8">
        {/* Ready Tests and Filters */}
        <div className="space-y-8">
          {/* Filters card */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              🔍 Test Filtreleme
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1.5">Sektör</label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 rounded-xl px-3 py-2.5 outline-none text-sm text-slate-700 dark:text-slate-200 focus:border-amber-500"
                >
                  <option value="">Tüm Sektörler</option>
                  {sectors.map((sec) => (
                    <option key={sec.id} value={sec.name}>{sec.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1.5">Departman</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 rounded-xl px-3 py-2.5 outline-none text-sm text-slate-700 dark:text-slate-200 focus:border-amber-500"
                >
                  <option value="">Tüm Departmanlar</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1.5">Pozisyon / Rol</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 rounded-xl px-3 py-2.5 outline-none text-sm text-slate-700 dark:text-slate-200 focus:border-amber-500"
                >
                  <option value="">Tüm Pozisyonlar</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>{role.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={() => {
                  setSelectedSector("");
                  setSelectedDepartment("");
                  setSelectedRole("");
                }}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white"
              >
                Filtreleri Temizle
              </button>
            </div>
          </div>

          {/* Test List Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">
                Uygun Test Şablonları ({filteredTests.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTests.map((test) => (
                <div
                  key={test.id}
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase mb-3 ${
                      test.difficulty === 'Zor' ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                    }`}>
                      {test.difficulty || 'Orta'}
                    </span>
                    <h4 className="font-extrabold text-slate-850 dark:text-white text-base mb-2">
                      {test.title}
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-zinc-500 mb-4">
                      {test.sector} • {test.department} • {test.roleName}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-850/60 pt-4 mt-auto w-full">
                    <span className="text-xs font-bold text-slate-500">
                      {test._count.questions} Senaryo Sorusu
                    </span>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/tests/${test.id}`}
                        target="_blank"
                        className="px-3.5 py-2 bg-slate-100 dark:bg-zinc-850 text-slate-750 dark:text-zinc-300 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-750 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1"
                      >
                        👁️ Görüntüle
                      </Link>
                      <button
                        onClick={() => setAssigningTest(test)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md hover:scale-105 transition-transform"
                      >
                        🚀 Direkt Ata
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredTests.length === 0 && (
                <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-10 text-center text-slate-500">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="font-bold mb-1">Eşleşen hazır test şablonu bulunamadı.</p>
                  <p className="text-xs text-slate-400">Kriterleri temizleyerek veya farklı seçimler yaparak diğer şablonları inceleyebilirsiniz.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Direct Assign Modal */}
      {assigningTest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 relative animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">🚀 Hızlı Test Atama & Paylaşım</h3>
                <p className="text-xs text-slate-400 mt-1">{assigningTest.title}</p>
              </div>
              <button
                onClick={() => {
                  setAssigningTest(null);
                  setCandidateName("");
                  setCandidateEmail("");
                  setGroupName("");
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5">
              {/* Scope Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-2">Paylaşım Kapsamı</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl text-xs font-bold text-center">
                  <button
                    type="button"
                    onClick={() => setAssignScope("SINGLE")}
                    className={`py-2 rounded-lg transition-all ${assignScope === "SINGLE" ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    Tekil Aday
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignScope("COMPANY")}
                    className={`py-2 rounded-lg transition-all ${assignScope === "COMPANY" ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    Şirket Geneli
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignScope("GROUP")}
                    className={`py-2 rounded-lg transition-all ${assignScope === "GROUP" ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    Grup / Ekip
                  </button>
                </div>
              </div>

              {/* Dynamic Inputs based on scope */}
              {assignScope === "SINGLE" && (
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

              {assignScope === "GROUP" && (
                <div className="bg-slate-50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800/80">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Grup / Ekip Adı</label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Örn: 2026_Yaz_Stajyerleri"
                    className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 bg-white dark:bg-zinc-900 outline-none text-xs"
                  />
                </div>
              )}

              {assignScope === "COMPANY" && (
                <div className="bg-slate-50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800/80 space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hedef Şirket Seçin</label>
                    <select
                      value={selectedCompanyId}
                      onChange={(e) => setSelectedCompanyId(e.target.value)}
                      className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 bg-white dark:bg-zinc-900 outline-none text-xs text-slate-700 dark:text-slate-200 focus:border-emerald-500 font-medium"
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
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(getShareUrl())}`}
                    alt="QR Code"
                    className="w-32 h-32 border p-2 bg-white rounded-xl shadow-sm"
                  />
                  <button
                    onClick={handlePrintQR}
                    className="mt-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-800/60 px-3 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-zinc-800 cursor-pointer"
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
                        value={getShareUrl()}
                        className="flex-1 border border-slate-200 dark:border-zinc-850 rounded-xl px-3 py-2 bg-slate-50 dark:bg-zinc-950 text-xs font-mono select-all outline-none"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 rounded-xl cursor-pointer min-w-[70px]"
                      >
                        {copied ? "Kopyalandı" : "Kopyala"}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal">
                    Adaylar bu linke tıklayarak veya QR kodu taratarak doğrudan sınava başlayabilirler.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
