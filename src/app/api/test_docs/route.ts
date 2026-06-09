import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const documents = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(documents);
  } catch (error) {
    return NextResponse.json({ error: 'Veriler getirilemedi' }, { status: 500 });
  }
}
