import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const competencies = await prisma.competency.findMany({
      select: {
        name: true,
        category: true,
        description: true,
        levelA: true,
        levelB: true,
        levelC: true,
        levelD: true,
        levelE: true
      }
    });
    return NextResponse.json(competencies);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
