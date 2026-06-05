import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Departments and Roles from Excel Dump ---');
  
  const departments = [
    'İcra Kurulu / Üst Yönetim', 'Finans ve Muhasebe', 'İnsan Kaynakları', 'Hukuk ve Uyum', 'Satış',
    'Pazarlama', 'Müşteri Hizmetleri ve Deneyimi', 'Ürün ve Ar-Ge', 'Yazılım / Mühendislik', 'Operasyon',
    'Tedarik Zinciri ve Lojistik', 'Üretim', 'Kalite, Denetim ve Risk', 'Bilgi Teknolojileri (BT)',
    'İdari İşler ve Tesis Yönetimi', 'Kurumsal İletişim ve PR', 'Proje Yönetimi (PMO)',
    'Veri, Analitik ve İş Zekâsı', 'Satın Alma', 'Kurumsal Gelişim / Dönüşüm',
    'Muhasebe', 'İşe Alım ve Yetenek Kazanımı', 'Sözleşmeler Yönetimi', 'B2B Satış (Kurumsal)',
    'Marka Yönetimi', 'Çağrı Merkezi', 'Ürün Yönetimi (Product Management)', 'Backend', 'Operasyon Yönetimi',
    'Satın Alma (Procurement)', 'Üretim (Hat/Atölye)', 'Kalite Yönetim Sistemi', 'Sistem & Ağ Yönetimi',
    'Ofis Yönetimi', 'Medya İlişkileri', 'PMO (Proje Yönetim Ofisi)', 'BI Raporlama', 'Stratejik Satın Alma',
    'Dijital Dönüşüm', 'CEO Ofisi', 'Finansal Planlama & Analiz (FP&A)', 'Organizasyonel Gelişim',
    'Dava / İcra Takibi', 'B2C Satış (Perakende)', 'Dijital Pazarlama', 'Müşteri Destek', 'Ürün Tasarımı (UX/UI)',
    'Frontend', 'Süreç Yönetimi (BPM)', 'Tedarikçi Yönetimi', 'Üretim Planlama', 'İç Denetim',
    'Help Desk / IT Destek', 'İç İletişim', 'Program Yönetimi', 'Veri Analizi', 'Operasyonel Satın Alma',
    'Süreç İyileştirme', 'Strateji ve İş Geliştirme', 'Bütçe ve Raporlama', 'Ücret & Yan Haklar (Comp & Ben)',
    'KVKK / Veri Koruma', 'Saha Satış', 'İçerik Pazarlama / PR içerikleri', 'Teknik Destek', 'Kullanıcı Araştırmaları',
    'Mobil', 'Operasyonel Mükemmellik / Lean / Six Sigma', 'Talep Planlama', 'Bakım-Onarım (Maintenance)',
    'Risk Yönetimi (ERM)', 'ERP/CRM Yönetimi', 'Güvenlik', 'Kurumsal İtibar Yönetimi', 'Portföy Yönetimi',
    'Veri Bilimi', 'Sözleşme & İhale', 'Organizasyonel Dönüşüm', 'Kurumsal Planlama', 'Nakit Yönetimi / Treasury',
    'Performans Yönetimi', 'Rekabet Hukuku / Ticaret Hukuku', 'İç Satış (Inside Sales)', 'Ürün Pazarlaması',
    'Müşteri Başarısı (Customer Success)', 'Ar-Ge / İnovasyon', 'DevOps / SRE', 'Kalite Yönetimi',
    'Kalite Kontrol (QC)', 'Uyum Denetimleri', 'Uygulama Yönetimi', 'Temizlik & Yemek Hizmetleri', 'Kriz İletişimi',
    'İş Analizi (Business Analysis)', 'Veri Yönetişimi (Data Governance)', 'Tedarikçi Denetimi', 'İnovasyon Programları',
    'Kurumsal Performans / OKR Yönetimi', 'Vergi', 'Eğitim ve Gelişim (L&D)', 'Uyum (Compliance)',
    'Kanal Satış / Bayi Yönetimi', 'Pazarlama Operasyonları', 'Şikâyet ve İade Yönetimi', 'Prototipleme / Laboratuvar',
    'QA / Test Otomasyon', 'Operasyon Planlama', 'Depo / Antrepo', 'Kalite Güvence (QA)', 'İş Sürekliliği (BCP)',
    'Veri Yönetimi / BI', 'Araç Filosu / Ulaşım', 'Sponsorluklar', 'Değişim Yönetimi (Change Management)',
    'Metrik/Performans Takibi', 'Kategori Yönetimi', 'Şirket Sekreterliği / Yönetim Destek', 'Bordro',
    'Çalışan İlişkileri / Disiplin / Uyum', 'Lisanslar, Ruhsatlar, Resmî İşlemler', 'Kilit Müşteri Yönetimi (Key Account)',
    'Büyüme (Growth)', 'Eğitim / Onboarding', 'Ürün Test / Doğrulama', 'Veri Mühendisliği', 'Sözleşme Operasyonları',
    'Nakliye / Sevkiyat', 'İş Sağlığı ve Güvenliği (İSG)', 'Şirket Güvenliği / Suistimal İnceleme', 'Siber Güvenlik',
    'Tesis Bakım / Teknik Hizmetler', 'E-ticaret Departmanı', 'Alacak Yönetimi (Tahsilat)', 'İK Operasyonları',
    'Kurumsal Yönetim (Governance)', 'Satış Operasyonları', 'Etkinlik & Organizasyon', 'Saha Servis',
    'Yapay Zeka / ML', 'İthalat / İhracat', 'Teknik Ofis / Endüstri Müh.', 'Lisans / Donanım / Envanter',
    'Kargo / Evrak / Arşiv', 'Franchise/Bayi Yönetimi', 'Borç Yönetimi (Ödemeler)', 'İşveren Markası',
    'Satış Sonrası / Yenileme (Renewal)', 'Müşteri Araştırmaları / Pazar Araştırması', 'Bilgi Güvenliği',
    'Stok Yönetimi', 'Kalibrasyon / Ölçüm', 'Mağazacılık Operasyonları (perakende)', 'Yatırımcı İlişkileri',
    'İSG', 'İş Ortaklıkları (Partners/Alliances)', 'Kurumsal İletişim', 'Yazılım Mimari / Platform Ekibi',
    'Lojistik Operasyonları', 'Üretim Ar-Ge (proses geliştirme)', 'Saha Operasyonları / Saha Servis',
    'İç Kontrol', 'Regülasyon & Ruhsat (sağlık, gıda, enerji vb.)', 'Laboratuvar (gıda/kimya)',
    'HSE / Çevre (üretim, enerji, inşaat)', 'Mimari / Proje / Şantiye (inşaat)'
  ];

  const roles = [
    { name: 'ÇALIŞAN ADAYI', hierarchy: 'JUNIOR' },
    { name: 'ÇALIŞAN', hierarchy: 'JUNIOR' },
    { name: 'UZMAN YARDIMCISI', hierarchy: 'JUNIOR' },
    { name: 'UZMAN', hierarchy: 'EXPERT' },
    { name: 'YÖNETİCİ', hierarchy: 'MANAGEMENT' },
    { name: 'MÜDÜR YARDIMCISI', hierarchy: 'MANAGEMENT' },
    { name: 'MÜDÜR', hierarchy: 'MANAGEMENT' },
    { name: 'DİREKTÖR', hierarchy: 'MANAGEMENT' },
    { name: 'GENEL MÜDÜR YARDIMCISI', hierarchy: 'MANAGEMENT' },
    { name: 'ŞEF', hierarchy: 'MANAGEMENT' },
    { name: 'LİDER', hierarchy: 'MANAGEMENT' },
    { name: 'SÜPERVİZÖR', hierarchy: 'MANAGEMENT' },
    { name: 'TEKNİSYEN', hierarchy: 'JUNIOR' },
    { name: 'FORMEN', hierarchy: 'JUNIOR' },
    { name: 'OPERATÖR', hierarchy: 'JUNIOR' },
    { name: 'İŞÇİ', hierarchy: 'JUNIOR' },
    { name: 'ELEMAN', hierarchy: 'JUNIOR' },
    { name: 'TAKIM LİDERİ', hierarchy: 'MANAGEMENT' },
    { name: 'GRUP LİDER', hierarchy: 'MANAGEMENT' },
    { name: 'VARDİYA AMİRİ', hierarchy: 'MANAGEMENT' },
    { name: 'DANIŞMAN', hierarchy: 'EXPERT' },
    { name: 'HUKUK MÜŞAVİRİ', hierarchy: 'EXPERT' },
    { name: 'HİSSEDAR', hierarchy: 'MANAGEMENT' },
    { name: 'YÖNETİM KURULU ÜYESİ', hierarchy: 'MANAGEMENT' },
    { name: 'CEO', hierarchy: 'MANAGEMENT' },
    { name: 'COO', hierarchy: 'MANAGEMENT' },
    { name: 'CFO', hierarchy: 'MANAGEMENT' },
    { name: 'CTO', hierarchy: 'MANAGEMENT' },
    { name: 'CSO', hierarchy: 'MANAGEMENT' },
    { name: 'CHRO', hierarchy: 'MANAGEMENT' },
    { name: 'CMO', hierarchy: 'MANAGEMENT' },
    { name: 'KOORDİNATÖR', hierarchy: 'MANAGEMENT' },
    { name: 'VİCE PRESİDENT', hierarchy: 'MANAGEMENT' },
    { name: 'PRESİDENT', hierarchy: 'MANAGEMENT' },
    { name: 'MD', hierarchy: 'MANAGEMENT' }
  ];

  console.log(`Upserting ${departments.length} departments...`);
  for (const name of departments) {
    const cleanName = name.trim();
    if (!cleanName) continue;
    await prisma.department.upsert({
      where: { name: cleanName },
      update: {},
      create: { name: cleanName }
    });
  }

  console.log(`Upserting ${roles.length} roles...`);
  for (const r of roles) {
    await prisma.jobRole.upsert({
      where: { name: r.name },
      update: { hierarchy: r.hierarchy },
      create: { name: r.name, hierarchy: r.hierarchy }
    });
  }

  console.log('--- Departments and Roles Seed Completed Successfully ---');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
