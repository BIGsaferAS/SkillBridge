import fs from 'fs';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding 40 Competencies from Markdown ---');
  
  const content = fs.readFileSync('./comps.md', 'utf-8');
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.startsWith('|'));

  for (const line of lines) {
    const cols = line.split('|').map(c => c.trim());
    if (cols.length < 9) continue;
    
    // Format: | Kategori | Yetkinlik | Kısa Tanım | A: Çok Yetersiz | B: Yetersiz | C: Beklenen | D: Yeterli | E: Çok Yeterli |
    const category = cols[1];
    const name = cols[2];
    const desc = cols[3];
    const a = cols[4];
    const b = cols[5];
    const c = cols[6];
    const d = cols[7];
    const e = cols[8];

    if (name === 'Yetkinlik' || name === '---') continue;

    // We can infer causeEffect from A-E or leave it simple
    // The user's UI displays comp.causeEffect. Let's make a generic one if empty
    const causeEffect = `Sebep: ${name} becerisinin uygulanması. Sonuç: ${category} alanında yüksek performans ve hata azaltımı.`;

    let dbCategory = category.toUpperCase();
    if (dbCategory.includes('BİLİŞSEL') || dbCategory.includes('BILIŞSEL')) dbCategory = 'BİLİŞSEL';
    else if (dbCategory.includes('TEKNİK') || dbCategory.includes('TEKNIK')) dbCategory = 'TEKNİK';
    else if (dbCategory.includes('TEMEL')) dbCategory = 'TEMEL';
    else if (dbCategory.includes('YÖNETSEL') || dbCategory.includes('YONETSEL')) dbCategory = 'YÖNETSEL';
    else dbCategory = 'TEMEL';

    await prisma.competency.upsert({
      where: { name: name },
      update: {
        description: desc,
        causeEffect: causeEffect,
        levelA: a,
        levelB: b,
        levelC: c,
        levelD: d,
        levelE: e,
        category: dbCategory
      },
      create: {
        name: name,
        category: dbCategory,
        causeEffect: causeEffect,
        description: desc,
        levelA: a,
        levelB: b,
        levelC: c,
        levelD: d,
        levelE: e
      }
    });

    console.log(`Upserted: ${name} (${dbCategory})`);
  }

  console.log('--- Seed Completed Successfully ---');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
