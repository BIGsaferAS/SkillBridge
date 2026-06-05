"use client";

import { useState, useMemo, useEffect } from 'react';
import taxonomyDataRaw from '../data/taxonomy.json';
import { TaxonomyData } from '../types/taxonomy';
import { generateTestQuestion, AiTestResponse, CaseAnalysisResponse } from '../services/aiService';
import { runAjan1Arastirmaci, runAjan2Yazar, runAjan3SoruTasarimcisi } from '../services/pipeline/creators';
import { runAjan4SinavSorumlusu, runAjan5Optik, runAjan6HataDedektoru, EvaluatorReport } from '../services/pipeline/evaluators';
import { runAjan7ProfilUzmani, runAjan8KiyaslamaMotoru, runAjan9Mentor, FinalDecisionReport } from '../services/pipeline/analysts';

const taxonomyData = taxonomyDataRaw as TaxonomyData;

type TestType = 'MULTIPLE_CHOICE' | 'CASE_ANALYSIS';
type PipelineState = 'IDLE' | 'AJAN_1' | 'AJAN_2' | 'AJAN_3' | 'TEST_READY' | 'AJAN_4' | 'AJAN_5' | 'AJAN_6' | 'AJAN_7' | 'AJAN_8' | 'AJAN_9' | 'FINISHED';

import { ThemeToggle } from "./ThemeToggle"

export default function SkillCreator({ predefinedJob, cvText }: { predefinedJob?: any, cvText?: string }) {
  const [testType, setTestType] = useState<TestType>('MULTIPLE_CHOICE');
  
  const [selectedSectorId, setSelectedSectorId] = useState<string>('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineState, setPipelineState] = useState<PipelineState>('IDLE');
  
  // Multiple Choice State
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<AiTestResponse | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [evalResult, setEvalResult] = useState<{ isCorrect: boolean; message: string } | null>(null);

  // Case Analysis State
  const [caseResult, setCaseResult] = useState<CaseAnalysisResponse | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [caseAnswers, setCaseAnswers] = useState<string[]>([]);
  const [caseFinished, setCaseFinished] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  
  // Final Evaluation State
  const [evaluatorReport, setEvaluatorReport] = useState<EvaluatorReport | null>(null);
  const [finalReport, setFinalReport] = useState<FinalDecisionReport | null>(null);

  const selectedSector = useMemo(() => {
    if (predefinedJob) {
      return { id: predefinedJob.sector, name: predefinedJob.sector, departments: [] };
    }
    return taxonomyData.sectors.find(s => s.id === selectedSectorId) || { id: "", name: "", departments: [] };
  }, [selectedSectorId, predefinedJob]);

  const selectedDepartment = useMemo(() => {
    if (predefinedJob) {
      return { id: predefinedJob.department, name: predefinedJob.department, roles: [] };
    }
    return (selectedSector as any)?.departments?.find((d: any) => d.id === selectedDepartmentId) || { id: "", name: "", roles: [] };
  }, [selectedSector, selectedDepartmentId, predefinedJob]);

  const [customRole, setCustomRole] = useState<any>(null);
  const selectedRole = useMemo(() => {
    if (predefinedJob) {
      return customRole || { id: "", name: "", competencies: [] };
    }
    return (selectedDepartment as any)?.roles?.find((r: any) => r.id === selectedRoleId) || { id: "", name: "", competencies: [] };
  }, [selectedDepartment, selectedRoleId, predefinedJob, customRole]);

  const resetState = () => {
    setGeneratedPrompt(null);
    setTestResult(null);
    setSelectedAnswer(null);
    setEvalResult(null);
    setCaseResult(null);
    setCurrentQuestionIndex(0);
    setCaseAnswers([]);
    setVoiceTranscript("");
    setIsListening(false);
    setCaseFinished(false);
    setEvaluatorReport(null);
    setFinalReport(null);
    setPipelineState('IDLE');
  };

  const [agent10Note, setAgent10Note] = useState<string>('');

  useEffect(() => {
    if (predefinedJob) {
      setSelectedSectorId(predefinedJob.sector);
      setSelectedDepartmentId(predefinedJob.department);
      setCustomRole({ name: predefinedJob.roleName, competencies: JSON.parse(predefinedJob.competencies) });
      
      if (cvText) {
        setAgent10Note("Ajan 10 (CV Tarayıcı) çalışıyor...");
        fetch('/api/agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId: 'AJAN_10', input: { job: predefinedJob, cvText } })
        }).then(res => res.json()).then(data => {
          if(data.result?.focusAreas) {
            setAgent10Note("CV Analiz Edildi. Odak Noktaları: " + data.result.focusAreas.join(", "));
          }
        })
      }
    }
  }, [predefinedJob, cvText])

  const handleGenerate = async () => {
    if (!selectedRole && !predefinedJob) return;
    
    setIsLoading(true);
    resetState();

    try {
      if (testType === 'MULTIPLE_CHOICE') {
        const { prompt, result } = await generateTestQuestion(selectedSector.name, selectedDepartment.name, selectedRole.name, selectedRole.competencies);
        setGeneratedPrompt(prompt);
        setTestResult(result);
      } else {
        setPipelineState('AJAN_1');
        const researchNotes = await runAjan1Arastirmaci(selectedRole.name, selectedRole.competencies);
        if (researchNotes.error) throw new Error(researchNotes.error);
        
        setPipelineState('AJAN_2');
        const caseText = await runAjan2Yazar(researchNotes);
        if (caseText.error) throw new Error(caseText.error);
        
        setPipelineState('AJAN_3');
        const finalCaseResult = await runAjan3SoruTasarimcisi(caseText);
        if (finalCaseResult.error) throw new Error(finalCaseResult.error);
        
        setPipelineState('TEST_READY');
        setCaseResult(finalCaseResult);
      }
    } catch (error: any) {
      console.error(error);
      alert("HATA: " + (error.message || "Bilinmeyen bir hata oluştu. API anahtarınızı kontrol edin."));
      setPipelineState('IDLE');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (key: string) => {
    if (!testResult) return;
    setSelectedAnswer(key);
    if (key === testResult.correctAnswer) {
      setEvalResult({ isCorrect: true, message: "Tebrikler! Doğru cevap. Puan: 5 (Mükemmel)" });
    } else {
      setEvalResult({ isCorrect: false, message: `Hatalı. Doğru cevap ${testResult.correctAnswer} olmalıydı. Puan: 1 (Geliştirilmeli)` });
    }
  };

  const handleCaseAnswer = async (answer: string) => {
    if (!caseResult) return;
    const newAnswers = [...caseAnswers, answer];
    setCaseAnswers(newAnswers);
    
    if (currentQuestionIndex < caseResult.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setCaseFinished(true);
      await runEvaluatorPipeline(newAnswers);
    }
  };

  const handleCaseAnswerSubmit = () => {
    if (!voiceTranscript.trim()) return;
    handleCaseAnswer(voiceTranscript);
    setVoiceTranscript("");
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tarayıcınız ses tanımayı desteklemiyor. Google Chrome kullanın.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceTranscript(prev => (prev + " " + transcript).trim());
    };
    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const runEvaluatorPipeline = async (finalAnswers: string[]) => {
    if (!caseResult) return;
    
    try {
      setPipelineState('AJAN_4');
      const duration = await runAjan4SinavSorumlusu(120); // Mock 120s
      
      setPipelineState('AJAN_5');
      const { score, wrongs } = await runAjan5Optik(caseResult, finalAnswers);
      
      setPipelineState('AJAN_6');
      const flawAnalysis = await runAjan6HataDedektoru(wrongs);
      
      const evalReport: EvaluatorReport = { timeSpentSec: duration, score, wrongAnswers: wrongs, flawAnalysis };
      setEvaluatorReport(evalReport);
      
      setPipelineState('AJAN_7');
      const profile = await runAjan7ProfilUzmani(evalReport);
      
      setPipelineState('AJAN_8');
      const benchmarking = await runAjan8KiyaslamaMotoru(score);
      
      setPipelineState('AJAN_9');
      const finalRes = await runAjan9Mentor(evalReport, profile, benchmarking);
      
      try {
        await fetch('/api/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: "aday" + Math.floor(Math.random()*1000) + "@test.com",
            name: "Demo Aday",
            sector: selectedSector.name,
            department: selectedDepartment.name,
            roleName: selectedRole.name,
            score: score,
            profileAnalysis: profile,
            benchmarking: benchmarking,
            hireDecision: finalRes.hireDecision.includes("NO-HIRE") || finalRes.hireDecision.includes("RED") ? "NO-HIRE" : "HIRE",
            developmentAreas: finalRes.developmentAreas,
            flawAnalysis: flawAnalysis
          })
        });
      } catch (e) {
        console.error("DB Kayıt Hatası", e);
      }

      setFinalReport(finalRes);
      setPipelineState('FINISHED');
      
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 bg-white rounded-xl shadow-lg mt-10 text-slate-800">
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            SkillBridge AI
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Yapay Zeka Destekli Yetkinlik Analizi</p>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex justify-center space-x-4 mb-4">
        <button 
          className={`px-4 py-2 rounded-full font-medium transition-colors border ${testType === 'MULTIPLE_CHOICE' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-300'}`}
          onClick={() => { setTestType('MULTIPLE_CHOICE'); resetState(); }}
        >
          Çoktan Seçmeli Test
        </button>
        <button 
          className={`px-4 py-2 rounded-full font-medium transition-colors border ${testType === 'CASE_ANALYSIS' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-300'}`}
          onClick={() => { setTestType('CASE_ANALYSIS'); resetState(); }}
        >
          Vaka Analizi (Pipeline Modu)
        </button>
      </div>

      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
        <h2 className="text-xl font-semibold mb-4 text-slate-700">1. Taksonomi Seçimi</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sektör</label>
            <select 
              className="w-full border border-slate-300 rounded-md p-2 bg-white"
              value={selectedSectorId}
              onChange={(e) => { setSelectedSectorId(e.target.value); setSelectedDepartmentId(''); setSelectedRoleId(''); }}
            >
              <option value="">Seçiniz</option>
              {taxonomyData.sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Departman</label>
            <select 
              className="w-full border border-slate-300 rounded-md p-2 bg-white disabled:bg-slate-100"
              value={selectedDepartmentId}
              disabled={!selectedSector}
              onChange={(e) => { setSelectedDepartmentId(e.target.value); setSelectedRoleId(''); }}
            >
              <option value="">Seçiniz</option>
              {selectedSector?.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rol / Pozisyon</label>
            <select 
              className="w-full border border-slate-300 rounded-md p-2 bg-white disabled:bg-slate-100"
              value={selectedRoleId}
              disabled={!selectedDepartment}
              onChange={(e) => setSelectedRoleId(e.target.value)}
            >
              <option value="">Seçiniz</option>
              {(selectedDepartment as any)?.roles?.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-end space-y-4">
          {agent10Note && (
            <div className="w-full bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 p-4 rounded-lg text-sm border border-blue-200 dark:border-blue-800">
              <strong>🎯 Ajan 10 (CV Tarayıcı):</strong> {agent10Note}
            </div>
          )}
          <button 
            disabled={(!selectedRole && !predefinedJob) || isLoading}
            onClick={handleGenerate}
            className={`text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 transition-colors ${testType === 'MULTIPLE_CHOICE' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}`}
          >
            {isLoading ? 'Üretiliyor...' : `Yapay Zeka ${testType === 'MULTIPLE_CHOICE' ? 'Testi' : 'Vakası'} Üret`}
          </button>
        </div>
      </div>

      {testType === 'CASE_ANALYSIS' && pipelineState !== 'IDLE' && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 text-purple-700">Cascade Pipeline: Grup 1 (Üreticiler)</h2>
          <div className="space-y-4">
            {['AJAN_1', 'AJAN_2', 'AJAN_3'].map((state, idx) => {
              const isActive = pipelineState === state;
              const isPast = ['TEST_READY', 'AJAN_4', 'AJAN_5', 'AJAN_6', 'AJAN_7', 'AJAN_8', 'AJAN_9', 'FINISHED'].includes(pipelineState) || (state === 'AJAN_1' && pipelineState !== 'AJAN_1') || (state === 'AJAN_2' && pipelineState === 'AJAN_3');
              return (
                <div key={state} className={`flex items-center p-3 rounded-md border ${isActive ? 'bg-blue-50 border-blue-300 animate-pulse' : isPast ? 'bg-green-50 border-green-300' : 'bg-slate-50 border-slate-200 opacity-50'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${isActive ? 'bg-blue-500 text-white' : isPast ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-500'}`}>{idx + 1}</div>
                  <div>
                    <h3 className="font-bold text-slate-700">Ajan {idx + 1} {['(Araştırmacı)', '(Yazar - Editör)', '(Soru Tasarımcısı)'][idx]}</h3>
                    <p className="text-sm text-slate-500">{isActive ? 'Çalışıyor...' : isPast ? 'Tamamlandı.' : 'Bekliyor...'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {testType === 'CASE_ANALYSIS' && (pipelineState === 'TEST_READY' || caseFinished) && caseResult && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm animate-fade-in">
          <h2 className="text-xl font-semibold mb-4 text-emerald-700">Değerlendirme: Aday Sınavda</h2>
          
          <div className="bg-slate-100 p-5 rounded-md border-l-4 border-emerald-500 mb-6 whitespace-pre-wrap">
            <h3 className="font-bold text-slate-700 mb-2">Senaryo (Ajan 2'nin Kaleminden):</h3>
            <p className="text-slate-800 leading-relaxed">{caseResult.caseText}</p>
          </div>

          {!caseFinished ? (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-lg text-slate-800">Soru {currentQuestionIndex + 1} / {caseResult.questions.length}</h4>
              </div>
              <p className="text-lg text-slate-700 mb-6 font-medium">{caseResult.questions[currentQuestionIndex].question}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caseResult.questions[currentQuestionIndex].options?.map((opt: string) => (
                  <button 
                    key={opt}
                    onClick={() => handleCaseAnswer(opt)} 
                    className="py-4 px-6 text-left border-2 border-indigo-200 bg-indigo-50 text-indigo-800 rounded-lg hover:bg-indigo-100 font-medium text-lg hover:border-indigo-400 transition-colors shadow-sm"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-emerald-50 text-emerald-800 rounded-md text-center font-semibold">Test tamamlandı. Cevaplarınız ajanlara gönderiliyor...</div>
          )}
        </div>
      )}

      {testType === 'CASE_ANALYSIS' && caseFinished && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mt-6">
          <h2 className="text-xl font-semibold mb-6 text-indigo-700">Cascade Pipeline: Grup 2 & Grup 3 (Analiz)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-4">
              <h3 className="font-bold text-slate-600 uppercase text-xs tracking-widest">Grup 2 (Değerlendiriciler)</h3>
              {['AJAN_4', 'AJAN_5', 'AJAN_6'].map((state, idx) => {
                const isActive = pipelineState === state;
                const isPast = ['AJAN_5', 'AJAN_6', 'AJAN_7', 'AJAN_8', 'AJAN_9', 'FINISHED'].includes(pipelineState) && state !== pipelineState;
                return (
                  <div key={state} className={`flex items-center p-3 rounded-md border ${isActive ? 'bg-indigo-50 border-indigo-300 animate-pulse' : isPast ? 'bg-green-50 border-green-300' : 'bg-slate-50 border-slate-200 opacity-50'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${isActive ? 'bg-indigo-500 text-white' : isPast ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-500'}`}>{idx + 4}</div>
                    <div>
                      <h3 className="font-bold text-slate-700">Ajan {idx + 4} {['(Sınav Sorumlusu)', '(Optik)', '(Hata Dedektörü)'][idx]}</h3>
                      <p className="text-sm text-slate-500">{isActive ? 'Çalışıyor...' : isPast ? 'Tamamlandı.' : 'Bekliyor...'}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-600 uppercase text-xs tracking-widest">Grup 3 (Analistler)</h3>
              {['AJAN_7', 'AJAN_8', 'AJAN_9'].map((state, idx) => {
                const isActive = pipelineState === state;
                const isPast = ['AJAN_8', 'AJAN_9', 'FINISHED'].includes(pipelineState) && state !== pipelineState;
                return (
                  <div key={state} className={`flex items-center p-3 rounded-md border ${isActive ? 'bg-indigo-50 border-indigo-300 animate-pulse' : isPast ? 'bg-green-50 border-green-300' : 'bg-slate-50 border-slate-200 opacity-50'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${isActive ? 'bg-indigo-500 text-white' : isPast ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-500'}`}>{idx + 7}</div>
                    <div>
                      <h3 className="font-bold text-slate-700">Ajan {idx + 7} {['(Profil Uzmanı)', '(Kıyaslama Motoru)', '(Gelişim Mentoru)'][idx]}</h3>
                      <p className="text-sm text-slate-500">{isActive ? 'Çalışıyor...' : isPast ? 'Tamamlandı.' : 'Bekliyor...'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
          </div>
        </div>
      )}

      {pipelineState === 'FINISHED' && finalReport && evaluatorReport && (
        <div className="bg-slate-800 text-white p-8 rounded-xl shadow-2xl mt-8 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-700 pb-6 mb-6">
            <div>
              <h2 className="text-3xl font-bold">Ajan 9: Mentor Raporu</h2>
              <p className="text-slate-400 mt-1">Sınav ve Profil Analizi Sonucu</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black text-emerald-400">%{evaluatorReport.score}</div>
              <p className="text-slate-400 text-sm">Başarı Skoru</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-300 mb-3 border-l-4 border-blue-500 pl-3">Ajan 7 (Psikolojik Profil)</h3>
              <p className="text-slate-200 leading-relaxed bg-slate-700 p-4 rounded-lg">{finalReport.profile}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-300 mb-3 border-l-4 border-purple-500 pl-3">Ajan 8 (Kıyaslama / Benchmark)</h3>
              <p className="text-slate-200 leading-relaxed bg-slate-700 p-4 rounded-lg">{finalReport.benchmarking}</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-slate-300 mb-3 border-l-4 border-red-500 pl-3">Ajan 6 (Hata Haritası)</h3>
              <p className="text-slate-200 leading-relaxed bg-slate-700 p-4 rounded-lg">{evaluatorReport.flawAnalysis}</p>
            </div>
            <div className="md:col-span-2 bg-slate-900 p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-bold mb-4 text-center">Nihai İK Kararı</h3>
              <div className={`text-2xl font-black text-center mb-4 ${finalReport.hireDecision.includes('OLUMLU') ? 'text-emerald-400' : 'text-rose-400'}`}>
                {finalReport.hireDecision}
              </div>
              <p className="text-center text-slate-300"><strong>Gelişim Tavsiyesi:</strong> {finalReport.developmentAreas}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
