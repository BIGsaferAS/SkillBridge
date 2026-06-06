'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminHeader from '@/components/AdminHeader';
import TestShareButton from '@/components/TestShareButton';

interface Message {
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

export default function QrAgentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tests, setTests] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Chat States
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'agent',
      text: 'Merhaba! Ben Ajan 11 (Barkod & Sınav Koordinatörünüz). Sınavlarınızı adaylara, departmanlara veya şirket geneline QR kodlar/barkodlar ve özel bağlantılar vasıtasıyla ulaştırmanıza yardımcı olmak için buradayım.\n\nNasıl yardımcı olabilirim? Örneğin bana "Adaylar için bir davet e-postası hazırla" diyebilir veya bağlantı yapıları hakkında sorular sorabilirsiniz.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    try {
      const [testsRes, resultsRes] = await Promise.all([
        fetch('/api/tests'),
        fetch('/api/results')
      ]);

      if (testsRes.ok) setTests(await testsRes.json());
      if (resultsRes.ok) setResults(await resultsRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      const role = (session?.user as any)?.role;
      if (role !== 'ADMIN' && role !== 'COMPANY_MANAGER' && role !== 'SUPER_ADMIN') {
        router.push('/login');
      } else {
        fetchData();
      }
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return;

    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsSending(true);

    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'AJAN_11',
          input: {
            request: textToSend,
            systemStats: {
              activeTestsCount: tests.length,
              completedCount: results.length
            }
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, {
          sender: 'agent',
          text: data.result,
          timestamp: new Date()
        }]);
      } else {
        setMessages(prev => [...prev, {
          sender: 'agent',
          text: `Bir hata oluştu: ${data.error || 'Bilinmeyen hata'}`,
          timestamp: new Date()
        }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        sender: 'agent',
        text: 'Bağlantı hatası oluştu. Lütfen Gemini API anahtarınızı kontrol edin.',
        timestamp: new Date()
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSuggestedPrompt = (promptText: string) => {
    handleSendMessage(promptText);
  };

  // Filter out recent guest (or all) results to display audit log
  const guestAttempts = results.slice(0, 10);

  if (status === 'loading' || isLoading) {
    return <div className="p-10 text-center text-slate-500">Yükleniyor...</div>;
  }

  const companyId = (session?.user as any)?.companyId;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black">
      <AdminHeader userName={(session?.user as any)?.name || 'Yönetici'} />

      <main className="max-w-7xl mx-auto p-6 mt-4 space-y-6">
        
        {/* Üst Başlık */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              🤖 Ajan 11: Barkod & Sınav Dağıtım Terminali
            </h1>
            <p className="text-slate-500 mt-1">Sınavlarınızın QR kod/barkod dağıtım süreçlerini otomatize edin ve Ajan 11 ile yönetin.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/tests" className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 shadow-sm transition-colors">
              Geri Dön (Testler)
            </Link>
          </div>
        </div>

        {/* Ana Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sol Panel: Chat Terminali */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col h-[650px] overflow-hidden">
            {/* Terminal Header */}
            <div className="bg-purple-950 text-purple-200 px-6 py-4 flex items-center justify-between border-b border-purple-900">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-mono text-xs font-bold uppercase tracking-wider">Ajan 11: Active and Listening</span>
              </div>
              <span className="text-xs opacity-75 font-semibold bg-purple-900/50 px-2 py-0.5 rounded-md">Vaka & Barkod Entegrasyonu</span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-950 text-slate-100 font-mono text-sm leading-relaxed">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-purple-700 text-white rounded-tr-none'
                      : 'bg-zinc-800 text-slate-100 rounded-tl-none border border-zinc-700/50'
                  }`}>
                    <span className="text-[10px] opacity-50 block mb-1.5">
                      {msg.sender === 'user' ? 'YÖNETİCİ' : 'AJAN_11'} - {msg.timestamp.toLocaleTimeString()}
                    </span>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex items-center gap-2 text-purple-400 animate-pulse italic">
                  <span>🤖</span> Ajan 11 düşünüyor ve taslak hazırlıyor...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="p-4 bg-slate-900 border-t border-zinc-800 flex flex-wrap gap-2">
              <button 
                onClick={() => handleSuggestedPrompt("Adaylar için barkodlu sınav davet e-postası tasarla.")}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-purple-300 border border-purple-900/50 px-3 py-1.5 rounded-full transition-colors font-mono"
              >
                📧 Davet E-postası Hazırla
              </button>
              <button 
                onClick={() => handleSuggestedPrompt("QR kod çözümlerinde grup bazlı katılım analizi nasıl çalışır?")}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-purple-300 border border-purple-900/50 px-3 py-1.5 rounded-full transition-colors font-mono"
              >
                📊 Grup Katılım Analizi
              </button>
              <button 
                onClick={() => handleSuggestedPrompt("Kullanıcıların sınav çözme bağlantılarını oluşturma standartlarını açıkla.")}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-purple-300 border border-purple-900/50 px-3 py-1.5 rounded-full transition-colors font-mono"
              >
                🔗 Bağlantı Standartları
              </button>
            </div>

            {/* Message Input */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
              className="p-4 bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 flex gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Ajan 11'e talimat verin (örn: 'Sınav e-postası yaz')..."
                className="flex-1 px-4 py-3 border rounded-xl text-sm bg-slate-50 dark:bg-zinc-900 dark:border-zinc-800 focus:ring-2 focus:ring-purple-500 outline-none font-mono"
              />
              <button 
                type="submit"
                disabled={isSending || !inputValue.trim()}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                Gönder ➔
              </button>
            </form>
          </div>

          {/* Sağ Panel: Dağıtım Kontrolleri & Audit Log */}
          <div className="space-y-6">
            
            {/* Kart 1: Hızlı Barkod Dağıtımı */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                🔗 Dağıtılabilir Sınavlar ({tests.length})
              </h2>
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {tests.map(test => (
                  <div key={test.id} className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800 flex justify-between items-center gap-2">
                    <div className="truncate">
                      <div className="font-bold text-xs text-slate-800 dark:text-zinc-200 truncate">{test.title}</div>
                      <div className="text-[10px] text-slate-500">{test.roleName} - {test.department}</div>
                    </div>
                    <div className="shrink-0">
                      <TestShareButton 
                        testId={test.id}
                        testTitle={test.title}
                        companyId={companyId}
                      />
                    </div>
                  </div>
                ))}
                {tests.length === 0 && (
                  <p className="text-sm text-slate-500 italic">Sistemde test bulunmamaktadır.</p>
                )}
              </div>
            </div>

            {/* Kart 2: Son QR Girişleri & Çözümleri */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm flex-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                👥 Son QR Katılımları (Audit)
              </h2>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {guestAttempts.map(attempt => {
                  const isAnon = (attempt.user?.email || '').includes('anonim');
                  return (
                    <div key={attempt.id} className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isAnon ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {isAnon ? 'Anonim Giriş' : 'Aday'}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 ml-1.5 block md:inline-block truncate max-w-[120px]">{attempt.user?.name}</span>
                        </div>
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">%{attempt.score}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{attempt.user?.email}</div>
                      <div className="text-[9px] text-slate-400">{attempt.roleName || 'Genel Test'}</div>
                    </div>
                  );
                })}
                {guestAttempts.length === 0 && (
                  <p className="text-sm text-slate-500 italic">Henüz bir çözüm bulunmamaktadır.</p>
                )}
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
