import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  const attemptId = 'cmq2l75pg0001bgwc6l65asz8';
  console.log('Searching for attempt:', attemptId);
  try {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: true,
        answers: true
      }
    });
    console.log('Result:', JSON.stringify(attempt, null, 2));
  } catch (e) {
    console.error('Error querying database:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
