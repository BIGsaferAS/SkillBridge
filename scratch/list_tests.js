import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  try {
    const testsCount = await prisma.test.count();
    console.log('Total tests in database:', testsCount);
    
    const tests = await prisma.test.findMany({
      select: {
        id: true,
        title: true,
        companyId: true,
        sector: true,
        department: true,
        roleName: true,
        _count: { select: { questions: true } }
      },
      take: 10
    });
    console.log('Sample tests:', JSON.stringify(tests, null, 2));
  } catch (err) {
    console.error('Error querying tests:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
