import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }
    const companyId = (session.user as any).companyId;

    const companies = await prisma.company.findMany({
      where: companyId ? { id: companyId } : undefined,
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error('Fetch companies error:', error);
    return NextResponse.json({ error: 'Şirketler listelenemedi' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const body = await req.json();
    const { name, limit } = body;

    if (!name || !limit) {
      return NextResponse.json({ error: 'Eksik bilgi girdiniz' }, { status: 400 });
    }

    const company = await prisma.company.create({
      data: {
        name,
        limit
      }
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('Company creation error:', error);
    return NextResponse.json({ error: 'Şirket oluşturulurken hata meydana geldi' }, { status: 500 });
  }
}
