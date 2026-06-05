import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const companyId = session?.user ? (session.user as any).companyId : null;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Lütfen .env dosyasına GEMINI_API_KEY ekleyin." }, { status: 401 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Oturumu ve adayları getir
    const compSession = await prisma.comparisonSession.findUnique({
      where: { id },
      include: { candidates: true }
    });

    if (!compSession) {
      return NextResponse.json({ error: "Karşılaştırma oturumu bulunamadı." }, { status: 404 });
    }

    let validCompanyId = null;
    if (companyId) {
      const company = await prisma.company.findUnique({ where: { id: companyId } });
      if (company) validCompanyId = companyId;
    }

    if (validCompanyId && compSession.companyId !== validCompanyId) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
    }

    // Yalnızca SUBMITTED olan veya zaten EVALUATED olan adayları karşılaştırabiliriz
    const validCandidates = compSession.candidates.filter(
      c => c.status === "SUBMITTED" || c.status === "EVALUATED"
    );

    if (validCandidates.length === 0) {
      return NextResponse.json({ error: "Karşılaştırma yapmak için cevap doldurmuş en az 1 aday olmalıdır." }, { status: 400 });
    }

    // --- STEP 1: Ajan K1 (Gereksinim Analisti) ---
    const k1Prompt = `Sen Karşılaştırma Ajanı 1 (Kriter Analisti) rolündesin. 
    Aşağıdaki ${compSession.type === "RECRUITMENT" ? "İş İlanı Görev Tanımını" : "Terfi Kriterlerini ve Tecrübe Tanımını"} analiz et:
    "${compSession.requirements}"
    Bu kriterlere göre adayları değerlendirmek için kullanılacak en kritik 5 yetkinlik/kriter listesini JSON dizisi olarak çıkar.
    Kesinlikle geçerli JSON formatında dön. Markdown tagleri (\`\`\`json) KULLANMA.
    Format: {"criteriaList": ["yetkinlik1", "yetkinlik2", ...]}`;

    const k1Result = await model.generateContent(k1Prompt);
    const k1Text = k1Result.response.text();
    let criteriaList: string[] = [];
    try {
      const cleanK1 = k1Text.replace(/```json/g, '').replace(/```/g, '').trim();
      criteriaList = JSON.parse(cleanK1).criteriaList || [];
    } catch (e) {
      console.error("K1 Parse error:", k1Text);
      criteriaList = ["Teknik Yetkinlikler", "Deneyim Süresi", "Proje Başarıları", "Çalışma Metotları", "Davranışsal Uyum"];
    }

    // --- STEP 2: Ajan K2-K9 (Aday Değerlendirmeleri) ---
    const candidateEvaluations: Record<string, any> = {};

    for (const cand of validCandidates) {
      const evalPrompt = `Sen Karşılaştırma Platformunun 2'den 9'a kadar olan değerlendirme ajanlarını (K2: Profil Oluşturucu, K3: Teknik Yetkinlik Uyumlaştırıcı, K4: Tecrübe Analisti, K5: Proje Skorer, K6: Metot Analisti, K7: Kültür Profiler, K8: Risk Dedektörü, K9: Puanlama Motoru) temsil ediyorsun.
      
      Oturum Türü: ${compSession.type === "RECRUITMENT" ? "İşe Alım" : "Terfi"}
      Oturum Kriterleri (Ajan K1): ${JSON.stringify(criteriaList)}
      
      Aday Adı: ${cand.name}
      Adayın Gönderdiği Bilgiler (CV veya İş Bitirme Dokümanı):
      "${cand.submittedData}"
      
      Lütfen bu adayı kriterler doğrultusunda analiz et ve Ajan K2-K9 rollerini üstlenerek aşağıdaki JSON formatında bir değerlendirme sun.
      Kesinlikle geçerli JSON döndür. Markdown tagleri KULLANMA.
      Format:
      {
        "profileSummary": "Adayın tecrübe, teknik beceri ve geçmişini özetleyen 2-3 cümle.",
        "technicalScore": 85,
        "experienceScore": 75,
        "projectScore": 80,
        "methodologyScore": 70,
        "behavioralTraits": "Adayın problem çözme ve iletişim üslubuna dair davranışsal özet.",
        "riskAssessment": "Varsa profil eksiklikleri veya çelişkili beyanlar. Yoksa 'Yok'.",
        "overallScore": 78,
        "pros": ["Güçlü yan 1", "Güçlü yan 2"],
        "cons": ["Zayıf yan 1", "Zayıf yan 2"]
      }`;

      const evalResult = await model.generateContent(evalPrompt);
      const evalText = evalResult.response.text();
      let parsedEval: any = {};
      try {
        const cleanEval = evalText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedEval = JSON.parse(cleanEval);
      } catch (e) {
        console.error("Eval Parse error for candidate", cand.name, evalText);
        parsedEval = {
          profileSummary: "Aday verisi okunamadı.",
          technicalScore: 50,
          experienceScore: 50,
          projectScore: 50,
          methodologyScore: 50,
          behavioralTraits: "Belirtilmedi.",
          riskAssessment: "Okuma hatası.",
          overallScore: 50,
          pros: ["Belirtilmedi"],
          cons: ["Veri okunamadı"]
        };
      }

      candidateEvaluations[cand.id] = {
        name: cand.name,
        email: cand.email,
        ...parsedEval
      };
    }

    // --- STEP 3: Ajan K10 (Şampiyon Belirleyici) ---
    const k10Prompt = `Sen Karşılaştırma Ajanı 10 (Şampiyon Belirleyici) rolündesin.
    Oturum Başlığı: "${compSession.title}"
    Türü: "${compSession.type === "RECRUITMENT" ? "İşe Alım" : "Terfi"}"
    Kriterler: ${JSON.stringify(criteriaList)}
    
    Aşağıda tüm adayların Ajan K2-K9 tarafından çıkarılan değerlendirme sonuçları bulunmaktadır:
    ${JSON.stringify(candidateEvaluations)}
    
    Lütfen tüm adayları yan yana kıyasla, nedenleriyle birlikte kazanan adayı (Winner) seç ve tüm adayların sıralamasını (leaderboard) belirle.
    Kesinlikle geçerli JSON formatında dön. Markdown tagleri KULLANMA.
    Format:
    {
      "winnerId": "kazanan_adayin_id_değeri",
      "comparisonNarrative": "Adayları yan yana kıyaslayan, güçlü ve zayıf yönlerini ele alan ve neden bu kazananın seçildiğini açıklayan 3-4 paragraflık detaylı rapor.",
      "rankings": [
        {"candidateId": "aday_id_value", "rank": 1, "score": 92},
        ...
      ]
    }`;

    const k10Result = await model.generateContent(k10Prompt);
    const k10Text = k10Result.response.text();
    let finalRankings: any = { winnerId: "", comparisonNarrative: "", rankings: [] };
    try {
      const cleanK10 = k10Text.replace(/```json/g, '').replace(/```/g, '').trim();
      finalRankings = JSON.parse(cleanK10);
    } catch (e) {
      console.error("K10 Parse error:", k10Text);
      // Fallback rankings
      const sortedCands = Object.entries(candidateEvaluations)
        .map(([id, data]: [string, any]) => ({ id, score: data.overallScore || 50 }))
        .sort((a, b) => b.score - a.score);

      finalRankings = {
        winnerId: sortedCands[0]?.id || "",
        comparisonNarrative: "Adaylar skor bazlı sıralanmıştır.",
        rankings: sortedCands.map((c, idx) => ({ candidateId: c.id, rank: idx + 1, score: c.score }))
      };
    }

    // --- STEP 4: Veritabanına Yazma ---
    // Her adayın değerlendirmesini veritabanına kaydet
    for (const cand of validCandidates) {
      const evaluation = candidateEvaluations[cand.id];
      const rankInfo = finalRankings.rankings.find((r: any) => r.candidateId === cand.id);
      const isWinner = finalRankings.winnerId === cand.id;

      await prisma.comparisonCandidate.update({
        where: { id: cand.id },
        data: {
          score: evaluation?.overallScore || 0,
          isWinner,
          status: "EVALUATED",
          agentEvaluations: JSON.stringify({
            criteriaList,
            evaluation,
            rankInfo,
            comparisonNarrative: finalRankings.comparisonNarrative,
          })
        }
      });
    }

    // Oturumu tamamlandı olarak işaretle
    const updatedSession = await prisma.comparisonSession.update({
      where: { id },
      data: { status: "COMPLETED" },
      include: { candidates: true }
    });

    return NextResponse.json({
      success: true,
      session: updatedSession,
      criteriaList,
      evaluations: candidateEvaluations,
      winnerId: finalRankings.winnerId,
      comparisonNarrative: finalRankings.comparisonNarrative,
    });

  } catch (error: any) {
    console.error("Run error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
