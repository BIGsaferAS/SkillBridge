import { GoogleGenAI } from '@google/genai';

async function main() {
  const apiKey = process.env.GEMINI_API_KEY || "";
  console.log("Gemini API Key test ediliyor...");
  
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Merhaba, bu bir test mesajıdır. Çalışıyorsan sadece "Evet" yaz.',
    });
    
    console.log("---------------------------------------");
    console.log("BAĞLANTI BAŞARILI! Yapay zeka yanıtı:");
    console.log(response.text);
    console.log("---------------------------------------");
  } catch (error) {
    console.error("---------------------------------------");
    console.error("HATA! Gemini API Key çalışmıyor!");
    console.error("Hata detayı:", error);
    console.error("---------------------------------------");
  }
}

main();
