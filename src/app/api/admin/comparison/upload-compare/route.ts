import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mammoth from "mammoth";

// Helper: Extract text from general files (PDF, DOCX, TXT)
async function parseDocumentToText(file: File, model: any): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  if (fileExtension === 'txt') {
    return Buffer.from(arrayBuffer).toString('utf-8');
  } else if (fileExtension === 'docx') {
    const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
    return result.value;
  } else if (fileExtension === 'pdf') {
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const prompt = "Bu görev tanımı veya gereksinimler belgesinin içeriğini eksiksiz bir şekilde düz metin olarak çıkar. Hiçbir yorum yapma, sadece metni ver.";
    const response = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: "application/pdf"
        }
      },
      prompt
    ]);
    return response.response.text();
  }
  
  return Buffer.from(arrayBuffer).toString('utf-8');
}

// Helper: Extract candidate info (name, email, summary) from CV files
async function parseCandidateCv(file: File, model: any): Promise<{ name: string; email: string; summary: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  let extractedText = "";
  const isPdf = fileExtension === 'pdf';
  
  if (isPdf) {
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const prompt = `Bu özgeçmiş (CV) belgesinden adayın adını (name), e-posta adresini (email) ve tüm deneyim, beceri ve eğitimlerini içeren detaylı bir özgeçmiş özetini (summary) çıkar. 
    Eğer e-posta adresi veya isim belgede açıkça bulunamıyorsa, dosya isminden veya mantıklı varsayımlardan yola çıkarak bir değer belirle. Dosya ismi: "${file.name}"
    Çıktıyı kesinlikle başka hiçbir açıklama metni olmadan ve markdown kod blokları (örneğin \`\`\`json) KULLANMADAN şu JSON formatında dön:
    {
      "name": "Adayın Adı Soyadı",
      "email": "adayin.epostasi@example.com",
      "summary": "Detaylı deneyimler, beceriler, eğitimler ve projeler özeti..."
    }`;
    
    const response = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: "application/pdf"
        }
      },
      prompt
    ]);
    
    const resText = response.response.text();
    try {
      const cleanRes = resText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanRes);
    } catch (e) {
      console.error("PDF Candidate JSON parse error", e, resText);
      return {
        name: file.name.replace(/\.[^/.]+$/, ""),
        email: `candidate-${Date.now()}@example.com`,
        summary: resText || "Özgeçmiş içeriği okunamadı."
      };
    }
  } else {
    if (fileExtension === 'docx') {
      const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
      extractedText = result.value;
    } else {
      extractedText = Buffer.from(arrayBuffer).toString('utf-8');
    }
    
    const prompt = `Aşağıdaki özgeçmiş (CV) metnini analiz et ve adayın adını (name), e-posta adresini (email) ve tüm deneyim, beceri ve eğitimlerini içeren detaylı bir özgeçmiş özetini (summary) çıkar.
    Eğer e-posta adresi veya isim belgede açıkça bulunamıyorsa, dosya isminden veya mantıklı varsayımlardan yola çıkarak bir değer belirle. Dosya ismi: "${file.name}"

    Ham Metin:
    "${extractedText}"

    Çıktıyı kesinlikle başka hiçbir açıklama metni olmadan ve markdown kod blokları (örneğin \`\`\`json) KULLANMADAN şu JSON formatında dön:
    {
      "name": "Adayın Adı Soyadı",
      "email": "adayin.epostasi@example.com",
      "summary": "Detaylı deneyimler, beceriler, eğitimler ve projeler özeti..."
    }`;
    
    const response = await model.generateContent(prompt);
    const resText = response.response.text();
    try {
      const cleanRes = resText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanRes);
    } catch (e) {
      console.error("Text Candidate JSON parse error", e, resText);
      return {
        name: file.name.replace(/\.[^/.]+$/, ""),
        email: `candidate-${Date.now()}@example.com`,
        summary: extractedText || "Özgeçmiş içeriği okunamadı."
      };
    }
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const companyId = session?.user ? (session.user as any).companyId : null;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Lütfen .env dosyasına GEMINI_API_KEY ekleyin." }, { status: 401 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Read multipart/form-data
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const type = formData.get("type") as string; // RECRUITMENT or PROMOTION
    const requirementsText = formData.get("requirementsText") as string || "";
    const requirementsFile = formData.get("requirementsFile") as File | null;
    const cvFiles = formData.getAll("cvFiles") as File[];

    if (!title || !type) {
      return NextResponse.json({ error: "Başlık ve Tür alanları zorunludur." }, { status: 400 });
    }

    if (cvFiles.length === 0) {
      return NextResponse.json({ error: "En az bir adet aday CV belgesi yüklemelisiniz." }, { status: 400 });
    }

    let finalRequirements = requirementsText;
    
    // If a job description file is uploaded, extract it and prepend/replace
    if (requirementsFile && requirementsFile.size > 0) {
      try {
        const fileCriteria = await parseDocumentToText(requirementsFile, model);
        if (fileCriteria.trim()) {
          finalRequirements = `${fileCriteria}\n\nEk Detaylar:\n${requirementsText}`;
        }
      } catch (err: any) {
        console.error("Gereksinim belgesi okunurken hata oluştu:", err);
      }
    }

    if (!finalRequirements.trim()) {
      return NextResponse.json({ error: "Görev tanımı metni yazılmalı veya görev tanımı belgesi yüklenmelidir." }, { status: 400 });
    }

    let validCompanyId = null;
    if (companyId) {
      const company = await prisma.company.findUnique({ where: { id: companyId } });
      if (company) validCompanyId = companyId;
    }

    // Process all candidate CVs in parallel or sequence
    const parsedCandidates: { name: string; email: string; summary: string }[] = [];
    for (const file of cvFiles) {
      if (file.size === 0) continue;
      try {
        const parsed = await parseCandidateCv(file, model);
        parsedCandidates.push(parsed);
      } catch (err: any) {
        console.error(`Dosya işlenirken hata oluştu: ${file.name}`, err);
        // Fallback candidate
        parsedCandidates.push({
          name: file.name.replace(/\.[^/.]+$/, ""),
          email: `candidate-${Math.random().toString(36).substring(2, 7)}@example.com`,
          summary: `Dosya adı: ${file.name}. Belge okunurken hata oluştu.`
        });
      }
    }

    if (parsedCandidates.length === 0) {
      return NextResponse.json({ error: "Yüklenen belgelerden hiçbir aday bilgisi çıkartılamadı." }, { status: 400 });
    }

    // Create Comparison Session in DB
    const compSession = await prisma.comparisonSession.create({
      data: {
        title,
        type,
        requirements: finalRequirements,
        companyId: validCompanyId,
        candidates: {
          create: parsedCandidates.map((cand) => ({
            name: cand.name,
            email: cand.email,
            status: "SUBMITTED", // Mark as submitted since we already have the CV data
            submittedData: cand.summary
          }))
        }
      },
      include: {
        candidates: true
      }
    });

    return NextResponse.json({ success: true, sessionId: compSession.id });
  } catch (error: any) {
    console.error("Upload comparison session error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
