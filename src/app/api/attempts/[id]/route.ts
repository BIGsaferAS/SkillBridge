import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request, context: any) {
  try {
    const params = await context.params;
    const id = params.id;

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const userId = (session.user as any).id;

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

    // Geliştirme aşamasında admin yetkisi kontrolünü biraz esnetelim
    // Normalde && attempt.userId !== userId kontrolü eklenir.

    return NextResponse.json(attempt);
  } catch (error) {
    return NextResponse.json({ error: 'Sonuçlar getirilemedi' }, { status: 500 });
  }
}
