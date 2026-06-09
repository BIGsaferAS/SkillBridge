import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  try {
    const test = await prisma.test.findFirst({
      include: {
        questions: true
      }
    });
    console.log('Test structure details:', JSON.stringify(test, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
