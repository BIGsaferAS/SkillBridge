import { CaseAnalysisResponse } from '../aiService';

export interface EvaluatorReport {
  timeSpentSec: number;
  score: number;
  wrongAnswers: { question: string, candidateAnswer: string, expectedAnswer: string }[];
  flawAnalysis: string;
}

export async function runAjan4SinavSorumlusu(durationSec: number): Promise<number> {
  // Mock API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  return durationSec;
}

export async function runAjan5Optik(
  caseResult: CaseAnalysisResponse, 
  userAnswers: string[]
): Promise<{ score: number, wrongs: any[] }> {
  // Mock API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  let correctCount = 0;
  const wrongs: any[] = [];
  
  caseResult.questions.forEach((q, idx) => {
    if (userAnswers[idx] === q.expectedAnswer) {
      correctCount++;
    } else {
      wrongs.push({ question: q.question, candidateAnswer: userAnswers[idx], expectedAnswer: q.expectedAnswer });
    }
  });
  
  const score = Math.round((correctCount / caseResult.questions.length) * 100);
  return { score, wrongs };
}

export async function runAjan6HataDedektoru(wrongs: any[]): Promise<string> {
  if (wrongs.length === 0) {
    return "Aday kusursuz bir performans sergiledi. Hiçbir çeldiriciye düşmeyerek mesleki reflekslerinin çok güçlü olduğunu kanıtladı.";
  }
  
  const res = await fetch('/api/agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId: 'AJAN_6', input: wrongs })
  });
  const data = await res.json();
  return data.result;
}
