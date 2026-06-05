import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
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

    const body = await req.json();
    const { name, subject, content, sector, department, roleName } = body;

    if (!name || !content) {
      return NextResponse.json({ error: 'Ad ve içerik zorunludur' }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        companyId: validCompanyId,
        name,
        subject,
        type: 'CREATED',
        fileFormat: 'html',
        content,
        sector,
        department,
        roleName,
        sizeBytes: Buffer.byteLength(content, 'utf8')
      }
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Doküman oluşturulamadı' }, { status: 500 });
  }
}
