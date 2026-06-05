import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || (role !== 'COMPANY_MANAGER' && role !== 'SUPER_ADMIN' && role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const companyId = (session.user as any).companyId;
    
    // SUPER_ADMIN ise tüm kullanıcıları görebilir, COMPANY_MANAGER ise sadece kendi şirketini
    const users = await prisma.user.findMany({
      where: role === 'COMPANY_MANAGER' ? { companyId } : undefined,
      select: { id: true, name: true, email: true, role: true, createdAt: true, company: { select: { name: true } } }
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Kullanıcılar getirilemedi' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || (role !== 'COMPANY_MANAGER' && role !== 'SUPER_ADMIN' && role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const body = await req.json();
    let { companyId } = body;
    if (companyId === '') companyId = null;

    // Eğer yetkili COMPANY_MANAGER ise sadece kendi şirketine ekleyebilir
    if (role === 'COMPANY_MANAGER') {
      companyId = (session.user as any).companyId;
      if (!companyId) {
        return NextResponse.json({ error: 'Şirket bilgisi bulunamadı' }, { status: 400 });
      }
    }

    const { name, email, password, role: targetRole } = body;

    if (!name || !email || !password || !targetRole) {
      return NextResponse.json({ error: 'Tüm alanları doldurun' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Bu e-posta kullanımda' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: targetRole,
        companyId,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Kullanıcı eklenemedi' }, { status: 500 });
  }
}
