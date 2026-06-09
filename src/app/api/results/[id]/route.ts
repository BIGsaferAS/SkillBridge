import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'COMPANY_MANAGER' && (session.user as any).role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { id } = await params;
    const result = await prisma.testResult.findUnique({
      where: { id: id },
      include: { user: true },
    });

    if (!result) {
      return NextResponse.json({ error: "Sonuç bulunamadı" }, { status: 404 });
    }

    const role = (session.user as any).role;
    const companyId = (session.user as any).companyId;

    if (role === 'COMPANY_MANAGER' && result.user?.companyId !== companyId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    // Try to find matching TestAttempt to fetch competency matrix and AI advice
    const attempt = await prisma.testAttempt.findFirst({
      where: {
        userId: result.userId,
        status: 'COMPLETED',
        test: {
          roleName: result.roleName,
          sector: result.sector,
          department: result.department
        }
      },
      include: {
        answers: {
          include: { question: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      ...result,
      competencyMatrix: attempt?.competencyMatrix || null,
      aiCareerAdvice: attempt?.aiCareerAdvice || null,
      answers: attempt?.answers || []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'COMPANY_MANAGER' && (session.user as any).role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { id } = await params;
    const result = await prisma.testResult.findUnique({
      where: { id: id },
      include: { user: true },
    });

    if (!result) {
      return NextResponse.json({ error: "Sonuç bulunamadı" }, { status: 404 });
    }

    const role = (session.user as any).role;
    const companyId = (session.user as any).companyId;

    if (role === 'COMPANY_MANAGER' && result.user?.companyId !== companyId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    await prisma.testResult.delete({
      where: { id: id }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
