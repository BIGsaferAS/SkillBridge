import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function seed() {
  try {
    let user = await prisma.user.findFirst({ where: { email: "admin@skillbridge.ai" } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: "admin@skillbridge.ai",
          name: "İnsan Kaynakları Yöneticisi",
          role: "ADMIN"
        }
      });
    }

    await prisma.testResult.create({
      data: {
        userId: user.id,
        sector: "Teknoloji",
        department: "Yazılım Geliştirme",
        roleName: "Senior Backend Developer",
        score: 85,
        timeSpentSec: 320,
        profileAnalysis: "Aday son derece analitik düşünüyor. Kriz anında sakin kalarak (Circuit Breaker yanıtı) sistemin bütünlüğünü korumaya odaklanıyor. Risk almaktan ziyade güvenli ve kalıcı çözümler üretme eğiliminde.",
        benchmarking: "Senior Backend adayları ortalaması %72 iken bu aday %85 başarı elde etti. Kriz yönetimi kası, standart bir uzmandan %20 daha gelişmiş.",
        hireDecision: "HIRE (İşe Alınabilir)",
        developmentAreas: "Aday kriz yönetiminde ve mimari kararlarda kusursuz. Ancak iletişim (yumuşak beceriler) ve takım yönetimi yetkinlikleri bir sonraki aşamada sözlü mülakatla daha derinlemesine incelenmeli. Kesinlikle potansiyeli çok yüksek bir profil.",
        flawAnalysis: "Adayın stres altında aceleci kararlar almadığı görüldü. Kritik bir hata yapmadı."
      }
    });

    console.log("Mock data inserted successfully!");
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
