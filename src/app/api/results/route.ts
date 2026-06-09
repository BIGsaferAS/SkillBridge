import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Kullanıcıyı bul veya anonim olarak oluştur (Basitleştirilmiş)
    let user = await prisma.user.findFirst({
      where: { email: data.email || "anonim@skillbridge.ai" }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: data.email || "anonim@skillbridge.ai",
          name: data.name || "Anonim Aday",
        }
      });
    }

    const result = await prisma.testResult.create({
      data: {
        userId: user.id,
        sector: data.sector,
        department: data.department,
        roleName: data.roleName,
        score: data.score,
        timeSpentSec: data.timeSpentSec || 0,
        profileAnalysis: data.profileAnalysis || "",
        benchmarking: data.benchmarking || "",
        hireDecision: data.hireDecision || "PENDING",
        developmentAreas: data.developmentAreas || "",
        flawAnalysis: data.flawAnalysis || "",
      }
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Save Result Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'COMPANY_MANAGER' && (session.user as any).role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const role = (session.user as any).role;
    const companyId = (session.user as any).companyId;

    const results = await prisma.testResult.findMany({
      where: role === 'COMPANY_MANAGER' && companyId ? { user: { companyId } } : {},
      include: { user: true, jobPosting: true },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
