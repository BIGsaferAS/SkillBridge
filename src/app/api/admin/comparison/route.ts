import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const companyId = session?.user ? (session.user as any).companyId : null;

    let validCompanyId = null;
    if (companyId) {
      const company = await prisma.company.findUnique({ where: { id: companyId } });
      if (company) validCompanyId = companyId;
    }

    const sessions = await prisma.comparisonSession.findMany({
      where: validCompanyId ? { companyId: validCompanyId } : {},
      include: {
        candidates: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            score: true,
            isWinner: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ sessions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const companyId = session?.user ? (session.user as any).companyId : null;

    const data = await req.json();
    const { title, type, requirements, candidates } = data;

    if (!title || !type || !requirements || !candidates || !Array.isArray(candidates)) {
      return NextResponse.json({ error: "Eksik parametre girdiniz." }, { status: 400 });
    }

    let validCompanyId = null;
    if (companyId) {
      const company = await prisma.company.findUnique({ where: { id: companyId } });
      if (company) validCompanyId = companyId;
    }

    // Karşılaştırma oturumu oluştur
    const compSession = await prisma.comparisonSession.create({
      data: {
        title,
        type,
        requirements,
        companyId: validCompanyId,
        candidates: {
          create: candidates.map((cand: any) => ({
            name: cand.name,
            email: cand.email,
            status: "PENDING",
          }))
        }
      },
      include: {
        candidates: true
      }
    });

    return NextResponse.json({ session: compSession });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
