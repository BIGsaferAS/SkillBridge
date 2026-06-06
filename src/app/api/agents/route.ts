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

    const agentRoles = {
      'AJAN_1': { name: 'Araştırmacı', duty: 'Meslek yetkinlikleri ve kriz argümanları araştırması yapmak.' },
      'AJAN_2': { name: 'Hikaye Yazarı', duty: 'Araştırma notlarına göre karmaşık vaka hikayesi kaleme almak.' },
      'AJAN_3': { name: 'Soru Tasarımcısı', duty: 'Vakayı analiz edip değerlendirme soruları hazırlamak.' },
      'AJAN_4': { name: 'Sınav Sorumlusu', duty: 'Sınav süreleri ve adayın katılım akışını koordine etmek.' },
      'AJAN_5': { name: 'Optik Değerlendirici', duty: 'Sınav cevaplarını okumak ve puanlama yapmak.' },
      'AJAN_6': { name: 'Hata Dedektörü', duty: 'Adayın yanlış cevaplarını analiz edip hata haritasını çıkarmak.' },
      'AJAN_7': { name: 'Profil Uzmanı', duty: 'Adayın mizaç ve stres altındaki psikolojik durumunu çözümlemek.' },
      'AJAN_8': { name: 'Kıyaslama Motoru', duty: 'Adayın puanını ideal profillerle karşılaştırıp benchmark yapmak.' },
      'AJAN_9': { name: 'Mentor', duty: 'Tüm raporları birleştirip nihai işe alım/terfi kararını ve eğitim önerilerini sunmak.' },
      'AJAN_10': { name: 'CV Analisti', duty: 'Aday CV\'sini okuyup zayıf noktaları ve odak alanlarını taramak.' },
      'AJAN_11': { name: 'Barkod & Sınav Koordinatörü', duty: 'QR kod sınav dağıtım bağlantılarını ve davet şablonlarını tasarlamak.' }
    };

    let prompt = "";
    if (input && input.isCustomTask) {
       const roleInfo = (agentRoles as any)[agentId] || { name: 'Asistan', duty: 'İş süreçlerini optimize etmek.' };
       prompt = `Sen SkillBridge ${agentId} (${roleInfo.name}) rolündesin. Görevin: ${roleInfo.duty}
       
Yönetici sana doğrudan şu görevi tanımladı: "${input.customPrompt}"

Lütfen bu görevi yerine getiren profesyonel, detaylı ve doğrudan uygulanabilir bir rapor veya metin yanıtı üret. Yanıtını anlaşılır Türkçe dilinde ver.`;
    } else {
       if (agentId === 'AJAN_1') {
          prompt = `Sen SkillBridge Ajan 1 (Araştırmacı) rolündesin. Görevin şu meslek/rol için güncel araştırma notları çıkarmaktır: ${JSON.stringify(input)}. Sadece ham notlar çıkar ve kesinlikle geçerli bir JSON olarak dön. Format: {"coreCompetencies": ["yetkinlik1"], "objectionHandling": ["itiraz1"], "crisisScenarios": ["kriz1"]}`;
       } else if (agentId === 'AJAN_2') {
          prompt = `Sen SkillBridge Ajan 2 (Yazar) rolündesin. Ajan 1'in notlarını kullanarak adayı terletecek, kriz dolu zorlu bir Vaka Hikayesi kaleme al. En fazla 3 paragraf olsun. Sadece hikaye metnini düz metin olarak ver. Notlar: ${JSON.stringify(input)}`;
       } else if (agentId === 'AJAN_3') {
          prompt = `Sen SkillBridge Ajan 3 (Soru Tasarımcısı) rolündesin. Verilen hikayeyi analiz et ve adayın kriz yönetimi tutarlılığını ölçecek 3 adet 'Çoktan Seçmeli (4 şıklı)' soru üret. Kesinlikle geçerli JSON formatında dön. Format: {"questions": [{"id": 1, "question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "expectedAnswer": "A) ...", "explanation": "..."}]}. Hikaye: ${input}`;
       } else if (agentId === 'AJAN_6') {
          prompt = `Sen SkillBridge Ajan 6 (Hata Dedektörü) rolündesin. Aday şu sorularda hata yaptı: ${JSON.stringify(input)}. Adayın neden hata yaptığına dair 2-3 cümlelik sert, psikolojik ve analitik bir 'Hata Haritası' analizi yaz. Sadece düz metin dön.`;
       } else if (agentId === 'AJAN_10') {
          prompt = `Sen SkillBridge Ajan 10 (CV Analisti) rolündesin. Adayın girdiği CV'yi (Özgeçmiş) oku ve İlan Gereksinimleri ile karşılaştır. İlan: ${JSON.stringify(input.job)}. CV: ${input.cvText}. Sadece adayın CV'sine özel, testte onu zorlamak için kullanılacak 3 adet 'Spesifik Zayıf Nokta veya Odaklanılacak Konu' çıkar. JSON formatında dön. Format: {"focusAreas": ["..."]}`;
       } else if (agentId === 'AJAN_11') {
          prompt = `Sen SkillBridge Ajan 11 (Barkod & Sınav Koordinatörü) rolündesin. Görevin, QR ve barkod tabanlı sınav dağıtım süreçlerini yönetmektir. Admin sana şu talebi gönderdi: ${JSON.stringify(input)}. Talebi yerine getiren profesyonel, yapıcı ve doğrudan kopyalanabilir e-posta şablonları, link formatları veya veri özetleri içeren bir yanıt üret. Sadece düz metin dön.`;
       } else {
          const roleInfo = (agentRoles as any)[agentId] || { name: 'Asistan', duty: 'İşe alım süreçlerini denetlemek.' };
          prompt = `Sen SkillBridge ${agentId} (${roleInfo.name}) rolündesin. Görevin: ${roleInfo.duty} Giriş parametresi: ${JSON.stringify(input)}. Lütfen görevini yerine getiren bir sonuç metni dön.`;
       }
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
