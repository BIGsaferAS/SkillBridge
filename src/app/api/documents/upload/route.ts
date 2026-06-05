import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { promises as fs } from 'fs';
import path from 'path';

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

    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;
    const name = formData.get('name') as string;
    const subject = formData.get('subject') as string;

    if (!file || !name) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
    }

    const originalFilename = (file as any).name || 'document';
    const ext = path.extname(originalFilename);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    
    // Yükleme dizinini kontrol et ve yoksa oluştur
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try { await fs.access(uploadDir); } catch { await fs.mkdir(uploadDir, { recursive: true }); }
    
    const filePath = path.join(uploadDir, uniqueName);
    
    // Dosyayı kaydet
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const document = await prisma.document.create({
      data: {
        companyId: validCompanyId,
        name,
        subject,
        type: 'UPLOADED',
        fileFormat: ext.replace('.', ''),
        filePath: `/uploads/${uniqueName}`,
        sizeBytes: buffer.length
      }
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Dosya yüklenemedi' }, { status: 500 });
  }
}
