import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request, context: any) {
  try {
    const params = await context.params;
    const id = params.id;

    const session = await getServerSession(authOptions);
    const role = session?.user ? (session.user as any).role : null;
    const companyId = session?.user ? (session.user as any).companyId : null;
    const isAdmin = role === 'ADMIN' || role === 'COMPANY_MANAGER' || role === 'SUPER_ADMIN';

    let validCompanyId = null;
    if (isAdmin && companyId) {
      const company = await prisma.company.findUnique({ where: { id: companyId } });
      if (company) validCompanyId = companyId;
    }

    const test = await prisma.test.findUnique({
      where: { id },
      include: { questions: true }
    });

    if (!test) {
      return NextResponse.json({ error: 'Test bulunamadı' }, { status: 404 });
    }

    // Yalnızca yetkili yönetici ise kendi şirketinin testi olup olmadığını doğrula
    if (isAdmin && validCompanyId && test.companyId !== validCompanyId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    // Aday veya misafir kullanıcı ise cevapları ve açıklamaları temizle (Kopya koruması)
    if (!isAdmin) {
      const sanitizedQuestions = test.questions.map(({ correctAnswer, explanation, ...rest }) => rest);
      return NextResponse.json({
        ...test,
        questions: sanitizedQuestions
      });
    }

    return NextResponse.json(test);
  } catch (error) {
    return NextResponse.json({ error: 'Test getirilemedi' }, { status: 500 });
  }
}
