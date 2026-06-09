const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Output file path
const outputPath = path.join(__dirname, '..', 'public', 'SkillBridge_Rol_ve_Yetkiler.pdf');

// Ensure directories exist
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const doc = new PDFDocument({ margin: 50 });
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Load Windows Arial font for Turkish character support
const fontPath = 'C:\\Windows\\Fonts\\arial.ttf';
const fontBoldPath = 'C:\\Windows\\Fonts\\arialbd.ttf';

if (fs.existsSync(fontPath)) {
    doc.registerFont('Arial', fontPath);
} else {
    console.warn("Arial font not found, falling back to Helvetica (Turkish characters might not render correctly)");
    doc.registerFont('Arial', 'Helvetica');
}

if (fs.existsSync(fontBoldPath)) {
    doc.registerFont('Arial-Bold', fontBoldPath);
} else {
    doc.registerFont('Arial-Bold', 'Helvetica-Bold');
}

// Colors
const primaryColor = '#4F46E5'; // Indigo
const textColor = '#1F2937'; // Dark Gray
const lightGray = '#9CA3AF'; // Light Gray

// Helper: Header
doc.fillColor(primaryColor)
   .font('Arial-Bold')
   .fontSize(24)
   .text('SkillBridge', { align: 'left' });

doc.fillColor(textColor)
   .font('Arial')
   .fontSize(10)
   .text('Rol ve Yetkilendirme Matrisi Raporu', { align: 'left' });

doc.moveTo(50, 90)
   .lineTo(550, 90)
   .strokeColor(primaryColor)
   .lineWidth(2)
   .stroke();

doc.moveDown(2);

// Title
doc.fillColor(textColor)
   .font('Arial-Bold')
   .fontSize(18)
   .text('SİSTEM ROL VE YETKİ DETAYLARI', { align: 'center' });

doc.moveDown(1.5);

// Roles Data
const roles = [
  {
    name: '1. SUPER_ADMIN (Süper Yönetici)',
    description: 'Tüm sistem genelinde en üst düzey kontrol ve yetkiye sahip roldür. Şirket sınırları olmaksızın tüm verilere müdahale edebilir.',
    permissions: [
      'Sistemdeki tüm Şirketleri (Company) oluşturma, düzenleme ve silme yetkisi.',
      'Sistemdeki tüm Kullanıcıları (User) listeleme, rollerini değiştirme ve yönetme.',
      'Global Yetkinlik Havuzu (Data Bank) üzerindeki tüm endüstri, departman, rol ve yetkinlikleri yönetme.',
      'Sistem genelindeki tüm dokümanları, testleri ve sonuçları görüntüleme.',
      'Sistem konfigürasyonlarını ve veri tabanı yedeklemelerini tetikleme.'
    ]
  },
  {
    name: '2. COMPANY_MANAGER (Şirket / İK Yöneticisi)',
    description: 'Yalnızca kendi şirketine bağlı olan aday, test ve analiz verilerini yönetebilen roldür. Şirket verilerinin gizliliği bu rol sınırlarında korunur.',
    permissions: [
      'Kendi şirketine özel Aday ve Çalışan listelerini yönetme.',
      'Kendi şirketine ait Karşılaştırma Oturumları (Comparison Session) oluşturma ve analiz etme.',
      'Kendi şirketi için yeni Değerlendirme Testleri (Test) ve soruları üretme/dağıtma.',
      'Kendi şirketindeki adayların sınav denemelerini, başarı oranlarını ve mentor raporlarını inceleme.',
      'Kendi şirketine özel Görev Tanımı ve CV dokümanlarını yükleme ve silme.'
    ]
  },
  {
    name: '3. ADMIN (Sistem Yöneticisi)',
    description: 'Şirket yöneticisi yetkilerine benzer şekilde operasyonel süreçleri yürüten, ancak bazı sistem geneli yönetim yetkilerine de sahip olabilen idari roldür.',
    permissions: [
      'Yeni karşılaştırma oturumları başlatma ve 10 Sayfalı AI analiz pipeline\'ını tetikleme.',
      'Soru havuzunu görüntüleme ve test dağıtım parametrelerini (QR kod/link) yapılandırma.',
      'Sınav deneme sonuçlarını ve aday puan analizlerini izleme.'
    ]
  },
  {
    name: '4. INDIVIDUAL (Aday / Çalışan)',
    description: 'Sistemde değerlendirmeye tabi tutulan son kullanıcılardır. Yönetim ekranlarına veya API\'lerine erişim yetkileri yoktur.',
    permissions: [
      'Kendisine atanan veya QR kod/link ile paylaşılan testleri çözme (Test Solve).',
      'Test tamamlandıktan sonra kendisine özel üretilen gelişim tavsiyelerini ve sınav sonucunu görüntüleme.',
      'Karşılaştırma oturumlarına katılarak CV veya performans verilerini sisteme yükleme.'
    ]
  }
];

roles.forEach(role => {
  doc.fillColor(primaryColor)
     .font('Arial-Bold')
     .fontSize(14)
     .text(role.name);
  
  doc.moveDown(0.2);
  
  doc.fillColor(textColor)
     .font('Arial')
     .fontSize(10)
     .text(role.description, { align: 'justify', lineGap: 2 });
  
  doc.moveDown(0.4);
  
  doc.font('Arial-Bold')
     .fontSize(10)
     .text('Başlıca Yetkiler:', { underline: true });
     
  doc.moveDown(0.2);
  
  role.permissions.forEach(permission => {
    doc.font('Arial')
       .fontSize(9.5)
       .text(`  •  ${permission}`, { indent: 15, lineGap: 1.5 });
  });
  
  doc.moveDown(1.5);
});

// Footer
const pages = doc.bufferedPageRange();
for (let i = 0; i < pages.count; i++) {
  doc.switchToPage(i);
  doc.moveTo(50, 730)
     .lineTo(550, 730)
     .strokeColor(lightGray)
     .lineWidth(0.5)
     .stroke();
     
  doc.fillColor(lightGray)
     .font('Arial')
     .fontSize(8)
     .text('SkillBridge Platform Security & Operations Report', 50, 740, { align: 'left' })
     .text(`Sayfa ${i + 1} / ${pages.count}`, 50, 740, { align: 'right' });
}

doc.end();

stream.on('finish', () => {
  console.log('PDF successfully created!');
});
