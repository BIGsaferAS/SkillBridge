import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  const attemptId = 'cmq35vdif0008kcb0pf9vy5mg';
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
