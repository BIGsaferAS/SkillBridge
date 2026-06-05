import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const companyId = session?.user ? (session.user as any).companyId : null;

    const compSession = await prisma.comparisonSession.findUnique({
      where: { id },
      include: {
        candidates: true
      }
    });

    if (!compSession) {
      return NextResponse.json({ error: "Karşılaştırma oturumu bulunamadı." }, { status: 404 });
    }

    let validCompanyId = null;
    if (companyId) {
      const company = await prisma.company.findUnique({ where: { id: companyId } });
      if (company) validCompanyId = companyId;
    }

    // Company verification
    if (validCompanyId && compSession.companyId !== validCompanyId) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
    }

    return NextResponse.json({ session: compSession });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const companyId = session?.user ? (session.user as any).companyId : null;

    const compSession = await prisma.comparisonSession.findUnique({
      where: { id }
    });

    if (!compSession) {
      return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 404 });
    }

    let validCompanyId = null;
    if (companyId) {
      const company = await prisma.company.findUnique({ where: { id: companyId } });
      if (company) validCompanyId = companyId;
    }

    if (validCompanyId && compSession.companyId !== validCompanyId) {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    await prisma.comparisonSession.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
