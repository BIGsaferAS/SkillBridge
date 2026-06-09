import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.competency.count();
    console.log("Total competencies in DB:", count);
    const samples = await prisma.competency.findMany({
      take: 5,
      select: { name: true, category: true }
    });
    console.log("Sample competencies:", samples);
  } catch (error) {
    console.error("Error querying competencies:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
