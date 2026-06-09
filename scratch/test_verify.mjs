import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const companyId = "cmq6f236o002ot0ogvniw0b16"; // İzmirGaz
    const testNames = ["ali demircan", "Ali Demircan", "cenk ulucan", "Ceyda Birsin", "ceyda birsin "];

    for (const name of testNames) {
      const trimmed = name.trim();
      const user = await prisma.user.findFirst({
        where: {
          companyId,
          name: trimmed
        }
      });
      console.log(`Querying "${name}" -> Found:`, user ? user.name : "NOT FOUND");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
