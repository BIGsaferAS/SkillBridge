const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const competencies = [
  {
    category: 'YÖNETSEL',
    name: 'Delegasyon ve Yetki Devri',
    description: 'Doğru kişiye doğru işi verme; güven esaslı yönetim ve kontrol mekanizması kurma.',
    causeEffect: 'Ekip üyelerinin kapasitelerinin etkin kullanılmasını ve yöneticinin stratejik konulara odaklanmasını sağlar.',
    levelA: 'İş dağıtımında doğru kişiye iş verip güvenle takip etme çoğunlukla görülmez. Sık hata yapar/kaçınır; yoğun yönlendirme gerekir.',
    levelB: 'Basit iş dağıtımında doğru kişiye iş verip güvenle takip etme kısmen yapar; tutarsızdır. Şablon/rehberlik ve sık kontrol ister.',
    levelC: 'Standart iş dağıtımında doğru kişiye iş verip güvenle takip etme beklenen düzeyde yapar. Kurallara uyar; zamanında ve doğru çıktı üretir.',
    levelD: 'Karmaşık iş dağıtımında güçlü doğru kişiye iş verip güvenle takip etme; alternatif üretir. Proaktif iyileştirir; başkalarına destek/mentorluk verir.',
    levelE: 'Kritik iş dağıtımında örnek düzeyde doğru kişiye iş verip güvenle takip etme; yöntem/standart geliştirir. İyi uygulamayı kurum genelinde yaygınlaştırır.'
  },
  {
    category: 'YÖNETSEL',
    name: 'Koçluk ve Ekip Geliştirme',
    description: 'Geri bildirim, gelişim fırsatları ve potansiyeli açığa çıkarma.',
    causeEffect: 'Çalışan bağlılığını artırır, geleceğin liderlerini yetiştirir ve performans metriklerini yükseltir.',
    levelA: 'Ekibe geri bildirim vermez; gelişim fırsatlarını göz ardı eder.',
    levelB: 'Sadece sorun olduğunda geri bildirim verir; yüzeysel rehberlik yapar.',
    levelC: 'Düzenli geri bildirim verir, performans görüşmelerini prosedüre uygun yürütür.',
    levelD: 'Kişisel gelişim planları hazırlar, proaktif mentorluk yapar.',
    levelE: 'Şirket çapında bir koçluk kültürü yaratır; diğer liderlere mentorluk yapar.'
  },
  {
    category: 'BİLİŞSEL',
    name: 'Analitik Düşünme',
    description: 'Büyük resmi görerek verileri yorumlama ve anlamlı çıktılar üretme.',
    causeEffect: 'Veriye dayalı stratejik kararların alınmasını sağlar, hata oranını düşürür.',
    levelA: 'Verileri bağdaştıramaz, yüzeysel kararlar alır.',
    levelB: 'Temel verileri okur ancak derin analiz gerektiren durumlarda zorlanır.',
    levelC: 'Mevcut raporları analiz ederek standart sorunların kök nedenini bulur.',
    levelD: 'Farklı kaynaklardan gelen verileri çapraz analiz eder, öngörülerde bulunur.',
    levelE: 'Karmaşık veri setlerinden stratejik modeller çıkarır; kurumsal karar süreçlerini dönüştürür.'
  },
  {
    category: 'BİLİŞSEL',
    name: 'Problem Çözme',
    description: 'Sorunları hızlı ve etkili bir şekilde analiz edip çözüm üretme yeteneği.',
    causeEffect: 'Kriz anlarında operasyonun kesintiye uğramadan devam etmesini sağlar.',
    levelA: 'Sorun karşısında panikler, inisiyatif almaz.',
    levelB: 'Sadece bilindik/rutin sorunları çözebilir.',
    levelC: 'Sorunun kök nedenini araştırır ve kalıcı standart çözümler üretir.',
    levelD: 'Beklenmeyen/yeni sorunlarda hızlıca alternatif B planları devreye sokar.',
    levelE: 'Sorunlar oluşmadan önce riskleri öngörüp engelleyici sistemler kurar.'
  },
  {
    category: 'TEMEL',
    name: 'İletişim ve İkna',
    description: 'Açık, anlaşılır iletişim kurma ve karşı tarafı ikna edebilme.',
    causeEffect: 'Departmanlar arası uyumu artırır, müşteri/paydaş ilişkilerini güçlendirir.',
    levelA: 'Düşüncelerini ifade etmekte zorlanır; dinleme becerisi düşüktür.',
    levelB: 'Günlük iletişimi kurar ancak zorlayıcı diyaloglardan kaçınır.',
    levelC: 'Fikirlerini net ve açık ifade eder, karşı tarafı aktif dinler.',
    levelD: 'Zorlu paydaşlarla empati kurarak fikir birliğine varır, güven inşa eder.',
    levelE: 'Toplulukları etkileyen, ilham veren sunumlar ve müzakereler yapar.'
  },
  {
    category: 'TEKNİK',
    name: 'Proje Yönetimi',
    description: 'Kısıtlı kaynaklar (zaman, bütçe) ile hedeflenen çıktıyı sağlama.',
    causeEffect: 'Stratejik hedeflerin zamanında ve bütçe dahilinde gerçekleşmesini garanti eder.',
    levelA: 'Zaman ve kaynak planlaması yapamaz, teslimatları sürekli geciktirir.',
    levelB: 'Temel iş takibi yapar ancak riskleri yönetemediği için sapmalar yaşanır.',
    levelC: 'Proje takvimini ve bütçeyi belirlenen çerçevede başarılı bir şekilde yönetir.',
    levelD: 'Eşzamanlı birden fazla projeyi optimize ederek verimliliği artırır.',
    levelE: 'Kurumsal düzeyde yeni proje metodolojileri geliştirir ve uygulatır.'
  }
];

async function seed() {
  console.log('Seeding competencies...');
  for (const comp of competencies) {
    await prisma.competency.upsert({
      where: { name: comp.name },
      update: comp,
      create: comp,
    });
  }
  console.log('Seeding completed successfully!');
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
