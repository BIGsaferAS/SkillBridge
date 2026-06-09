const fs = require('fs');
const path = require('path');

// Load environment variables manually if dotenv is not global
if (fs.existsSync('.env.production')) {
  const envConfig = require('dotenv').config({ path: '.env.production' });
} else if (fs.existsSync('.env')) {
  require('dotenv').config({ path: '.env' });
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Database records updating...");
  
  // Get all TestResult records
  const results = await prisma.testResult.findMany();
  console.log(`Found ${results.length} total test results.`);
  
  let updateCount = 0;
  for (const r of results) {
    if (r.hireDecision && r.hireDecision.toUpperCase().includes("NO HIRE")) {
      const newDecision = r.hireDecision.replace(/NO HIRE/gi, "Geliştirilmeli");
      await prisma.testResult.update({
        where: { id: r.id },
        data: { hireDecision: newDecision }
      });
      console.log(`Updated result ID: ${r.id} | Old: "${r.hireDecision}" -> New: "${newDecision}"`);
      updateCount++;
    }
  }
  
  console.log(`Update completed! Total records updated: ${updateCount}`);
}

main()
  .catch(e => {
    console.error("Error updating database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
