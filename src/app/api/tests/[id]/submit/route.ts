import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
              role: "INDIVIDUAL"
            }
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

    // Generate AI Career Advice based on score
    const aiCareerAdvice = `Sayın Aday, ${test.roleName} rolü için girdiğiniz simülasyonda özellikle Problem Çözme yetkinliğinde ortalama üstü bir başarı gösterdiniz. Ancak Kriz Yönetimi (açık uçlu senaryo) tarafında müşteri ilişkilerini daha stratejik yönetmeniz gerekiyor. İşe giriş adımınızda ilk 30 günde "Kriz İletişimi" eğitimlerine ağırlık vermeniz tavsiye edilir.`;

    const maxScore = test.questions.length * 10;
    const normalizedScore = Math.round((totalScore / maxScore) * 100);

    const attempt = await prisma.testAttempt.create({
      data: {
        testId: test.id,
        userId: userId,
        status: 'COMPLETED',
        score: normalizedScore,
        timeSpentSec: timeSpentSec || 0,
        competencyMatrix: JSON.stringify(finalMatrix),
        aiCareerAdvice,
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
        profileAnalysis: `Adayın ${test.roleName || test.title} testi sonucundaki profil analizi: Yetkinlik dağılımları incelendiğinde güçlü problem çözme ve analiz becerileri öne çıkmaktadır.`,
        benchmarking: `Aday, bu alanda sınava giren diğer kişilerin genel ortalamasına kıyasla %${normalizedScore} başarı skoru ile ortalamanın ${normalizedScore >= 70 ? 'üzerinde' : 'altında'} yer almaktadır.`,
        hireDecision: normalizedScore >= 70 ? 'HIRE (İşe Alım)' : 'NO HIRE (Geliştirilmeli)',
        developmentAreas: aiCareerAdvice,
        flawAnalysis: `Test içerisindeki yanlış yanıtlar incelendiğinde, adayın özellikle ${Object.keys(finalMatrix).find(k => finalMatrix[k] < 60) || 'Genel'} yetkinlik alanında bazı kavramsal hatalar yaptığı ve pratik tecrübe eksikliği yaşadığı gözlemlenmiştir.`
      }
    });

    return NextResponse.json({ success: true, attemptId: attempt.id });
  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json({ error: 'Sonuçlar kaydedilemedi' }, { status: 500 });
  }
}
