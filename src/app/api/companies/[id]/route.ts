import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PUT(req: Request, { params }: { params: any }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { name, limit } = body;

    const company = await prisma.company.update({
      where: { id },
      data: { name, limit: Number(limit) }
    });

    return NextResponse.json({ success: true, company });
  } catch (error) {
    console.error('Company update error:', error);
    return NextResponse.json({ error: 'Şirket güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: any }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { id } = params;
    
    await prisma.company.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Company delete error:', error);
    return NextResponse.json({ error: 'Şirket silinemedi (Bağlı kullanıcılar olabilir)' }, { status: 500 });
  }
}
