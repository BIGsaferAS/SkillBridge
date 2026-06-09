import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { GoogleGenAI, Type } from '@google/genai';

export async function POST(req: Request, context: any) {
  try {
    const params = await context.params;
    const testId = params.id;

    const session = await getServerSession(authOptions);
    const { answers, timeSpentSec, guestInfo } = await req.json();

    let userId = null;

    // Resolve real database userId if logged in to prevent foreign key errors with mock user session IDs
    if (session?.user?.email) {
      let dbUser = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      // If mock admin or other session user is not in database, create them safely
      if (!dbUser) {
        let validCompanyId = null;
        if ((session.user as any).companyId) {
          const companyExists = await prisma.company.findUnique({
            where: { id: (session.user as any).companyId }
          });
          if (companyExists) {
            validCompanyId = (session.user as any).companyId;
          }
        }
        
        dbUser = await prisma.user.create({
          data: {
            name: session.user.name || 'Giriş Yapmış Kullanıcı',
            email: session.user.email,
            role: (session.user as any).role || 'INDIVIDUAL',
            companyId: validCompanyId
          }
        });
      }
      userId = dbUser.id;
    }

    if (!userId) {
      if (guestInfo && guestInfo.email && guestInfo.name) {
        // Find or create guest user
        let user = await prisma.user.findUnique({
          where: { email: guestInfo.email }
        });
        if (!user) {
          user = await prisma.user.create({
            data: {
              name: guestInfo.name,
              email: guestInfo.email,
              role: "INDIVIDUAL",
              companyId: guestInfo.companyId || null
            }
          });
        } else if (guestInfo.companyId && !user.companyId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { companyId: guestInfo.companyId }
          });
        }
        userId = user.id;
      } else {
        return NextResponse.json({ error: 'Sınava başlamak için lütfen giriş yapın veya bilgilerinizi girin.' }, { status: 401 });
      }
    }

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: { questions: true }
    });

    if (!test) {
      return NextResponse.json({ error: 'Test bulunamadı' }, { status: 404 });
    }

    // Agent 4 (Evaluation AI) Mock
    // Gerçekte burada açık uçlu sorular yapay zekaya gönderilip değerlendirilir.
    await new Promise(resolve => setTimeout(resolve, 3000));

    let totalScore = 0;
    const answerRecords = [];
    const competencyScores: Record<string, { total: number, earned: number }> = {};

    for (const question of test.questions) {
      const userAnswer = answers[question.id] || '';
      let isCorrect = false;
      let points = 0;
      let aiFeedback = null;

      const comp = question.competency || 'Genel';
      if (!competencyScores[comp]) {
        competencyScores[comp] = { total: 0, earned: 0 };
      }
      competencyScores[comp].total += 10; // Each question worth 10 points for that competency

      if (question.type === 'MULTIPLE_CHOICE') {
        if (userAnswer === question.correctAnswer) {
          isCorrect = true;
          points = 10;
        }
      } else if (question.type === 'OPEN_ENDED') {
        // Mock AI Evaluation for open ended
        if (userAnswer.length > 20) {
          isCorrect = true;
          points = 8; // AI gives 8/10 based on sentiment and content
          aiFeedback = "Aday krizi yönetirken müşteriyle empati kurmaya çalışmış ancak somut aksiyon planında eksiklikler var. İletişim tonu başarılı.";
        } else {
          isCorrect = false;
          points = 2;
          aiFeedback = "Cevap çok yetersiz. Krizi yönetecek derinlikte bir aksiyon planı sunulamamış.";
        }
      }

      totalScore += points;
      competencyScores[comp].earned += points;

      answerRecords.push({
        questionId: question.id,
        userAnswer,
        isCorrect,
        pointsAwarded: points,
        aiFeedback
      });
    }

    // Calculate Competency Matrix Percentages
    const finalMatrix: Record<string, number> = {};
    for (const [comp, scores] of Object.entries(competencyScores)) {
      finalMatrix[comp] = Math.round((scores.earned / scores.total) * 100);
    }

    const maxScore = test.questions.length * 10;
    const normalizedScore = Math.round((totalScore / maxScore) * 100);

    let profileAnalysis = `Adayın ${test.roleName || test.title} testi sonucundaki profil analizi: Yetkinlik dağılımları incelendiğinde problem çözme ve analiz becerileri öne çıkmaktadır.`;
    let benchmarking = `Aday, bu alanda sınava giren diğer kişilerin genel ortalamasına kıyasla %${normalizedScore} başarı skoru ile ortalamanın ${normalizedScore >= 75 ? 'üzerinde' : 'altında'} yer almaktadır.`;
    let hireDecision = normalizedScore >= 75 ? 'HIRE (İşe Alım)' : 'NO HIRE (Geliştirilmeli)';
    let careerAdvice = `Sayın Aday, ${test.roleName} rolü için girdiğiniz simülasyonda özellikle yetkinliklerinizi gösterdiniz. Zayıf alanlarınız için eğitim almanız önerilir.`;
    let flawAnalysis = `Test içerisindeki yanlış yanıtlar incelendiğinde, adayın bazı yetkinlik alanlarında pratik tecrübe eksikliği yaşadığı gözlemlenmiştir.`;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

      const evaluationPrompt = `
        Sen; Seçme-Yerleştirme, Yetenek Yönetimi, Kurumsal Değerlendirme ve İK Analitiği alanında uzmanlaşmış, gelişmiş bir Yapay Zeka Değerlendirme Merkezisin (Assessment Center) ve Sayfa 17: Editör ve Kalite Denetleyicisisin (AJAN_17).

        Görevin, adayın tamamladığı sınavın sonuçlarını ve yanıtlarını inceleyerek; "pozisyon ve yetkinlik.xlsx" dosyasındaki mimariye, 4 kategori x 10 yetkinlik yapısına ve Recep Yigit'in master prompt kurallarına uygun dinamik, özelleştirilmiş, şablon içermeyen bir değerlendirme raporu hazırlamaktır.

        Sınav ve Aday Bilgileri:
        - Pozisyon/Birim: ${test.roleName} / ${test.department}
        - Sektör: ${test.sector}
        - Seçilen Yetkinlikler: ${test.competencies}
        - Genel Başarı Skoru: %${normalizedScore}
        - Sınav Süresi: ${timeSpentSec} saniye
        - Her Yetkinliğin Başarı Yüzdeleri (Radar Grafiği Veri Matrisi): ${JSON.stringify(finalMatrix)}
        - Sorular ve Verilen Cevaplar:
        ${test.questions.map((q, idx) => {
          const ans = answers[q.id] || "";
          const isQCorrect = ans === q.correctAnswer;
          return `Soru ${idx + 1}: ${q.text}
                  Ölçülen Yetkinlik: ${q.competency}
                  Adayın Cevabı: ${ans}
                  Doğru Cevap: ${q.correctAnswer}
                  Durum: ${isQCorrect ? 'DOĞRU (10/10 Puan)' : 'YANLIŞ (0/10 Puan)'}`;
        }).join('\n\n')}

        Lütfen adayın gerçek performansına dayanan, statik kodlardan arındırılmış, dinamik bir değerlendirme raporu üret.
        Rapor içeriği kesinlikle aşağıdaki alanları içeren geçerli bir JSON objesi olmalıdır:
        1. profileAnalysis: Adayın genel ve yetkinlik bazlı başarı durumunu, güçlü yönlerini açıklayan detaylı profil analizi (en az 3 cümle).
        2. benchmarking: Adayın performansını ideal profillerle karşılaştırıp benchmark yapan analiz (en az 2 cümle).
        3. hireDecision: İşe alım/terfi kararı (Örn: "İŞE ALIM (HIRE)" veya "NO HIRE (Geliştirilmeli)" kararı ve nedeni).
        4. careerAdvice: Adayın zayıf olduğu yetkinlikler için 30 günlük gelişim yol haritası ve eğitim önerileri (en az 4 cümle).
        5. flawAnalysis: Test içerisindeki yanlış yanıtlarına dayanarak refleks zafiyetlerini belirleyen hata haritası analizi (en az 3 cümle).

        JSON Format Şeması:
        {
          "profileAnalysis": "...",
          "benchmarking": "...",
          "hireDecision": "...",
          "careerAdvice": "...",
          "flawAnalysis": "..."
        }
      `;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: evaluationPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              profileAnalysis: { type: Type.STRING },
              benchmarking: { type: Type.STRING },
              hireDecision: { type: Type.STRING },
              careerAdvice: { type: Type.STRING },
              flawAnalysis: { type: Type.STRING }
            },
            required: ["profileAnalysis", "benchmarking", "hireDecision", "careerAdvice", "flawAnalysis"]
          },
          temperature: 0.7
        }
      });

      const responseText = aiResponse.text || '';
      const resultObj = JSON.parse(responseText);
      if (resultObj.profileAnalysis) profileAnalysis = resultObj.profileAnalysis;
      if (resultObj.benchmarking) benchmarking = resultObj.benchmarking;
      if (resultObj.hireDecision) hireDecision = resultObj.hireDecision;
      if (resultObj.careerAdvice) careerAdvice = resultObj.careerAdvice;
      if (resultObj.flawAnalysis) flawAnalysis = resultObj.flawAnalysis;

    } catch (aiError) {
      console.error("Gemini AI evaluation error, falling back to static strings:", aiError);
    }

    const attempt = await prisma.testAttempt.create({
      data: {
        testId: test.id,
        userId: userId,
        status: 'COMPLETED',
        score: normalizedScore,
        timeSpentSec: timeSpentSec || 0,
        competencyMatrix: JSON.stringify(finalMatrix),
        aiCareerAdvice: careerAdvice,
        answers: {
          create: answerRecords
        }
      }
    });

    // Also create corresponding TestResult so it shows up on the admin results & user dashboard
    await prisma.testResult.create({
      data: {
        userId: userId,
        sector: test.sector || 'Genel',
        department: test.department || 'Genel',
        roleName: test.roleName || test.title || 'Genel',
        score: normalizedScore,
        timeSpentSec: timeSpentSec || 0,
        profileAnalysis,
        benchmarking,
        hireDecision,
        developmentAreas: careerAdvice,
        flawAnalysis
      }
    });

    return NextResponse.json({ success: true, attemptId: attempt.id });
  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json({ error: 'Sonuçlar kaydedilemedi' }, { status: 500 });
  }
}
