import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  try {
    const industries = await prisma.industry.findMany({ select: { name: true } });
    const departments = await prisma.department.findMany({ select: { name: true } });
    const roles = await prisma.jobRole.findMany({ select: { name: true } });

    console.log('Industries:', industries.map(i => i.name));
    console.log('Departments:', departments.map(d => d.name));
    console.log('Roles:', roles.map(r => r.name));
  } catch (err) {
    console.error('Error querying master data:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
