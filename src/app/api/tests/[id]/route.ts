import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request, context: any) {
  try {
    const params = await context.params;
    const id = params.id;

    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'COMPANY_MANAGER')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const companyId = (session.user as any).companyId;
    let validCompanyId = null;
    if (companyId) {
      const company = await prisma.company.findUnique({ where: { id: companyId } });
      if (company) validCompanyId = companyId;
    }

    const test = await prisma.test.findUnique({
      where: { id },
      include: { questions: true }
    });

    if (!test || (validCompanyId && test.companyId !== validCompanyId)) {
      return NextResponse.json({ error: 'Test bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(test);
  } catch (error) {
    return NextResponse.json({ error: 'Test getirilemedi' }, { status: 500 });
  }
}
