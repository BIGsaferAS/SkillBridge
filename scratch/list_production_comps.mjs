import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  try {
    const comps = await prisma.competency.findMany({
      select: { name: true, category: true }
    });
    console.log(JSON.stringify(comps, null, 2));
  } catch (error) {
    console.error("Error querying competencies:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
