import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // sessionId
    const data = await req.json();
    const { name, email } = data;

    if (!name || !email) {
      return NextResponse.json({ error: "Lütfen ad soyad ve e-posta bilgilerini girin." }, { status: 400 });
    }

    const session = await prisma.comparisonSession.findUnique({
      where: { id },
      include: { candidates: true }
    });

    if (!session) {
      return NextResponse.json({ error: "Karşılaştırma oturumu bulunamadı." }, { status: 404 });
    }

    // Adayın e-postası bu oturumda zaten kayıtlı mı kontrol et
    let candidate = session.candidates.find(c => c.email.toLowerCase() === email.toLowerCase());

    if (!candidate) {
      // Dinamik aday ekle
      candidate = await prisma.comparisonCandidate.create({
        data: {
          sessionId: id,
          name,
          email,
          status: "PENDING"
        }
      });
    }

    return NextResponse.json({ success: true, candidateId: candidate.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
