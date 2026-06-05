import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { GoogleGenAI, Type } from '@google/genai';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'COMPANY_MANAGER')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { documentId, sector, subject, department, roleName, competencies, difficulty, questionCount, timeLimit } = await req.json();
    
    if (!sector || !department || !roleName || !competencies || competencies.length === 0) {
      return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 });
    }

    const companyId = (session.user as any).companyId;
    let validCompanyId = null;
    if (companyId) {
      const company = await prisma.company.findUnique({ where: { id: companyId } });
      if (company) validCompanyId = companyId;
    }

    // Fetch Role Hierarchy
    const jobRoleObj = await prisma.jobRole.findUnique({ where: { name: roleName } });
    const isManagement = jobRoleObj?.hierarchy === 'MANAGEMENT';
    const reportType = isManagement ? 'Stratejik Değerlendirme Raporu' : 'Teknik Yetkinlik Analizi';

    // Fetch Competency Rubrics
    const compObjects = await prisma.competency.findMany({
      where: { name: { in: competencies } }
    });

    const aiGeneratedTimeLimit = (timeLimit || 15) * 60; // saniye cinsinden
    const count = questionCount || 5; 
    
    let aiScenario = "";
    let finalQuestions = [];

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

      // Doküman varsa içeriğini bağlam (context) olarak çek
      let docContext = "";
      if (documentId) {
        const doc = await prisma.document.findUnique({ where: { id: documentId } });
        if (doc?.content) {
          docContext = `\nAşağıdaki özel şirket dokümanını/rehberini dikkatlice incele. Senaryoyu ve soruları üretirken ÖZELLİKLE VE SADECE "${subject}" KONUSUNA ODAKLAN. Dokümanın geri kalan kısımlarını bağlam olarak kullan ama ana test konusu kesinlikle "${subject}" olmalıdır:\n"""\n${doc.content}\n"""\n`;
        }
      }

      const promptStr = `
        Sen uzman bir İK Değerlendirme Merkezi (Assessment Center) simülatörüsün.
        Sektör: ${sector}
        Departman: ${department}
        Pozisyon: ${roleName}
        Hiyerarşi: ${isManagement ? 'Yönetici' : 'Uzman'}
        Konu: ${subject}
        Zorluk: ${difficulty}
        Soru Sayısı: ${count}
        ${docContext}
        Ölçülecek Yetkinlikler ve Hedef Kriterler:
        ${competencies.map((c: string) => {
          const det = compObjects.find((x: any) => x.name === c);
          return `- ${c}: (Hedef Davranış: ${det?.levelE || 'Genel Başarı'})`;
        }).join('\n')}

        Lütfen tamamen benzersiz, adaya özel, asla tekrar etmeyen gerçekçi bir vaka senaryosu (case study) üret. Senaryo pozisyonun zorluğuna ve sektör dinamiklerine uygun olmalı.
        Ardından tam olarak ${count} adet ÇOKTAN SEÇMELİ soru üret. 
        - Tüm seçtiğim yetkinlikleri kapsayacak şekilde soruları orantılı dağıt (Örn: 5 yetkinlik, 10 soru istendiyse her yetkinlik için ~2 soru).
        - Tüm sorular KESİNLİKLE çoktan seçmeli (MULTIPLE_CHOICE) olmalıdır. Asla açık uçlu soru üretme.
        - Çoktan seçmeli soruların 4 şıkkı (options) olmalıdır ve sadece biri (correctAnswer) hedef davranışa tam uygun doğru cevaptır. Diğerleri çeldiricidir.
        `;

      const schema = {
        type: Type.OBJECT,
        properties: {
          scenarioText: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ["MULTIPLE_CHOICE"] },
                competency: { type: Type.STRING },
                text: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["type", "competency", "text", "options", "correctAnswer", "explanation"]
            }
          }
        },
        required: ["scenarioText", "questions"]
      };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptStr,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.8
        }
      });

      const responseText = response.text || '';
      const resultObj = JSON.parse(responseText);
      
      aiScenario = resultObj.scenarioText;
      finalQuestions = resultObj.questions.map((q: any) => ({
        type: q.type,
        competency: q.competency,
        text: q.text,
        options: q.type === 'MULTIPLE_CHOICE' && q.options ? JSON.stringify(q.options) : null,
        correctAnswer: q.type === 'MULTIPLE_CHOICE' ? q.correctAnswer : null,
        explanation: q.explanation
      }));

    } catch (aiError: any) {
      console.error("Gemini API Error:", aiError);
      return NextResponse.json({ error: 'Yapay Zeka (Gemini) API hatası. Lütfen .env dosyanızdaki GEMINI_API_KEY ayarını kontrol edin. Detay: ' + aiError.message }, { status: 500 });
    }

    const test = await prisma.test.create({
      data: {
        companyId: validCompanyId,
        documentId: documentId || null,
        title: `${roleName} - ${department} Kariyer Simülasyonu`,
        description: `Bu simülasyon, seçtiğiniz yetkinlikleri ölçmek üzere Ajan 3 tarafından özel kurgulanmıştır.`,
        sector,
        department,
        roleName,
        competencies: JSON.stringify(competencies),
        difficulty: difficulty || 'Orta',
        scenarioText: aiScenario,
        timeLimitSec: aiGeneratedTimeLimit,
        questions: {
          create: finalQuestions
        }
      }
    });

    return NextResponse.json({ success: true, testId: test.id });
  } catch (error) {
    console.error('Simulation generation error:', error);
    return NextResponse.json({ error: 'Simülasyon üretilemedi' }, { status: 500 });
  }
}
