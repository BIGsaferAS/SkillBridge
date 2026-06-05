import { EvaluatorReport } from './evaluators';

export interface FinalDecisionReport {
  profile: string;
  benchmarking: string;
  hireDecision: string;
  developmentAreas: string;
}

export async function runAjan7ProfilUzmani(evalReport: EvaluatorReport): Promise<string> {
  // Mock API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  if (evalReport.score >= 80) {
    return "Mizaç: 'Analitik ve Kararlı'. Stres altında vizyonunu kaybetmeyen, veri odaklı (Data-driven) düşünen ve riskleri izole edebilen sağlam bir psikolojik profil.";
  }
  return "Mizaç: 'Dürtüsel ve Riskten Kaçınan'. Kriz anlarında paniğe kapılarak kolay yolu seçen, stratejik derinlikten yoksun ve yönlendirilmeye aşırı açık bir profil.";
}

export async function runAjan8KiyaslamaMotoru(score: number): Promise<string> {
  // Mock API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const idealScore = 85;
  const difference = score - idealScore;
  
  if (difference >= 0) {
    return `İdeal Aday Profilinden %${difference} daha yüksek puana sahip. Sistemdeki en iyi %10'luk dilimde (Top 10th Percentile). Mükemmel uyum (Cultural & Technical Fit).`;
  }
  return `İdeal Aday Profilinin %${Math.abs(difference)} gerisinde kaldı. Şirket standartlarının ve pazar ortalamasının alt çeyreğinde yer alıyor.`;
}

export async function runAjan9Mentor(
  evalReport: EvaluatorReport, 
  profile: string, 
  benchmarking: string
): Promise<FinalDecisionReport> {
  // Mock API delay
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  const isHire = evalReport.score >= 66;
  
  return {
    profile,
    benchmarking,
    hireDecision: isHire ? "✅ İŞE ALIM OLUMLU (HIRE)" : "❌ İŞE ALIM OLUMSUZ (NO-HIRE)",
    developmentAreas: isHire 
      ? "Liderlik becerileri (Executive Presence) ve C-Level müzakere teknikleri üzerine ileri düzey koçluk alması önerilir. Potansiyeli çok yüksek." 
      : "Satış metodolojileri (MEDDPICC/SPIN) teorisinde ve pratik itiraz yönetiminde (Objection Handling) ciddi eksikleri var. Temel eğitime geri dönmeli."
  };
}
