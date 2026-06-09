import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request, context: any) {
  try {
    const params = await context.params;
    const id = params.id;

    const attempt = await prisma.testAttempt.findUnique({
      where: { id },
      include: { 
        test: true,
        answers: {
          include: { question: true }
        }
      }
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 });
    }

    const session = await getServerSession(authOptions);

    if (session) {
      const userId = (session.user as any).id;
      const role = (session.user as any).role;
      const companyId = (session.user as any).companyId;

      const isOwner = attempt.userId === userId;
      const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
      const isCompanyManager = role === 'COMPANY_MANAGER' && attempt.test.companyId === companyId;

      if (!isOwner && !isAdmin && !isCompanyManager) {
        return NextResponse.json({ error: 'Bu sonuçları görme yetkiniz yok' }, { status: 403 });
      }
    } else {
      // Misafir (guest) veya şirket listesindeki kullanıcıların kendi sonuçlarını görebilmesi için
      const attemptUser = await prisma.user.findUnique({
        where: { id: attempt.userId }
      });

      // Eğer kayıtlı ve şifreli bir üye ise ve şirkete bağlı değilse giriş yapması şarttır
      if (attemptUser && attemptUser.password && !attemptUser.companyId) {
        return NextResponse.json({ error: 'Bu sonuçları görmek için giriş yapmalısınız' }, { status: 401 });
      }
    }

    // Ajan 17 değerlendirme raporu verilerini eşleşen TestResult kaydından çekip birleştiriyoruz
    const testResult = await prisma.testResult.findFirst({
      where: {
        userId: attempt.userId,
        roleName: attempt.test.roleName || 'Genel',
        sector: attempt.test.sector || 'Genel',
        department: attempt.test.department || 'Genel',
        score: attempt.score ?? undefined
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      ...attempt,
      profileAnalysis: testResult?.profileAnalysis || null,
      benchmarking: testResult?.benchmarking || null,
      hireDecision: testResult?.hireDecision || null,
      flawAnalysis: testResult?.flawAnalysis || null
    });
  } catch (error) {
    return NextResponse.json({ error: 'Sonuçlar getirilemedi' }, { status: 500 });
  }
}
