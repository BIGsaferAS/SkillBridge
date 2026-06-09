import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding NACE Master Data ---');

  // 1. INDUSTRIES (NACE)
  const industries = [
    'Ağaç, Ahşap ve Mobilya Endüstrisi',
    'Metal, Metalürji ve Makine Sanayii',
    'Tekstil, Hazır Giyim ve Deri Endüstrisi',
    'Kimya, Plastik ve Kauçuk Sanayii',
    'Tarım, Hayvancılık ve Gıda Sektörü',
    'Teknoloji, Bilişim ve Elektronik',
    'Hizmet, Sağlık ve Eğitim',
    'Denizcilik, Gemi İnşa ve Su Yolu Taşımacılığı',
    'Otomotiv ve Kara Taşımacılığı',
    'İnşaat ve Altyapı Mühendisliği',
    'Telekomünikasyon ve Haberleşme',
    'Enerji, Akaryakıt ve Rafineri',
    'Finans, Bankacılık ve Sigortacılık'
  ];

  for (const name of industries) {
    await prisma.industry.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  // 2. DEPARTMENTS
  const departments = [
    'İcra Kurulu / Üst Yönetim', 'Finans ve Muhasebe', 'İnsan Kaynakları',
    'Hukuk ve Uyum', 'Satış', 'Pazarlama', 'Müşteri Hizmetleri ve Deneyimi',
    'Ürün ve Ar-Ge', 'Yazılım / Mühendislik', 'Operasyon',
    'Tedarik Zinciri ve Lojistik', 'Üretim', 'Kalite, Denetim ve Risk',
    'Bilgi Teknolojileri (BT)', 'İdari İşler ve Tesis Yönetimi',
    'Kurumsal İletişim ve PR', 'Proje Yönetimi (PMO)', 'Veri, Analitik ve İş Zekası',
    'Satın Alma', 'Kurumsal Gelişim / Dönüşüm'
  ];

  for (const name of departments) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  // 3. JOB ROLES (WITH HIERARCHY)
  const roles = [
    { name: 'CEO', hierarchy: 'MANAGEMENT' },
    { name: 'CFO', hierarchy: 'MANAGEMENT' },
    { name: 'CTO', hierarchy: 'MANAGEMENT' },
    { name: 'CHRO', hierarchy: 'MANAGEMENT' },
    { name: 'Genel Müdür Yardımcısı', hierarchy: 'MANAGEMENT' },
    { name: 'Direktör', hierarchy: 'MANAGEMENT' },
    { name: 'Müdür', hierarchy: 'MANAGEMENT' },
    { name: 'Proje Yöneticisi', hierarchy: 'MANAGEMENT' },
    { name: 'Takım Lideri', hierarchy: 'MANAGEMENT' },
    { name: 'Kıdemli Uzman (Senior)', hierarchy: 'EXPERT' },
    { name: 'Uzman', hierarchy: 'EXPERT' },
    { name: 'Danışman', hierarchy: 'EXPERT' },
    { name: 'Yazılım Geliştirici', hierarchy: 'EXPERT' },
    { name: 'Finansal Analist', hierarchy: 'EXPERT' },
    { name: 'Mühendis', hierarchy: 'EXPERT' },
    { name: 'Uzman Yardımcısı', hierarchy: 'JUNIOR' },
    { name: 'Operatör', hierarchy: 'JUNIOR' },
    { name: 'Teknisyen', hierarchy: 'JUNIOR' },
    { name: 'Çalışan Adayı', hierarchy: 'JUNIOR' }
  ];

  for (const r of roles) {
    await prisma.jobRole.upsert({
      where: { name: r.name },
      update: { hierarchy: r.hierarchy },
      create: { name: r.name, hierarchy: r.hierarchy }
    });
  }

  // 4. COMPETENCIES (WITH A-E RUBRIC AND CAUSE-EFFECT)
  const competencies = [
    // BİLİŞSEL (COGNITIVE)
    {
      name: 'Analitik Düşünme',
      category: 'BİLİŞSEL',
      desc: 'Veri/durum/problem parçalarına ayırarak neden-sonuç ilişkisini anlamlandırma',
      causeEffect: 'Sebep: Veriyi parçalara ayırma ve örüntü yakalama. Sonuç: Riskleri önceden saptayıp hatalı karar almayı önleme.',
      a: 'Problemlerde veriyi parçalara ayırıp neden-sonuç çıkarımı yapma çoğunlukla görülmez.',
      b: 'Basit problemlerde veriyi parçalara ayırıp kısmen yapar; tutarsızdır.',
      c: 'Standart problemlerde veriyi parçalara ayırıp beklenen düzeyde yapar.',
      d: 'Karmaşık problemlerde güçlü veriyi parçalara ayırıp alternatif üretir.',
      e: 'Kritik problemlerde örnek düzeyde çıkarım yapar; yöntem/standart geliştirir.'
    },
    {
      name: 'Problem Çözme',
      category: 'BİLİŞSEL',
      desc: 'Karmaşık durumlarda kök nedeni belirleyip uygulanabilir çözümler geliştirme.',
      causeEffect: 'Sebep: Kriz anında sakin kalıp kök nedeni bulma. Sonuç: Kalıcı iş sürekliliği sağlama.',
      a: 'Kök nedeni bulup uygulanabilir çözüm geliştirme çoğunlukla görülmez.',
      b: 'Basit işlerde kök nedeni bulup kısmen çözüm geliştirir.',
      c: 'Standart işlerde kök nedeni bulup beklenen düzeyde yapar.',
      d: 'Karmaşık işlerde güçlü kök nedeni bulup kalıcı çözüm üretir.',
      e: 'Kritik işlerde örnek düzeyde çözüm geliştirir; kuruma yayar.'
    },
    {
      name: 'Bütünsel / Sistemsel Düşünme',
      category: 'BİLİŞSEL',
      desc: 'Sistemin bütünü içinde değerlendirme; süreçler arası bağlantıları fark etme.',
      causeEffect: 'Sebep: Departmanlar arası zincirleme etkiyi görme. Sonuç: Optimizasyon ve verimlilik artışı.',
      a: 'Süreçlerde parçalar arası etkiyi görüp bütünsel değerlendirme görülmez.',
      b: 'Basit süreçlerde etkiyi kısmen görür.',
      c: 'Standart sistemlerde parçalar arası etkiyi beklenen düzeyde yapar.',
      d: 'Karmaşık süreçlerde güçlü parçalar arası etkiyi görür; iyileştirir.',
      e: 'Kritik süreçlerde örnek düzeyde değerlendirme yapar; yöntem geliştirir.'
    },
    // TEKNİK (TECHNICAL)
    {
      name: 'Süreç Odaklılık',
      category: 'TEKNİK',
      desc: 'İşleri sistem ve süreçler bütünü olarak yürütme; darboğazları görme.',
      causeEffect: 'Sebep: Süreçteki tıkanıklıkları anında fark etme. Sonuç: Daha hızlı ve kayıpsız ürün/hizmet teslimatı.',
      a: 'İş akışlarında darboğazı iyileştirme görülmez.',
      b: 'Basit iş akışlarında kısmen yapar.',
      c: 'Standart akışlarda süreç adımlarını görünür kılıp beklenen düzeyde yapar.',
      d: 'Karmaşık işlerde güçlü darboğaz tespiti yapar.',
      e: 'Kritik iş akışlarında örnek düzeyde iyileştirme yapar; standart belirler.'
    },
    // TEMEL (CORE)
    {
      name: 'İletişim',
      category: 'TEMEL',
      desc: 'Açık, net, saygılı ve etkin iletişim kurabilme.',
      causeEffect: 'Sebep: Anlaşılır, empatik ve şeffaf diyalog. Sonuç: Çatışmaların azalması, çalışan/müşteri memnuniyetinin artması.',
      a: 'Günlük iletişimde net ve saygılı iletişim kurma çoğunlukla görülmez.',
      b: 'Basit günlük iletişimde kısmen yapar.',
      c: 'Standart iletişimde beklenen düzeyde net ve saygılıdır.',
      d: 'Karmaşık ve zorlu anlarda güçlü, etkili iletişim kurar.',
      e: 'Kritik iletişimde örnek düzeydedir; kurumsal standart geliştirir.'
    },
    {
      name: 'Takım Çalışması',
      category: 'TEMEL',
      desc: 'Ortak hedef için ekiplerle uyumlu çalışma.',
      causeEffect: 'Sebep: Bilgi paylaşımı ve destekleme. Sonuç: Hızlı entegrasyon ve yüksek takım performansı.',
      a: 'Bireysel hedefleri takımın önüne koyar.',
      b: 'Sadece kendi sorumluluğundaki işleri yapar, takıma katkısı zayıftır.',
      c: 'Takım üyeleriyle uyumlu çalışır, üzerine düşeni yapar.',
      d: 'Takım içi sorunları çözer, arkadaşlarına mentörlük yapar.',
      e: 'Çapraz fonksiyonel (cross-functional) takımları bile mükemmel yönetip ilham verir.'
    },
    // YÖNETSEL (MANAGERIAL)
    {
      name: 'Stratejik Düşünme',
      category: 'YÖNETSEL',
      desc: 'Büyük resmi görme, uzun vadeli hedefler belirleme ve strateji-plan dengesi kurma.',
      causeEffect: 'Sebep: Uzun vadeli pazar analizleri yapabilme. Sonuç: Şirketin rekabet avantajını koruması ve sürdürülebilir büyüme.',
      a: 'Büyük resmi görüp stratejik öncelik belirleme görülmez.',
      b: 'Basit planlamada büyük resmi kısmen görür.',
      c: 'Standart yönetsel planlamada beklenen düzeyde yapar.',
      d: 'Karmaşık organizasyonda güçlü strateji belirler ve alternatif üretir.',
      e: 'Sektörel ve küresel çapta örnek stratejik vizyon ortaya koyar.'
    },
    {
      name: 'Karar Alma',
      category: 'YÖNETSEL',
      desc: 'Belirsizlik anlarında sorumluluk alıp hızlı ve etkili kararlar verme.',
      causeEffect: 'Sebep: Risk/Fayda analizini hızla sentezleyebilme. Sonuç: Kayıpları minimize eden proaktif liderlik duruşu.',
      a: 'Karar almaktan kaçınır veya sürekli geciktirir.',
      b: 'Karar alırken başkalarına çok bağımlıdır.',
      c: 'Standart operasyonlarda bağımsız doğru kararlar alır.',
      d: 'Zor ve baskı altındaki durumlarda veriye dayalı isabetli karar alır.',
      e: 'Şirketin kaderini belirleyecek seviyede belirsiz durumlarda cesur ve doğru karar alır.'
    }
  ];

  for (const c of competencies) {
    await prisma.competency.upsert({
      where: { name: c.name },
      update: {
        description: c.desc,
        causeEffect: c.causeEffect,
        levelA: c.a,
        levelB: c.b,
        levelC: c.c,
        levelD: c.d,
        levelE: c.e,
        category: c.category
      },
      create: {
        name: c.name,
        category: c.category,
        causeEffect: c.causeEffect,
        description: c.desc,
        levelA: c.a,
        levelB: c.b,
        levelC: c.c,
        levelD: c.d,
        levelE: c.e
      }
    });
  }

  console.log('--- NACE Master Data Seed Completed Successfully ---');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
