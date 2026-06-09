import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { companyId, name } = await req.json();

    if (!companyId || !name) {
      return NextResponse.json({ error: 'Eksik şirket veya isim bilgisi' }, { status: 400 });
    }

    const trimmedName = name.trim();

    // Find a user belonging to the company with that name
    // (SQL Server default is case-insensitive, but we can do a precise search)
    const user = await prisma.user.findFirst({
      where: {
        companyId: companyId,
        name: trimmedName
      }
    });

    if (!user) {
      return NextResponse.json({ exists: false, error: 'Girdiğiniz isim şirket çalışan listesinde bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json({
      exists: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Verify user error:', error);
    return NextResponse.json({ error: 'Kullanıcı doğrulanamadı' }, { status: 500 });
  }
}
