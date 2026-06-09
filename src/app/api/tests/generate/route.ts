import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'COMPANY_MANAGER' && (session.user as any).role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { documentId } = await req.json();
    if (!documentId) {
      return NextResponse.json({ error: 'documentId gerekli' }, { status: 400 });
    }

    const companyId = (session.user as any).companyId;
    let validCompanyId = null;
    if (companyId) {
      const company = await prisma.company.findUnique({ where: { id: companyId } });
      if (company) validCompanyId = companyId;
    }

    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document || (validCompanyId && document.companyId !== validCompanyId)) {
      return NextResponse.json({ error: 'Doküman bulunamadı veya erişim yetkiniz yok' }, { status: 404 });
    }

    // Mock AI Generation (Ajan 3)
    // Gerçekte burada Gemini/OpenAI API çağrısı yapılıp document.content veya dosyası analiz edilip JSON döner.
    // Şimdilik 1 saniye bekletip mock data kaydediyoruz.
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockQuestions = [
      {
        text: `${document.name} belgesinde vurgulanan temel ana fikir aşağıdakilerden hangisidir?`,
        options: JSON.stringify(["Müşteri memnuniyeti", "Süreç optimizasyonu", "Maliyet düşürme", "Yeni pazarlara açılma"]),
        correctAnswer: "Müşteri memnuniyeti",
        explanation: "Belgenin genel bağlamında en çok müşteri geri bildirimlerine değinilmektedir."
      },
      {
        text: `Bu dokümana göre operasyonel verimliliği artırmak için atılması gereken İLK adım nedir?`,
        options: JSON.stringify(["Ekip eğitimi", "Veri analizi", "Bütçe onayı", "Yazılım güncellemesi"]),
        correctAnswer: "Veri analizi",
        explanation: "1. Bölümde açıkça belirtildiği üzere veri analizi olmadan aksiyon alınmamalıdır."
      }
    ];

    const test = await prisma.test.create({
      data: {
        companyId: validCompanyId,
        documentId: document.id,
        title: `${document.name} - Değerlendirme Testi`,
        description: `Bu test Ajan 3 tarafından ${document.name} belgesi referans alınarak otomatik üretilmiştir.`,
        questions: {
          create: mockQuestions
        }
      }
    });

    return NextResponse.json({ success: true, testId: test.id });
  } catch (error) {
    console.error('Test generation error:', error);
    return NextResponse.json({ error: 'Test üretilemedi' }, { status: 500 });
  }
}
