import { generatePrompt } from '../utils/templateEngine';

export interface AiTestResponse {
  question: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

export interface CaseAnalysisQuestion {
  id: number;
  question: string;
  options: string[];
  expectedAnswer: string;
  explanation: string;
}

export interface CaseAnalysisResponse {
  caseText: string;
  questions: CaseAnalysisQuestion[];
}

export async function generateTestQuestion(
  sector: string,
  department: string,
  role: string,
  competencies: string[]
): Promise<{ prompt: string; result: AiTestResponse }> {
  const prompt = generatePrompt(sector, department, role, competencies);
  
  await new Promise((resolve) => setTimeout(resolve, 1500));

  let result: AiTestResponse;

  if (sector.includes('Teknoloji')) {
    result = {
      question: `Mikroservis mimarisine geçiş sürecinde, servisler arası iletişimin kopması durumunda "${competencies[0] || 'Problem Çözme'}" yetkinliğinizi nasıl sergilersiniz?`,
      options: [
        { key: 'A', text: 'Tüm sistemi kapatıp baştan başlatırım.' },
        { key: 'B', text: 'Circuit Breaker (Devre Kesici) pattern uygulayarak hatanın yayılmasını önlerim.' },
        { key: 'C', text: 'Logları silerek hatanın kaydını gizlerim.' },
        { key: 'D', text: 'Monolitik yapıya geri dönerim.' }
      ],
      correctAnswer: 'B',
      explanation: 'Circuit Breaker, servisler arası kriz anında en uygun teknik yaklaşımdır.'
    };
  } else {
    result = {
      question: `${role} rolünde "${competencies[0] || 'Kalite Kontrol'}" yetkinliğini en iyi hangi aksiyon yansıtır?`,
      options: [
        { key: 'A', text: 'Teorik çerçevede kalmak' },
        { key: 'B', text: 'Veriye dayalı karar alıp anında uygulamak' },
        { key: 'C', text: 'İnisiyatif almaktan kaçınmak' },
        { key: 'D', text: 'Süreci uzatmak' }
      ],
      correctAnswer: 'B',
      explanation: 'Veriye dayalı pratik çözümler en iyi yetkinlik göstergesidir.'
    };
  }

  return { prompt, result };
}

export async function generateCaseAnalysis(
  sector: string,
  department: string,
  role: string,
  competencies: string[]
): Promise<{ prompt: string; result: CaseAnalysisResponse }> {
  const compStr = competencies.join(', ');
  const prompt = `VAKA ANALİZİ: Senaryo tabanlı bir değerlendirme oluştur. Sektör: ${sector}, Rol: ${role}. Ölçülecek yetkinlikler: ${compStr}. Kısa bir iş senaryosu ve ardından adayın 'Evet' veya 'Hayır' diyerek tutarlılığını kanıtlayacağı 3 adet soru üret.`;

  await new Promise((resolve) => setTimeout(resolve, 2000));

  let result: CaseAnalysisResponse;

  if (sector.includes('Teknoloji')) {
    result = {
      caseText: "Şirketinizin ana sunucularında cuma akşamı saat 17:45'te beklenmedik bir veritabanı yavaşlaması tespit edildi. CPU kullanımı %95'lerde ve müşteri işlemleri zaman aşımına uğruyor. Sistemi 1 saat içinde stabilize etmeniz veya bakım moduna almanız gerekiyor.",
      questions: [
        { id: 1, question: "Kullanıcı etkisini minimuma indirmek için önce sistemi bakım moduna alıp trafiği durdurur musunuz?", options: [], expectedAnswer: "Evet", explanation: "Sorun büyümeden trafiği kesmek veri kaybını önler." },
        { id: 2, question: "Bakım modundayken, yavaşlamanın kök nedenini bulmak için tüm logları silip sistemi sıfırdan başlatır mısınız?", options: [], expectedAnswer: "Hayır", explanation: "Logların silinmesi sorunun kaynağını bulmayı imkansız kılar. Tutarsız bir karar." },
        { id: 3, question: "Sistem loglarını inceleyip yavaşlamaya neden olan sorguyu tespit ettikten sonra sadece o servise kısıtlama (rate limit) getirerek sistemi tekrar açar mısınız?", options: [], expectedAnswer: "Evet", explanation: "Kök nedeni izole edip sistemi güvenle açmak en iyi pratiktir." }
      ]
    };
  } else {
    result = {
      caseText: "Yeni bir ürün lansmanı sırasında tedarikçi firmasından kaynaklı kritik bir malzeme eksikliği yaşandı. Lansmana 2 gün var ve üretim hattı durma noktasına geldi. Hem maliyeti kontrol altında tutmanız hem de teslimatı yetiştirmeniz gerekiyor.",
      questions: [
        { id: 1, question: "Lansmanı ertelemek yerine derhal alternatif yerel tedarikçilerle daha yüksek maliyetli ancak hızlı teslimat için iletişime geçer misiniz?", options: [], expectedAnswer: "Evet", explanation: "Zaman kısıtı maliyetten daha kritik olduğunda inisiyatif alınmalıdır." },
        { id: 2, question: "Yerel tedarikçi ile anlaşma sağladıktan sonra, asıl tedarikçiye bilgi vermeden sözleşmeyi tek taraflı fesheder misiniz?", options: [], expectedAnswer: "Hayır", explanation: "Sözleşme feshi hukuki problemlere yol açar. Profesyonel iletişim şarttır." },
        { id: 3, question: "Lansman sonrasında tedarik zinciri risklerini azaltmak için gelecekte her zaman en az 2 onaylı tedarikçi ile çalışma kuralı getirir misiniz?", options: [], expectedAnswer: "Evet", explanation: "Krizden ders çıkarıp süreci optimize etmek stratejik bir karardır." }
      ]
    };
  }

  return { prompt, result };
}
