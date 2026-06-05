import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const companies = await prisma.company.findMany();
    console.log("Companies in DB:", companies);
  } catch (error) {
    console.error("Prisma error details:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
