import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const candidate = await prisma.comparisonCandidate.findUnique({
      where: { id },
      include: {
        session: {
          select: {
            title: true,
            type: true,
            requirements: true,
          }
        }
      }
    });

    if (!candidate) {
      return NextResponse.json({ error: "Aday/Çalışan kaydı bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ candidate });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();
    const { submittedData } = data;

    if (!submittedData) {
      return NextResponse.json({ error: "Gönderilen veri boş olamaz." }, { status: 400 });
    }

    const candidate = await prisma.comparisonCandidate.findUnique({
      where: { id }
    });

    if (!candidate) {
      return NextResponse.json({ error: "Aday bulunamadı." }, { status: 404 });
    }

    const updated = await prisma.comparisonCandidate.update({
      where: { id },
      data: {
        submittedData,
        status: "SUBMITTED"
      }
    });

    return NextResponse.json({ success: true, candidate: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
