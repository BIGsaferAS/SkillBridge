import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || (role !== 'SUPER_ADMIN' && role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const industries = await prisma.industry.findMany();
    const departments = await prisma.department.findMany();
    const jobRoles = await prisma.jobRole.findMany();
    const competencies = await prisma.competency.findMany();
    const questionTemplates = await prisma.questionTemplate.findMany();
    const companies = await prisma.company.findMany({
      include: { _count: { select: { users: true } } }
    });
    const users = await prisma.user.findMany({
      include: { company: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      industries,
      departments,
      jobRoles,
      competencies,
      questionTemplates,
      companies,
      users
    });
  } catch (error) {
    return NextResponse.json({ error: 'Veriler getirilemedi' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || (role !== 'SUPER_ADMIN' && role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const data = await req.json();
    const { type, payload } = data; // type: 'industry', 'department', 'jobRole', 'competency', 'questionTemplate'

    let result;
    if (type === 'industry') {
      result = await prisma.industry.create({ data: { name: payload.name } });
    } else if (type === 'department') {
      result = await prisma.department.create({ data: { name: payload.name } });
    } else if (type === 'jobRole') {
      result = await prisma.jobRole.create({ data: { name: payload.name, description: payload.description } });
    } else if (type === 'competency') {
      result = await prisma.competency.create({ 
        data: { 
          name: payload.name, 
          category: payload.category || 'BİLİŞSEL',
          description: payload.description || null,
          causeEffect: payload.causeEffect || null,
          levelA: payload.levelA || null,
          levelB: payload.levelB || null,
          levelC: payload.levelC || null,
          levelD: payload.levelD || null,
          levelE: payload.levelE || null,
        } 
      });
    } else if (type === 'questionTemplate') {
      result = await prisma.questionTemplate.create({ 
        data: {
          sector: payload.sector,
          department: payload.department,
          roleName: payload.roleName,
          competency: payload.competency,
          difficulty: payload.difficulty,
          type: payload.type,
          scenarioText: payload.scenarioText,
          questionText: payload.questionText,
          options: payload.options,
          correctAnswer: payload.correctAnswer,
          explanation: payload.explanation
        }
      });
    } else {
      return NextResponse.json({ error: 'Geçersiz veri tipi' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Data bank post error:', error);
    return NextResponse.json({ error: 'Kayıt eklenemedi' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || (role !== 'SUPER_ADMIN' && role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const data = await req.json();
    const { id, type, payload } = data;

    let result;
    if (type === 'competency') {
      result = await prisma.competency.update({
        where: { id },
        data: {
          name: payload.name,
          category: payload.category,
          description: payload.description || null,
          causeEffect: payload.causeEffect || null,
          levelA: payload.levelA || null,
          levelB: payload.levelB || null,
          levelC: payload.levelC || null,
          levelD: payload.levelD || null,
          levelE: payload.levelE || null,
        }
      });
    } else {
      return NextResponse.json({ error: 'Güncelleme sadece yetkinlikler için aktif' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Data bank put error:', error);
    return NextResponse.json({ error: 'Kayıt güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || (role !== 'SUPER_ADMIN' && role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || !type) {
      return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 });
    }

    if (type === 'competency') {
      await prisma.competency.delete({ where: { id } });
    } else {
      return NextResponse.json({ error: 'Silme işlemi sadece yetkinlikler için aktif' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Data bank delete error:', error);
    return NextResponse.json({ error: 'Kayıt silinemedi' }, { status: 500 });
  }
}
