import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Lütfen .env dosyasına GEMINI_API_KEY ekleyin. Sistem artık sahte veri kabul etmiyor!" }, { status: 401 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const { agentId, input } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let prompt = "";
    if (agentId === 'AJAN_1') {
       prompt = `Sen SkillBridge Ajan 1 (Araştırmacı) rolündesin. Görevin şu meslek/rol için güncel araştırma notları çıkarmaktır: ${JSON.stringify(input)}. Sadece ham notlar çıkar ve kesinlikle geçerli bir JSON olarak dön. Markdown tagleri ( \`\`\`json ) KULLANMA. Sadece süslü parantezlerle başla. Format: {"coreCompetencies": ["yetkinlik1"], "objectionHandling": ["itiraz1"], "crisisScenarios": ["kriz1"]}`;
    } else if (agentId === 'AJAN_2') {
       prompt = `Sen SkillBridge Ajan 2 (Yazar) rolündesin. Ajan 1'in notlarını kullanarak adayı terletecek, kriz dolu zorlu bir Vaka Hikayesi kaleme al. En fazla 3 paragraf olsun. Sadece hikaye metnini düz metin olarak ver. Notlar: ${JSON.stringify(input)}`;
    } else if (agentId === 'AJAN_3') {
       prompt = `Sen SkillBridge Ajan 3 (Soru Tasarımcısı) rolündesin. Verilen hikayeyi analiz et ve adayın kriz yönetimi tutarlılığını ölçecek 3 adet 'Çoktan Seçmeli (4 şıklı)' soru üret. Kesinlikle geçerli JSON formatında dön. Markdown tagleri kullanma. Format: {"questions": [{"id": 1, "question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "expectedAnswer": "A) ...", "explanation": "..."}]}. Hikaye: ${input}`;
    } else if (agentId === 'AJAN_6') {
       prompt = `Sen SkillBridge Ajan 6 (Hata Dedektörü) rolündesin. Aday şu sorularda hata yaptı: ${JSON.stringify(input)}. Adayın neden hata yaptığına dair 2-3 cümlelik sert, psikolojik ve analitik bir 'Hata Haritası' analizi yaz. Sadece düz metin dön.`;
    } else if (agentId === 'AJAN_10') {
       prompt = `Sen SkillBridge Ajan 10 (CV Analisti) rolündesin. Adayın girdiği CV'yi (Özgeçmiş) oku ve İlan Gereksinimleri ile karşılaştır. İlan: ${JSON.stringify(input.job)}. CV: ${input.cvText}. Sadece adayın CV'sine özel, testte onu zorlamak için kullanılacak 3 adet 'Spesifik Zayıf Nokta veya Odaklanılacak Konu' çıkar. JSON formatında dön. Format: {"focusAreas": ["..."]}`;
    } else if (agentId === 'AJAN_11') {
       prompt = `Sen SkillBridge Ajan 11 (Barkod & Sınav Koordinatörü) rolündesin. Görevin, QR ve barkod tabanlı sınav dağıtım süreçlerini yönetmektir. Admin sana şu talebi gönderdi: ${JSON.stringify(input)}. Talebi yerine getiren profesyonel, yapıcı ve doğrudan kopyalanabilir e-posta şablonları, link formatları veya veri özetleri içeren bir yanıt üret. Sadece düz metin dön.`;
    }

    if (!prompt) {
       return NextResponse.json({ error: "Unknown agent" }, { status: 400 });
    }

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    let parsedResult = text;
    if (agentId === 'AJAN_1' || agentId === 'AJAN_3') {
        try {
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            parsedResult = JSON.parse(cleanText);
        } catch(e) {
            console.error("JSON parse error for agent", agentId, text);
            return NextResponse.json({ error: "Gemini AI geçerli bir JSON döndüremedi. Lütfen tekrar deneyin." }, { status: 500 });
        }
    }

    return NextResponse.json({ result: parsedResult });

  } catch (error: any) {
    console.error("Agent Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
