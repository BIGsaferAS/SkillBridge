import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const companies = await prisma.company.findMany({
      select: { id: true, name: true }
    });
    console.log("=== COMPANIES ===");
    console.log(JSON.stringify(companies, null, 2));

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, companyId: true }
    });
    console.log("\n=== USERS ===");
    console.log(JSON.stringify(users, null, 2));

    const tests = await prisma.test.findMany({
      select: { id: true, title: true, companyId: true }
    });
    console.log("\n=== TESTS ===");
    console.log(JSON.stringify(tests, null, 2));

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
