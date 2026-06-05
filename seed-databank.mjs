import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Master Data Bank...');

  // 1. Industries
  const industries = ['Yazılım & Teknoloji', 'Finans & Bankacılık', 'Sağlık & Tıp', 'Lojistik & Tedarik', 'Otomotiv', 'Savunma Sanayii'];
  for (const name of industries) {
    await prisma.industry.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  // 2. Departments
  const departments = ['AR-GE', 'İnsan Kaynakları', 'Operasyon', 'Finans', 'Pazarlama', 'Satış', 'Bilgi İşlem (IT)'];
  for (const name of departments) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  // 3. Job Roles
  const roles = ['Junior Uzman', 'Kıdemli Uzman (Senior)', 'Takım Lideri (Team Lead)', 'Proje Yöneticisi', 'Direktör', 'Yazılım Mühendisi', 'Finansal Analist'];
  for (const name of roles) {
    await prisma.jobRole.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  // 4. Competencies
  const competencies = [
    { name: 'Problem Çözme', type: 'SOFT_SKILL' },
    { name: 'Kriz Yönetimi', type: 'SOFT_SKILL' },
    { name: 'Liderlik', type: 'SOFT_SKILL' },
    { name: 'Algoritmik Düşünme', type: 'HARD_SKILL' },
    { name: 'Stratejik İletişim', type: 'SOFT_SKILL' },
    { name: 'Veri Analizi', type: 'HARD_SKILL' },
  ];

  for (const comp of competencies) {
    await prisma.competency.upsert({
      where: { name: comp.name },
      update: {},
      create: { name: comp.name, type: comp.type }
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
