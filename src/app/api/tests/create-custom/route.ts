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

    const { jobTitle } = await req.json();
    if (!jobTitle || jobTitle.trim() === '') {
      return NextResponse.json({ error: 'İş başlığı boş olamaz' }, { status: 400 });
    }

    const companyId = (session.user as any).companyId;
    let validCompanyId = null;
    if (companyId) {
      const company = await prisma.company.findUnique({ where: { id: companyId } });
      if (company) validCompanyId = companyId;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

    const promptStr = `Sen profesyonel bir İşe Alım Değerlendirme ve İK analistisin. 
Yönetici senden şu iş pozisyonu için özel bir Değerlendirme Testi hazırlamanı istedi: "${jobTitle}"

Lütfen bu iş pozisyonunu analiz et ve:
1. Hangi sektör (sector) ve departmana (department) ait olduğunu belirle.
2. Bu iş pozisyonu için kritik öneme sahip 3 adet yetkinliği (competencies) belirle.
3. Adayın kriz yönetimi yeteneğini ve bu yetkinliklerini test edecek zorlu ve gerçekçi bir Vaka Senaryosu (scenarioText) yaz.
4. Bu vaka senaryosu ile ilgili adayı test edecek 3 adet Çoktan Seçmeli (4 seçenekli) soru üret.

Her soru için şunlara KESİNLİKLE dikkat et:
- Seçenekler (options) dizisi 4 elemandan oluşmalı ve şıklar "A) ...", "B) ...", "C) ...", "D) ..." formatında olmalıdır.
- Doğru cevap seçeneğinin metni (correctAnswer), "options" dizisindeki elemanlardan birine tam olarak eşit olmalıdır.
- Doğru seçeneğin dizideki konumu (indeksi) her soruda farklı şıklara denk gelecek şekilde rastgele dağıtılmalıdır. Örneğin ilk soruda C şıkkı, ikinci soruda A şıkkı, üçüncü soruda D şıkkı doğru olmalıdır. Tüm sorularda doğru cevabı ilk eleman (A şıkkı) olarak yerleştirme!
- A, B, C ve D şıklarındaki tüm seçenekler kelime sayısı, karakter uzunluğu ve detay derecesi olarak birbirine KESİNLİKLE çok yakın (neredeyse tamamen aynı uzunlukta) olmalıdır. Doğru seçenek diğerlerinden daha uzun, daha detaylı veya daha kısa/öz olmamalıdır.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        sector: { type: Type.STRING },
        department: { type: Type.STRING },
        competencies: { type: Type.ARRAY, items: { type: Type.STRING } },
        scenarioText: { type: Type.STRING },
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              competency: { type: Type.STRING },
              text: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["competency", "text", "options", "correctAnswer", "explanation"]
          }
        }
      },
      required: ["sector", "department", "competencies", "scenarioText", "questions"]
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

    // Save test to database
    const test = await prisma.test.create({
      data: {
        companyId: validCompanyId,
        title: `${jobTitle} Özel Değerlendirme Simülasyonu`,
        description: `Bu test "${jobTitle}" pozisyonu için yapay zeka tarafından özel olarak tasarlanmıştır.`,
        sector: resultObj.sector,
        department: resultObj.department,
        roleName: jobTitle,
        competencies: JSON.stringify(resultObj.competencies),
        difficulty: 'Orta',
        scenarioText: resultObj.scenarioText,
        timeLimitSec: 900, // 15 mins
        questions: {
          create: resultObj.questions.map((q: any) => ({
            type: 'MULTIPLE_CHOICE',
            competency: q.competency,
            text: q.text,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation
          }))
        }
      }
    });

    return NextResponse.json({ success: true, test: { id: test.id, title: test.title } });

  } catch (error: any) {
    console.error('Custom test creation error:', error);
    return NextResponse.json({ error: 'Özel test oluşturulamadı: ' + error.message }, { status: 500 });
  }
}
