import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'COMPANY_MANAGER' && (session.user as any).role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const companyId = (session.user as any).companyId;
    let validCompanyId = null;
    if (companyId) {
      const company = await prisma.company.findUnique({ where: { id: companyId } });
      if (company) validCompanyId = companyId;
    }

    const tests = await prisma.test.findMany({
      where: validCompanyId ? { companyId: validCompanyId } : undefined,
      include: {
        _count: {
          select: { questions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(tests);
  } catch (error) {
    return NextResponse.json({ error: 'Testler listelenemedi' }, { status: 500 });
  }
}
