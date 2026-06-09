import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

function extractAndParseJSON(text: string) {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch (e) {}

  const startIdx = trimmed.indexOf('{');
  const endIdx = trimmed.lastIndexOf('}');
  
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const jsonCandidate = trimmed.substring(startIdx, endIdx + 1);
    try {
      return JSON.parse(jsonCandidate);
    } catch (e) {}
  }

  const startArrIdx = trimmed.indexOf('[');
  const endArrIdx = trimmed.lastIndexOf(']');
  if (startArrIdx !== -1 && endArrIdx !== -1 && endArrIdx > startArrIdx) {
    const jsonCandidate = trimmed.substring(startArrIdx, endArrIdx + 1);
    try {
      return JSON.parse(jsonCandidate);
    } catch (e) {}
  }

  throw new Error("JSON formatı çözülemedi.");
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'COMPANY_MANAGER' && (session.user as any).role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

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
      'AJAN_11': { name: 'Barkod & Sınav Koordinatörü', duty: 'QR kod sınav dağıtım bağlantılarını ve davet şablonlarını tasarlamak.' },
      'AJAN_12': { name: 'Frontend Ajanı', duty: 'Tasarım taslaklarını koda dökmek, mobil uyumluluk ve API entegrasyonu sağlamak.' },
      'AJAN_13': { name: 'Backend Ajanı', duty: 'Güvenli, hızlı ve ölçeklenebilir API mimarileri, yetkilendirme ve iş mantığı servisleri tasarlamak.' },
      'AJAN_14': { name: 'Veri Tabanı Ajanı', duty: 'Veri tabanı şemalarını tasarlamak, migrations yönetmek ve sorguları optimize etmek.' },
      'AJAN_15': { name: 'Tasarımcı Ajanı', duty: 'Kullanıcı arayüz tasarımlarındaki görsel eksikleri gidermek, UX akışlarını basitleştirmek ve Tasarım Kütüphanesi hazırlamak.' },
      'AJAN_16': { name: 'Yetkinlik Soru Ajanı', duty: 'Sadece yetkinlik matrisine ve seviye tanımlarına göre çoktan seçmeli davranış ve durum değerlendirme soruları üretmek.' },
      'AJAN_17': { name: 'Editör ve Kalite Denetleyicisi', duty: 'Ajan 1, 2, 3 ve 16\'nın ürettiği vaka sorularını, matris çıktılarını ve radar grafik modellerini Recep Yigit\'in master prompt kurallarına göre denetler, hataları düzeltir ve format tutarlılığını sağlar.' }
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
           prompt = `Sen SkillBridge Ajan 3 (Soru Tasarımcısı) rolündesin. Verilen hikayeyi analiz et ve adayın kriz yönetimi tutarlılığını ölçecek 3 adet 'Çoktan Seçmeli (4 şıklı)' soru üret.
Her soru için şunlara KESİNLİKLE dikkat et:
1. Doğru cevap seçeneği (A, B, C veya D şıklarından biri) her soruda rastgele dağıtılmalıdır, hepsi aynı şıkta (örneğin hep A'da veya hep B'de) toplanmamalıdır.
2. A, B, C ve D şıklarındaki seçeneklerin uzunlukları, kelime sayıları ve detay dereceleri birbirine çok yakın (neredeyse aynı uzunlukta) olmalıdır. Doğru şık, uzunluğu veya kısalığı ile kendini belli etmemelidir.
3. Kesinlikle geçerli JSON formatında dön. Format: {"questions": [{"id": 1, "question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "expectedAnswer": "C) ...", "explanation": "..."}]}.
Hikaye: ${input}`;
       } else if (agentId === 'AJAN_6') {
          prompt = `Sen SkillBridge Ajan 6 (Hata Dedektörü) rolündesin. Aday şu sorularda hata yaptı: ${JSON.stringify(input)}. Adayın neden hata yaptığına dair 2-3 cümlelik sert, psikolojik ve analitik bir 'Hata Haritası' analizi yaz. Sadece düz metin dön.`;
       } else if (agentId === 'AJAN_10') {
          prompt = `Sen SkillBridge Ajan 10 (CV Analisti) rolündesin. Adayın girdiği CV'yi (Özgeçmiş) oku ve İlan Gereksinimleri ile karşılaştır. İlan: ${JSON.stringify(input.job)}. CV: ${input.cvText}. Sadece adayın CV'sine özel, testte onu zorlamak için kullanılacak 3 adet 'Spesifik Zayıf Nokta veya Odaklanılacak Konu' çıkar. JSON formatında dön. Format: {"focusAreas": ["..."]}`;
       } else if (agentId === 'AJAN_11') {
          prompt = `Sen SkillBridge Ajan 11 (Barkod & Sınav Koordinatörü) rolündesin. Görevin, QR ve barkod tabanlı sınav dağıtım süreçlerini yönetmektir. Admin sana şu talebi gönderdi: ${JSON.stringify(input)}. Talebi yerine getiren profesyonel, yapıcı ve doğrudan kopyalanabilir e-posta şablonları, link formatları veya veri özetleri içeren bir yanıt üret. Sadece düz metin dön.`;
       } else if (agentId === 'AJAN_16') {
          prompt = `Sen SkillBridge Ajan 16 (Yetkinlik Soru Ajanı) rolündesin. Görevin, verilen yetkinlikler ve hiyerarşi düzeylerine göre sadece yetkinlik verisini ve matris tanımlarını baz alan çoktan seçmeli (4 şıklı) değerlendirme soruları üretmektir.
Sorular bir vaka senaryosu (case study) yerine, doğrudan adayın ilgili yetkinlikteki seviyesini ve davranışını ölçecek mülakat durumları olmalıdır.
Her soru için şunlara KESİNLİKLE dikkat et:
1. Doğru cevap seçeneği (A, B, C veya D şıklarından biri) her soruda rastgele dağıtılmalıdır.
2. Şıkların metin uzunlukları ve kelime sayıları birbirine KESİNLİKLE çok yakın (neredeyse tamamen aynı) olmalıdır.
3. Sorulacak yetkinlikler ve beklenen seviyeler: ${JSON.stringify(input)}
4. Kesinlikle geçerli JSON formatında dön. Format: {"questions": [{"id": 1, "competency": "...", "question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "expectedAnswer": "...", "explanation": "..."}]}.`;
       } else if (agentId === 'AJAN_17') {
          prompt = `Sen SkillBridge Ajan 17 (Editör ve Kalite Denetleyicisi) rolündesin. Görevin; Seçme-Yerleştirme, Yetenek Yönetimi, Kurumsal Değerlendirme ve İK Analitiği alanında uzmanlaşmış, gelişmiş bir Yapay Zeka Değerlendirme Merkezi (Assessment Center) olarak, verilen girdi metnini veya JSON içeriğini Recep Yigit'in master prompt kurallarına göre denetlemek, düzeltmek ve en yüksek kaliteli, hatasız editör çıktısını üretmektir.
           
           Şu ana kurallara, sadeleştirmelere ve yapıya %100 uyacaksın:
           
           ### 1. KATEGORİ VE YETKİNLİK YAPISI (4 Kategori x 10 Yetkinlik = 40 Yetkinlik)
           Sadeleştirilmiş, birbiriyle çakışmayan 40 yetkinlik:
           - BİLİŞSEL YETKİNLİKLER (10 Adet): Analitik Düşünme, Stratejik Düşünme, Sayısal Düşünme, Sözel Düşünme, Yaratıcı Düşünme, Dikkat ve Odaklanma vb.
           - TEKNİK YETKİNLİKLER (10 Adet): Örn: "Teknik Problem Çözme" yerine "Arıza Giderme".
           - TEMEL YETKİNLİKLER (10 Adet): "İş Disiplini", "Etik Değerler", "İlişki Yönetimi", "Müşteri İlişkileri", "İnovasyon", "Risk Önleme".
           - YÖNETSEL YETKİNLİKLER (10 Adet): "Önceliklendirme", "Sonuç ve Performans Takibi", "Kriz Yönetimi", "Eğitim ve Gelişim".

           ### 2. DEĞERLENDİRME VE SEVİYELENDİRME SİSTEMİ (5'li Barem)
           Cevap şıklarını ve davranış göstergelerini A, B, C, D, E puanlama mantığına göre kontrol et (A=1, B=2, C=3, D=4, E=5):
           - A: Çok Yetersiz (Sık hata yapar, yoğun yönlendirme ve kontrol ister).
           - B: Yetersiz (Basit durumlarda kalıplara bağlı kalır, tutarsızdır, şablon ister).
           - C: Beklenen (Standart durumlarda kurallara uyar, zamanında ve doğru çıktı üretir).
           - D: Yeterli (Karmaşık durumlarda proaktiftir, alternatif üretir, diğerlerine mentorluk yapar).
           - E: Çok Yeterli (Kritik durumlarda örnek düzeydedir, yöntem/standart geliştirir, kurumsal yaygınlaştırma sağlar).

           ### 3. DİNAMİK SORU VE ÇIKTI KONTROLÜ
           - Her test kendine özel olmalı. Statik, kalıplaşmış veya her defasında aynı puan matrisini veren kopyala-yapıştır çıktılardan kesinlikle kaçın.
           - Doğru seçeneğin rastgele dağıldığını doğrula.
           - Şıkların uzunluk ve detay dengesini kontrol et.

           Girdi: ${JSON.stringify(input)}
           Lütfen en yüksek kalitede, düzeltilmiş, JSON veya metin çıktısını üret.`;
       } else {
          const roleInfo = (agentRoles as any)[agentId] || { name: 'Asistan', duty: 'İşe alım süreçlerini denetlemek.' };
          prompt = `Sen SkillBridge ${agentId} (${roleInfo.name}) rolündesin. Görevin: ${roleInfo.duty} Giriş parametresi: ${JSON.stringify(input)}. Lütfen görevini yerine getiren bir sonuç metni dön.`;
       }
    }

    if (!prompt) {
       return NextResponse.json({ error: "Unknown agent" }, { status: 400 });
    }

    const needsJson = !input?.isCustomTask && (agentId === 'AJAN_1' || agentId === 'AJAN_3' || agentId === 'AJAN_10' || agentId === 'AJAN_16' || agentId === 'AJAN_17');
    const result = await model.generateContent(
      needsJson 
        ? {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          }
        : prompt
    );
    const text = result.response.text();
    
    let parsedResult = text;
    if (needsJson) {
        try {
            parsedResult = extractAndParseJSON(text);
        } catch(e) {
            console.error("JSON parse error for agent", agentId, text, e);
            return NextResponse.json({ error: "Gemini AI geçerli bir JSON döndüremedi. Lütfen tekrar deneyin." }, { status: 500 });
        }
    }

    return NextResponse.json({ result: parsedResult });

  } catch (error: any) {
    console.error("Agent Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
