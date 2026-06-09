import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { GoogleGenAI, Type } from '@google/genai';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'COMPANY_MANAGER' && (session.user as any).role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { documentId, sector, subject, department, roleName, competencies, difficulty, questionCount, timeLimit, testType, testTypes } = await req.json();
    
    if (!sector || !department || !roleName || !competencies || competencies.length === 0) {
      return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 });
    }

    // Support both testType (string) and testTypes (array) for backward compatibility
    const selectedTypes: string[] = testTypes || (testType ? [testType] : ['SIMULATION']);

    const companyId = (session.user as any).companyId;
    let validCompanyId = null;
    if (companyId) {
      const company = await prisma.company.findUnique({ where: { id: companyId } });
      if (company) validCompanyId = companyId;
    }

    // Fetch Role Hierarchy
    const jobRoleObj = await prisma.jobRole.findUnique({ where: { name: roleName } });
    const isManagement = jobRoleObj?.hierarchy === 'MANAGEMENT';

    // Fetch Competency Rubrics
    const compObjects = await prisma.competency.findMany({
      where: { name: { in: competencies } }
    });

    const aiGeneratedTimeLimit = (timeLimit || 15) * 60; // saniye cinsinden
    const count = questionCount || 5; 
    
    let aiScenario = "";
    let finalQuestions = [];

    const hasSimulation = selectedTypes.includes('SIMULATION');
    const hasHrDirect = selectedTypes.includes('HR_DIRECT');

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

      let promptStr = "";

      if (hasSimulation && hasHrDirect) {
        // Hybrid Mode: both selected
        promptStr = `
          Sen hem uzman bir İK Değerlendirme Merkezi (Assessment Center) simülatörüsün (Ajan 1, 2, 3) hem de kıdemli bir İK Yetkinlik Soru Ajanısın (Ajan 16).
          Görevin, hem bir vaka senaryosuna (case study) bağlı simülasyon soruları hem de doğrudan yetkinlik matrisi tanımlarını baz alan davranışsal durum soruları içeren karma (hibrit) bir Değerlendirme Testi hazırlamaktır.
          
          Sektör: ${sector}
          Departman: ${department}
          Pozisyon: ${roleName}
          Hiyerarşi: ${isManagement ? 'Yönetici' : 'Uzman'}
          Konu: ${subject}
          Zorluk: ${difficulty}
          Soru Sayısı: ${count}
          ${docContext}
          
          Seçilen Yetkinlikler ve Matris Davranışları:
          ${competencies.map((c: string) => {
            const det = compObjects.find((x: any) => x.name === c);
            return `- ${c}:
              * Seviye 1 (Gelişmeli): ${det?.levelA || 'Davranış çoğunlukla görülmez'}
              * Seviye 3 (Beklenen): ${det?.levelC || 'Standart kurallara uyar'}
              * Seviye 5 (Örnek): ${det?.levelE || 'İyi uygulamaları kuruma yayar'}`;
          }).join('\n')}

          Lütfen:
          1. Adayı kriz anlarında test edecek gerçekçi bir vaka senaryosu (scenarioText) yaz.
          2. Toplamda ${count} adet çoktan seçmeli (4 şıklı) soru üret.
             - Soruların yarısı vaka senaryosuyla doğrudan ilişkili olmalıdır (senaryo/simülasyon soruları).
             - Geri kalan sorular ise vaka senaryosundan bağımsız, doğrudan seçilen yetkinlik tanımlarına göre adayın davranışsal/durumsal tepkilerini mülakat mantığıyla ölçen İK durum soruları olmalıdır.
          
          ŞIK (SEÇENEK) ÜRETİMİNDE KESİNLİKLE UYULMASI GEREKEN GÜVENLİK KURALLARI:
          1. Doğru seçeneğin metni (correctAnswer), "options" dizisi içinde her soruda farklı konumlara (farklı dizinlere/indekslere) yerleştirilmelidir. Örneğin ilk soruda 2. sırada, ikinci soruda 4. sırada, üçüncü soruda 1. sırada yer almalıdır. KESİNLİKLE tüm sorularda doğru cevabı dizinin ilk elemanı (A şıkkı) olarak yerleştirme!
          2. A, B, C ve D şıklarındaki tüm seçenekler (options dizisindeki 4 metin) kelime sayısı, karakter uzunluğu ve detay derecesi olarak birbirine KESİNLİKLE çok yakın (neredeyse tamamen aynı uzunlukta) olmalıdır. Doğru seçenek diğerlerinden daha uzun, daha detaylı veya daha kısa/öz olmamalı, kendini uzunluğuyla belli etmemelidir.
        `;
      } else if (hasHrDirect) {
        // Only HR Direct questions (Ajan 16)
        promptStr = `
          Sen uzman bir İşe Alım Değerlendirme ve İK analistisin (Ajan 16 - İK Yetkinlik Soru Ajanı).
          Görevin, adayın seçilen yetkinlik seviyelerini ve davranışlarını ölçmek üzere vaka hikayesi (case study) olmaksızın, doğrudan durum ve davranışsal İK soruları hazırlamaktır.
          
          Sektör: ${sector}
          Departman: ${department}
          Pozisyon: ${roleName}
          Hiyerarşi: ${isManagement ? 'Yönetici' : 'Uzman'}
          Konu: ${subject}
          Zorluk: ${difficulty}
          Soru Sayısı: ${count}
          
          Seçilen Yetkinlikler ve Matris Davranışları:
          ${competencies.map((c: string) => {
            const det = compObjects.find((x: any) => x.name === c);
            return `- ${c}:
              * Seviye 1 (Gelişmeli): ${det?.levelA || 'Davranış çoğunlukla görülmez'}
              * Seviye 3 (Beklenen): ${det?.levelC || 'Standart kurallara uyar'}
              * Seviye 5 (Örnek): ${det?.levelE || 'İyi uygulamaları kuruma yayar'}`;
          }).join('\n')}

          Lütfen tam olarak ${count} adet ÇOKTAN SEÇMELİ durum/davranış sorusu üret.
          - Her soru, adayın iş hayatında karşılaşabileceği kısa bir İK durumunu (situation) ve bu durum karşısında sergileyeceği davranışı ölçmelidir.
          - Soruların altında vaka hikayesi olmayacaktır. Her soru kendi içinde kısa bir senaryo/durum barındırmalıdır.
          - Tüm seçtiğim yetkinlikleri dengeli şekilde kapsayacak şekilde soruları dağıt.
          - Çoktan seçmeli soruların 4 şıkkı (options) olmalıdır ve sadece biri (correctAnswer) hedef davranışa tam uygun doğru cevaptır. Diğerleri çeldiricidir.
          
          ŞIK (SEÇENEK) ÜRETİMİNDE KESİNLİKLE UYULMASI GEREKEN GÜVENLİK KURALLARI:
          1. Doğru seçeneğin metni (correctAnswer), "options" dizisi içinde her soruda farklı konumlara (farklı dizinlere/indekslere) yerleştirilmelidir. Örneğin ilk soruda 2. sırada, ikinci soruda 4. sırada, üçüncü soruda 1. sırada yer almalıdır. KESİNLİKLE tüm sorularda doğru cevabı dizinin ilk elemanı (A şıkkı) olarak yerleştirme!
          2. A, B, C ve D şıklarındaki tüm seçenekler (options dizisindeki 4 metin) kelime sayısı, karakter uzunluğu ve detay derecesi olarak birbirine KESİNLİKLE çok yakın (neredeyse tamamen aynı uzunlukta) olmalıdır. Doğru seçenek diğerlerinden daha uzun, daha detaylı veya daha kısa/öz olmamalı, kendini uzunluğuyla belli etmemelidir.
        `;
      } else {
        // Only Simulation questions (Ajan 1, 2, 3)
        promptStr = `
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

          ŞIK (SEÇENEK) ÜRETİMİNDE KESİNLİKLE UYULMASI GEREKEN GÜVENLİK KURALLARI:
          1. Doğru seçeneğin metni (correctAnswer), "options" dizisi içinde her soruda farklı konumlara (farklı dizinlere/indekslere) yerleştirilmelidir. Örneğin ilk soruda 2. sırada, ikinci soruda 4. sırada, üçüncü soruda 1. sırada yer almalıdır. KESİNLİKLE tüm sorularda doğru cevabı dizinin ilk elemanı (A şıkkı) olarak yerleştirme!
          2. A, B, C ve D şıklarındaki tüm seçenekler (options dizisindeki 4 metin) kelime sayısı, karakter uzunluğu ve detay derecesi olarak birbirine KESİNLİKLE çok yakın (neredeyse tamamen aynı uzunlukta) olmalıdır. Doğru seçenek diğerlerinden daha uzun, daha detaylı veya daha kısa/öz olmamalı, kendini uzunluğuyla belli etmemelidir.
        `;
      }

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
      
      aiScenario = resultObj.scenarioText || (hasHrDirect && !hasSimulation ? "Bu test, pozisyonun gerektirdiği kritik yetkinliklerin durum bazlı mülakat sorularıyla ölçülmesi amacıyla hazırlanmıştır. Aşağıdaki soruları dikkatlice yanıtlayınız." : "");
      finalQuestions = resultObj.questions.map((q: any) => ({
        type: q.type || 'MULTIPLE_CHOICE',
        competency: q.competency,
        text: q.text,
        options: q.options ? JSON.stringify(q.options) : null,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }));

    } catch (aiError: any) {
      console.error("Gemini API Error:", aiError);
      return NextResponse.json({ error: 'Yapay Zeka (Gemini) API hatası. Lütfen .env dosyanızdaki GEMINI_API_KEY ayarını kontrol edin. Detay: ' + aiError.message }, { status: 500 });
    }

    const isBoth = hasSimulation && hasHrDirect;
    const isHr = hasHrDirect && !hasSimulation;

    const test = await prisma.test.create({
      data: {
        companyId: validCompanyId,
        documentId: documentId || null,
        title: isBoth 
          ? `${roleName} - Hibrit Değerlendirme Simülasyonu`
          : isHr 
            ? `${roleName} - Yetkinlik Değerlendirme Testi` 
            : `${roleName} - ${department} Kariyer Simülasyonu`,
        description: isBoth
          ? `Bu hibrit test, hem vaka senaryolu kriz sorularını hem de doğrudan yetkinlik matrisi davranış sorularını içerir.`
          : isHr
            ? `Bu test, ${roleName} rolü için seçtiğiniz yetkinlikleri ölçmek üzere Ajan 16 tarafından doğrudan hazırlanmıştır.`
            : `Bu simülasyon, seçtiğiniz yetkinlikleri ölçmek üzere Ajan 3 tarafından özel kurgulanmıştır.`,
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
