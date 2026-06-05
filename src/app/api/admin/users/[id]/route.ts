import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request, { params }: { params: any }) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || (role !== 'COMPANY_MANAGER' && role !== 'SUPER_ADMIN' && role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const companyId = (session.user as any).companyId;
    const body = await req.json();
    let { name, email, password, role: targetRole, companyId: newCompanyId } = body;
    if (newCompanyId === '') newCompanyId = null;

    // fix params issue for next.js 15
    const resolvedParams = await params;
    
    const targetUser = await prisma.user.findUnique({ where: { id: resolvedParams.id } });
    if (!targetUser) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }
    
    // Eğer COMPANY_MANAGER ise sadece kendi şirketindeki kullanıcıyı düzenleyebilir
    if (role === 'COMPANY_MANAGER' && targetUser.companyId !== companyId) {
      return NextResponse.json({ error: 'Bu kullanıcıyı düzenleme yetkiniz yok' }, { status: 403 });
    }

    const updateData: any = { name, email, role: targetRole };
    if ((role === 'SUPER_ADMIN' || role === 'ADMIN') && newCompanyId) updateData.companyId = newCompanyId;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: resolvedParams.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true }
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Güncelleme başarısız' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: any }) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || (role !== 'COMPANY_MANAGER' && role !== 'SUPER_ADMIN' && role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const companyId = (session.user as any).companyId;
    
    // fix params issue for next.js 15
    const resolvedParams = await params;

    const targetUser = await prisma.user.findUnique({ where: { id: resolvedParams.id } });
    if (!targetUser) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    if (role === 'COMPANY_MANAGER' && targetUser.companyId !== companyId) {
      return NextResponse.json({ error: 'Bu kullanıcıyı silme yetkiniz yok' }, { status: 403 });
    }

    await prisma.user.delete({ where: { id: resolvedParams.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Silme işlemi başarısız' }, { status: 500 });
  }
}
