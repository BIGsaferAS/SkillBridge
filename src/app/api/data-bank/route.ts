import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const industries = await prisma.industry.findMany();
    const departments = await prisma.department.findMany();
    const jobRoles = await prisma.jobRole.findMany();
    const competencies = await prisma.competency.findMany();

    return NextResponse.json({
      industries,
      departments,
      jobRoles,
      competencies
    });
  } catch (error) {
    return NextResponse.json({ error: 'Veriler getirilemedi' }, { status: 500 });
  }
}
