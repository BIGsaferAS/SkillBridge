import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  try {
    const questions = await prisma.question.findMany({
      select: { competency: true }
    });
    
    const templates = await prisma.questionTemplate.findMany({
      select: { competency: true }
    });

    const tests = await prisma.test.findMany({
      select: { competencies: true }
    });

    console.log("Unique competencies in Questions:", [...new Set(questions.map(q => q.competency))]);
    console.log("Unique competencies in Templates:", [...new Set(templates.map(t => t.competency))]);
    console.log("Test competency JSON values count:", tests.length);
  } catch (error) {
    console.error("Error querying references:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
