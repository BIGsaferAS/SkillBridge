import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const documents = await prisma.document.findMany({
    where: undefined,
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(documents);
}
