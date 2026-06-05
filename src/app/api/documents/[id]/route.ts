import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { promises as fs } from 'fs';
import path from 'path';

export async function DELETE(req: Request, context: any) {
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

    const document = await prisma.document.findUnique({ where: { id } });
    if (!document || (validCompanyId && document.companyId !== validCompanyId)) {
      return NextResponse.json({ error: 'Doküman bulunamadı' }, { status: 404 });
    }

    // Eğer fiziksel bir dosyaysa, dosyayı sil
    if (document.type === 'UPLOADED' && document.filePath) {
      const filePath = path.join(process.cwd(), 'public', document.filePath);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.warn('Dosya zaten silinmiş veya bulunamadı:', filePath);
      }
    }

    await prisma.document.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Silme işlemi başarısız' }, { status: 500 });
  }
}
